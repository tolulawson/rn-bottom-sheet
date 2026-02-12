/**
 * Bottom Sheet Type Definitions
 *
 * Core type definitions for the bottom sheet API.
 * These types are used across the JS and native layers.
 */

// =============================================================================
// Detent Types
// =============================================================================

/**
 * Semantic detent identifiers that map to iOS system detents.
 */
export type SemanticDetent = 'medium' | 'large';

/**
 * Fraction-based detent (0..1 range representing percentage of screen height).
 * Maps to UISheetPresentationController.Detent.custom(identifier:resolver:)
 */
export interface FractionDetent {
  type: 'fraction';
  value: number; // 0..1
}

/**
 * Points-based detent (fixed height in points).
 * Maps to UISheetPresentationController.Detent.custom(identifier:resolver:)
 */
export interface PointsDetent {
  type: 'points';
  value: number; // > 0
}

/**
 * All supported detent types.
 * - 'medium': ~50% of screen height (iOS system detent)
 * - 'large': Full available height (iOS system detent)
 * - FractionDetent: Custom fraction of container height
 * - PointsDetent: Fixed height in points
 */
export type BottomSheetDetent = SemanticDetent | FractionDetent | PointsDetent;

// =============================================================================
// Change Reason Types
// =============================================================================

/**
 * Reason for sheet state change.
 * Used in dismiss and detent change callbacks to indicate what triggered the change.
 */
export type BottomSheetChangeReason =
  | 'programmatic' // API call (present/dismiss/snapToDetent)
  | 'swipe' // User swipe gesture
  | 'backdrop' // User tapped backdrop
  | 'system'; // System event (e.g., memory pressure, interruption)

// =============================================================================
// Background Interaction Types
// =============================================================================

/**
 * Background interaction mode.
 * - 'modal': Background is dimmed and non-interactive (default)
 * - 'nonModal': Background is interactive, no dimming
 * - { upThrough: number }: Background is interactive up through the detent at specified index
 */
export type BackgroundInteractionMode =
  | 'modal'
  | 'nonModal'
  | { upThrough: number };

// =============================================================================
// Callback Types
// =============================================================================

/**
 * Callback for open state changes.
 */
export type OnOpenChangeCallback = (
  isOpen: boolean,
  reason: BottomSheetChangeReason
) => void;

/**
 * Callback for detent changes.
 */
export type OnDetentChangeCallback = (
  index: number,
  reason: BottomSheetChangeReason
) => void;

/**
 * Lifecycle callbacks for sheet presentation.
 */
export type LifecycleCallback = () => void;

// =============================================================================
// Props Types
// =============================================================================

/**
 * Props for controlled sheet state.
 */
export interface ControlledProps {
  /** Controlled open state */
  isOpen: boolean;
  /** Callback when open state changes */
  onOpenChange: OnOpenChangeCallback;
}

/**
 * Props for uncontrolled sheet state.
 */
export interface UncontrolledProps {
  /** Initial open state for uncontrolled mode */
  defaultOpen?: boolean;
  /** Optional callback when open state changes */
  onOpenChange?: OnOpenChangeCallback;
}

/**
 * Base props shared by all sheet configurations.
 */
export interface BottomSheetBaseProps {
  /** Available detent positions. Defaults to ['medium', 'large'] */
  detents?: BottomSheetDetent[];

  /** Initial detent index when sheet opens. Defaults to 0 */
  initialDetent?: number;

  /** Controlled detent selection */
  selectedDetent?: number;

  /** Callback when detent changes */
  onDetentChange?: OnDetentChangeCallback;

  /** Show grabber handle at top of sheet. Defaults to true */
  grabberVisible?: boolean;

  /** Allow swipe gesture to dismiss sheet. Defaults to true */
  allowSwipeToDismiss?: boolean;

  /** Background interaction mode. Defaults to 'modal' */
  backgroundInteraction?: BackgroundInteractionMode;

  /** Corner radius of sheet. Defaults to system default */
  cornerRadius?: number;

  /** Allow sheet to expand when scrolled content reaches edge. Defaults to true */
  expandsWhenScrolledToEdge?: boolean;

  // Lifecycle callbacks
  onWillPresent?: LifecycleCallback;
  onDidPresent?: LifecycleCallback;
  onWillDismiss?: LifecycleCallback;
  onDidDismiss?: LifecycleCallback;

  /** React children to render inside the sheet */
  children?: React.ReactNode;
}

/**
 * Complete props type supporting both controlled and uncontrolled modes.
 */
export type BottomSheetProps = BottomSheetBaseProps &
  (ControlledProps | UncontrolledProps);

// =============================================================================
// Methods Types
// =============================================================================

/**
 * Imperative methods available via ref.
 */
export interface BottomSheetMethods {
  /** Present the sheet */
  present(): void;

  /** Dismiss the sheet */
  dismiss(): void;

  /** Snap to a specific detent by index */
  snapToDetent(index: number): void;

  /** Get the current detent index */
  getCurrentDetentIndex(): number;
}

// =============================================================================
// Session Types (internal)
// =============================================================================

/**
 * Internal session state for tracking sheet lifecycle.
 */
export interface BottomSheetSession {
  /** Unique session identifier */
  sessionId: string;

  /** Current presentation state */
  isPresented: boolean;

  /** Current detent index */
  currentDetentIndex: number;

  /** Last change reason */
  lastChangeReason: BottomSheetChangeReason;
}

// =============================================================================
// Validation Types
// =============================================================================

/**
 * Result of detent validation.
 */
export interface DetentValidationResult {
  valid: boolean;
  error?: string;
  normalizedDetents?: BottomSheetDetent[];
}

/**
 * Result of configuration validation.
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
}
