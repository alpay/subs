import type { List } from '@/lib/db/schema';

import { create } from 'zustand';
import { DEFAULT_LISTS } from '@/lib/data/seed-defaults';
import { getLists, saveLists } from '@/lib/db/storage';
import { createId } from '@/lib/utils/ids';

const nowIso = () => new Date().toISOString();

type ListsState = {
  lists: List[];
  isLoaded: boolean;
  load: () => void;
  add: (name: string) => List;
  update: (list: List) => void;
  remove: (listId: string) => void;
};

export const useListsStore = create<ListsState>((set, get) => ({
  lists: [],
  isLoaded: false,
  load: () => {
    const stored = getLists();
    const lists = stored.length > 0 ? stored : DEFAULT_LISTS;
    if (stored.length === 0) {
      saveLists(lists);
    }
    set({ lists, isLoaded: true });
  },
  add: (name) => {
    const list: List = {
      id: createId('list'),
      name,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    const next = [...get().lists, list];
    saveLists(next);
    set({ lists: next });
    return list;
  },
  update: (list) => {
    const updated = { ...list, updatedAt: nowIso() };
    const next = get().lists.map(item => item.id === updated.id ? updated : item);
    saveLists(next);
    set({ lists: next });
  },
  remove: (listId) => {
    const next = get().lists.filter(item => item.id !== listId);
    saveLists(next);
    set({ lists: next });
  },
}));
