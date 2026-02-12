import { View, StyleSheet, Text, Button } from 'react-native';
import { useState, useCallback } from 'react';
import { BottomSheet } from 'rn-bottom-sheet';
import type { BottomSheetChangeReason } from 'rn-bottom-sheet';

/**
 * Example app demonstrating controlled BottomSheet usage.
 */
export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDetent, setCurrentDetent] = useState(0);

  const handleOpenChange = useCallback(
    (open: boolean, reason: BottomSheetChangeReason) => {
      console.log(`Sheet open changed: ${open}, reason: ${reason}`);
      setIsOpen(open);
    },
    []
  );

  const handleDetentChange = useCallback(
    (index: number, reason: BottomSheetChangeReason) => {
      console.log(`Detent changed: ${index}, reason: ${reason}`);
      setCurrentDetent(index);
    },
    []
  );

  const detents = ['fit', 'medium', 'large'] as const;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>rn-bottom-sheet Example</Text>
      <Text style={styles.status}>
        Sheet: {isOpen ? 'Open' : 'Closed'} | Detent: {currentDetent}
      </Text>
      <Button title="Open Sheet" onPress={() => setIsOpen(true)} />

      <BottomSheet
        isOpen={isOpen}
        detents={[...detents]}
        initialDetent={1}
        grabberVisible={true}
        allowSwipeToDismiss={true}
        backgroundInteraction="modal"
        cornerRadius={-1}
        expandsWhenScrolledToEdge={true}
        onOpenChange={handleOpenChange}
        onDetentChange={handleDetentChange}
        onWillPresent={() => console.log('Will present')}
        onDidPresent={() => console.log('Did present')}
        onWillDismiss={() => console.log('Will dismiss')}
        onDidDismiss={() => console.log('Did dismiss')}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Sheet Content</Text>
          <Button title="Close" onPress={() => setIsOpen(false)} />
        </View>
      </BottomSheet>
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
