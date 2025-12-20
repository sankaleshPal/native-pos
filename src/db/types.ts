// DB types
export interface DatabaseResult<T> {
  rows: {
    length: number;
    item: (index: number) => T;
    [index: number]: T;
  };
  rowsAffected: number;
  insertId?: number;
}

// Existing types
export interface User {
  id: number;
  name: string;
  phone: string;
  password: string;
}

export interface Business {
  id: number;
  name: string;
  gst_number?: string;
  fssai?: string;
}

export interface Zone {
  id: number;
  business_id: number;
  name: string;
}

export interface Table {
  id: number;
  zone_id: number;
  table_name: string;
  table_code: string;
  capacity: number;
  status: 'empty' | 'active';
}

export interface ZoneWithTables extends Zone {
  tables: Table[];
}

// Menu types
export interface Category {
  id: number;
  name: string;
  visibility: boolean;
  sequence: number;
}

export interface Dish {
  id: number;
  name: string;
  description?: string;
  price: number;
  dish_type: 'VEG' | 'NON_VEG' | 'EGG' | 'VEGAN';
  visibility: boolean;
  availability: boolean;
  gst: number;
  avg_prep_time: number;
}

export interface DishWithDetails extends Dish {
  categories: Category[];
  portions: Portion[];
  addOns: AddOnWithChoices[];
}

export interface Portion {
  id: number;
  dish_id: number;
  name: string;
  price: number;
  is_default: boolean;
  portion_type?: string;
}

export interface AddOn {
  id: number;
  name: string;
  compulsory: boolean;
  max_quantity: number;
  choice_type: 'CHECKBOX' | 'NUMBER' | 'RADIO';
}

export interface AddOnChoice {
  id: number;
  add_on_id: number;
  name: string;
  price: number;
  max_quantity: number;
  choice_dish_type?: string;
}

export interface AddOnWithChoices extends AddOn {
  choices: AddOnChoice[];
}

// Cart types
export interface CartExtra {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface CartItem {
  id: string; // Format: dishId_portionId_extras
  dish: DishWithDetails;
  portion: Portion | null;
  extras: CartExtra[];
  quantity: number;
}

export interface Cart {
  businessId: string;
  userId: string;
  tableName: string;
  customerName?: string;
  customerPhone?: string;
  internalCart: CartItem[];
}

// Order types
export interface Order {
  id: number;
  table_id: number;
  user_id: number;
  customer_name?: string;
  customer_phone?: string;
  status: 'active' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  dish_id: number;
  portion_id?: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface OrderItemAddOn {
  id: number;
  order_item_id: number;
  add_on_choice_id: number;
  quantity: number;
  price: number;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    dish: Dish;
    portion?: Portion;
    addOns: (OrderItemAddOn & { choice: AddOnChoice })[];
  })[];
}

// KOT (Kitchen Order Ticket) types
export interface KOT {
  id: number;
  table_id: number;
  user_id: string;
  punched_by: string;
  punched_at: string;
  items_count: number;
  subtotal: number;
  status: 'active' | 'completed';
  created_at: string;
  session_id?: number | null;
}

export interface KOTItem {
  id: number;
  kot_id: number;
  dish_id: number;
  dish_name: string;
  portion_name: string | null;
  portion_price: number;
  quantity: number;
  extras: string; // JSON string
  item_total: number;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by: string | null;
  deletion_reason: string | null;
  created_at: string;
}

export interface KOTWithItems extends KOT {
  items: KOTItem[];
}

// Billing types
export interface Bill {
  id: number;
  table_id: number;
  table_name: string;
  subtotal: number;
  tax: number;
  total: number;
  payment_mode?: PaymentMode;
  settled_by?: string;
  settled_at?: string;
  status: 'pending' | 'settled';
  created_at: string;
  kots?: KOT[]; // For UI convenience
  session_id?: number | null;
}

export interface BillWithKOTs extends Bill {
  kots: KOTWithItems[];
}

export type PaymentMode = 'UPI' | 'Cash' | 'Swiggy' | 'Zomato';

// Update Table interface with KOT tracking fields
export interface TableWithKOTInfo extends Table {
  active_since: string | null;
  current_total: number;
  total_kots: number;
}
