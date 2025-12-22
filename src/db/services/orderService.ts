import { getDatabase } from '../database';
import type {
  Order,
  OrderItem,
  OrderItemAddOn,
  OrderWithItems,
} from '../types';
import type { CartItem } from '../types';

// Create a new order
export const createOrder = async (
  tableId: number,
  userId: number,
  customerName?: string,
  customerPhone?: string,
): Promise<number> => {
  const db = await getDatabase();

  const result = await db.execute(
    `INSERT INTO orders (table_id, user_id, customer_name, customer_phone, status, subtotal, tax, total)
     VALUES (?, ?, ?, ?, 'active', 0, 0, 0)`,
    [tableId, userId, customerName || null, customerPhone || null],
  );

  return result.insertId as number;
};

// Add items to order from cart
export const addOrderItemsFromCart = async (
  orderId: number,
  cartItems: CartItem[],
): Promise<void> => {
  const db = await getDatabase();

  for (const cartItem of cartItems) {
    const portionPrice = cartItem.portion?.price ?? cartItem.dish.price ?? 0;
    const extrasPrice = cartItem.extras.reduce(
      (sum, extra) => sum + extra.price * extra.quantity,
      0,
    );
    const unitPrice = portionPrice + extrasPrice;
    const totalPrice = unitPrice * cartItem.quantity;

    // Insert order item
    const orderItemResult = await db.execute(
      `INSERT INTO order_items (order_id, dish_id, portion_id, quantity, unit_price, total_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        cartItem.dish.id,
        cartItem.portion?.id ?? null,
        cartItem.quantity,
        unitPrice,
        totalPrice,
      ],
    );

    const orderItemId = orderItemResult.insertId as number;

    // Insert add-ons for this order item
    for (const extra of cartItem.extras) {
      // Find the add-on choice ID from the extra ID
      const choiceId = parseInt(extra.id.split('_').pop() || '0');

      await db.execute(
        `INSERT INTO order_item_add_ons (order_item_id, add_on_choice_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderItemId, choiceId, extra.quantity, extra.price],
      );
    }
  }

  // Update order totals
  await updateOrderTotals(orderId);
};

// Update order totals
export const updateOrderTotals = async (orderId: number): Promise<void> => {
  const db = await getDatabase();

  // Calculate subtotal from order items
  const result = await db.execute(
    'SELECT SUM(total_price) as subtotal FROM order_items WHERE order_id = ?',
    [orderId],
  );

  const subtotal = (result.rows?.[0]?.subtotal as number) || 0;
  const tax = subtotal * 0.05; // 5% GST
  const total = subtotal + tax;

  await db.execute(
    'UPDATE orders SET subtotal = ?, tax = ?, total = ? WHERE id = ?',
    [subtotal, tax, total, orderId],
  );
};

// Get active order for a table
export const getActiveOrderForTable = async (
  tableId: number,
): Promise<Order | null> => {
  const db = await getDatabase();

  const result = await db.execute(
    "SELECT * FROM orders WHERE table_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1",
    [tableId],
  );

  if (!result.rows || result.rows.length === 0) return null;

  return result.rows[0] as unknown as Order;
};

// Get order with items
export const getOrderWithItems = async (
  orderId: number,
): Promise<OrderWithItems | null> => {
  const db = await getDatabase();

  // Get order
  const orderResult = await db.execute('SELECT * FROM orders WHERE id = ?', [
    orderId,
  ]);
  if (!orderResult.rows || orderResult.rows.length === 0) return null;

  const order = orderResult.rows[0] as unknown as Order;

  // Get order items with dishes and portions
  const itemsResult = await db.execute(
    `SELECT oi.*, d.*, p.name as portion_name, p.price as portion_price
     FROM order_items oi
     INNER JOIN dishes d ON oi.dish_id = d.id
     LEFT JOIN portions p ON oi.portion_id = p.id
     WHERE oi.order_id = ?`,
    [orderId],
  );

  const items = itemsResult.rows || [];

  // Get add-ons for each item
  const itemsWithAddOns = await Promise.all(
    items.map(async (item: any) => {
      const addOnsResult = await db.execute(
        `SELECT oia.*, aoc.name as choice_name
         FROM order_item_add_ons oia
         INNER JOIN add_on_choices aoc ON oia.add_on_choice_id = aoc.id
         WHERE oia.order_item_id = ?`,
        [item.id],
      );

      return {
        ...item,
        addOns: addOnsResult.rows || [],
      };
    }),
  );

  return {
    ...order,
    items: itemsWithAddOns as any,
  };
};

// Complete an order
export const completeOrder = async (orderId: number): Promise<void> => {
  const db = await getDatabase();
  await db.execute("UPDATE orders SET status = 'completed' WHERE id = ?", [
    orderId,
  ]);
};

// Cancel an order
export const cancelOrder = async (orderId: number): Promise<void> => {
  const db = await getDatabase();
  await db.execute("UPDATE orders SET status = 'cancelled' WHERE id = ?", [
    orderId,
  ]);
};
