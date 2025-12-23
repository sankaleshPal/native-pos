import { useEffect } from 'react';
import { useOrderStore, Order } from '../store/orderStore';
import { notificationService } from '../services/NotificationService';

const DUMMY_USERS = [
  { id: 'USER_1', name: 'Rahul' },
  { id: 'USER_2', name: 'Priya' },
  { id: 'USER_3', name: 'Amit' },
];

const MENU_ITEMS = [
  { id: 'M1', name: 'Butter Chicken', price: 350 },
  { id: 'M2', name: 'Naan', price: 40 },
  { id: 'M3', name: 'Paneer Tikka', price: 280 },
  { id: 'M4', name: 'Dal Makhani', price: 220 },
  { id: 'M5', name: 'Biryani', price: 300 },
];

export const useDummyOrderGenerator = () => {
  const { addOrder, tables } = useOrderStore();

  useEffect(() => {
    const generateOrders = () => {
      // Create 3 orders
      for (let i = 0; i < 3; i++) {
        // Pick a random user
        const user =
          DUMMY_USERS[Math.floor(Math.random() * DUMMY_USERS.length)];

        // Pick a random IDLE table
        const idleTables = tables.filter(t => t.status === 'IDLE');

        if (idleTables.length === 0) {
          // No idle tables available to place an order
          continue;
        }

        const table = idleTables[Math.floor(Math.random() * idleTables.length)];

        // Generate random items for the order
        const numItems = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
        const items = [];
        for (let j = 0; j < numItems; j++) {
          const menuItem =
            MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
          items.push({
            ...menuItem,
            quantity: 1, // Simple quantity for now
          });
        }

        const newOrder: Order = {
          id: `ORD_${Date.now()}_${i}`,
          userId: user.id,
          userName: user.name,
          tableId: table.id,
          tableNumber: table.number,
          items: items,
          status: 'NEW',
          createdAt: Date.now(),
        };

        addOrder(newOrder);

        // TRIGGER LOCAL NOTIFICATION
        // This simulates a "push" notification when an order arrives
        notificationService.displayLocalNotification(
          'New Order Received!',
          `Table ${table.number} • ${user.name}`,
        );
      }
    };

    // Run every 30 seconds
    const intervalId = setInterval(generateOrders, 60000);

    // Initial run? Maybe wait 30s as per requirement "Every 30 seconds".
    // If we want immediate orders for testing, we could call it here.
    // generateOrders();

    return () => clearInterval(intervalId);
  }, [addOrder, tables]);
};
