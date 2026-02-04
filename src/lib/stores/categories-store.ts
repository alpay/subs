import type { Category } from '@/lib/db/schema';

import { create } from 'zustand';
import { DEFAULT_CATEGORIES } from '@/lib/data/seed-defaults';
import { getCategories, saveCategories } from '@/lib/db/storage';
import { createId } from '@/lib/utils/ids';

const nowIso = () => new Date().toISOString();

type CategoriesState = {
  categories: Category[];
  isLoaded: boolean;
  load: () => void;
  add: (name: string, color: string) => Category;
  update: (category: Category) => void;
  remove: (categoryId: string) => void;
};

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  isLoaded: false,
  load: () => {
    const stored = getCategories();
    const categories = stored.length > 0 ? stored : DEFAULT_CATEGORIES;
    if (stored.length === 0) {
      saveCategories(categories);
    }
    set({ categories, isLoaded: true });
  },
  add: (name, color) => {
    const category: Category = {
      id: createId('cat'),
      name,
      color,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    const next = [...get().categories, category];
    saveCategories(next);
    set({ categories: next });
    return category;
  },
  update: (category) => {
    const updated = { ...category, updatedAt: nowIso() };
    const next = get().categories.map(item => item.id === updated.id ? updated : item);
    saveCategories(next);
    set({ categories: next });
  },
  remove: (categoryId) => {
    const next = get().categories.filter(item => item.id !== categoryId);
    saveCategories(next);
    set({ categories: next });
  },
}));
