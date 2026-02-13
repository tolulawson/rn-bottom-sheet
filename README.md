# rn-bottom-sheet

iOS-first native sheet bindings for React Native using Nitro Views.

## Installation

```sh
npm install rn-bottom-sheet react-native-nitro-modules
```

Optional integrations:

```sh
npm install react-native-reanimated
```

`react-native-nitro-modules` is required because this library is built on Nitro.

## Quick Start

```tsx
import { useState } from 'react';
import { Button, View } from 'react-native';
import { BottomSheet } from 'rn-bottom-sheet';

export function ExampleScreen() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <Button title="Open" onPress={() => setIsOpen(true)} />
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
        detents={['fit', 'medium', 'large']}
        initialDetent={1}
        preferredColorScheme="system"
        contentBackgroundStyle="system"
        contentBackgroundBlurStyle="regular"
      >
        <View />
      </BottomSheet>
    </View>
  );
}
```

## Public API

### Components

- `BottomSheet`: primary wrapper component (controlled or uncontrolled open state)
- `BottomSheetView`: documented native host compatibility surface
- `BottomSheetNativeView`: explicit named export for the native host surface
- `RnBottomSheetView`: raw internal host component export for advanced cases

### Imperative Ref Methods

- `present()`
- `dismiss()`
- `snapToDetent(index: number)`
- `getCurrentDetentIndex()`

### Detents

Supported detent values:

- `'fit' | 'medium' | 'large'`
- `{ type: 'fraction'; value: number; id?: string }`
- `{ type: 'points'; value: number; id?: string }`

### Behavior Props

- `grabberVisible?: boolean`
- `allowSwipeToDismiss?: boolean`
- `expandsWhenScrolledToEdge?: boolean`
- `cornerRadius?: number`
- `backgroundInteraction?: 'modal' | 'nonModal' | { upThrough: number }`
- `preferredColorScheme?: 'system' | 'light' | 'dark'` (iOS)
- `contentBackgroundStyle?: 'system' | 'blur' | 'clear'` (iOS)
- `contentBackgroundBlurStyle?: 'regular' | 'prominent' | 'light' | 'dark'` (iOS, used when `contentBackgroundStyle="blur"`)

### Callbacks

- `onOpenChange(isOpen, reason)`
- `onDetentChange(index, reason)`
- `onWillPresent()`
- `onDidPresent()`
- `onWillDismiss()`
- `onDidDismiss()`

`reason` is one of: `'programmatic' | 'swipe' | 'backdrop' | 'system'`.

## Navigation Integration

Use the optional adapter utilities to map route state to controlled sheet props:

```tsx
import { useBottomSheetNavigation } from 'rn-bottom-sheet';

const navigationSheet = useBottomSheetNavigation({
  routeIsOpen,
  onRouteOpen: () => setRouteIsOpen(true),
  onRouteClose: () => setRouteIsOpen(false),
});

<BottomSheet isOpen={navigationSheet.isOpen} onOpenChange={navigationSheet.onOpenChange} />;
```

Also exported: `createBottomSheetNavigationAdapter`.

## iPhone Option Matrix

| Option | Status | Notes |
|---|---|---|
| `detents` (`fit`/`medium`/`large`/`fraction`/`points`) | Implemented | Deterministic normalization and identifier mapping. |
| `initialDetent`, `selectedDetent` | Implemented | Controlled + uncontrolled flows supported. |
| `grabberVisible` | Implemented | Maps to native grabber visibility. |
| `allowSwipeToDismiss` | Implemented | Mapped through modal-in-presentation behavior. |
| `expandsWhenScrolledToEdge` | Implemented | Maps to `prefersScrollingExpandsWhenScrolledToEdge`. |
| `backgroundInteraction` | Implemented | Modal / non-modal / up-through-detent behavior. |
| `cornerRadius` | Implemented | Uses native preferred corner radius. |
| `preferredColorScheme` | Implemented | `system` / `light` / `dark`. |
| `contentBackgroundStyle` | Implemented | `system` / `blur` / `clear` for sheet content host. |
| `contentBackgroundBlurStyle` | Implemented | `regular` / `prominent` / `light` / `dark` blur presets. |
| iPad edge-attached width-following options | Deferred | Explicitly out of current feature scope. |

## Non-Goals

- Package-owned in-sheet navigation stack APIs (push/pop/replace) are out of scope.
- Custom backdrop blur opacity/strength controls are not exposed through standard UIKit sheet APIs.

## Reanimated Compatibility

- `BottomSheet` and `BottomSheetNativeView` are compatible with `createAnimatedComponent`.
- Supported animated prop pathways are focused on stateful surface props such as:
  `isOpen`, `selectedDetentIndex`, `backgroundInteraction`, and `cornerRadius`.
- Full frame-by-frame control of UIKit's internal sheet transition timeline is intentionally out of scope.

## Platform Behavior

- iOS: native sheet behavior is supported.
- Non-iOS: deterministic fallback (children render without native sheet behavior) with developer warnings in `__DEV__`.

## Development

Run validation locally:

```sh
yarn lint
yarn typecheck
yarn test
```

Knowledge base integrity:

```sh
yarn docs:sync
yarn docs:check
```

## Contributing

- If a change modifies public API surface area, usage behavior, or other user-visible library
  contracts, update this README in the same branch/PR.
- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT
