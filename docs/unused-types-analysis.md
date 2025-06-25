# Unused Types Analysis & Type Isolation Strategy

## Summary
- **243 unused exported types** found by knip
- Types are scattered across feature folders
- Need better type isolation and organization

## Analysis by Category

### 1. API & Route Guard Types (7 types)
**Location**: `src/app/api/auth/route-guard.ts`, `src/app/api/webhooks/clerk/types.ts`
- `AuthGuardOptions`, `AuthGuardResult`, `AuthGuardError`
- `WebhookEventData`, `UserWebhookEventType`, `SessionWebhookEventType`, `WebhookEventType`

**Recommendation**: Keep these - they're API boundary types that provide type safety

### 2. Billing & Stripe Types (44 types)
**Locations**: 
- `src/features/billing/index.ts` (22 types)
- `src/features/billing/types.ts` (3 types) 
- `src/features/stripe/` (19 types)

**Issues**:
- Billing index.ts exports types that should be in types.ts
- Duplicate types between billing and stripe features
- Types not properly isolated

**Recommendation**: Consolidate into `src/features/billing/types.ts` and `src/features/stripe/types.ts`

### 3. Chat Types (10 types)
**Location**: `src/features/chat/types.ts`
- All chat-related interfaces and types
- Well-organized in dedicated types file

**Recommendation**: Keep as-is - good type isolation

### 4. Employee Dashboard Types (19 types)
**Locations**: 
- `src/features/employee-dashboard/types.ts` (17 types)
- `src/features/employee-dashboard/state/clientFormsState.ts` (2 types)

**Issues**: Types mixed between main types file and state files

**Recommendation**: Move all types to `src/features/employee-dashboard/types.ts`

### 5. Employer Dashboard Types (19 types)
**Location**: `src/features/employer-dashboard/types.ts`
- Well-organized in dedicated types file

**Recommendation**: Keep as-is - good type isolation

### 6. Explore Feature Types (6 types)
**Location**: `src/features/explore/types.ts`
- Well-organized in dedicated types file

**Recommendation**: Keep as-is - good type isolation

### 7. Google Calendar Types (19 types)
**Location**: `src/features/google-calendar/types/index.ts`
- Well-organized in dedicated types directory

**Recommendation**: Keep as-is - good type isolation

### 8. Home Feature Types (32 types)
**Issues**: 
- Types exported from both `src/features/home/index.ts` (19 types)
- Duplicate types in `src/features/home/types.ts` (13 types)

**Critical Issue**: Significant type duplication between index.ts and types.ts

**Recommendation**: Remove exports from index.ts, keep only in types.ts

### 9. Notifications Types (9 types)
**Locations**:
- `src/features/notifications/services/session-notifications.ts` (2 types)
- `src/features/notifications/types/email.ts` (5 types)
- `src/features/notifications/types/in-app.ts` (2 types)

**Recommendation**: Good organization, keep as-is

### 10. Onboarding Types (3 types)
**Location**: `src/features/onboarding/types.ts`
- Well-organized in dedicated types file

**Recommendation**: Keep as-is

### 11. PostHog Analytics Types (8 types)
**Location**: `src/features/posthog/types.ts`
- Well-organized in dedicated types file

**Recommendation**: Keep as-is

### 12. Therapist Dashboard Types (85 types)
**Locations**:
- `src/features/therapist-dashboard/types/` (80 types across 8 files)
- `src/features/therapist-dashboard/state/availabilityState.ts` (5 types)

**Issues**: Types mixed between dedicated types directory and state files

**Recommendation**: Move state types to dedicated types files

### 13. UTM Types (3 types)
**Location**: `src/features/utm/types.ts`
- Well-organized in dedicated types file

**Recommendation**: Keep as-is

### 14. Shared/Utility Types (8 types)
**Locations**:
- `src/lib/logger.ts` (1 type)
- `src/lib/retry.ts` (2 types)
- `src/services/` (3 types)
- `src/shared/types.ts` (6 types)

**Recommendation**: Keep as-is - these are legitimate utility types

## Type Isolation Strategy

### Phase 1: Remove Type Duplication
1. **Home Feature**: Remove 19 type exports from `index.ts`, keep only in `types.ts`
2. **Billing Feature**: Move types from `index.ts` to `types.ts`
3. **Stripe Feature**: Consolidate duplicate type definitions

### Phase 2: Centralize Feature Types
1. Move types from state files to dedicated types files
2. Create consistent naming: `src/features/{feature}/types.ts`
3. Remove type exports from index.ts files

### Phase 3: Create Type Boundaries
1. Create `src/types/` directory for shared types
2. Move cross-feature types to shared location
3. Create feature-specific type isolation

### Phase 4: Type Validation
1. Ensure no circular dependencies
2. Validate type imports work correctly
3. Update import paths throughout codebase

## Recommended File Structure

```
src/
├── types/
│   ├── shared.ts          # Cross-feature types
│   ├── api.ts             # API response types
│   └── database.ts        # Database types
├── features/
│   ├── billing/
│   │   └── types.ts       # All billing types
│   ├── stripe/
│   │   └── types.ts       # All stripe types
│   ├── employee-dashboard/
│   │   └── types.ts       # All dashboard types (move from state)
│   └── [other-features]/
│       └── types.ts       # Feature-specific types only
```

## Next Steps
1. Remove duplicate home types from index.ts
2. Consolidate billing/stripe types
3. Move state types to dedicated type files
4. Create shared types directory
5. Update all import paths
6. Validate build and type checking 