import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";

const createPrescriptionApiMock = vi.fn();
const getPrescriptionByIdMock = vi.fn();
const getAllPrescriptionsMock = vi.fn();
const cancelPrescriptionApiMock = vi.fn();
const reviewPrescriptionApiMock = vi.fn();

vi.mock("@api/prescription.ts", () => ({
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
} from "../prescription/prescriptionSlice";

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
            patientName: "John",
            prescriber: { id: "d-1", name: "Dr. Jane" },
            prescriberName: "Dr. Jane",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            status: "Created",
            medicineCount: 0,
            medicines: [],
          },
          etag: "etag-1",
        },
        "",
        { id: "rx-1", patientId: "p-1" },
      ),
    );

    const next = reducer(state, clearSelected());
    expect(next.selected).toBeUndefined();
    expect(next.status).toBe("succeeded");
  });

  it("createPrescription stores the selected prescription on success", async () => {
    createPrescriptionApiMock.mockResolvedValueOnce({
      data: {
        id: "rx-1",
        patientId: "p-1",
        patientName: "John",
        prescriber: { id: "d-1", name: "Dr. Jane" },
        createdAt: "2026-01-01T00:00:00.000Z",
        status: "Created",
        medicines: [],
      },
      etag: "etag-1",
    });

    const store = makeStore();
    await store.dispatch(
      createPrescription({
        patientId: "p-1",
        prescriber: { id: "d-1", name: "Dr. Jane" },
        medicines: [],
      }),
    );

    expect(store.getState().prescriptions.selected?.prescription.id).toBe("rx-1");
    expect(store.getState().prescriptions.selected?.etag).toBe("etag-1");
    expect(store.getState().prescriptions.status).toBe("succeeded");
  });

  it("fetchPrescriptionDetails stores the fetched selection", async () => {
    getPrescriptionByIdMock.mockResolvedValueOnce({
      data: {
        id: "rx-2",
        patientId: "p-2",
        patientName: "Jane",
        prescriber: { id: "d-2", name: "Dr. Smith" },
        createdAt: "2026-01-02T00:00:00.000Z",
        status: "Created",
        medicines: [],
      },
      etag: "etag-2",
    });

    const store = makeStore();
    await store.dispatch(fetchPrescriptionDetails({ id: "rx-2", patientId: "p-2" }));

    expect(store.getState().prescriptions.selected?.prescription.id).toBe("rx-2");
    expect(store.getState().prescriptions.selected?.etag).toBe("etag-2");
  });

  it("fetchAllPrescriptions populates the mapped list", async () => {
    getAllPrescriptionsMock.mockResolvedValueOnce({
      items: [
        {
          id: "rx-1",
          patientId: "p-1",
          patientName: "John",
          prescriberName: "Dr. A",
          createdAt: "2026-01-01T00:00:00.000Z",
          status: "Created",
          medicineCount: 1,
        },
      ],
      pageNumber: 2,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: true,
    });

    const store = makeStore();
    await store.dispatch(fetchAllPrescriptions({ pageNumber: 2, pageSize: 10 }));

    const state = store.getState().prescriptions;
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe("rx-1");
    expect(state.pageNumber).toBe(2);
    expect(state.status).toBe("succeeded");
  });

  it("cancelPrescription removes item and clears matching selected state", async () => {
    getPrescriptionByIdMock.mockResolvedValueOnce({
      data: {
        id: "rx-1",
        patientId: "p-1",
        patientName: "John",
        prescriber: { id: "d-1", name: "Dr. Jane" },
        createdAt: "2026-01-01T00:00:00.000Z",
        status: "Created",
        medicines: [],
      },
      etag: "etag-1",
    });
    cancelPrescriptionApiMock.mockResolvedValueOnce("etag-2");

    const base = reducer(
      undefined,
      fetchAllPrescriptions.fulfilled(
        {
          items: [
            {
              id: "rx-1",
              patientId: "p-1",
              patientName: "John",
              prescriberName: "Dr. Jane",
              createdAt: new Date("2026-01-01T00:00:00.000Z"),
              status: "Created",
              medicineCount: 1,
            },
          ],
          pageNumber: 1,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        "",
        undefined,
      ),
    );
    const seeded = reducer(
      base,
      fetchPrescriptionDetails.fulfilled(
        {
          prescription: {
            id: "rx-1",
            patientId: "p-1",
            patientName: "John",
            prescriber: { id: "d-1", name: "Dr. Jane" },
            prescriberName: "Dr. Jane",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            status: "Created",
            medicineCount: 0,
            medicines: [],
          },
          etag: "etag-1",
        },
        "",
        { id: "rx-1", patientId: "p-1" },
      ),
    );

    const store = configureStore({
      reducer: { prescriptions: reducer },
      preloadedState: { prescriptions: seeded },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    });

    await store.dispatch(cancelPrescription({ id: "rx-1", patientId: "p-1" }));

    expect(store.getState().prescriptions.items).toEqual([]);
    expect(store.getState().prescriptions.selected).toBeUndefined();
  });

  it("reviewPrescription stores the refreshed snapshot and next etag", async () => {
    reviewPrescriptionApiMock.mockResolvedValueOnce("etag-2");
    getPrescriptionByIdMock.mockResolvedValueOnce({
      data: {
        id: "rx-9",
        patientId: "p-9",
        patientName: "Jane",
        prescriber: { id: "d-9", name: "Dr. House" },
        createdAt: "2026-01-09T00:00:00.000Z",
        status: "Active",
        medicines: [],
      },
      etag: "etag-3",
    });

    const store = makeStore();
    await store.dispatch(
      reviewPrescription({
        id: "rx-9",
        patientId: "p-9",
        reviews: [{ prescriptionLineId: "line-1", status: "Approved", notes: null }],
        etag: "etag-1",
      }),
    );

    const state = store.getState().prescriptions;
    expect(state.selected?.prescription.id).toBe("rx-9");
    expect(state.selected?.etag).toBe("etag-2");
    expect(state.status).toBe("succeeded");
  });
});
