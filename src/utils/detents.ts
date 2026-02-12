/**
 * Detent Normalization and Validation Utilities
 *
 * Handles conversion between JS detent representations and native identifiers,
 * as well as validation of detent configurations.
 */

import type {
  BottomSheetDetent,
  FractionDetent,
  PointsDetent,
  SemanticDetent,
  DetentValidationResult,
} from '../types/bottom-sheet';

// =============================================================================
// Constants
// =============================================================================

const SEMANTIC_DETENTS: readonly SemanticDetent[] = ['medium', 'large'];

/**
 * Approximate height values for semantic detents (used for sorting).
 * These are relative values, not actual pixel values.
 */
const SEMANTIC_HEIGHT_VALUES: Record<SemanticDetent, number> = {
  medium: 0.5,
  large: 1.0,
};

// =============================================================================
// Type Guards
// =============================================================================

export function isSemanticDetent(
  detent: BottomSheetDetent
): detent is SemanticDetent {
  return (
    typeof detent === 'string' &&
    SEMANTIC_DETENTS.includes(detent as SemanticDetent)
  );
}

export function isFractionDetent(
  detent: BottomSheetDetent
): detent is FractionDetent {
  return (
    typeof detent === 'object' &&
    detent !== null &&
    'type' in detent &&
    detent.type === 'fraction'
  );
}

export function isPointsDetent(
  detent: BottomSheetDetent
): detent is PointsDetent {
  return (
    typeof detent === 'object' &&
    detent !== null &&
    'type' in detent &&
    detent.type === 'points'
  );
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Validate a single detent value.
 */
export function validateDetent(detent: BottomSheetDetent): string | null {
  if (isSemanticDetent(detent)) {
    return null; // Valid
  }

  if (isFractionDetent(detent)) {
    if (typeof detent.value !== 'number') {
      return `Fraction detent value must be a number, got ${typeof detent.value}`;
    }
    if (detent.value < 0 || detent.value > 1) {
      return `Fraction detent value must be between 0 and 1, got ${detent.value}`;
    }
    return null;
  }

  if (isPointsDetent(detent)) {
    if (typeof detent.value !== 'number') {
      return `Points detent value must be a number, got ${typeof detent.value}`;
    }
    if (detent.value <= 0) {
      return `Points detent value must be positive, got ${detent.value}`;
    }
    return null;
  }

  return `Invalid detent type: ${JSON.stringify(detent)}`;
}

/**
 * Validate an array of detents.
 */
export function validateDetents(
  detents: BottomSheetDetent[]
): DetentValidationResult {
  if (!Array.isArray(detents)) {
    return {
      valid: false,
      error: 'Detents must be an array',
    };
  }

  if (detents.length === 0) {
    return {
      valid: false,
      error: 'Detents array cannot be empty',
    };
  }

  for (let i = 0; i < detents.length; i++) {
    const detent = detents[i]!;
    const error = validateDetent(detent);
    if (error) {
      return {
        valid: false,
        error: `Invalid detent at index ${i}: ${error}`,
      };
    }
  }

  const normalized = normalizeDetents(detents);

  return {
    valid: true,
    normalizedDetents: normalized,
  };
}

// =============================================================================
// Normalization
// =============================================================================

/**
 * Get a comparable height value for a detent (used for sorting).
 * For semantic and fraction detents, returns a 0..1 value.
 * For points detents, returns a large value to sort them based on points.
 */
export function getDetentSortValue(detent: BottomSheetDetent): number {
  if (isSemanticDetent(detent)) {
    return SEMANTIC_HEIGHT_VALUES[detent];
  }

  if (isFractionDetent(detent)) {
    return detent.value;
  }

  if (isPointsDetent(detent)) {
    // For points, we assume a reference height of 1000 for sorting purposes
    // This allows points to be compared relatively with fractions
    return detent.value / 1000;
  }

  return 0;
}

/**
 * Generate a unique identifier for a detent (used for deduplication).
 */
export function getDetentIdentifier(detent: BottomSheetDetent): string {
  if (isSemanticDetent(detent)) {
    return `semantic:${detent}`;
  }

  if (isFractionDetent(detent)) {
    return `fraction:${detent.value}`;
  }

  if (isPointsDetent(detent)) {
    return `points:${detent.value}`;
  }

  return 'unknown';
}

/**
 * Normalize detents: sort low-to-high and deduplicate.
 */
export function normalizeDetents(
  detents: BottomSheetDetent[]
): BottomSheetDetent[] {
  // Deduplicate by identifier
  const seen = new Set<string>();
  const unique: BottomSheetDetent[] = [];

  for (const detent of detents) {
    const id = getDetentIdentifier(detent);
    if (!seen.has(id)) {
      seen.add(id);
      unique.push(detent);
    }
  }

  // Sort by height value (low to high)
  return unique.sort((a, b) => getDetentSortValue(a) - getDetentSortValue(b));
}

// =============================================================================
// Native Identifier Mapping
// =============================================================================

/**
 * Convert a detent to its native iOS identifier.
 * Used for bridging to UISheetPresentationController.
 */
export function detentToNativeIdentifier(
  detent: BottomSheetDetent,
  index: number
): string {
  if (isSemanticDetent(detent)) {
    return detent; // 'medium' or 'large' map directly
  }

  if (isFractionDetent(detent)) {
    return `fraction_${detent.value}_${index}`;
  }

  if (isPointsDetent(detent)) {
    return `points_${detent.value}_${index}`;
  }

  return `custom_${index}`;
}

/**
 * Convert an array of detents to native identifier mapping.
 */
export function detentsToNativeConfig(
  detents: BottomSheetDetent[]
): Array<{ identifier: string; detent: BottomSheetDetent }> {
  const normalized = normalizeDetents(detents);
  return normalized.map((detent, index) => ({
    identifier: detentToNativeIdentifier(detent, index),
    detent,
  }));
}

// =============================================================================
// Default Values
// =============================================================================

/**
 * Default detents if none are specified.
 */
export const DEFAULT_DETENTS: BottomSheetDetent[] = ['medium', 'large'];

/**
 * Get detents with defaults applied.
 */
export function getDetentsWithDefaults(
  detents: BottomSheetDetent[] | undefined
): BottomSheetDetent[] {
  if (!detents || detents.length === 0) {
    return DEFAULT_DETENTS;
  }
  return detents;
}
