import { ROUTES } from "../constants/routes";
import type { UserRole } from "@store/auth/authtype";

/** Mapping from user role enum -> dashboard route */
const ROLE_DASHBOARD_ROUTE: Record<UserRole, string> = {
  manager: ROUTES.MANAGER.DASHBOARD,
  pharmacist: ROUTES.PHARMACIST.DASHBOARD,
  technician: ROUTES.TECHNICIAN.DASHBOARD,
};

export function getDashboardRoute(role: UserRole) {
  return ROLE_DASHBOARD_ROUTE[role] ?? ROUTES.LOGIN;
}
