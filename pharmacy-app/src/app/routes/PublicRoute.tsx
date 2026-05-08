import { useAppSelector } from "@app/store";
import { Navigate } from "react-router-dom";
import { ROLE_FALLBACKS } from "@shared/constants/roleRoutes";
import { type ReactNode } from "react";

export default function PublicRoute({ children }: { children: ReactNode }){
  const user = useAppSelector((s) => s.auth.user);

  if (user) {
    return <Navigate to={ROLE_FALLBACKS[user.role]} replace />;
  }

  return children;
}
