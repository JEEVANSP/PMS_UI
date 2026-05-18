export const ENDPOINTS = {
  login: "/api/auth/login",
  refresh: "/api/auth/refresh",
  logout: "/api/auth/logout",

  users: "/api/users",

  patients: "/api/patients",
  patientSearch: "/api/patients/search",

  allergySearch: "/api/catalogs/allergies/search",
  ALLERGY_SEARCH_ENDPOINT: "/api/catalogs/allergies/search",

  products: "/api/products/search",

  prescriptions: "/api/prescriptions",
  prescriptionById: (id: string) => `/api/prescriptions/${id}`,
  prescriptionsByPatient: (patientId: string) => `/api/prescriptions/patient/${patientId}`,
  prescriptionValidate: (id: string) => `/api/prescriptions/${id}/validate`,
  prescriptionReview: (id: string) => `/api/prescriptions/${id}/review`,
  prescriptionDispensePreview: (id: string) =>
    `/api/prescriptions/${id}/dispense-preview`,

  dispenses: "/api/dispenses",
  dispenseById: (id: string) => `/api/dispenses/${id}`,
  dispenseLabel: (id: string) => `/api/dispenses/${id}/label`,
  dispenseExecute: (id: string) => `/api/dispenses/${id}/execute`,
  dispenseCancel: (id: string) => `/api/dispenses/${id}/cancel`,
  dispenseInsuranceClaim: (id: string) => `/api/dispenses/${id}/insurance-claim`,

  dispensePreview: (prescriptionId: string) =>
    `/api/prescriptions/${prescriptionId}/dispense-preview`,

  inventoryLotsByProduct: (productId: string) =>
    `/api/inventory/products/${productId}/lots`,
  inventoryProducts: "/api/inventory/products",
  inventoryLotRequest: "/api/inventory/lots/request",
  inventoryPendingLots: "/api/inventory/lots/pending",
  inventoryLotsAll: "/api/inventory/lots/all",
  inventoryExpiring: "/api/inventory/lots/expiring",

  payments: "/api/payments",
  paymentById: (id: string) => `/api/payments/${id}`,
  paymentsByDispense: (dispenseId: string) => `/api/payments/dispense/${dispenseId}`,
  paymentRecord: "/api/payments",
  paymentsSummary: "/api/payments/summary",
  paymentsTrend: "/api/payments/trend",
  paymentsModeBreakdown: "/api/payments/mode-breakdown",
  paymentsTransactions: "/api/payments/transactions",

  auditList: "/api/audit",
  auditById: (id: string) => `/api/audit/${id}`,
} as const;
