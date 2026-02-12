import type { BottomSheetDetent } from '../types/bottom-sheet';
import {
  detentToNativeIdentifier,
  detentsToNativeConfig,
  getDetentIdentifier,
  normalizeDetents,
  validateDetent,
  validateDetents,
} from '../utils/detents';

describe('detent utilities', () => {
  it('accepts semantic fit detent', () => {
    expect(validateDetent('fit')).toBeNull();
  });

  it('rejects invalid fraction values', () => {
    expect(validateDetent({ type: 'fraction', value: 1.2 })).toContain(
      'between 0 and 1'
    );
  });

  it('rejects non-positive points values', () => {
    expect(validateDetent({ type: 'points', value: 0 })).toContain('positive');
  });

  it('normalizes detents to low-to-high order and deduplicates by resolved value', () => {
    const detents: BottomSheetDetent[] = [
      'large',
      { type: 'points', value: 200, id: 'content' },
      'medium',
      'fit',
      { type: 'fraction', value: 0.8 },
      { type: 'points', value: 200, id: 'duplicate-id' },
      'medium',
    ];

    expect(normalizeDetents(detents)).toEqual([
      { type: 'points', value: 200, id: 'content' },
      'fit',
      'medium',
      { type: 'fraction', value: 0.8 },
      'large',
    ]);
  });

  it('returns deterministic identifier values', () => {
    expect(getDetentIdentifier('fit')).toBe('semantic:fit');
    expect(
      getDetentIdentifier({ type: 'fraction', value: 0.6, id: 'hero' })
    ).toBe('fraction:hero');
    expect(getDetentIdentifier({ type: 'points', value: 320 })).toBe(
      'points:320'
    );
  });

  it('validates unique custom detent ids', () => {
    const result = validateDetents([
      { type: 'fraction', value: 0.4, id: 'dup' },
      { type: 'points', value: 360, id: 'dup' },
    ]);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("Duplicate detent id 'dup'");
  });

  it('returns normalized detents when validation succeeds', () => {
    const result = validateDetents([
      'large',
      'fit',
      { type: 'fraction', value: 0.6 },
    ]);

    expect(result.valid).toBe(true);
    expect(result.normalizedDetents).toEqual([
      'fit',
      { type: 'fraction', value: 0.6 },
      'large',
    ]);
  });

  it('maps detents to native config with deterministic identifiers', () => {
    const config = detentsToNativeConfig([
      { type: 'fraction', value: 0.6, id: 'hero detent' },
      'fit',
    ]);

    expect(config).toEqual([
      {
        type: 'semantic',
        value: 'fit',
        identifier: 'fit',
        detent: 'fit',
      },
      {
        type: 'fraction',
        value: 0.6,
        identifier: 'hero_detent',
        detent: { type: 'fraction', value: 0.6, id: 'hero detent' },
      },
    ]);
  });

  it('falls back to generated identifier when custom id is not provided', () => {
    expect(detentToNativeIdentifier({ type: 'points', value: 300 }, 2)).toBe(
      'points_300_2'
    );
  });
});
