import type { UtilityRoute } from './UtilityRoute';

export interface UtilityRouteRepository {
  add(route: UtilityRoute): void;
  remove(id: string): void;
}