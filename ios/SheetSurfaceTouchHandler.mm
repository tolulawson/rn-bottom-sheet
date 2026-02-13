#import "SheetSurfaceTouchHandler.h"

#import <React/RCTSurfaceTouchHandler.h>

@implementation SheetSurfaceTouchHandler {
  RCTSurfaceTouchHandler *_touchHandler;
}

- (instancetype)init
{
  self = [super init];
  if (self != nil) {
    _touchHandler = [RCTSurfaceTouchHandler new];
  }
  return self;
}

- (void)attachToView:(UIView *)view
{
  UIView *currentView = _touchHandler.view;
  if (currentView == view) {
    return;
  }

  if (currentView != nil) {
    [_touchHandler detachFromView:currentView];
  }

  [_touchHandler attachToView:view];
}

- (void)detachFromCurrentView
{
  UIView *currentView = _touchHandler.view;
  if (currentView == nil) {
    return;
  }

  [_touchHandler detachFromView:currentView];
}

@end
