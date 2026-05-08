import { ROUTES } from "@constants/routes";
import type { UserRole } from "@auth/types";

export const ROLE_FALLBACKS: Record<UserRole, string> = {
  manager: ROUTES.MANAGER.DASHBOARD,
  pharmacist: ROUTES.PHARMACIST.DASHBOARD,
  technician: ROUTES.TECHNICIAN.DASHBOARD,
};
