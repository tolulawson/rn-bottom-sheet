export type SheetPhase = 'closed' | 'opening' | 'open' | 'dismissing';
export type InSheetRoute = 'summary' | 'details';

export function isOpenRequestNoOp(phase: SheetPhase): boolean {
  return phase === 'opening' || phase === 'open';
}

export function getPhaseForOpenRequest(phase: SheetPhase): SheetPhase {
  if (isOpenRequestNoOp(phase)) {
    return phase;
  }

  return 'opening';
}

export function getPhaseForCloseRequest(phase: SheetPhase): SheetPhase {
  if (phase === 'closed') {
    return 'closed';
  }

  return 'dismissing';
}

export function getResetRouteOnClose(
  nextOpen: boolean,
  currentRoute: InSheetRoute
): InSheetRoute {
  if (nextOpen) {
    return currentRoute;
  }

  return 'summary';
}
