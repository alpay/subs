/**
 * Shine: Care Routine - Database Schema Types
 * Using MMKV only (no SQLite) - all data stored as JSON
 */

// ============================================
// User Profile
// ============================================
export type SkinType = 'Normal' | 'Oily' | 'Dry' | 'Combination' | 'Sensitive';
export type SkinSensitivity = 'Low' | 'SomewhatSensitive' | 'VerySensitive';
export type Phototype = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
export type Gender = 'Female' | 'Male' | 'Other' | 'PreferNotToSay';

// Skincare experience level from onboarding
export type SkincareExperience = 'Regular' | 'Occasional' | 'Beginner';

// User's skincare goals from onboarding
export type SkincareGoal
  = | 'FixConcerns'
    | 'TrackRoutines'
    | 'CreateRoutines'
    | 'DiscoverProducts'
    | 'TrackProgress'
    | 'LearnSkincare'
    | 'LearnAboutSkin';

// Skin concerns for multi-select
export type SkinConcern
  = | 'AcneBlemishes'
    | 'AntiAging'
    | 'Blackheads'
    | 'DarkCircles'
    | 'DarkSpots'
    | 'Dryness'
    | 'Dullness'
    | 'FineLines'
    | 'LossOfFirmness'
    | 'Oiliness'
    | 'Puffiness'
    | 'Redness'
    | 'UnevenTexture'
    | 'VisiblePores';

// User preferences from onboarding and settings
export type UserPreferences = {
  // Routine reminder times (HH:MM format)
  morningRoutineTime: string;
  skinDiaryTime: string;
  eveningRoutineTime: string;
  // Onboarding status
  hasCompletedOnboarding: boolean;
  hasSeenPaywall: boolean;
  // Premium status
  isPremium: boolean;
  premiumExpiresAt?: string; // ISO date
};

export type UserProfile = {
  id: string;
  name?: string;
  avatarUri?: string;
  skinType?: SkinType;
  skinSensitivity?: SkinSensitivity;
  phototype?: Phototype;
  concerns: SkinConcern[]; // Typed skin concerns
  age?: number;
  gender?: Gender;
  experience?: SkincareExperience; // Skincare experience level
  goals: SkincareGoal[]; // User's skincare goals
  showUvIndex: boolean;
  locale: string; // default: tr-TR
  preferences: UserPreferences; // User preferences from onboarding
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
};

// ============================================
// Products
// ============================================
export type ProductType
  = | 'Cleanser'
    | 'Toner'
    | 'Serum'
    | 'Moisturizer'
    | 'Sunscreen'
    | 'Treatment'
    | 'Mask'
    | 'Eye Cream'
    | 'Exfoliator'
    | 'Oil'
    | 'Balm'
    | 'Other';

export type Product = {
  id: string;
  name: string; // required
  brand?: string;
  type: ProductType;
  imageUri?: string;
  expirationDate?: string; // ISO date
  notes?: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
};

// ============================================
// Routines
// ============================================
export type RoutineCategory = 'Essentials' | 'Treatments' | 'GeneralHealth';
export type RepeatFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Custom';

/**
 * Routine interaction types:
 * - 'detailed': Opens routine detail sheet with step-by-step completion (default)
 * - 'diary': Opens diary camera/log screen
 * - 'quick': Shows simple confirmation bottom sheet for quick completion
 */
export type RoutineType = 'detailed' | 'diary' | 'quick';

export type RoutineStep = {
  id: string;
  routineId: string;
  title: string; // e.g., "Cleanser", "Toner"
  description?: string; // Optional step description
  productId?: string; // Linked product from user's shelf
  order: number; // For step ordering
  isOptional?: boolean;
};

export type Routine = {
  id: string;
  title: string; // e.g., "Morning Routine"
  iconKey: string; // For UI icon mapping
  category: RoutineCategory;
  routineType?: RoutineType; // Interaction type, defaults to 'detailed'
  enabled: boolean;
  repeat: RepeatFrequency;
  repeatDays?: number[]; // 0-6 for custom weekly (0 = Sunday, 1 = Monday)
  reminderTime?: string; // "09:00" format
  steps: RoutineStep[];
  bgImage?: string; // Background image for detail sheet
  order: number; // For routine list sorting
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
};

// ============================================
// Routine Completion (Daily Tracking)
// ============================================
export type RoutineCompletion = {
  id: string;
  date: string; // YYYY-MM-DD format
  routineId: string;
  completedStepIds: string[]; // IDs of completed steps
  isCompleted: boolean; // All required steps done
  completedAt?: string; // ISO date
};

// ============================================
// Skin Diary / Logs
// ============================================
export type SkinFeelingLabel = 'Great' | 'Normal' | 'Bad';
export type SkinDescriptor
  = | 'Normal'
    | 'Oily'
    | 'Dehydrated'
    | 'Itchy'
    | 'Red'
    | 'Clear'
    | 'Dull'
    | 'Glowing';

export type SkinLog = {
  id: string;
  date: string; // YYYY-MM-DD format
  photoUri?: string;
  feelingScore: number; // 0-100 slider
  feelingLabel: SkinFeelingLabel;
  skinDescriptors: SkinDescriptor[];
  notes?: string;
  productsUsed: string[]; // manually added products (not via routines)
  createdAt: string; // ISO date
};

export type TreatmentCompletion = {
  id: string;
  treatmentId: string;
  date: string; // YYYY-MM-DD format
  completedAt: string; // ISO date
};

// ============================================
// Treatments (Guides)
// ============================================
export type TreatmentCategory = 'All' | 'Face' | 'Hair' | 'Feet' | 'Nails' | 'Body';
export type TreatmentStepType = 'Checklist' | 'Instruction' | 'Timer';

export type TreatmentIngredient = {
  id: string;
  name: string;
  iconUri?: string;
  quantity?: string; // e.g., "1 piece", "1 tbsp"
  description?: string;
};

export type TreatmentChecklistItem = {
  id: string;
  title: string;
  subtitle?: string;
};

export type TreatmentStep = {
  id: string;
  type: TreatmentStepType;
  title: string;
  body: string;
  checklistItems?: TreatmentChecklistItem[];
  timerSeconds?: number;
  ambientSounds?: string[]; // Sound file references
};

export type Treatment = {
  id: string;
  title: string;
  category: TreatmentCategory;
  tags: string[]; // e.g., "Moisturizing", "For Oily Skin"
  durationMinutes: number;
  rating?: number; // e.g., 4.9
  weeklyUsedCount?: number; // e.g., 448 used this week
  heroImageUri?: string;
  overview: string;
  ingredients: TreatmentIngredient[];
  steps: TreatmentStep[];
  requiresPremium: boolean;
};

// ============================================
// Treatment Progress (User's active treatments)
// ============================================
export type TreatmentProgress = {
  id: string;
  treatmentId: string;
  startedAt: string; // ISO date
  completedAt?: string; // ISO date
  completedSteps: string[]; // step IDs
};

// ============================================
// Helper Types
// ============================================
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.

export type DateString = string; // YYYY-MM-DD format

// Index structures for efficient lookups
export type CompletionsByDate = Record<DateString, RoutineCompletion[]>;
export type SkinLogsByDate = Record<DateString, SkinLog[]>;
export type TreatmentProgressById = Record<string, TreatmentProgress>;
