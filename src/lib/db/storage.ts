/**
 * Shine: Care Routine - MMKV Storage Layer
 * All data stored as JSON with prefixed keys for organization
 */

import type {
  CompletionsByDate,
  Product,
  Routine,
  RoutineCompletion,
  SkinLog,
  SkinLogsByDate,
  TreatmentProgress,
  TreatmentProgressById,
  UserProfile,
} from './schema';
import { storage } from '@/lib/storage';

// ============================================
// Storage Keys
// ============================================
const KEYS = {
  USER_PROFILE: 'shine:user_profile',
  PRODUCTS: 'shine:products',
  ROUTINES: 'shine:routines',
  COMPLETIONS: 'shine:completions',
  SKIN_LOGS: 'shine:skin_logs',
  TREATMENT_PROGRESS: 'shine:treatment_progress',
  HAS_SEEDED_DEFAULTS: 'shine:has_seeded_defaults',
  HAS_COMPLETED_ONBOARDING: 'shine:has_completed_onboarding',
} as const;

// ============================================
// Generic MMKV Helpers
// ============================================
export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  return value ? (JSON.parse(value) as T) : null;
}

export function setItem<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}

export function removeItem(key: string): void {
  storage.remove(key);
}

// ============================================
// User Profile Storage
// ============================================
export function saveUserProfile(profile: UserProfile): void {
  setItem(KEYS.USER_PROFILE, profile);
}

export function getUserProfile(): UserProfile | null {
  return getItem<UserProfile>(KEYS.USER_PROFILE);
}

export function deleteUserProfile(): void {
  removeItem(KEYS.USER_PROFILE);
}

// ============================================
// Products Storage
// ============================================
export function saveProducts(products: Product[]): void {
  setItem(KEYS.PRODUCTS, products);
}

export function getProducts(): Product[] {
  return getItem<Product[]>(KEYS.PRODUCTS) ?? [];
}

export function addProduct(product: Product): void {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
}

export function updateProduct(updatedProduct: Product): void {
  const products = getProducts();
  const index = products.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    products[index] = { ...updatedProduct, updatedAt: new Date().toISOString() };
    saveProducts(products);
  }
}

export function deleteProduct(productId: string): void {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== productId);
  saveProducts(filtered);
}

export function getProductById(productId: string): Product | undefined {
  const products = getProducts();
  return products.find(p => p.id === productId);
}

// ============================================
// Routines Storage
// ============================================
export function saveRoutines(routines: Routine[]): void {
  setItem(KEYS.ROUTINES, routines);
}

export function getRoutines(): Routine[] {
  return getItem<Routine[]>(KEYS.ROUTINES) ?? [];
}

export function addRoutine(routine: Routine): void {
  const routines = getRoutines();
  routines.push(routine);
  saveRoutines(routines);
}

export function updateRoutine(updatedRoutine: Routine): void {
  const routines = getRoutines();
  const index = routines.findIndex(r => r.id === updatedRoutine.id);
  if (index !== -1) {
    routines[index] = { ...updatedRoutine, updatedAt: new Date().toISOString() };
    saveRoutines(routines);
  }
}

export function deleteRoutine(routineId: string): void {
  const routines = getRoutines();
  const filtered = routines.filter(r => r.id !== routineId);
  saveRoutines(filtered);
}

export function getRoutineById(routineId: string): Routine | undefined {
  const routines = getRoutines();
  return routines.find(r => r.id === routineId);
}

export function getEnabledRoutines(): Routine[] {
  return getRoutines()
    .filter(r => r.enabled)
    .sort((a, b) => a.order - b.order);
}

// ============================================
// Routine Completions Storage (Date-indexed)
// ============================================
export function saveCompletions(completions: CompletionsByDate): void {
  setItem(KEYS.COMPLETIONS, completions);
}

export function getCompletions(): CompletionsByDate {
  return getItem<CompletionsByDate>(KEYS.COMPLETIONS) ?? {};
}

export function getCompletionsForDate(date: string): RoutineCompletion[] {
  const completions = getCompletions();
  return completions[date] ?? [];
}

export function saveCompletionForDate(
  date: string,
  completion: RoutineCompletion,
): void {
  const completions = getCompletions();
  if (!completions[date]) {
    completions[date] = [];
  }
  const index = completions[date].findIndex(c => c.routineId === completion.routineId);
  if (index !== -1) {
    completions[date][index] = completion;
  }
  else {
    completions[date].push(completion);
  }
  saveCompletions(completions);
}

export function deleteCompletionForRoutine(routineId: string, date: string): void {
  const completions = getCompletions();
  if (completions[date]) {
    completions[date] = completions[date].filter(c => c.routineId !== routineId);
    if (completions[date].length === 0) {
      delete completions[date];
    }
    saveCompletions(completions);
  }
}

export function getCompletionForRoutineOnDate(
  routineId: string,
  date: string,
): RoutineCompletion | undefined {
  const completions = getCompletionsForDate(date);
  return completions.find(c => c.routineId === routineId);
}

type ToggleStepCompletionParams = {
  routineId: string;
  stepId: string;
  date: string;
  requiredStepIds?: string[];
};

export function toggleStepCompletion({
  routineId,
  stepId,
  date,
  requiredStepIds,
}: ToggleStepCompletionParams): RoutineCompletion {
  const completions = getCompletions();
  if (!completions[date]) {
    completions[date] = [];
  }

  let completion = completions[date].find(c => c.routineId === routineId);

  if (!completion) {
    completion = {
      id: `${routineId}-${date}`,
      date,
      routineId,
      completedStepIds: [stepId],
      isCompleted: false,
    };
    completions[date].push(completion);
  }
  else {
    const stepIndex = completion.completedStepIds.indexOf(stepId);
    if (stepIndex > -1) {
      completion.completedStepIds.splice(stepIndex, 1);
    }
    else {
      completion.completedStepIds.push(stepId);
    }
  }

  if (requiredStepIds && requiredStepIds.length > 0) {
    const allRequiredCompleted = requiredStepIds.every(
      id => completion!.completedStepIds.includes(id),
    );
    completion.isCompleted = allRequiredCompleted;
    if (allRequiredCompleted) {
      completion.completedAt = new Date().toISOString();
    }
    else {
      completion.completedAt = undefined;
    }
  }

  saveCompletions(completions);
  return completion;
}

// ============================================
// Skin Logs Storage (Date-indexed)
// ============================================
export function saveSkinLogs(logs: SkinLogsByDate): void {
  setItem(KEYS.SKIN_LOGS, logs);
}

export function getSkinLogs(): SkinLogsByDate {
  return getItem<SkinLogsByDate>(KEYS.SKIN_LOGS) ?? {};
}

export function getSkinLogsForDate(date: string): SkinLog[] {
  const logs = getSkinLogs();
  return logs[date] ?? [];
}

export function addSkinLog(log: SkinLog): void {
  const logs = getSkinLogs();
  if (!logs[log.date]) {
    logs[log.date] = [];
  }
  logs[log.date].push(log);
  saveSkinLogs(logs);
}

export function updateSkinLog(updatedLog: SkinLog): void {
  const logs = getSkinLogs();
  if (!logs[updatedLog.date])
    return;

  const index = logs[updatedLog.date].findIndex(l => l.id === updatedLog.id);
  if (index !== -1) {
    logs[updatedLog.date][index] = updatedLog;
    saveSkinLogs(logs);
  }
}

export function deleteSkinLog(logId: string, date: string): void {
  const logs = getSkinLogs();
  if (!logs[date])
    return;

  logs[date] = logs[date].filter(l => l.id !== logId);
  if (logs[date].length === 0) {
    delete logs[date];
  }
  saveSkinLogs(logs);
}

export function getSkinLogById(logId: string): SkinLog | undefined {
  const logs = getSkinLogs();
  for (const date in logs) {
    const found = logs[date].find(l => l.id === logId);
    if (found)
      return found;
  }
  return undefined;
}

// ============================================
// Treatment Progress Storage
// ============================================
export function saveTreatmentProgress(progress: TreatmentProgressById): void {
  setItem(KEYS.TREATMENT_PROGRESS, progress);
}

export function getTreatmentProgress(): TreatmentProgressById {
  return getItem<TreatmentProgressById>(KEYS.TREATMENT_PROGRESS) ?? {};
}

export function getTreatmentProgressById(
  treatmentId: string,
): TreatmentProgress | undefined {
  const progress = getTreatmentProgress();
  return progress[treatmentId];
}

export function startTreatment(treatmentId: string): TreatmentProgress {
  const progress = getTreatmentProgress();
  const newProgress: TreatmentProgress = {
    id: `${treatmentId}-${Date.now()}`,
    treatmentId,
    startedAt: new Date().toISOString(),
    completedSteps: [],
  };
  progress[treatmentId] = newProgress;
  saveTreatmentProgress(progress);
  return newProgress;
}

export function updateTreatmentProgress(
  treatmentId: string,
  updates: Partial<TreatmentProgress>,
): void {
  const progress = getTreatmentProgress();
  if (progress[treatmentId]) {
    progress[treatmentId] = { ...progress[treatmentId], ...updates };
    saveTreatmentProgress(progress);
  }
}

export function completeTreatmentStep(
  treatmentId: string,
  stepId: string,
): void {
  const progress = getTreatmentProgress();
  if (!progress[treatmentId]) {
    progress[treatmentId] = {
      id: `${treatmentId}-${Date.now()}`,
      treatmentId,
      startedAt: new Date().toISOString(),
      completedSteps: [stepId],
    };
  }
  else if (!progress[treatmentId].completedSteps.includes(stepId)) {
    progress[treatmentId].completedSteps.push(stepId);
  }
  saveTreatmentProgress(progress);
}

// ============================================
// App State / Flags
// ============================================
export function hasSeededDefaults(): boolean {
  return storage.getBoolean(KEYS.HAS_SEEDED_DEFAULTS) ?? false;
}

export function setHasSeededDefaults(value: boolean): void {
  storage.set(KEYS.HAS_SEEDED_DEFAULTS, value);
}

export function hasCompletedOnboarding(): boolean {
  return storage.getBoolean(KEYS.HAS_COMPLETED_ONBOARDING) ?? false;
}

export function setHasCompletedOnboarding(value: boolean): void {
  storage.set(KEYS.HAS_COMPLETED_ONBOARDING, value);
}

// ============================================
// Clear All Data (for logout/reset)
// ============================================
export function clearAllData(): void {
  Object.values(KEYS).forEach((key) => {
    storage.remove(key);
  });
}
