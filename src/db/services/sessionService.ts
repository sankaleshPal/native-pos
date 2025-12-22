import { getDatabase } from '../database';

export interface TableSession {
  id: number;
  table_id: number;
  start_time: string;
  end_time: string | null;
  status: 'active' | 'completed';
}

/**
 * Start a new session for a table
 */
export const startSession = async (tableId: number): Promise<number> => {
  const db = await getDatabase();
  const startTime = new Date().toISOString();

  // Create session
  const result = await db.execute(
    `INSERT INTO table_sessions (table_id, start_time, status) VALUES (?, ?, 'active')`,
    [tableId, startTime],
  );

  const sessionId = result.insertId!;

  // Update table with active session
  await db.execute(
    `UPDATE tables SET active_session_id = ?, status = 'active' WHERE id = ?`,
    [sessionId, tableId],
  );

  return sessionId;
};

/**
 * End the current session for a table
 */
export const endSession = async (sessionId: number): Promise<void> => {
  const db = await getDatabase();
  const endTime = new Date().toISOString();

  await db.execute(
    `UPDATE table_sessions SET end_time = ?, status = 'completed' WHERE id = ?`,
    [endTime, sessionId],
  );

  // We don't necessarily clear active_session_id from tables here,
  // as the table becomes 'empty' via standard table status updates,
  // which implicitly means no active session or we can clear it there.
  // Ideally, when a table becomes empty, active_session_id should be NULL.

  // Get table ID
  const sessionResult = await db.execute(
    `SELECT table_id FROM table_sessions WHERE id = ?`,
    [sessionId],
  );
  if (sessionResult.rows?.length) {
    const tableId = sessionResult.rows[0].table_id;
    await db.execute(
      `UPDATE tables SET active_session_id = NULL WHERE id = ?`,
      [tableId],
    );
  }
};

/**
 * Get active session ID for a table
 */
export const getActiveSessionId = async (
  tableId: number,
): Promise<number | null> => {
  const db = await getDatabase();
  // Try getting from tables table first (faster)
  const tableResult = await db.execute(
    `SELECT active_session_id FROM tables WHERE id = ?`,
    [tableId],
  );

  if (tableResult.rows?.length && tableResult.rows[0].active_session_id) {
    return tableResult.rows[0].active_session_id as number;
  }

  // Fallback: check table_sessions
  const sessionResult = await db.execute(
    `SELECT id FROM table_sessions WHERE table_id = ? AND status = 'active' ORDER BY start_time DESC LIMIT 1`,
    [tableId],
  );

  if (sessionResult.rows?.length) {
    // Self-correct tables table
    const sessionId = sessionResult.rows[0].id as number;
    await db.execute(`UPDATE tables SET active_session_id = ? WHERE id = ?`, [
      sessionId,
      tableId,
    ]);
    return sessionId;
  }

  return null;
};
