import type { Category } from '@/lib/db/schema';

import { create } from 'zustand';
import { DEFAULT_CATEGORIES, OTHER_CATEGORY_NAME } from '@/lib/data/seed-defaults';
import { getCategories, getSubscriptions, saveCategories, saveSubscriptions } from '@/lib/db/storage';
import { useSubscriptionsStore } from '@/lib/stores/subscriptions-store';
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
    const otherCategory = next.find(c => c.name === OTHER_CATEGORY_NAME);
    if (otherCategory) {
      const subscriptions = getSubscriptions();
      const updated = subscriptions.map(sub =>
        sub.categoryId === categoryId
          ? { ...sub, categoryId: otherCategory.id, updatedAt: nowIso() }
          : sub,
      );
      const changed = updated.some((s, i) => s.categoryId !== subscriptions[i]?.categoryId);
      if (changed) {
        saveSubscriptions(updated);
        if (useSubscriptionsStore.getState().isLoaded) {
          useSubscriptionsStore.getState().load();
        }
      }
    }
    saveCategories(next);
    set({ categories: next });
  },
}));
