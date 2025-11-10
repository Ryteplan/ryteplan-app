# StatDisplay Component Refactoring

## Overview

The `StatDisplay` component has been refactored to improve readability, maintainability, and extensibility. The original 562-line monolithic component has been broken down into smaller, focused components and reusable composables.

## Architecture

### Main Component
- **StatDisplay.vue** (Main component, ~350 lines) - Orchestrates the display and editing of institution statistics

### Sub-Components
Located in `/src/components/StatDisplay/`:

1. **SatScoreEditor.vue** - Handles editing of SAT scores (Math, Verbal, Combined)
2. **GenericValueEditor.vue** - Handles editing of regular stat values
3. **TestingPolicyEditor.vue** - Handles testing policy visibility toggles

### Composables
Located in `/src/composables/`:

1. **useValueFormatter.js** - Handles value formatting and normalization
2. **useStatDatabase.js** - Manages database operations for stats

## Key Improvements

### 1. Separation of Concerns
- **Before**: All logic (display, editing, SAT scores, testing policies) in one file
- **After**: Each concern has its own component/composable

### 2. Reusability
- Value formatting logic can be used in other components
- Database operations are centralized and consistent
- Sub-components can be tested independently

### 3. Maintainability
- Smaller, focused files are easier to understand
- Changes to SAT editing don't affect other functionality
- Constants for field names and policy mappings reduce magic strings

### 4. Testability
- Composables can be unit tested independently
- Sub-components can be tested in isolation
- Reduced complexity in main component

## Usage

The main component API remains unchanged:

```vue
<StatDisplay
  label="Undergraduate Enrollment"
  :uri="institution.uri"
  field="enTotUgN"
  :valueFromIntegrated="institution.enTotUgN"
  :valueFromPetersons="petersonsInstitution.enTotUgN"
  :valueFromManual="manualData.enTotUgN"
  valueType="default"
/>
```

### Special Cases

#### SAT Scores
```vue
<StatDisplay
  label="SAT 50th%ile"
  :uri="institution.uri"
  field="sat1Combined50th"
  :valueFromIntegrated="institution.sat1Combined50th"
  :valueFromPetersons="petersonsInstitution.sat1Combined50th"
  :valueFromManual="manualData.sat1Combined50th"
  :valueFromPetersonsMath="petersonsInstitution.sat1Math50thP"
  :valueFromPetersonsVerbal="petersonsInstitution.sat1Verb50thP"
  :valueFromManualMath="manualData.sat1Math50thP"
  :valueFromManualVerbal="manualData.sat1Verb50thP"
/>
```

#### Testing Policies
```vue
<StatDisplay
  label="Testing Policy"
  :uri="institution.uri"
  field="testingPolicy"
  valueType="testingPolicy"
  :valueFromPetersons="petersonsInstitution.testingPolicy"
  :valueFromManual="manualData.testingPolicy"
/>
```

## File Structure

```
src/
├── components/
│   ├── StatDisplay.vue           # Main component
│   └── StatDisplay/
│       ├── README.md              # This file
│       ├── SatScoreEditor.vue     # SAT score editing
│       ├── GenericValueEditor.vue # Generic value editing
│       └── TestingPolicyEditor.vue # Testing policy toggles
└── composables/
    ├── useValueFormatter.js       # Value formatting logic
    └── useStatDatabase.js         # Database operations
```

## Adding New Functionality

### Adding a New Value Type
1. Add formatter in `useValueFormatter.js`
2. Update `processValue` method with new case
3. No changes needed to sub-components

### Adding a New Edit Mode
1. Create new component in `StatDisplay/` directory
2. Import in main `StatDisplay.vue`
3. Add conditional rendering in edit section
4. Handle save logic in main component

### Modifying Database Operations
1. Update `useStatDatabase.js` composable
2. Changes automatically available to all components

## Constants

Key constants defined in the main component:

```javascript
const SAT_FIELD = 'sat1Combined50th';
const TESTING_POLICY_VALUE_TYPE = 'testingPolicy';
const TESTING_POLICY_MAP = {
  'Required': 'showRequiredTestingPolicy',
  'Considered': 'showConsideredTestingPolicy',
  'Not used': 'showNotUsedTestingPolicy'
};
```

## Testing

All components pass linting without errors:
```bash
npm run lint src/components/StatDisplay.vue
npm run lint src/components/StatDisplay/*.vue
npm run lint src/composables/use*.js
```

## Migration Notes

- **No breaking changes**: The component API remains identical
- **Backward compatible**: All existing props work as before
- **Drop-in replacement**: No changes needed in parent components
- **Performance**: Similar performance characteristics, slightly better due to better Vue reactivity optimization

## Future Enhancements

Potential improvements:
1. Add TypeScript for better type safety
2. Create unit tests for composables
3. Add component tests for sub-components
4. Extract more constants to configuration file
5. Add loading states for async operations
6. Improve error handling and user feedback
