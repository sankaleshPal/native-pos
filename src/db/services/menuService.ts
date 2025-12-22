import { getDatabase } from '../database';
import type {
  Category,
  Dish,
  DishWithDetails,
  Portion,
  AddOn,
  AddOnChoice,
  AddOnWithChoices,
} from '../types';

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
  const db = await getDatabase();
  const result = await db.execute(
    'SELECT * FROM categories WHERE visibility = 1 ORDER BY sequence, name',
  );
  return (result.rows || []) as unknown as Category[];
};

// Get all dishes
export const getAllDishes = async (): Promise<Dish[]> => {
  const db = await getDatabase();
  const result = await db.execute(
    'SELECT * FROM dishes WHERE visibility = 1 AND availability = 1',
  );
  return (result.rows || []) as unknown as Dish[];
};

// Get dishes by category
export const getDishesByCategory = async (
  categoryId: number,
): Promise<Dish[]> => {
  const db = await getDatabase();
  const result = await db.execute(
    `SELECT d.* FROM dishes d
     INNER JOIN dish_categories dc ON d.id = dc.dish_id
     WHERE dc.category_id = ? AND d.visibility = 1 AND d.availability = 1`,
    [categoryId],
  );
  return (result.rows || []) as unknown as Dish[];
};

// Get dish with full details (portions, add-ons)
export const getDishWithDetails = async (
  dishId: number,
): Promise<DishWithDetails | null> => {
  const db = await getDatabase();

  // Get dish
  const dishResult = await db.execute('SELECT * FROM dishes WHERE id = ?', [
    dishId,
  ]);
  if (!dishResult.rows || dishResult.rows.length === 0) return null;

  const dish = dishResult.rows[0] as unknown as Dish;

  // Get categories
  const categoriesResult = await db.execute(
    `SELECT c.* FROM categories c
     INNER JOIN dish_categories dc ON c.id = dc.category_id
     WHERE dc.dish_id = ?`,
    [dishId],
  );
  const categories = (categoriesResult.rows || []) as unknown as Category[];

  // Get portions
  const portionsResult = await db.execute(
    'SELECT * FROM portions WHERE dish_id = ? ORDER BY is_default DESC, price',
    [dishId],
  );
  const portions = (portionsResult.rows || []) as unknown as Portion[];

  // Get add-ons with choices
  const addOnsResult = await db.execute(
    `SELECT a.* FROM add_ons a
     INNER JOIN dish_add_ons da ON a.id = da.add_on_id
     WHERE da.dish_id = ?`,
    [dishId],
  );
  const addOns = (addOnsResult.rows || []) as unknown as AddOn[];

  const addOnsWithChoices: AddOnWithChoices[] = await Promise.all(
    addOns.map(async addOn => {
      const choicesResult = await db.execute(
        'SELECT * FROM add_on_choices WHERE add_on_id = ?',
        [addOn.id],
      );
      const choices = (choicesResult.rows || []) as unknown as AddOnChoice[];
      return { ...addOn, choices };
    }),
  );

  return {
    ...dish,
    categories,
    portions,
    addOns: addOnsWithChoices,
  };
};

// Search dishes
export const searchDishes = async (query: string): Promise<Dish[]> => {
  const db = await getDatabase();
  const result = await db.execute(
    `SELECT * FROM dishes 
     WHERE (name LIKE ? OR description LIKE ?) 
     AND visibility = 1 AND availability = 1`,
    [`%${query}%`, `%${query}%`],
  );
  return (result.rows || []) as unknown as Dish[];
};
