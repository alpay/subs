import type { ServiceTemplate } from '@/lib/db/schema';

import { create } from 'zustand';
import { DEFAULT_SERVICE_TEMPLATES } from '@/lib/data/seed-defaults';
import { getServiceTemplates, saveServiceTemplates } from '@/lib/db/storage';

export type ServiceTemplatesState = {
  templates: ServiceTemplate[];
  isLoaded: boolean;
  load: () => void;
};

export const useServiceTemplatesStore = create<ServiceTemplatesState>(set => ({
  templates: [],
  isLoaded: false,
  load: () => {
    const stored = getServiceTemplates();
    const templates = stored.length > 0 ? stored : DEFAULT_SERVICE_TEMPLATES;
    if (stored.length === 0) {
      saveServiceTemplates(templates);
    }
    set({ templates, isLoaded: true });
  },
}));
