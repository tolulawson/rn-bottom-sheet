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

const SEMANTIC_DETENTS: readonly SemanticDetent[] = ['fit', 'medium', 'large'];

/**
 * Approximate relative height values for semantic detents (used for sorting).
 */
const SEMANTIC_HEIGHT_VALUES: Record<SemanticDetent, number> = {
  fit: 0.25,
  medium: 0.5,
  large: 1.0,
};

const POINTS_REFERENCE_HEIGHT = 1000;

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

function validateCustomId(id: unknown): string | null {
  if (id === undefined) {
    return null;
  }
  if (typeof id !== 'string') {
    return `Detent id must be a string when provided, got ${typeof id}`;
  }
  if (id.trim().length === 0) {
    return 'Detent id must not be empty';
  }
  return null;
}

/**
 * Validate a single detent value.
 */
export function validateDetent(detent: BottomSheetDetent): string | null {
  if (isSemanticDetent(detent)) {
    return null;
  }

  if (isFractionDetent(detent)) {
    if (typeof detent.value !== 'number' || !Number.isFinite(detent.value)) {
      return `Fraction detent value must be a finite number, got ${String(
        detent.value
      )}`;
    }
    if (detent.value < 0 || detent.value > 1) {
      return `Fraction detent value must be between 0 and 1, got ${detent.value}`;
    }
    return validateCustomId(detent.id);
  }

  if (isPointsDetent(detent)) {
    if (typeof detent.value !== 'number' || !Number.isFinite(detent.value)) {
      return `Points detent value must be a finite number, got ${String(
        detent.value
      )}`;
    }
    if (detent.value <= 0) {
      return `Points detent value must be positive, got ${detent.value}`;
    }
    return validateCustomId(detent.id);
  }

  return `Invalid detent type: ${JSON.stringify(detent)}`;
}

function getCustomDetentId(
  detent: FractionDetent | PointsDetent
): string | null {
  return typeof detent.id === 'string' && detent.id.trim() ? detent.id : null;
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

  const customIds = new Set<string>();

  for (let i = 0; i < detents.length; i++) {
    const detent = detents[i]!;
    const error = validateDetent(detent);
    if (error) {
      return {
        valid: false,
        error: `Invalid detent at index ${i}: ${error}`,
      };
    }

    if (isFractionDetent(detent) || isPointsDetent(detent)) {
      const customId = getCustomDetentId(detent);
      if (customId) {
        if (customIds.has(customId)) {
          return {
            valid: false,
            error: `Duplicate detent id '${customId}' is not allowed`,
          };
        }
        customIds.add(customId);
      }
    }
  }

  return {
    valid: true,
    normalizedDetents: normalizeDetents(detents),
  };
}

// =============================================================================
// Normalization
// =============================================================================

/**
 * Get a comparable height value for a detent (used for low-to-high sorting).
 */
export function getDetentSortValue(detent: BottomSheetDetent): number {
  if (isSemanticDetent(detent)) {
    return SEMANTIC_HEIGHT_VALUES[detent];
  }

  if (isFractionDetent(detent)) {
    return detent.value;
  }

  if (isPointsDetent(detent)) {
    return detent.value / POINTS_REFERENCE_HEIGHT;
  }

  return 0;
}

function getResolvedDetentKey(detent: BottomSheetDetent): string {
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
 * Generate a deterministic identifier for a detent.
 */
export function getDetentIdentifier(detent: BottomSheetDetent): string {
  if (isFractionDetent(detent) || isPointsDetent(detent)) {
    const customId = getCustomDetentId(detent);
    if (customId) {
      return `${detent.type}:${customId}`;
    }
  }
  return getResolvedDetentKey(detent);
}

/**
 * Normalize detents by deduplicating resolved values and sorting low-to-high.
 */
export function normalizeDetents(
  detents: BottomSheetDetent[]
): BottomSheetDetent[] {
  const seen = new Set<string>();
  const unique: BottomSheetDetent[] = [];

  for (const detent of detents) {
    const key = getResolvedDetentKey(detent);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(detent);
    }
  }

  return unique.sort((a, b) => {
    const valueDiff = getDetentSortValue(a) - getDetentSortValue(b);
    if (valueDiff !== 0) {
      return valueDiff;
    }
    return getDetentIdentifier(a).localeCompare(getDetentIdentifier(b));
  });
}

// =============================================================================
// Native Identifier Mapping
// =============================================================================

function sanitizeIdentifier(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Convert a detent to its native iOS identifier.
 */
export function detentToNativeIdentifier(
  detent: BottomSheetDetent,
  index: number
): string {
  if (isSemanticDetent(detent)) {
    return detent;
  }

  if (isFractionDetent(detent) || isPointsDetent(detent)) {
    const customId = getCustomDetentId(detent);
    if (customId) {
      return sanitizeIdentifier(customId);
    }
    return `${detent.type}_${detent.value}_${index}`;
  }

  return `custom_${index}`;
}

/**
 * Convert detents to native bridge config objects.
 */
export function detentsToNativeConfig(detents: BottomSheetDetent[]): Array<{
  type: 'semantic' | 'fraction' | 'points';
  value: string | number;
  identifier: string;
  detent: BottomSheetDetent;
}> {
  const normalized = normalizeDetents(detents);
  return normalized.map((detent, index) => {
    if (isSemanticDetent(detent)) {
      return {
        type: 'semantic',
        value: detent,
        identifier: detentToNativeIdentifier(detent, index),
        detent,
      };
    }

    if (isFractionDetent(detent)) {
      return {
        type: 'fraction',
        value: detent.value,
        identifier: detentToNativeIdentifier(detent, index),
        detent,
      };
    }

    return {
      type: 'points',
      value: detent.value,
      identifier: detentToNativeIdentifier(detent, index),
      detent,
    };
  });
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
