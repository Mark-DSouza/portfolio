import { describe, expect, test } from 'bun:test';
import { compareProjects, type ProjectOrdering } from '../../src/lib/ordering';

function project(overrides: Partial<ProjectOrdering>): ProjectOrdering {
  return { featured: false, priority: 0, date: new Date('2025-01-01'), ...overrides };
}

describe('Projects order by Featured, then Priority, then date', () => {
  test('a Featured Project ranks above a non-Featured one', () => {
    const featured = project({ featured: true });
    const plain = project({ featured: false });
    expect(compareProjects(featured, plain)).toBeLessThan(0);
    expect(compareProjects(plain, featured)).toBeGreaterThan(0);
  });

  test('Featured wins even against higher Priority and newer date', () => {
    const featured = project({ featured: true, priority: -5, date: new Date('2020-01-01') });
    const plain = project({ featured: false, priority: 99, date: new Date('2026-01-01') });
    expect(compareProjects(featured, plain)).toBeLessThan(0);
  });

  test('among equally-Featured Projects, higher Priority ranks first', () => {
    const high = project({ priority: 10 });
    const low = project({ priority: 1 });
    expect(compareProjects(high, low)).toBeLessThan(0);
    expect(compareProjects(low, high)).toBeGreaterThan(0);
  });

  test('Priority defaults compare as 0: explicit positive beats default, default beats negative', () => {
    const positive = project({ priority: 1 });
    const zero = project({ priority: 0 });
    const negative = project({ priority: -1 });
    expect(compareProjects(positive, zero)).toBeLessThan(0);
    expect(compareProjects(zero, negative)).toBeLessThan(0);
  });

  test('with equal Featured and Priority, the newer date ranks first', () => {
    const newer = project({ date: new Date('2026-05-19') });
    const older = project({ date: new Date('2024-08-27') });
    expect(compareProjects(newer, older)).toBeLessThan(0);
    expect(compareProjects(older, newer)).toBeGreaterThan(0);
  });

  test('fully tied Projects compare equal (stable sort keeps their order)', () => {
    const a = project({});
    const b = project({});
    expect(compareProjects(a, b)).toBe(0);
  });

  test('sorting a full list applies all three keys in order', () => {
    const flagship = project({ featured: true, date: new Date('2026-05-19') });
    const pinned = project({ priority: 5, date: new Date('2023-01-01') });
    const recent = project({ date: new Date('2025-04-20') });
    const older = project({ date: new Date('2024-08-27') });
    const shuffled = [older, pinned, recent, flagship];
    expect(shuffled.toSorted(compareProjects)).toEqual([flagship, pinned, recent, older]);
  });
});
