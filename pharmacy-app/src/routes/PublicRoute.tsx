import { useAppSelector } from "@app/store";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { type ReactNode } from "react";

export default function PublicRoute({ children }: { children: ReactNode }){
  const user = useAppSelector((s) => s.auth.user);

  if (user) {
    const ROLE_FALLBACKS = {
      manager: ROUTES.MANAGER.DASHBOARD,
      pharmacist: ROUTES.PHARMACIST.DASHBOARD,
      technician: ROUTES.TECHNICIAN.DASHBOARD,
    };

    return <Navigate to={ROLE_FALLBACKS[user.role]} replace />;
  }

  return children;
}
