# Data Model: Interactive Sheet Content and Core Sheet Configuration

## Entity: SheetConfiguration

Represents the public configuration surface supplied by consumers to control sheet behavior and appearance.

### Fields

- `detents: BottomSheetDetent[]`
  - Allowed values include semantic detents (`fit`, `medium`, `large`) and numeric (`fraction`, `points`).
  - Validation: non-empty; values must pass existing detent validation rules.
- `initialDetent?: number`
  - Initial selected detent index.
  - Validation: integer index within resolved detent bounds.
- `selectedDetent?: number`
  - Controlled selected detent index.
  - Validation: integer index within resolved detent bounds.
- `allowSwipeToDismiss?: boolean`
- `backgroundInteraction?: 'modal' | 'nonModal' | { upThrough: number }`
- `expandsWhenScrolledToEdge?: boolean`
- `cornerRadius?: number`
- `grabberVisible?: boolean`
- `preferredColorScheme?: 'system' | 'light' | 'dark'` (iOS feature scope)
- `contentBackgroundStyle?: 'system' | 'blur' | 'clear'` (iOS feature scope)
- `contentBackgroundBlurStyle?: 'regular' | 'prominent' | 'light' | 'dark'` (effective when background style is `blur`)

### Invariants

- Common iPhone configuration options are exposed and documented.
- iPad/compact-height niche options are explicitly deferred for this feature.
- Unsupported/native-limited options (for example configurable backdrop blur) are explicitly documented as non-goals.

## Entity: SheetPresentationState

Tracks runtime presentation and detent lifecycle state.

### Fields

- `isOpen: boolean`
- `currentDetentIndex: number`
- `changeReason: 'programmatic' | 'swipe' | 'backdrop' | 'system'`
- `isHostAttached: boolean` (native lifecycle condition)

### State transitions

1. `closed -> opening -> open`
2. `open -> dismissing -> closed`
3. `open(detent i) -> open(detent j)` on drag or programmatic snap

### Constraints

- Callback reason mapping remains deterministic across transitions.
- Presentation state behavior remains stable when child content state changes.

## Entity: ContentHostSurface

Represents the mounted native container boundary for React children.

### Fields

- `childCount: number`
- `interactionEnabled: boolean`
- `widthPolicy: 'fill-sheet-content-width'`
- `backgroundMode: 'system' | 'blur' | 'clear'`
- `appearanceOverride: 'system' | 'light' | 'dark'`

### Behavioral rules

- Child views receive touch/scroll/input interactions while sheet is open.
- Child root fills available sheet content width by default.
- Styling updates are applied without breaking interaction or lifecycle callbacks.

## Entity: ConsumerFlowHost (Non-owned)

Represents consumer-managed internal flow state rendered within sheet content.

### Fields

- `flowProviderType: 'local-state' | 'navigation-library' | 'custom'`
- `activeStep: string | number`

### Constraints

- Package does not own this state machine.
- Package remains compatible with internal flow transitions.
- Dismiss/reopen behavior follows consumer logic, not package-owned route policy.
