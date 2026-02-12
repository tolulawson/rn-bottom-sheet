import type {
  NativeBackgroundInteraction,
  NativeDetentConfig,
} from '../RnBottomSheet.nitro';
import type {
  BackgroundInteractionMode,
  BottomSheetDetent,
  BottomSheetProps,
  ControlledProps,
} from '../types/bottom-sheet';
import {
  DEFAULT_DETENTS,
  detentsToNativeConfig,
  validateDetents,
} from '../utils/detents';

const ERROR_PREFIX = '[rn-bottom-sheet]';

export function isControlledProps(
  props: BottomSheetProps
): props is BottomSheetProps & ControlledProps {
  return 'isOpen' in props;
}

export function toNativeDetentConfig(
  detents: BottomSheetDetent[] | undefined
): NativeDetentConfig[] {
  const sourceDetents = detents ?? DEFAULT_DETENTS;
  const validationResult = validateDetents(sourceDetents);

  if (!validationResult.valid || !validationResult.normalizedDetents) {
    throw new Error(
      `${ERROR_PREFIX} Invalid detent configuration: ${
        validationResult.error ?? 'unknown error'
      }`
    );
  }

  return detentsToNativeConfig(validationResult.normalizedDetents).map(
    ({ type, value, identifier }) => ({
      type,
      value,
      identifier,
    })
  );
}

export function toNativeBackgroundInteraction(
  mode: BackgroundInteractionMode | undefined
): NativeBackgroundInteraction {
  if (!mode) {
    return 'modal';
  }

  if (mode === 'modal' || mode === 'nonModal') {
    return mode;
  }

  const { upThrough } = mode;
  if (!Number.isInteger(upThrough) || upThrough < 0) {
    throw new Error(
      `${ERROR_PREFIX} Invalid backgroundInteraction.upThrough value: ${String(
        upThrough
      )}`
    );
  }

  return upThrough;
}

export function resolveInitialDetentIndex(
  initialDetent: number | undefined,
  detentCount: number
): number {
  const index = initialDetent ?? 0;
  assertDetentIndex(index, detentCount, 'initialDetent');
  return index;
}

export function resolveSelectedDetentIndex(
  selectedDetent: number | undefined,
  detentCount: number
): number {
  if (selectedDetent === undefined) {
    return -1;
  }

  assertDetentIndex(selectedDetent, detentCount, 'selectedDetent');
  return selectedDetent;
}

type BottomSheetLifecycleCallbacks = Pick<
  BottomSheetProps,
  'onWillPresent' | 'onDidPresent' | 'onWillDismiss' | 'onDidDismiss'
>;

export interface BottomSheetLifecycleHandlers {
  onNativeWillPresent: () => void;
  onNativeDidPresent: () => void;
  onNativeWillDismiss: () => void;
  onNativeDidDismiss: () => void;
}

export function createLifecycleHandlers(
  callbacks: BottomSheetLifecycleCallbacks
): BottomSheetLifecycleHandlers {
  const { onWillPresent, onDidPresent, onWillDismiss, onDidDismiss } =
    callbacks;

  return {
    onNativeWillPresent() {
      onWillPresent?.();
    },
    onNativeDidPresent() {
      onDidPresent?.();
    },
    onNativeWillDismiss() {
      onWillDismiss?.();
    },
    onNativeDidDismiss() {
      onDidDismiss?.();
    },
  };
}

function assertDetentIndex(
  index: number,
  detentCount: number,
  name: 'initialDetent' | 'selectedDetent'
): void {
  if (!Number.isInteger(index)) {
    throw new Error(
      `${ERROR_PREFIX} ${name} must be an integer, got ${String(index)}`
    );
  }

  if (index < 0 || index >= detentCount) {
    throw new Error(
      `${ERROR_PREFIX} ${name} index ${index} is out of bounds for ${detentCount} detent(s)`
    );
  }
}
