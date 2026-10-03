import type { Point, UtilityRoute as UtilityRouteData, UtilityRouteKind } from '$lib/models/types';

export interface UtilityRouteDraft {
  kind: UtilityRouteKind;
  points: readonly Point[];
  sizeMm: number;
  slopePercent?: number;
}

export class UtilityRoute {
  private constructor(
    readonly id: string,
    readonly kind: UtilityRouteKind,
    readonly points: readonly Point[],
    readonly sizeMm: number,
    readonly slopePercent?: number,
  ) {}

  static create(id: string, draft: UtilityRouteDraft): UtilityRoute {
    if (!id.trim()) throw new Error('A utility route needs an ID.');
    if (!['power', 'lighting', 'cold-water', 'hot-water', 'drain', 'vent', 'gas'].includes(draft.kind)) {
      throw new Error('Choose a supported utility system.');
    }
    if (draft.points.length < 2 || draft.points.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y))) {
      throw new Error('A utility route needs at least two finite points.');
    }
    if (!Number.isFinite(draft.sizeMm) || draft.sizeMm <= 0) throw new Error('Utility route size must be greater than zero.');
    if (draft.slopePercent !== undefined && (!Number.isFinite(draft.slopePercent) || Math.abs(draft.slopePercent) > 100)) {
      throw new Error('Utility route slope must be between -100% and 100%.');
    }
    const points = draft.points.map(point => Object.freeze({ x: point.x, y: point.y }));
    return new UtilityRoute(id, draft.kind, Object.freeze(points), draft.sizeMm, draft.slopePercent);
  }

  toData(): UtilityRouteData {
    return {
      id: this.id,
      kind: this.kind,
      points: this.points.map(point => ({ x: point.x, y: point.y })),
      sizeMm: this.sizeMm,
      ...(this.slopePercent === undefined ? {} : { slopePercent: this.slopePercent }),
    };
  }
}