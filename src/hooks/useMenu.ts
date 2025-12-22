import { useQuery } from '@tanstack/react-query';
import {
  getAllCategories,
  getDishesByCategory,
} from '../db/services/menuService';

export const queryKeys = {
  categories: ['categories'] as const,
  dishes: (categoryId: number) => ['dishes', categoryId] as const,
};

export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: getAllCategories,
  });
};

export const useDishes = (categoryId: number | null) => {
  return useQuery({
    queryKey: queryKeys.dishes(categoryId || 0),
    queryFn: () =>
      categoryId ? getDishesByCategory(categoryId) : Promise.resolve([]),
    enabled: !!categoryId,
  });
};
