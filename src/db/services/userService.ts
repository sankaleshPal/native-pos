import { getDatabase } from '../database';
import type { User } from '../types';

export const authenticateUser = async (
  phone: string,
  password: string,
): Promise<User | null> => {
  const db = getDatabase();

  console.log('Authenticating user:', phone, password);

  const result = await db.execute(
    'SELECT * FROM users WHERE phone = ? AND password = ?',
    [phone, password],
  );

  console.log('Auth query result:', JSON.stringify(result));

  if (result.rows && result.rows.length > 0) {
    console.log('User found:', result.rows[0]);
    return result.rows[0] as unknown as User;
  }

  console.log('No user found');
  return null;
};

export const getUserById = async (id: number): Promise<User | null> => {
  const db = getDatabase();

  const result = await db.execute('SELECT * FROM users WHERE id = ?', [id]);

  if (result.rows && result.rows.length > 0) {
    return result.rows[0] as unknown as User;
  }

  return null;
};

export const getAllUsers = async (): Promise<User[]> => {
  const db = getDatabase();

  const result = await db.execute('SELECT * FROM users');

  return (result.rows || []) as unknown as User[];
};
