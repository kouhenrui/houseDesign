import { UtilityRoute, type UtilityRouteDraft } from '$lib/domain/utilities/UtilityRoute';
import type { UtilityRouteRepository } from '$lib/domain/utilities/UtilityRouteRepository';

export class UtilityRouteService {
  constructor(
    private readonly routes: UtilityRouteRepository,
    private readonly createId: () => string = () => globalThis.crypto?.randomUUID?.() ?? `route-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
  ) {}

  add(draft: UtilityRouteDraft): string {
    const route = UtilityRoute.create(this.createId(), draft);
    this.routes.add(route);
    return route.id;
  }

  remove(id: string): void {
    if (id.trim()) this.routes.remove(id);
  }
}