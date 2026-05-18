import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

import {
  clearPrescriptions,
  clearSelected,
  fetchAllPrescriptions,
  prescriptionReducer,
  reviewPrescription,
} from "@prescription/slices";

const reducer = prescriptionReducer;

describe("prescriptionSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with the current state shape", () => {
    expect(reducer(undefined, { type: "unknown" })).toEqual({
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
        undefined
      )
    );

    expect(reducer(state, clearPrescriptions())).toEqual({
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

  it("clearSelected removes selected prescription without changing list state", () => {
    const state = {
      items: [],
      selected: {
        prescription: { id: "rx-1" },
        etag: "etag-1",
      },
      pageNumber: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 1,
      status: "idle",
      error: undefined,
    } as unknown as ReturnType<typeof reducer>;

    const next = reducer(state, clearSelected());

    expect(next.selected).toBeUndefined();
    expect(next.items).toEqual([]);
  });

  it("fetches a fresh ETag before review when the submit path has no ETag", async () => {
    const detailsDto = {
      id: "rx-1",
      patientId: "p-1",
      patientName: "John Doe",
      prescriber: { id: "d-1", name: "Dr. Smith" },
      prescriberName: "Dr. Smith",
      createdAt: "2026-03-10T10:00:00Z",
      status: "Created",
      medicines: [],
      medicineCount: 0,
    };

    getPrescriptionByIdMock
      .mockResolvedValueOnce({ data: detailsDto, etag: "etag-fresh" })
      .mockResolvedValueOnce({ data: detailsDto, etag: "etag-after" });
    reviewPrescriptionApiMock.mockResolvedValueOnce("etag-after");

    const store = configureStore({
      reducer: { prescriptions: prescriptionReducer },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    });

    const action = await store.dispatch(
      reviewPrescription({
        id: "rx-1",
        patientId: "p-1",
        reviews: [],
        etag: "",
      }),
    );

    expect(reviewPrescription.fulfilled.match(action)).toBe(true);
    expect(getPrescriptionByIdMock).toHaveBeenNthCalledWith(1, "rx-1", "p-1");
    expect(reviewPrescriptionApiMock).toHaveBeenCalledWith(
      "rx-1",
      "p-1",
      { reviews: [] },
      "etag-fresh",
    );
  });
});
