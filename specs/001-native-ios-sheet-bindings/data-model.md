# Data Model: Native iOS Sheet Bindings

## Entity: BottomSheetConfiguration

- Purpose: Declares runtime behavior and interaction settings for one sheet instance.
- Fields:
  - `isOpen` (boolean, optional, controlled state)
  - `defaultOpen` (boolean, optional, uncontrolled initial state)
  - `detents` (list of `DetentDefinition`)
  - `initialDetent` (index or `last`)
  - `selectedDetent` (index, optional controlled detent)
  - `grabberVisible` (boolean)
  - `allowSwipeToDismiss` (boolean)
  - `backgroundInteractionMode` (`modal` or threshold mode)
- Validation Rules:
  - Detent list must be non-empty when provided.
  - Detent values must be valid and sortable.
  - Detent indexes must resolve to an existing detent.

## Entity: DetentDefinition

- Purpose: Represents one valid resting height option.
- Variants:
  - `fit`
  - `medium`
  - `large`
  - fractional value (0..1)
  - points value (>0)
- Validation Rules:
  - Fractions must be within valid range.
  - Points must be positive.
  - Duplicate resolved detents should be normalized.

## Entity: BottomSheetSession

- Purpose: Represents one active presentation lifecycle.
- Fields:
  - `sessionId` (runtime identifier)
  - `isPresented` (boolean)
  - `currentDetentIndex` (integer)
  - `lastChangeReason` (`programmatic`, `swipe`, `backdrop`, `system`)
- State Transitions:
  - `idle` -> `presenting` -> `presented`
  - `presented` -> `dismissing` -> `idle`
  - `presented` -> `presented` (detent transition)

## Entity: IntegrationBinding

- Purpose: Optional mapping between sheet lifecycle and navigation/animation layers.
- Fields:
  - `navigationSyncEnabled` (boolean)
  - `onOpenChangeBinding` (callback binding)
  - `onDetentChangeBinding` (callback binding)
- Constraints:
  - Must not create circular open/dismiss loops.
  - Must preserve deterministic ordering of lifecycle events.
