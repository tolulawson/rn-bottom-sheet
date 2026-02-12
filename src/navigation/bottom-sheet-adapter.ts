import { useMemo, useRef } from 'react';
import type {
  BottomSheetChangeReason,
  OnOpenChangeCallback,
} from '../types/bottom-sheet';

/**
 * Configuration for mapping route state to controlled BottomSheet props.
 */
export interface BottomSheetNavigationAdapterOptions {
  /**
   * Whether the navigation state expects the sheet to be open.
   */
  routeIsOpen: boolean;
  /**
   * Called when the sheet requests an open transition.
   */
  onRouteOpen?: (reason: BottomSheetChangeReason) => void;
  /**
   * Called when the sheet requests a close transition.
   */
  onRouteClose?: (reason: BottomSheetChangeReason) => void;
  /**
   * Optional side-effect callback for observing open changes.
   */
  onOpenChange?: OnOpenChangeCallback;
}

/**
 * Controlled BottomSheet props derived from navigation state.
 */
export interface BottomSheetNavigationAdapter {
  isOpen: boolean;
  onOpenChange: OnOpenChangeCallback;
}

function handleRouteSync(
  nextOpen: boolean,
  reason: BottomSheetChangeReason,
  routeIsOpen: boolean,
  onRouteOpen?: (reason: BottomSheetChangeReason) => void,
  onRouteClose?: (reason: BottomSheetChangeReason) => void
): void {
  if (nextOpen === routeIsOpen) {
    return;
  }

  if (nextOpen) {
    onRouteOpen?.(reason);
    return;
  }

  onRouteClose?.(reason);
}

/**
 * Build controlled BottomSheet props from route state.
 * Re-create this adapter when route state changes.
 */
export function createBottomSheetNavigationAdapter(
  options: BottomSheetNavigationAdapterOptions
): BottomSheetNavigationAdapter {
  return {
    isOpen: options.routeIsOpen,
    onOpenChange(nextOpen, reason) {
      options.onOpenChange?.(nextOpen, reason);
      handleRouteSync(
        nextOpen,
        reason,
        options.routeIsOpen,
        options.onRouteOpen,
        options.onRouteClose
      );
    },
  };
}

/**
 * Hook variant that keeps callback behavior aligned with the latest route state.
 */
export function useBottomSheetNavigation(
  options: BottomSheetNavigationAdapterOptions
): BottomSheetNavigationAdapter {
  const { routeIsOpen, onOpenChange, onRouteOpen, onRouteClose } = options;
  const routeIsOpenRef = useRef(routeIsOpen);
  routeIsOpenRef.current = routeIsOpen;

  return useMemo(
    () => ({
      isOpen: routeIsOpen,
      onOpenChange(nextOpen, reason) {
        onOpenChange?.(nextOpen, reason);
        handleRouteSync(
          nextOpen,
          reason,
          routeIsOpenRef.current,
          onRouteOpen,
          onRouteClose
        );
      },
    }),
    [onOpenChange, onRouteClose, onRouteOpen, routeIsOpen]
  );
}
