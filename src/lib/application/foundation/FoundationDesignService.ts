import type { FoundationPoint, FoundationType } from '$lib/domain/foundation/FoundationPlan';
import type { FoundationPlanRepository } from '$lib/domain/foundation/FoundationPlanRepository';

export class FoundationDesignService {
  constructor(private readonly foundations: FoundationPlanRepository) {}

  selectType(type: FoundationType): void {
    this.foundations.save(this.foundations.load().withType(type));
  }

  setOutline(points: readonly FoundationPoint[]): void {
    this.foundations.save(this.foundations.load().withOutline(points));
  }

  clearOutline(): void {
    this.foundations.save(this.foundations.load().withOutline(undefined));
  }
}