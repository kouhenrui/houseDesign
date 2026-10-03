import { FoundationDesignService } from '$lib/application/foundation/FoundationDesignService';
import { projectFoundationPlanRepository } from '$lib/stores/project';

export const foundationDesignService = new FoundationDesignService(projectFoundationPlanRepository);