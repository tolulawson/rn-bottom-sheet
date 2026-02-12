import React, { useEffect } from 'react';
import TestRenderer from 'react-test-renderer';
import {
  createBottomSheetNavigationAdapter,
  useBottomSheetNavigation,
  type BottomSheetNavigationAdapter,
} from '../navigation/bottom-sheet-adapter';
import type { BottomSheetChangeReason } from '../types/bottom-sheet';

describe('createBottomSheetNavigationAdapter', () => {
  it('maps route state to controlled isOpen', () => {
    const adapter = createBottomSheetNavigationAdapter({
      routeIsOpen: true,
    });

    expect(adapter.isOpen).toBe(true);
  });

  it('requests route close when native sheet closes while route is open', () => {
    const onOpenChange = jest.fn();
    const onRouteClose = jest.fn();
    const onRouteOpen = jest.fn();
    const adapter = createBottomSheetNavigationAdapter({
      routeIsOpen: true,
      onOpenChange,
      onRouteClose,
      onRouteOpen,
    });

    adapter.onOpenChange(false, 'swipe');

    expect(onOpenChange).toHaveBeenCalledWith(false, 'swipe');
    expect(onRouteClose).toHaveBeenCalledWith('swipe');
    expect(onRouteOpen).not.toHaveBeenCalled();
  });

  it('does not request route state changes when sheet state already matches', () => {
    const onRouteClose = jest.fn();
    const onRouteOpen = jest.fn();
    const adapter = createBottomSheetNavigationAdapter({
      routeIsOpen: false,
      onRouteClose,
      onRouteOpen,
    });

    adapter.onOpenChange(false, 'programmatic');

    expect(onRouteClose).not.toHaveBeenCalled();
    expect(onRouteOpen).not.toHaveBeenCalled();
  });
});

interface HookHarnessProps {
  routeIsOpen: boolean;
  onAdapter: (adapter: BottomSheetNavigationAdapter) => void;
  onRouteOpen?: (reason: BottomSheetChangeReason) => void;
  onRouteClose?: (reason: BottomSheetChangeReason) => void;
}

function HookHarness({
  routeIsOpen,
  onAdapter,
  onRouteOpen,
  onRouteClose,
}: HookHarnessProps) {
  const adapter = useBottomSheetNavigation({
    routeIsOpen,
    onRouteOpen,
    onRouteClose,
  });

  useEffect(() => {
    onAdapter(adapter);
  }, [adapter, onAdapter]);

  return null;
}

describe('useBottomSheetNavigation', () => {
  it('uses latest route state when handling open changes', () => {
    const onRouteOpen = jest.fn();
    const onRouteClose = jest.fn();
    let latestAdapter: BottomSheetNavigationAdapter | null = null;
    let renderer: TestRenderer.ReactTestRenderer;

    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        React.createElement(HookHarness, {
          routeIsOpen: false,
          onRouteOpen,
          onRouteClose,
          onAdapter: (adapter) => {
            latestAdapter = adapter;
          },
        })
      );
    });

    TestRenderer.act(() => {
      latestAdapter?.onOpenChange(true, 'programmatic');
    });
    expect(onRouteOpen).toHaveBeenCalledTimes(1);

    TestRenderer.act(() => {
      renderer!.update(
        React.createElement(HookHarness, {
          routeIsOpen: true,
          onRouteOpen,
          onRouteClose,
          onAdapter: (adapter) => {
            latestAdapter = adapter;
          },
        })
      );
    });

    TestRenderer.act(() => {
      latestAdapter?.onOpenChange(true, 'programmatic');
      latestAdapter?.onOpenChange(false, 'swipe');
    });

    expect(onRouteOpen).toHaveBeenCalledTimes(1);
    expect(onRouteClose).toHaveBeenCalledWith('swipe');
  });
});
