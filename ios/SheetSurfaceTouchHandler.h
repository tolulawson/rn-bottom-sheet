#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface SheetSurfaceTouchHandler : NSObject

- (void)attachToView:(UIView *)view;
- (void)detachFromCurrentView;

@end

NS_ASSUME_NONNULL_END
