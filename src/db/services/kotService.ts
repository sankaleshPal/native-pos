import { getDatabase } from '../database';
import type { KOT, KOTItem, KOTWithItems, CartItem } from '../types';
import { getActiveSessionId, startSession } from './sessionService';

/**
 * Create a new KOT from cart items
 */
export const createKOT = async (
  tableId: number,
  userId: string,
  punchedBy: string,
  cartItems: CartItem[],
): Promise<number> => {
  const db = await getDatabase();
  console.log('createKOT called with:', {
    tableId,
    userId,
    punchedBy,
    cartItemsCount: cartItems.length,
  });

  if (!cartItems || cartItems.length === 0) {
    throw new Error('No cart items provided');
  }

  const punchedAt = new Date().toISOString();
  console.log('Cart Items details:', JSON.stringify(cartItems, null, 2));

  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => {
    // Debug individual item calculation
    const portionPrice =
      Number(item.portion?.price) || Number(item.dish.price) || 0;
    const extrasPrice =
      item.extras?.reduce(
        (eSum, extra) =>
          eSum + (Number(extra.price) || 0) * (Number(extra.quantity) || 0),
        0,
      ) || 0;

    const singleItemTotal = (portionPrice + extrasPrice) * item.quantity;
    console.log(
      `Item calculation: ${item.dish.name}, Price: ${portionPrice}, Extras: ${extrasPrice}, Qty: ${item.quantity}, ItemTotal: ${singleItemTotal}`,
    );

    return sum + singleItemTotal;
  }, 0);

  console.log('KOT calculations:', { itemsCount, subtotal });

  // Get or start session
  let sessionId = await getActiveSessionId(tableId);
  if (!sessionId) {
    console.log('No active session for table, starting new one');
    sessionId = await startSession(tableId);
  }

  // Insert KOT with session_id
  const kotResult = await db.execute(
    `INSERT INTO kots (table_id, user_id, punched_by, punched_at, items_count, subtotal, status, session_id)
     VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
    [tableId, userId, punchedBy, punchedAt, itemsCount, subtotal, sessionId],
  );

  const kotId = kotResult.insertId!;

  // Insert KOT items
  for (const item of cartItems) {
    const portionPrice =
      Number(item.portion?.price) || Number(item.dish.price) || 0;
    const extrasPrice =
      item.extras?.reduce(
        (sum, extra) =>
          sum + (Number(extra.price) || 0) * (Number(extra.quantity) || 0),
        0,
      ) || 0;
    const itemTotal = (portionPrice + extrasPrice) * item.quantity;
    const extrasJson = item.extras ? JSON.stringify(item.extras) : null;

    await db.execute(
      `INSERT INTO kot_items (kot_id, dish_id, dish_name, portion_name, portion_price, quantity, extras, item_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        kotId,
        item.dish.id,
        item.dish.name,
        item.portion?.name || null,
        portionPrice,
        item.quantity,
        extrasJson,
        itemTotal,
      ],
    );
  }

  // Update table totals
  await updateTableTotals(tableId);

  // Mark table as active if it was empty
  await markTableActive(tableId);

  return kotId;
};

/**
 * Get all KOTs for a specific table (Active Session Only)
 */
export const getKOTsByTable = async (
  tableId: number,
): Promise<KOTWithItems[]> => {
  const db = await getDatabase();
  console.log('getKOTsByTable called for table:', tableId);

  // Get active session
  const sessionId = await getActiveSessionId(tableId);

  if (!sessionId) {
    console.log('No active session, returning empty KOT list');
    return [];
  }

  const kotsResult = await db.execute(
    `SELECT * FROM kots WHERE session_id = ? ORDER BY punched_at DESC`,
    [sessionId],
  );

  // ... (rest of logic)

  console.log('KOTs query result:', kotsResult);
  console.log('KOTs rows:', kotsResult.rows);
  console.log('KOTs rows._array:', kotsResult.rows);

  const kots: KOTWithItems[] = [];

  for (const kotRow of (kotsResult.rows || []) as unknown as KOT[]) {
    console.log('Processing KOT row:', kotRow);

    const itemsResult = await db.execute(
      `SELECT * FROM kot_items WHERE kot_id = ? ORDER BY created_at ASC`,
      [kotRow.id],
    );

    console.log('Items for KOT', kotRow.id, ':', itemsResult.rows);

    kots.push({
      ...kotRow,
      items: (itemsResult.rows || []) as unknown as KOTItem[],
    });
  }

  console.log('Returning', kots.length, 'KOTs');
  return kots;
};

/**
 * Get a single KOT with all its items
 */
export const getKOTWithItems = async (
  kotId: number,
): Promise<KOTWithItems | null> => {
  const db = await getDatabase();
  const kotResult = await db.execute(`SELECT * FROM kots WHERE id = ?`, [
    kotId,
  ]);

  if (!kotResult.rows?.length) {
    return null;
  }

  const kot = kotResult.rows[0] as unknown as KOT;

  const itemsResult = await db.execute(
    `SELECT * FROM kot_items WHERE kot_id = ? ORDER BY created_at ASC`,
    [kotId],
  );

  return {
    ...kot,
    items: (itemsResult.rows || []) as unknown as KOTItem[],
  };
};

/**
 * Delete a KOT item (soft delete with tracking)
 */
export const deleteKOTItem = async (
  itemId: number,
  deletedBy: string,
  reason: string,
  password: string,
): Promise<boolean> => {
  const db = await getDatabase();
  // Verify password (check against user's password)
  const userResult = await db.execute(
    `SELECT password FROM users WHERE name = ?`,
    [deletedBy],
  );
  console.log('User result:', userResult);

  if (!userResult.rows?.length || userResult.rows[0].password !== password) {
    throw new Error('Invalid password');
  }

  const deletedAt = new Date().toISOString();

  await db.execute(
    `UPDATE kot_items 
     SET is_deleted = 1, deleted_at = ?, deleted_by = ?, deletion_reason = ?
     WHERE id = ?`,
    [deletedAt, deletedBy, reason, itemId],
  );

  // Get the KOT ID to update table totals
  const itemResult = await db.execute(
    `SELECT kot_id FROM kot_items WHERE id = ?`,
    [itemId],
  );

  if (itemResult.rows?.length) {
    const kotId = itemResult.rows[0].kot_id as number;

    // Get table ID from KOT
    const kotResult = await db.execute(
      `SELECT table_id FROM kots WHERE id = ?`,
      [kotId],
    );

    if (kotResult.rows?.length) {
      await updateTableTotals(kotResult.rows[0].table_id as number);
    }
  }

  return true;
};

/**
 * Get deleted items for a KOT
 */
export const getDeletedItems = async (kotId: number): Promise<KOTItem[]> => {
  const db = await getDatabase();
  const result = await db.execute(
    `SELECT * FROM kot_items WHERE kot_id = ? AND is_deleted = 1 ORDER BY deleted_at DESC`,
    [kotId],
  );

  return (result.rows || []) as unknown as KOTItem[];
};

/**
 * Update table totals (current_total and total_kots)
 */
export const updateTableTotals = async (tableId: number): Promise<void> => {
  const db = await getDatabase();
  console.log('updateTableTotals called for table:', tableId);

  try {
    // Get active session
    const sessionId = await getActiveSessionId(tableId);

    // Calculate total from all active KOTs in current session
    const totalResult = await db.execute(
      `SELECT 
         COUNT(*) as kot_count,
         COALESCE(SUM(subtotal), 0) as total
       FROM kots 
       WHERE table_id = ? AND status = 'active' AND session_id = ?`,
      [tableId, sessionId],
    );

    console.log('Total result:', totalResult.rows);

    const resultRow = totalResult.rows?.[0];
    const kot_count = resultRow?.kot_count || 0;
    const total = resultRow?.total || 0;

    console.log('Calculated totals:', { kot_count, total });

    // Subtract deleted items
    const deletedResult = await db.execute(
      `SELECT COALESCE(SUM(ki.item_total), 0) as deleted_total
       FROM kot_items ki
       JOIN kots k ON ki.kot_id = k.id
       WHERE k.table_id = ? AND k.status = 'active' AND ki.is_deleted = 1`,
      [tableId],
    );

    console.log('Deleted result:', deletedResult.rows);

    const deletedTotal =
      (deletedResult.rows?.[0]?.deleted_total as number) || 0;
    const currentTotal = (total as number) - deletedTotal;

    console.log('Final calculations:', {
      deletedTotal,
      currentTotal,
      kot_count,
    });

    await db.execute(
      `UPDATE tables 
       SET current_total = ?, total_kots = ?
       WHERE id = ?`,
      [currentTotal, kot_count, tableId],
    );

    console.log('Table totals updated successfully');
  } catch (error) {
    console.error('Error in updateTableTotals:', error);
    throw error;
  }
};

/**
 * Mark table as active with timestamp
 */
export const markTableActive = async (tableId: number): Promise<void> => {
  const db = await getDatabase();
  const activeSince = new Date().toISOString();

  await db.execute(
    `UPDATE tables 
     SET status = 'active', active_since = ?
     WHERE id = ?`,
    [activeSince, tableId],
  );
};

/**
 * Mark table as inactive (empty)
 */
export const markTableInactive = async (tableId: number): Promise<void> => {
  const db = await getDatabase();
  await db.execute(
    `UPDATE tables 
     SET status = 'empty', active_since = NULL, current_total = 0, total_kots = 0
     WHERE id = ?`,
    [tableId],
  );
};

/**
 * Prepare KOT data for printing
 */
export interface PrintData {
  kotId: number;
  tableName: string;
  punchedBy: string;
  punchedAt: string;
  items: KOTItem[];
  total: number;
}

export const prepareKOTPrintData = async (
  kotId: number,
): Promise<PrintData | null> => {
  const db = await getDatabase();
  const kotResult = await getKOTWithItems(kotId);
  const kot = kotResult as KOTWithItems;
  if (!kot) return null;

  // Get table name
  const tableResult = await db.execute(
    `SELECT table_name FROM tables WHERE id = ?`,
    [kot.table_id],
  );

  const tableName = tableResult.rows[0]?.table_name || 'Unknown';

  return {
    kotId: kot.id,
    tableName: String(tableName),
    punchedBy: String(kot.punched_by),
    punchedAt: String(kot.punched_at),
    items: kot.items.filter(item => !item.is_deleted),
    total: Number(kot.subtotal),
  };
};

/**
 * Get all active KOTs across all tables
 */
export const getAllActiveKOTs = async (): Promise<KOTWithItems[]> => {
  const db = await getDatabase();
  const kotsResult = await db.execute(
    `SELECT * FROM kots WHERE status = 'active' ORDER BY punched_at DESC`,
  );

  const kots: KOTWithItems[] = [];

  for (const kotRow of (kotsResult.rows || []) as any[]) {
    const itemsResult = await db.execute(
      `SELECT * FROM kot_items WHERE kot_id = ? ORDER BY created_at ASC`,
      [kotRow.id],
    );

    kots.push({
      ...kotRow,
      items: (itemsResult.rows || []) as any as KOTItem[],
    });
  }

  return kots;
};
