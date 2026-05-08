import { useAppSelector } from "@app/store";
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@constants/routes";
import { ROLE_FALLBACKS } from "@shared/constants/roleRoutes";
import type { UserRole } from "@auth/types";

type Props = { allowedRoles?: UserRole[] };

export default function ProtectedRoute({ allowedRoles }: Props) {
  const user = useAppSelector((s) => s.auth.user);

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const role = user.role as UserRole;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={ROLE_FALLBACKS[role]} replace />;
  }

  return <Outlet />;
}
