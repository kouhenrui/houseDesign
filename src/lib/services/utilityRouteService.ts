import { UtilityRouteService } from '$lib/application/utilities/UtilityRouteService';
import { projectUtilityRouteRepository } from '$lib/stores/project';

export const utilityRouteService = new UtilityRouteService(projectUtilityRouteRepository);