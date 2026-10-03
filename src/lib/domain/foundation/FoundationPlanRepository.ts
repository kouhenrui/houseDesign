import type { FoundationPlan } from './FoundationPlan';

export interface FoundationPlanRepository {
  load(): FoundationPlan;
  save(plan: FoundationPlan): void;
}