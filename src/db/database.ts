import { open } from '@op-engineering/op-sqlite';

let db: ReturnType<typeof open> | null = null;

let initPromise: Promise<void> | null = null;

export const getDatabase = async (): Promise<ReturnType<typeof open>> => {
  if (!db) {
    db = open({ name: 'pos.db' });
    initPromise = initializeDatabase();
  }

  if (initPromise) {
    await initPromise;
    initPromise = null;
  }
  return db;
};

export const getDBConnection = getDatabase;

const initializeDatabase = async () => {
  if (!db) return;

  // Create Users table with unique phone
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  // Create Business table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS business (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      gst_number TEXT,
      fssai TEXT
    );
  `);

  // Create Zones table with unique name per business
  await db.execute(`
    CREATE TABLE IF NOT EXISTS zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (business_id) REFERENCES business(id),
      UNIQUE(business_id, name)
    );
  `);

  // Create Tables table with unique table_code globally
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zone_id INTEGER NOT NULL,
      table_name TEXT NOT NULL,
      table_code TEXT NOT NULL UNIQUE,
      capacity INTEGER,
      status TEXT DEFAULT 'empty' CHECK(status IN ('empty', 'active')),
      FOREIGN KEY (zone_id) REFERENCES zones(id),
      UNIQUE(zone_id, table_name)
    );
  `);

  // Create Categories table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      visibility BOOLEAN DEFAULT 1,
      sequence INTEGER DEFAULT 0
    );
  `);

  // Create Dishes table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS dishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      price REAL NOT NULL,
      dish_type TEXT CHECK(dish_type IN ('VEG', 'NON_VEG', 'EGG', 'VEGAN')),
      visibility BOOLEAN DEFAULT 1,
      availability BOOLEAN DEFAULT 1,
      gst REAL DEFAULT 5,
      avg_prep_time INTEGER DEFAULT 0
    );
  `);

  // Create Dish_Categories junction table (many-to-many)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS dish_categories (
      dish_id INTEGER,
      category_id INTEGER,
      PRIMARY KEY (dish_id, category_id),
      FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  // Create Portions table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS portions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dish_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      is_default BOOLEAN DEFAULT 0,
      portion_type TEXT,
      FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
      UNIQUE(dish_id, name)
    );
  `);

  // Create AddOns table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS add_ons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      compulsory BOOLEAN DEFAULT 0,
      max_quantity INTEGER DEFAULT 1,
      choice_type TEXT CHECK(choice_type IN ('CHECKBOX', 'NUMBER', 'RADIO'))
    );
  `);

  // Create AddOn_Choices table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS add_on_choices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      add_on_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL DEFAULT 0,
      max_quantity INTEGER DEFAULT 1,
      choice_dish_type TEXT,
      FOREIGN KEY (add_on_id) REFERENCES add_ons(id) ON DELETE CASCADE
    );
  `);

  // Create Dish_AddOns junction table (many-to-many)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS dish_add_ons (
      dish_id INTEGER,
      add_on_id INTEGER,
      PRIMARY KEY (dish_id, add_on_id),
      FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
      FOREIGN KEY (add_on_id) REFERENCES add_ons(id) ON DELETE CASCADE
    );
  `);

  // Create Orders table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      customer_name TEXT,
      customer_phone TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled')),
      subtotal REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (table_id) REFERENCES tables(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Create Order_Items table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      dish_id INTEGER NOT NULL,
      portion_id INTEGER,
      quantity INTEGER DEFAULT 1,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      notes TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (dish_id) REFERENCES dishes(id),
      FOREIGN KEY (portion_id) REFERENCES portions(id)
    );
  `);

  // Create Order_Item_AddOns table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS order_item_add_ons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_item_id INTEGER NOT NULL,
      add_on_choice_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      price REAL NOT NULL,
      FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
      FOREIGN KEY (add_on_choice_id) REFERENCES add_on_choices(id)
    );
  `);

  // Update Tables table with KOT tracking columns
  // SQLite doesn't support IF NOT EXISTS in ALTER TABLE, so we use try-catch
  try {
    await db.execute(`ALTER TABLE tables ADD COLUMN active_since TEXT;`);
  } catch (e) {
    // Column might already exist, ignore error
  }
  try {
    await db.execute(
      `ALTER TABLE tables ADD COLUMN current_total REAL DEFAULT 0;`,
    );
  } catch (e) {
    // Column might already exist, ignore error
  }
  try {
    await db.execute(
      `ALTER TABLE tables ADD COLUMN total_kots INTEGER DEFAULT 0;`,
    );
  } catch (e) {
    // Column might already exist, ignore error
  }

  // Create KOTs (Kitchen Order Tickets) table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS kots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      punched_by TEXT NOT NULL,
      punched_at TEXT NOT NULL,
      items_count INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (table_id) REFERENCES tables(id)
    );
  `);

  // Create KOT_Items table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS kot_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kot_id INTEGER NOT NULL,
      dish_id INTEGER NOT NULL,
      dish_name TEXT NOT NULL,
      portion_name TEXT,
      portion_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      extras TEXT,
      item_total REAL NOT NULL,
      is_deleted INTEGER DEFAULT 0,
      deleted_at TEXT,
      deleted_by TEXT,
      deletion_reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (kot_id) REFERENCES kots(id) ON DELETE CASCADE,
      FOREIGN KEY (dish_id) REFERENCES dishes(id)
    );
  `);

  // Create Bills table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER NOT NULL,
      table_name TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      payment_mode TEXT,
      settled_by TEXT,
      settled_at TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'settled')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (table_id) REFERENCES tables(id)
    );
  `);

  // Create Bill_KOTs junction table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS bill_kots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id INTEGER NOT NULL,
      kot_id INTEGER NOT NULL,
      FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
      FOREIGN KEY (kot_id) REFERENCES kots(id)
    );
  `);

  // Create Table Sessions table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS table_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER NOT NULL,
      start_time TEXT DEFAULT CURRENT_TIMESTAMP,
      end_time TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed')),
      FOREIGN KEY (table_id) REFERENCES tables(id)
    );
  `);

  // Add session_id columns
  try {
    await db.execute(
      `ALTER TABLE kots ADD COLUMN session_id INTEGER DEFAULT NULL;`,
    );
  } catch (e) {
    /* ignore */
  }

  try {
    await db.execute(
      `ALTER TABLE bills ADD COLUMN session_id INTEGER DEFAULT NULL;`,
    );
  } catch (e) {
    /* ignore */
  }

  try {
    await db.execute(
      `ALTER TABLE tables ADD COLUMN active_session_id INTEGER DEFAULT NULL;`,
    );
  } catch (e) {
    /* ignore */
  }

  await seedDefaultData();
};

const seedDefaultData = async () => {
  if (!db) return;

  try {
    // Check if users already exist
    const userCount = await db.execute('SELECT COUNT(*) as count FROM users;');
    console.log('User count query result:', JSON.stringify(userCount));

    const count = (userCount.rows?.[0]?.count as number) ?? 0;
    console.log('Parsed count:', count);

    if (count > 0) {
      console.log('Data already seeded, skipping...');
      return; // Data already seeded
    }

    console.log('Seeding default data...');

    // Insert default users
    await db.execute(`
      INSERT INTO users (name, phone, password) VALUES
      ('Sankalesh', '8668229890', '6344'),
      ('Datta', '9588413799', '6344');
    `);
    console.log('Users inserted');

    // Insert default business
    await db.execute(`
      INSERT INTO business (name, gst_number, fssai) VALUES
      ('My Restaurant', '22AAAAA0000A1Z5', 'FSSAI123456');
    `);
    console.log('Business inserted');

    // Insert default zones
    await db.execute(`
      INSERT INTO zones (business_id, name) VALUES
      (1, 'Indoor'),
      (1, 'Outdoor'),
      (1, 'VIP Section');
    `);
    console.log('Zones inserted');

    // Insert default tables with unique codes
    await db.execute(`
      INSERT INTO tables (zone_id, table_name, table_code, capacity, status) VALUES
      (1, 'Table 1', 'IN-01', 4, 'empty'),
      (1, 'Table 2', 'IN-02', 4, 'empty'),
      (1, 'Table 3', 'IN-03', 6, 'empty'),
      (1, 'Table 4', 'IN-04', 2, 'empty'),
      (2, 'Table 5', 'OUT-01', 4, 'empty'),
      (2, 'Table 6', 'OUT-02', 6, 'empty'),
      (2, 'Table 7', 'OUT-03', 4, 'empty'),
      (3, 'VIP 1', 'VIP-01', 8, 'empty'),
      (3, 'VIP 2', 'VIP-02', 6, 'empty');
    `);
    console.log('Tables inserted');

    // Insert sample categories
    await db.execute(`
      INSERT INTO categories (name, visibility, sequence) VALUES
      ('Vegetarian Soups', 1, 1),
      ('Non-Vegetarian Rice & Biryani', 1, 2);
    `);
    console.log('Categories inserted');

    // Insert sample dishes
    await db.execute(`
      INSERT INTO dishes (name, description, price, dish_type, visibility, availability, gst, avg_prep_time) VALUES
      ('Cream of Mushroom Soup', 'Cream of Mushroom Soup crafted with balanced flavors in Vegetarian Soups.', 319, 'VEG', 1, 1, 5, 0),
      ('Lemon Coriander Soup', 'Lemon Coriander Soup crafted with balanced flavors in Vegetarian Soups.', 380, 'VEG', 1, 1, 5, 0),
      ('Vegetable Manchow Soup', 'Vegetable Manchow Soup crafted with balanced flavors in Vegetarian Soups.', 319, 'VEG', 1, 1, 5, 0),
      ('Mutton Biryani', 'Mutton Biryani crafted with balanced flavors in Non-Vegetarian Rice & Biryani.', 699, 'NON_VEG', 1, 1, 5, 0),
      ('Murgh Dum Biryani', 'Murgh Dum Biryani crafted with balanced flavors in Non-Vegetarian Rice & Biryani.', 629, 'NON_VEG', 1, 1, 5, 0);
    `);
    console.log('Dishes inserted');

    // Link dishes to categories
    await db.execute(`
      INSERT INTO dish_categories (dish_id, category_id) VALUES
      (1, 1), (2, 1), (3, 1),
      (4, 2), (5, 2);
    `);
    console.log('Dish categories linked');

    // Insert portions
    await db.execute(`
      INSERT INTO portions (dish_id, name, price, is_default, portion_type) VALUES
      (1, 'Regular', 319, 1, 'VEG'),
      (1, 'Full', 580, 0, 'VEG'),
      (2, 'Regular', 380, 1, 'VEG'),
      (3, 'Regular', 319, 1, 'VEG'),
      (4, 'Regular', 699, 1, 'NON_VEG'),
      (5, 'Regular', 629, 1, 'NON_VEG');
    `);
    console.log('Portions inserted');

    // Insert add-ons
    await db.execute(`
      INSERT INTO add_ons (name, compulsory, max_quantity, choice_type) VALUES
      ('Bread Selection', 1, 3, 'CHECKBOX'),
      ('Extra Sauce', 0, 2, 'NUMBER');
    `);
    console.log('Add-ons inserted');

    // Insert add-on choices
    await db.execute(`
      INSERT INTO add_on_choices (add_on_id, name, price, max_quantity, choice_dish_type) VALUES
      (1, 'Bread 1', 10, 3, 'VEG'),
      (1, 'Bread 2', 10, 3, 'VEG'),
      (1, 'Bread 3', 10, 3, 'EGG'),
      (1, 'Bread 4', 0, 3, 'VEGAN'),
      (2, 'Red Sauce', 78, 4, 'VEG');
    `);
    console.log('Add-on choices inserted');

    // Link add-ons to dishes
    await db.execute(`
      INSERT INTO dish_add_ons (dish_id, add_on_id) VALUES
      (1, 1), (1, 2);
    `);
    console.log('Dish add-ons linked');

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
  }
};
