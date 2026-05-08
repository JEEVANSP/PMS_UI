import { lazy } from "react";

export const LoginPage = lazy(() => import("@auth/components/LoginPage"));
export const PharmacistDashboard = lazy(() => import("@dashboard/components/PharmacistDashboard"));
export const ManagerDashboard = lazy(() => import("@dashboard/components/ManagerDashboard"));
export const ManagerUserManagement = lazy(() => import("@usermanagement/ManagerUserManagement"));
export const ManagerInventoryManagement = lazy(() => import("@inventory/components/ManagerInventoryManagement"));

export const PrescriptionValidationQueue = lazy(() => import("@validation/PrescriptionValidationQueue"));
export const PrescriptionValidationPage = lazy(() => import("@validation/PrescriptionValidationPage"));

export const ManualPrescriptionView = lazy(() => import("@prescription/PrescriptionEntry"));
export const PrescriptionDispense = lazy(() => import("@dispense/components/PrescriptionDispense"));

export const TechnicianDashboard = lazy(() => import("@dashboard/components/TechnicianDashboard"));
export const InventoryManagement = lazy(() => import("@inventory/InventoryManagement"));

export const LabelGeneration = lazy(() => import("@labels/components/LabelGeneration"));

export const PrescriptionHistory = lazy(() => import("@prescription/PrescriptionHistory"));
export const PatientProfile = lazy(() => import("@patient/components/PatientProfile"));

export const AuditLogs = lazy(() => import("@audit/components/AuditLog"));
export const PaymentDashboard = lazy(() => import("@payment/components/PaymentDashboard"));
