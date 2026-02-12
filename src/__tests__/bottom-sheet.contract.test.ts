/**
 * Contract tests for bottom sheet API behavior
 *
 * These tests validate the public API contract without requiring
 * the native implementation. They focus on:
 * - Type definitions and exports
 * - Validation logic
 * - Error handling
 */

describe('BottomSheet Contract', () => {
  describe('Type Exports', () => {
    it.todo('should export BottomSheetDetent type');
    it.todo('should export BottomSheetProps type');
    it.todo('should export BottomSheetMethods type');
    it.todo('should export BottomSheetChangeReason type');
  });

  describe('Detent Validation', () => {
    it.todo('should accept valid semantic detents (medium, large)');
    it.todo('should accept valid fraction detents (0..1)');
    it.todo('should accept valid points detents (>0)');
    it.todo('should reject empty detent array');
    it.todo('should reject invalid fraction values (<0 or >1)');
    it.todo('should reject invalid points values (<=0)');
    it.todo('should normalize detent order to low-to-high');
    it.todo('should deduplicate equivalent detents');
  });

  describe('Configuration Validation', () => {
    it.todo('should validate initialDetent is within detent bounds');
    it.todo('should validate selectedDetent is within detent bounds');
    it.todo('should accept valid backgroundInteractionMode values');
    it.todo('should reject invalid backgroundInteractionMode values');
  });

  describe('Component Exports', () => {
    it.todo('should export BottomSheet component');
    it.todo('should export BottomSheetView native component');
  });
});
