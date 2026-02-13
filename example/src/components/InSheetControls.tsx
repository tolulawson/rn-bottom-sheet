import { Button, StyleSheet, Text, View } from 'react-native';
import type {
  BackgroundInteractionMode,
  BottomSheetContentBackgroundBlurStyle,
  BottomSheetContentBackgroundStyle,
  BottomSheetPreferredColorScheme,
} from 'rn-bottom-sheet';

import type { InSheetRoute } from '../example-state';
import { TEST_IDS } from '../testids';
import type { ThemeTokens } from '../theme';

type InSheetControlsProps = {
  availableDetentCount: number;
  allowSwipeToDismiss: boolean;
  backgroundInteraction: BackgroundInteractionMode;
  contentBackgroundBlurStyle: BottomSheetContentBackgroundBlurStyle;
  contentBackgroundStyle: BottomSheetContentBackgroundStyle;
  currentDetent: number;
  detentPresetLabel: string;
  expandsWhenScrolledToEdge: boolean;
  grabberVisible: boolean;
  onCycleContentBackgroundBlurStyle: () => void;
  onCycleContentBackgroundStyle: () => void;
  onCycleDetentPreset: () => void;
  onClose: () => void;
  onCycleBackgroundInteraction: () => void;
  onCyclePreferredColorScheme: () => void;
  onSnapToDetent: (index: number) => void;
  onToggleExpandOnScroll: () => void;
  onToggleGrabber: () => void;
  onToggleRoute: () => void;
  onToggleSwipeDismiss: () => void;
  preferredColorScheme: BottomSheetPreferredColorScheme;
  route: InSheetRoute;
  theme: ThemeTokens;
};

function renderBackgroundInteractionLabel(
  mode: BackgroundInteractionMode
): string {
  if (typeof mode === 'string') {
    return mode;
  }

  return `upThrough(${mode.upThrough})`;
}

export function InSheetControls({
  availableDetentCount,
  allowSwipeToDismiss,
  backgroundInteraction,
  contentBackgroundBlurStyle,
  contentBackgroundStyle,
  currentDetent,
  detentPresetLabel,
  expandsWhenScrolledToEdge,
  grabberVisible,
  onCycleContentBackgroundBlurStyle,
  onCycleContentBackgroundStyle,
  onCycleDetentPreset,
  onClose,
  onCycleBackgroundInteraction,
  onCyclePreferredColorScheme,
  onSnapToDetent,
  onToggleExpandOnScroll,
  onToggleGrabber,
  onToggleRoute,
  onToggleSwipeDismiss,
  preferredColorScheme,
  route,
  theme,
}: InSheetControlsProps) {
  return (
    <View
      accessibilityLabel={TEST_IDS.sheetContent}
      style={[
        styles.content,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
      testID={TEST_IDS.sheetContent}
    >
      <Text
        accessibilityLabel={TEST_IDS.sheetTitle}
        style={[styles.title, { color: theme.text }]}
        testID={TEST_IDS.sheetTitle}
      >
        Sheet Controls
      </Text>
      <Text
        accessibilityLabel={TEST_IDS.sheetRouteSummary}
        accessibilityValue={{
          text: `In-Sheet Route: ${
            route === 'summary' ? 'Summary' : 'Details'
          } | Detent: ${currentDetent}`,
        }}
        style={[styles.status, { color: theme.mutedText }]}
        testID={TEST_IDS.sheetRouteSummary}
      >
        In-Sheet Route: {route === 'summary' ? 'Summary' : 'Details'} | Detent:{' '}
        {currentDetent}
      </Text>
      <Text style={[styles.status, { color: theme.mutedText }]}>
        Grabber: {grabberVisible ? 'On' : 'Off'} | Swipe dismiss:{' '}
        {allowSwipeToDismiss ? 'On' : 'Off'}
      </Text>
      <Text style={[styles.status, { color: theme.mutedText }]}>
        Expand on scroll: {expandsWhenScrolledToEdge ? 'On' : 'Off'} |{' '}
        Background: {renderBackgroundInteractionLabel(backgroundInteraction)}
      </Text>
      <Text
        accessibilityLabel={TEST_IDS.sheetDetentPresetSummary}
        accessibilityValue={{ text: `Detent preset: ${detentPresetLabel}` }}
        style={[styles.status, { color: theme.mutedText }]}
        testID={TEST_IDS.sheetDetentPresetSummary}
      >
        Detent preset: {detentPresetLabel}
      </Text>
      <Text
        accessibilityLabel={TEST_IDS.sheetStyleSummary}
        accessibilityValue={{
          text: `Sheet style: ${preferredColorScheme} / ${contentBackgroundStyle} / ${contentBackgroundBlurStyle}`,
        }}
        style={[styles.status, { color: theme.mutedText }]}
        testID={TEST_IDS.sheetStyleSummary}
      >
        Sheet style: {preferredColorScheme} / {contentBackgroundStyle} /{' '}
        {contentBackgroundBlurStyle}
      </Text>

      <View style={styles.buttonSpacer} />
      <Button
        accessibilityLabel={TEST_IDS.routeToggleButton}
        onPress={onToggleRoute}
        testID={TEST_IDS.routeToggleButton}
        title={route === 'summary' ? 'Go to Details' : 'Back to Summary'}
      />
      <View style={styles.buttonSpacer} />
      <Button
        accessibilityLabel={TEST_IDS.closeSheetButton}
        onPress={onClose}
        testID={TEST_IDS.closeSheetButton}
        title="Close Sheet"
      />
      <View style={styles.buttonSpacer} />
      <Button
        accessibilityLabel={TEST_IDS.snapFitButton}
        onPress={() => onSnapToDetent(0)}
        testID={TEST_IDS.snapFitButton}
        title="Snap to Fit"
      />
      <View style={styles.buttonSpacer} />
      <Button
        accessibilityLabel={TEST_IDS.snapMediumButton}
        disabled={availableDetentCount < 2}
        onPress={() => onSnapToDetent(1)}
        testID={TEST_IDS.snapMediumButton}
        title="Snap to Medium"
      />
      <View style={styles.buttonSpacer} />
      <Button
        accessibilityLabel={TEST_IDS.snapLargeButton}
        disabled={availableDetentCount < 3}
        onPress={() => onSnapToDetent(2)}
        testID={TEST_IDS.snapLargeButton}
        title="Snap to Large"
      />
      <View style={styles.buttonSpacer} />
      <Button
        accessibilityLabel={TEST_IDS.cycleDetentPresetButton}
        onPress={onCycleDetentPreset}
        testID={TEST_IDS.cycleDetentPresetButton}
        title="Cycle Detent Preset"
      />
      <View style={styles.buttonSpacer} />
      <Button
        accessibilityLabel={TEST_IDS.toggleGrabberButton}
        onPress={onToggleGrabber}
        testID={TEST_IDS.toggleGrabberButton}
        title="Toggle Grabber"
      />
      <View style={styles.buttonSpacer} />
      <Button
        accessibilityLabel={TEST_IDS.toggleSwipeDismissButton}
        onPress={onToggleSwipeDismiss}
        testID={TEST_IDS.toggleSwipeDismissButton}
        title="Toggle Swipe Dismiss"
      />
      <View style={styles.buttonSpacer} />
      <Button
        accessibilityLabel={TEST_IDS.toggleExpandOnScrollButton}
        onPress={onToggleExpandOnScroll}
        testID={TEST_IDS.toggleExpandOnScrollButton}
        title="Toggle Expand On Scroll"
      />
      <View style={styles.buttonSpacer} />
      <Button
        accessibilityLabel={TEST_IDS.cycleBackgroundInteractionButton}
        onPress={onCycleBackgroundInteraction}
        testID={TEST_IDS.cycleBackgroundInteractionButton}
        title="Cycle Background Interaction"
      />
      <View style={styles.buttonSpacer} />
      <Button
        accessibilityLabel={TEST_IDS.cyclePreferredColorSchemeButton}
        onPress={onCyclePreferredColorScheme}
        testID={TEST_IDS.cyclePreferredColorSchemeButton}
        title="Cycle Preferred Color Scheme"
      />
      <View style={styles.buttonSpacer} />
      <Button
        accessibilityLabel={TEST_IDS.cycleContentBackgroundStyleButton}
        onPress={onCycleContentBackgroundStyle}
        testID={TEST_IDS.cycleContentBackgroundStyleButton}
        title="Cycle Content Background Style"
      />
      <View style={styles.buttonSpacer} />
      <Button
        accessibilityLabel={TEST_IDS.cycleContentBackgroundBlurStyleButton}
        onPress={onCycleContentBackgroundBlurStyle}
        testID={TEST_IDS.cycleContentBackgroundBlurStyleButton}
        title="Cycle Content Background Blur Style"
      />
      <View style={styles.buttonSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    borderWidth: 1,
    width: '100%',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  status: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonSpacer: {
    height: 8,
  },
});
