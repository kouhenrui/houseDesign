import { expect, it } from 'vitest';
import { UtilityRoute } from '$lib/domain/utilities/UtilityRoute';
import type { UtilityRouteRepository } from '$lib/domain/utilities/UtilityRouteRepository';
import { UtilityRouteService } from '$lib/application/utilities/UtilityRouteService';

it('creates immutable utility routes and returns detached project data', () => {
  const source = [{ x: 0, y: 0 }, { x: 300, y: 100 }];
  const route = UtilityRoute.create('route-1', { kind: 'drain', points: source, sizeMm: 100, slopePercent: 2 });
  source[1].x = 999;
  expect(route.points[1].x).toBe(300);
  const data = route.toData();
  data.points[0].x = 80;
  expect(route.points[0].x).toBe(0);
});

it.each([
  { id: '', draft: { kind: 'drain', points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], sizeMm: 100 } },
  { id: 'route-1', draft: { kind: 'drain', points: [{ x: 0, y: 0 }], sizeMm: 100 } },
  { id: 'route-1', draft: { kind: 'drain', points: [{ x: 0, y: 0 }, { x: Infinity, y: 1 }], sizeMm: 100 } },
  { id: 'route-1', draft: { kind: 'drain', points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], sizeMm: 0 } },
  { id: 'route-1', draft: { kind: 'drain', points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], sizeMm: 100, slopePercent: 101 } },
] as const)('rejects invalid route drafts', ({ id, draft }) => {
  expect(() => UtilityRoute.create(id, draft)).toThrow();
});

it('coordinates route creation and removal through the repository abstraction', () => {
  const saved: UtilityRoute[] = [];
  const removed: string[] = [];
  const repository: UtilityRouteRepository = {
    add(route) { saved.push(route); },
    remove(id) { removed.push(id); },
  };
  const service = new UtilityRouteService(repository, () => 'route-service-test');
  expect(service.add({ kind: 'hot-water', points: [{ x: 10, y: 20 }, { x: 80, y: 90 }], sizeMm: 20 })).toBe('route-service-test');
  service.remove('route-service-test');
  service.remove(' ');
  expect(saved[0].toData()).toMatchObject({ id: 'route-service-test', kind: 'hot-water', sizeMm: 20 });
  expect(removed).toEqual(['route-service-test']);
});