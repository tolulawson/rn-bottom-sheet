# Quickstart: Native iOS Sheet Bindings

## 1. Install and Prepare

1. Install dependencies and run codegen.
2. Ensure New Architecture/Fabric is enabled.
3. Build and run the example app on iOS.

## 2. Minimal Usage Flow

1. Render sheet component with simple child content.
2. Toggle open state.
3. Observe present/dismiss callbacks.

## 3. Detent Configuration Flow

1. Provide a detent list with initial detent.
2. Trigger user drag/programmatic snap.
3. Validate detent change callback and current detent state.

## 4. Navigation Integration Flow

1. Wire optional navigation adapter helper.
2. Open sheet from route transition.
3. Verify route and sheet states remain synchronized.

## 5. Animation Compatibility Flow

1. Wrap supported host component path with animation helper.
2. Trigger supported animated updates.
3. Verify sheet interaction and rendering remain stable.

## 6. Non-iOS Fallback Flow

1. Run on non-iOS target.
2. Confirm deterministic fallback behavior and explicit warning path.
