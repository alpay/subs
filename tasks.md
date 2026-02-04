# Subs — Implementation Tasks (Phased)

## Overview
This file breaks the work into 4 phases with explicit, step-by-step instructions. Each phase is designed to be independently shippable and reviewable.

## Phase 1 — Cleanup + New Skeleton
Goal: Remove all care-routine features and prepare routing/shells for the Subs app.

1. [x] Remove feature folders and screens:
   - `src/app/(app)/diary`
   - `src/app/(app)/learn`
   - `src/app/(app)/products`
   - `src/app/(app)/today`
   - `src/app/(app)/treatments`
   - `src/app/(modals)/diary`
   - `src/app/(modals)/routines`
   - `src/app/(modals)/paywall.tsx`
   - `src/features/diary`
   - `src/features/learn`
   - `src/features/products`
   - `src/features/routines`
   - `src/features/today`
   - `src/features/treatments`
   - `src/features/onboarding`
   - `src/features/premium`
   - `src/features/uv-index`
   - `src/components/routines`
   - `src/components/treatments`
   - `src/components/forms`

2. [x] Remove old skincare assets and data:
   - `src/lib/data/seed-data.ts`
   - `src/lib/assets/images.ts`
   - Any unused assets in `assets/images/` tied to routines/treatments.

3. [x] Replace navigation with single Home screen:
   - Update `src/app/index.tsx` to redirect to `/home`.
   - Replace `src/app/(app)/_layout.tsx` with a single Stack (no tabs).
   - Create `src/app/(app)/home.tsx` shell.

4. [x] Add modal shells:
   - Create empty modal screens for `analytics`, `settings`, `add-subscription`, `subscription-form`, `csv-import`, `categories`, `lists`, `currency`, `notification-settings`, `payment-methods`, `icon-picker`.

5. [x] Remove old stores/logic not needed:
   - Remove `src/lib/stores/*` files tied to routines/treatments/diary.
   - Keep shared utilities and MMKV base.

6. [x] Update i18n keys:
   - Remove translations for skincare and add basic app strings for Subs.

7. [x] Confirm app name placeholder:
   - Set visible UI string to “Subs” in Settings header and account card.

Deliverable:
- Clean build with no references to old features.
- App opens to empty Home screen.

Phase 1 Complete:
- Cleanup and skeleton complete. No old feature references remain in app routes/layouts.

## Phase 2 — Data + Logic Foundation
Goal: Define data models, storage, stores, and core calculations.

1. [x] Add new schema types:
   - Replace `src/lib/db/schema.ts` with subscription tracker models.
   - Add types for Subscription, Category, List, PaymentMethod, Settings, CurrencyRates, ReminderConfig, ServiceTemplate.

2. [x] Update MMKV storage:
   - Replace `src/lib/db/storage.ts` with new keys and CRUD for new models.

3. [x] Create Zustand stores:
   - `src/lib/stores/subscriptions-store.ts`
   - `src/lib/stores/categories-store.ts`
   - `src/lib/stores/lists-store.ts`
   - `src/lib/stores/payment-methods-store.ts`
   - `src/lib/stores/settings-store.ts`
   - `src/lib/stores/currency-rates-store.ts`
   - `src/lib/stores/service-templates-store.ts`

4. [x] Add core utility functions:
   - `src/lib/utils/subscription-dates.ts` for next-payment logic.
   - `src/lib/utils/currency.ts` for conversion + rounding.
   - `src/lib/utils/totals.ts` for monthly total, yearly forecast, average monthly.

5. [x] Add bundled currency rates file:
   - `assets/data/currency-rates.json`
   - Base EUR, include EUR, USD, GBP, JPY, CAD, AUD, CHF.
   - Load into store on app start.

6. [x] Seed defaults:
   - Create default categories, lists, payment methods, and service templates.

7. [x] Add notification scheduler:
   - `src/lib/notifications.ts`
   - Schedule local notifications based on reminder settings.

Deliverable:
- Data layer complete and tested with mocked entries.
- Core computations verified with unit-style checks.

Phase 2 Complete:
- Data models, storage, stores, utilities, defaults, and notifications scaffolded.

## Phase 3 — Core UI and Screens
Goal: Implement all screens and sheets matching the mockups.

1. [x] Home Screen (calendar view):
   - Header: list filter dropdown, search, analytics, settings icons.
   - Month label + monthly total.
   - Calendar grid with subscription icons.
   - “Add subscription” CTA.

2. [x] Day Subscriptions Sheet:
   - Title and date.
   - List of due subscriptions.
   - Total at bottom.
   - Add Subscription row.

3. [x] Subscription Detail Sheet:
   - Status dropdown, Edit button.
   - Amount, Next Payment, Total Spent, Notifications.
   - Category, List, Payment Method, Notes.

4. [x] Add Subscription (Service Picker):
   - Import from file row.
   - Popular services grid.
   - Search services.
   - Custom service option.

5. [x] Subscription Form:
   - Icon picker.
   - Name, Schedule, Start Date, Amount, Currency.
   - Category, List, Payment Method, Notifications, Notes.
   - Save/Add button with validation.

6. [x] Amount Keypad:
   - Currency selector.
   - Numeric keypad, Done button.

7. [x] Analytics Screen:
   - Year selector, category selector.
   - Donut chart.
   - Yearly Forecast and Avg Monthly Cost cards.

8. [x] Settings Screen:
   - Account card (“Subs”).
   - iCloud & Data toggle (UI only).
   - Main Currency selector.
   - Round to Whole Numbers toggle.
   - Categories manager, Lists manager.
   - Payment Methods list.
   - Notifications settings.
   - True Dark Colors, Haptic Feedback.
   - Currency rates + Update Now.
   - Rate & Review, Ideas & Roadmap.

9. [x] Managers/Selectors:
   - Categories manager.
   - Lists manager.
   - Currency picker.
   - Notification settings modal.
   - Payment methods modal.
   - Icon picker.

10. [x] CSV Import:
   - File picker.
   - Validate strict template.
   - Preview import.
   - Confirm import.

Deliverable:
- All screens and flows working end-to-end with local data.

Phase 3 Complete:
- Core screens, sheets, managers, and CSV import UI wired to data stores.
- UX tighten-up: added CSV file picker, image picker for icons, and date picker.

## Phase 4 — Polish + QA
Goal: Performance, consistency, and correctness.

1. [x] Performance passes:
   - Use FlashList for large lists.
   - Memoize list items.
   - Avoid inline styles in list items.

2. [x] Visual polish:
   - Adjust spacing, shadows, card radius to match mockups.
   - Ensure “true dark colors” toggle works.

3. [x] Notifications QA:
   - Confirm scheduling, cancellation, and updates.

4. [x] Error states:
   - Empty states for Home, Analytics, Lists, Categories.
   - CSV import errors.

5. [ ] Testing:
   - Manual test checklist for all flows.
   - Optional unit tests for date calculations.

6. [x] Lint & type-check:
   - `pnpm lint`
   - `pnpm type-check`

Deliverable:
- App is feature-complete and stable.

Phase 4 In Progress:
- Applied performance, polish, notifications wiring, empty/error states, safe-area top padding, and 90% snap points. Testing pending.
