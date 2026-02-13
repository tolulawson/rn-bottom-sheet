import fs from 'node:fs';
import path from 'node:path';

const componentPath = path.resolve(
  process.cwd(),
  'nitrogen/generated/ios/c++/views/HybridRnBottomSheetComponent.mm'
);

if (!fs.existsSync(componentPath)) {
  process.exit(0);
}

let source = fs.readFileSync(componentPath, 'utf8');
let changed = false;

const objcMessageImport = '#import <objc/message.h>';
if (!source.includes(objcMessageImport)) {
  source = source.replace(
    '#import <UIKit/UIKit.h>',
    '#import <UIKit/UIKit.h>\n#import <objc/message.h>'
  );
  changed = true;
}

const routingSignature =
  '- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index';

if (!source.includes(routingSignature)) {
  const routingBlock = `

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [super mountChildComponentView:childComponentView index:index];

  UIView* hostView = self.contentView;
  SEL routeSelector = NSSelectorFromString(@"routeChild:atIndex:");
  if (hostView != nil && [hostView respondsToSelector:routeSelector]) {
    ((void (*)(id, SEL, UIView*, NSInteger))objc_msgSend)(
      hostView,
      routeSelector,
      childComponentView,
      index
    );
  }
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  UIView* hostView = self.contentView;
  SEL unrouteSelector = NSSelectorFromString(@"unrouteChild:");
  if (hostView != nil && [hostView respondsToSelector:unrouteSelector]) {
    ((void (*)(id, SEL, UIView*))objc_msgSend)(
      hostView,
      unrouteSelector,
      childComponentView
    );
    return;
  }

  [childComponentView removeFromSuperview];
}
`;
  source = source.replace('+ (BOOL)shouldBeRecycled {', `${routingBlock}\n+ (BOOL)shouldBeRecycled {`);
  changed = true;
}

if (changed) {
  fs.writeFileSync(componentPath, source);
  console.log(
    '[rn-bottom-sheet] Applied iOS child-routing patch to HybridRnBottomSheetComponent.mm'
  );
}
