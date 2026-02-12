import { View, StyleSheet, Text, Button } from 'react-native';
import { useState, useCallback } from 'react';
import { RnBottomSheetView } from 'rn-bottom-sheet';
import type { NativeChangeReason } from 'rn-bottom-sheet';
import { callback } from 'react-native-nitro-modules';

/**
 * Example app demonstrating basic bottom sheet usage.
 *
 * Note: This is a minimal example. The full BottomSheet component wrapper
 * will provide a more ergonomic API with proper controlled/uncontrolled modes.
 */
export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDetent, setCurrentDetent] = useState(0);

  const handleOpenChange = useCallback(
    (open: boolean, reason: NativeChangeReason) => {
      console.log(`Sheet open changed: ${open}, reason: ${reason}`);
      setIsOpen(open);
    },
    []
  );

  const handleDetentChange = useCallback(
    (index: number, reason: NativeChangeReason) => {
      console.log(`Detent changed: ${index}, reason: ${reason}`);
      setCurrentDetent(index);
    },
    []
  );

  // Default detent configurations
  const detents = [
    { type: 'semantic' as const, value: 'medium', identifier: 'medium' },
    { type: 'semantic' as const, value: 'large', identifier: 'large' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>rn-bottom-sheet Example</Text>
      <Text style={styles.status}>
        Sheet: {isOpen ? 'Open' : 'Closed'} | Detent: {currentDetent}
      </Text>
      <Button title="Open Sheet" onPress={() => setIsOpen(true)} />

      <RnBottomSheetView
        style={styles.sheet}
        isOpen={isOpen}
        detents={detents}
        initialDetentIndex={0}
        selectedDetentIndex={-1}
        grabberVisible={true}
        allowSwipeToDismiss={true}
        backgroundInteraction="modal"
        cornerRadius={-1}
        expandsWhenScrolledToEdge={true}
        onOpenChange={callback(handleOpenChange)}
        onDetentChange={callback(handleDetentChange)}
        onWillPresent={callback(() => console.log('Will present'))}
        onDidPresent={callback(() => console.log('Did present'))}
        onWillDismiss={callback(() => console.log('Will dismiss'))}
        onDidDismiss={callback(() => console.log('Did dismiss'))}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Sheet Content</Text>
          <Button title="Close" onPress={() => setIsOpen(false)} />
        </View>
      </RnBottomSheetView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContent: {
    padding: 20,
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
});
