import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

const createPrescriptionApiMock = vi.fn();
const getPrescriptionByIdMock = vi.fn();
const getAllPrescriptionsMock = vi.fn();
const cancelPrescriptionApiMock = vi.fn();
const reviewPrescriptionApiMock = vi.fn();

vi.mock("@prescription/api", () => ({
  createPrescription: (...args: unknown[]) => createPrescriptionApiMock(...args),
  getPrescriptionById: (...args: unknown[]) => getPrescriptionByIdMock(...args),
  getAllPrescriptions: (...args: unknown[]) => getAllPrescriptionsMock(...args),
  cancelPrescription: (...args: unknown[]) => cancelPrescriptionApiMock(...args),
  reviewPrescription: (...args: unknown[]) => reviewPrescriptionApiMock(...args),
}));

import reducer, {
  cancelPrescription,
  clearPrescriptions,
  clearSelected,
  createPrescription,
  fetchAllPrescriptions,
  fetchPrescriptionDetails,
  reviewPrescription,
} from "@prescription/slices";

function makeStore() {
  return configureStore({
    reducer: {
      prescriptions: reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("prescriptionSlice", () => {
  it("initializes with the current state shape", () => {
    const store = makeStore();

    expect(store.getState().prescriptions).toEqual({
      items: [],
      selected: undefined,
      pageNumber: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 1,
      status: "idle",
      error: undefined,
    });
  });

  it("clearPrescriptions resets list state", () => {
    const state = reducer(
      undefined,
      fetchAllPrescriptions.fulfilled(
        {
          items: [],
          pageNumber: 3,
          pageSize: 25,
          totalCount: 2,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
        "",
        undefined,
      ),
    );

    const next = reducer(state, clearPrescriptions());

    expect(next.items).toEqual([]);
    expect(next.pageNumber).toBe(1);
    expect(next.pageSize).toBe(10);
    expect(next.totalCount).toBe(0);
    expect(next.totalPages).toBe(1);
    expect(next.status).toBe("idle");
    expect(next.error).toBeUndefined();
  });

  it("clearSelected removes selected only", () => {
    const state = reducer(
      undefined,
      fetchPrescriptionDetails.fulfilled(
        {
          prescription: {
            id: "rx-1",
            patientId: "p-1",
