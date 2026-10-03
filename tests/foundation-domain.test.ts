import { expect, it } from 'vitest';
import { FoundationPlan } from '$lib/domain/foundation/FoundationPlan';
import type { FoundationPlanRepository } from '$lib/domain/foundation/FoundationPlanRepository';
import { FoundationDesignService } from '$lib/application/foundation/FoundationDesignService';

const outline = [{ x: 0, y: 0 }, { x: 500, y: 0 }, { x: 500, y: 300 }, { x: 0, y: 300 }];

it('keeps foundation selection and outline as immutable aggregate state', () => {
  const plan = FoundationPlan.create().withType('crawlspace').withOutline(outline);
  outline[0].x = 999;
  expect(plan.type).toBe('crawlspace');
  expect(plan.outline?.[0].x).toBe(0);
  expect(() => { (plan.outline![0] as { x: number }).x = 10; }).toThrow();
});

it.each([
  { type: 'unsupported' as never },
  { outline: [{ x: 0, y: 0 }, { x: 1, y: 1 }] },
  { outline: [{ x: 0, y: 0 }, { x: Infinity, y: 1 }, { x: 1, y: 0 }] },
])('rejects invalid foundation state', state => {
  expect(() => FoundationPlan.create(state.type, state.outline)).toThrow();
});

it('uses the repository abstraction to update and clear the foundation outline', () => {
  let saved = FoundationPlan.create();
  const repository: FoundationPlanRepository = {
    load: () => saved,
    save: plan => { saved = plan; },
  };
  const service = new FoundationDesignService(repository);
  service.selectType('basement');
  service.setOutline(outline);
  expect(saved.type).toBe('basement');
  expect(saved.outline).toHaveLength(4);
  service.clearOutline();
  expect(saved.type).toBe('basement');
  expect(saved.outline).toBeUndefined();
});