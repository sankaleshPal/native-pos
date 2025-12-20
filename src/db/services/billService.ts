import { getDatabase } from '../database';
import type { Bill, BillWithKOTs, PaymentMode, KOTItem, KOT } from '../types';
import { getKOTsByTable } from './kotService';
import { markTableInactive } from './kotService';
import { endSession, getActiveSessionId } from './sessionService';

const db = getDatabase();

/**
 * Create a bill for a table with all its KOTs (Active Session Only)
 */
export const createBill = async (tableId: number): Promise<number> => {
  // Get active session
  const sessionId = await getActiveSessionId(tableId);
  if (!sessionId) {
    throw new Error('No active session found for this table');
  }

  // Get table name
  const tableResult = await db.execute(
    `SELECT table_name FROM tables WHERE id = ?`,
    [tableId],
  );

  const tableName = tableResult.rows[0]?.table_name || 'Unknown';

  // Get all active KOTs for this SESSION
  const kotsResult = await db.execute(
    `SELECT * FROM kots WHERE session_id = ? ORDER BY punched_at DESC`,
    [sessionId],
  );

  // .rows in op-sqlite is an array access, need to cast
  // Re-using getKOTsByTable logic might be safer but circular dependency risk if not careful.
  // Let's iterate manually or define a helper in kotService that accepts sessionId.
  // For now, let's just proceed with manual calculation to be safe.

  const kots = (kotsResult.rows || []) as unknown as KOT[];
  const activeKOTs = kots.filter(kot => kot.status === 'active');

  // Calculate subtotal (excluding deleted items)
  let subtotal = 0;
  for (const kot of activeKOTs) {
    const itemsResult = await db.execute(
      `SELECT * FROM kot_items WHERE kot_id = ?`,
      [kot.id],
    );
    const items = (itemsResult.rows || []) as unknown as KOTItem[];

    const kotSubtotal = items
      .filter(item => !item.is_deleted)
      .reduce((sum, item) => sum + item.item_total, 0);
    subtotal += kotSubtotal;
  }

  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  // Create bill linked to session
  const billResult = await db.execute(
    `INSERT INTO bills (table_id, table_name, subtotal, tax, total, status, session_id)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
    [tableId, tableName, subtotal, tax, total, sessionId],
  );

  const billId = billResult.insertId!;

  // Link KOTs to bill
  for (const kot of activeKOTs) {
    await db.execute(`INSERT INTO bill_kots (bill_id, kot_id) VALUES (?, ?)`, [
      billId,
      kot.id,
    ]);
  }

  return billId;
};

// ... (getBillByTable can stay mostly same, but ideally filter by session too if multiple pending bills exist?
// Actually constraint says only one pending bill usually. But let's check session just in case.)

/**
 * Get bill for a table (Active Session)
 */
export const getBillByTable = async (
  tableId: number,
): Promise<BillWithKOTs | null> => {
  const sessionId = await getActiveSessionId(tableId);

  if (!sessionId) return null;

  const billResult = await db.execute(
    `SELECT * FROM bills WHERE table_id = ? AND status = 'pending' AND session_id = ? ORDER BY created_at DESC LIMIT 1`,
    [tableId, sessionId],
  );

  if (!billResult.rows?.length) {
    return null;
  }

  // ... (rest of getBill logic is same, assuming billId is unique)
  const bill = billResult.rows[0] as unknown as Bill;

  // Get KOTs linked to this bill
  const kotsResult = await db.execute(
    `SELECT k.* FROM kots k
     JOIN bill_kots bk ON k.id = bk.kot_id
     WHERE bk.bill_id = ?
     ORDER BY k.punched_at ASC`,
    [bill.id],
  );

  const kots = [];
  for (const kotRow of (kotsResult.rows || []) as unknown as KOT[]) {
    const itemsResult = await db.execute(
      `SELECT * FROM kot_items WHERE kot_id = ? ORDER BY created_at ASC`,
      [kotRow.id],
    );

    kots.push({
      ...kotRow,
      items: (itemsResult.rows || []) as unknown as KOTItem[],
    });
  }

  return {
    ...bill,
    kots,
  };
};

/**
 * Get bill by ID
 */
export const getBillById = async (
  billId: number,
): Promise<BillWithKOTs | null> => {
  const billResult = await db.execute(`SELECT * FROM bills WHERE id = ?`, [
    billId,
  ]);

  if (!billResult.rows?.length) {
    return null;
  }

  const bill = billResult.rows[0] as unknown as Bill;

  // Get KOTs linked to this bill
  const kotsResult = await db.execute(
    `SELECT k.* FROM kots k
     JOIN bill_kots bk ON k.id = bk.kot_id
     WHERE bk.bill_id = ?
     ORDER BY k.punched_at ASC`,
    [bill.id],
  );

  const kots = [];
  for (const kotRow of (kotsResult.rows || []) as unknown as KOT[]) {
    const itemsResult = await db.execute(
      `SELECT * FROM kot_items WHERE kot_id = ? ORDER BY created_at ASC`,
      [kotRow.id],
    );

    kots.push({
      ...kotRow,
      items: (itemsResult.rows || []) as unknown as KOTItem[],
    });
  }

  return {
    ...bill,
    kots,
  };
};

/**
 * Settle a bill with payment mode
 */
export const settleBill = async (
  billId: number,
  paymentMode: PaymentMode,
  settledBy: string,
): Promise<boolean> => {
  const settledAt = new Date().toISOString();

  await db.execute(
    `UPDATE bills 
     SET payment_mode = ?, settled_by = ?, settled_at = ?, status = 'settled'
     WHERE id = ?`,
    [paymentMode, settledBy, settledAt, billId],
  );

  // Mark all KOTs in this bill as completed
  await db.execute(
    `UPDATE kots 
     SET status = 'completed'
     WHERE id IN (SELECT kot_id FROM bill_kots WHERE bill_id = ?)`,
    [billId],
  );

  // Get table ID and session ID from bill
  const billResult = await db.execute(
    `SELECT table_id, session_id FROM bills WHERE id = ?`,
    [billId],
  );

  if (billResult.rows?.length) {
    const row = billResult.rows[0];
    const tableId = row.table_id as number;
    const sessionId = row.session_id as number;

    // Mark table as empty/inactive
    await markTableInactive(tableId);

    // End the session
    if (sessionId) {
      await endSession(sessionId);
    }
  }

  return true;
};

/**
 * Get all bills (for reporting)
 */
export const getAllBills = async (): Promise<Bill[]> => {
  const result = await db.execute(
    `SELECT * FROM bills ORDER BY created_at DESC`,
  );

  return (result.rows || []) as unknown as Bill[];
};

/**
 * Get bills by date range
 */
export const getBillsByDateRange = async (
  startDate: string,
  endDate: string,
): Promise<Bill[]> => {
  const result = await db.execute(
    `SELECT * FROM bills 
     WHERE created_at BETWEEN ? AND ?
     ORDER BY created_at DESC`,
    [startDate, endDate],
  );

  return (result.rows || []) as unknown as Bill[];
};
