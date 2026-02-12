# Nitro View Components Notes

## Why It Matters

This project is implemented as a Nitro View, so Nitro lifecycle and threading rules are core to correctness.

## Key Constraints

1. Nitro Views require React Native 0.78+ and New Architecture/Fabric.
2. A `*.nitro.ts` declaration drives generated ShadowNode/config/code bindings.
3. JS host registration uses `getHostComponent(...)` + generated view config JSON.
4. Props can arrive from different threads (React path vs `hybridRef` path), so native code must be thread-safe.
5. `beforeUpdate()` and `afterUpdate()` can be used to batch prop application.
6. Callback props in Nitro Views require wrapping (`callback(...)`) due to React Native core function handling.
7. Recycled views must implement `RecyclableView.prepareForRecycle()` to avoid stale content.

## Implications for rn-bottom-sheet

1. Native sheet presenter state cannot assume a single-thread write path.
2. Cleanup must be deterministic for reused views.
3. Public JS API should hide Nitro callback wrapping complexity where possible.
4. Codegen must be rerun whenever `*.nitro.ts` contract changes.
