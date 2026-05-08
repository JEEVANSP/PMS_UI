import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import PageLoader from "@components/common/Loader/PageLoader";
import AppLayout from "@components/layouts/Applayout/Applayout";
import { ROUTES } from "@constants/routes";
import {
  LoginPage,
  PharmacistDashboard,
  ManagerDashboard,
  ManagerUserManagement,
  ManagerInventoryManagement,
  PrescriptionValidationQueue,
  PrescriptionValidationPage,
  ManualPrescriptionView,
  PrescriptionDispense,
  TechnicianDashboard,
  InventoryManagement,
  LabelGeneration,
  PrescriptionHistory,
  PatientProfile,
  AuditLogs,
  PaymentDashboard,
} from "./routeConfig";
export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
          <Route path={ROUTES.MANAGER.BASE} element={<AppLayout />}>
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="users" element={<ManagerUserManagement />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="payment" element={<PaymentDashboard />} />
            <Route path="inventory" element={<ManagerInventoryManagement />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["pharmacist"]} />}>
          <Route path={ROUTES.PHARMACIST.BASE} element={<AppLayout />}>
            <Route index element={<PharmacistDashboard />} />
            <Route path="dashboard" element={<PharmacistDashboard />} />
            <Route path="entry" element={<ManualPrescriptionView />} />
            <Route path="validation" element={<PrescriptionValidationQueue />} />
            <Route path="validation/:rxId" element={<PrescriptionValidationPage />} />
            <Route path="dispense" element={<PrescriptionDispense />} />
            <Route path="labels" element={<LabelGeneration />} />
            <Route path="history" element={<PrescriptionHistory />} />
            <Route path="profiles" element={<PatientProfile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["technician"]} />}>
          <Route path={ROUTES.TECHNICIAN.BASE} element={<AppLayout />}>
            <Route path="dashboard" element={<TechnicianDashboard />} />
            <Route path="inventory" element={<InventoryManagement />} />
          </Route>
        </Route>

        <Route path={ROUTES.FALLBACK} element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </Suspense>
  );
}
