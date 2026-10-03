export type FoundationType = 'slab-on-grade' | 'crawlspace' | 'basement';

export interface FoundationPoint {
  x: number;
  y: number;
}

export class FoundationPlan {
  private constructor(
    readonly type: FoundationType | undefined,
    readonly outline: readonly FoundationPoint[] | undefined,
  ) {}

  static create(type?: FoundationType, outline?: readonly FoundationPoint[]): FoundationPlan {
    if (type !== undefined && !['slab-on-grade', 'crawlspace', 'basement'].includes(type)) {
      throw new Error('Choose a supported foundation type.');
    }
    if (outline !== undefined && (outline.length < 3 || outline.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y)))) {
      throw new Error('A foundation outline needs at least three finite points.');
    }
    const points = outline?.map(point => Object.freeze({ x: point.x, y: point.y }));
    return new FoundationPlan(type, points ? Object.freeze(points) : undefined);
  }

  withType(type: FoundationType): FoundationPlan {
    return FoundationPlan.create(type, this.outline);
  }

  withOutline(outline?: readonly FoundationPoint[]): FoundationPlan {
    return FoundationPlan.create(this.type, outline);
  }
}