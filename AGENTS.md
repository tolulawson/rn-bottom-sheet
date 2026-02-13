# Agent Instructions

Read `.specify/memory/constitution.md` first.
That file is the source of truth for this project.

## Active Technologies
- TypeScript 5.9 (public API), Swift 5 (iOS native layer), Kotlin (existing Android fallback path) + react-native 0.81.5, react-native-nitro-modules 0.33.x, nitrogen, optional react-navigation and react-native-reanimated adapters (001-native-ios-sheet-bindings)
- N/A (runtime UI behavior only) (001-native-ios-sheet-bindings)
- TypeScript 5.9 (React 19, React Native 0.81.5) + react-native, rn-bottom-sheet, optional react-native-reanimated wrapper path, expo example runtime (002-fix-example-sheet)
- N/A (in-memory UI state only) (002-fix-example-sheet)
- Swift 5, TypeScript 5.9, Objective-C++ (Nitro-generated) + react-native 0.81.5, react-native-nitro-modules 0.33.x, UIKit (UISheetPresentationController) (003-native-sheet-content-routing)
- N/A (in-memory view state only) (003-native-sheet-content-routing)

## Recent Changes
- 001-native-ios-sheet-bindings: Added TypeScript 5.9 (public API), Swift 5 (iOS native layer), Kotlin (existing Android fallback path) + react-native 0.81.5, react-native-nitro-modules 0.33.x, nitrogen, optional react-navigation and react-native-reanimated adapters
