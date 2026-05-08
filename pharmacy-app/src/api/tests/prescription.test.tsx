import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@core/api/apiClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

import api from "@core/api/apiClient";
import {
  cancelPrescription,
  createPrescription,
  getAllPrescriptions,
  getPendingPrescriptions,
  getPrescriptionById,
  getPrescriptionsByPatient,
  getValidatedPrescriptions,
  reviewPrescription,
} from "@prescription/api";

describe("prescription API", () => {
  const apiGet = api.get as unknown as ReturnType<typeof vi.fn>;
  const apiPost = api.post as unknown as ReturnType<typeof vi.fn>;
  const apiPut = api.put as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("createPrescription returns wrapped details with normalized etag", async () => {
    apiPost.mockResolvedValueOnce({
      data: { id: "rx-1" },
      headers: { etag: '"etag-1"' },
    });

    const result = await createPrescription({
      patientId: "p-1",
      patientName: "John Doe",
      prescriber: { id: "d-1", name: "Dr. Jane" },
      medicines: [],
    });

    expect(apiPost).toHaveBeenCalledWith("/api/prescriptions", {
      patientId: "p-1",
      patientName: "John Doe",
      prescriber: { id: "d-1", name: "Dr. Jane" },
      medicines: [],
    });
    expect(result).toEqual({
      data: { id: "rx-1" },
      etag: "etag-1",
    });
  });

  it("getPrescriptionById requests the details endpoint with patientId", async () => {
    apiGet.mockResolvedValueOnce({
      data: { id: "rx-2" },
      headers: { ETag: '"etag-2"' },
    });

    const result = await getPrescriptionById("rx-2", "p-9");

    expect(apiGet).toHaveBeenCalledWith("/api/prescriptions/rx-2", {
      params: { patientId: "p-9" },
    });
    expect(result).toEqual({
      data: { id: "rx-2" },
      etag: "etag-2",
    });
  });

  it("getPrescriptionsByPatient normalizes array payloads into a page response", async () => {
    apiGet.mockResolvedValueOnce({
      data: [
        {
          id: "rx-1",
          patientId: "p-1",
          patientName: "John",
          prescriber: { id: "d-1", name: "Dr. A" },
          createdAt: "2026-02-10",
          status: "Created",
          medicines: [],
        },
      ],
    });

    const result = await getPrescriptionsByPatient(" p-1 ", {
      pageNumber: 2,
      pageSize: 5,
    });

    expect(apiGet).toHaveBeenCalledWith("/api/prescriptions/patient/p-1", {
      params: { pageNumber: 2, pageSize: 5 },
    });
    expect(result).toEqual({
      items: [
        {
          id: "rx-1",
          patientId: "p-1",
          patientName: "John",
          prescriberName: "Dr. A",
          createdAt: "2026-02-10",
          status: "Created",
          medicineCount: 0,
        },
      ],
      pageNumber: 2,
      pageSize: 5,
      totalCount: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it("getAllPrescriptions builds params from query", async () => {
    apiGet.mockResolvedValueOnce({
      data: {
        items: [],
        pageNumber: 2,
        pageSize: 10,
        totalCount: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });

    await getAllPrescriptions({
      prescriptionId: " RX-1 ",
      patientName: " John ",
      prescriberName: " Dr. A ",
      createdAt: " 2026-02-10 ",
      status: "Created",
      pageNumber: 2,
      pageSize: 10,
      sortBy: " createdAt ",
      sortDirection: "desc",
    });

    expect(apiGet).toHaveBeenCalledWith("/api/prescriptions", {
      params: {
        pageNumber: 2,
        pageSize: 10,
        prescriptionId: "RX-1",
        patientName: "John",
        prescriberName: "Dr. A",
        createdAt: "2026-02-10",
        status: "Created",
        sortBy: "createdAt",
        sortDirection: "desc",
      },
    });
  });

  it("getAllPrescriptions returns the backend page as-is", async () => {
    const payload = {
      items: [{ id: "rx-1" }],
      pageNumber: 2,
      pageSize: 10,
      totalCount: 3,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    };
    apiGet.mockResolvedValueOnce({ data: payload });

    const result = await getAllPrescriptions({ pageNumber: 2, pageSize: 10 });

    expect(result).toEqual(payload);
  });

  it("reviewPrescription sends a single review request with If-Match", async () => {
    apiPut.mockResolvedValueOnce({
      headers: { etag: "etag-next" },
    });

    const result = await reviewPrescription(
      "rx-1",
      "p-1",
      {
        reviews: [
          { prescriptionLineId: "line-1", status: "Approved", notes: null },
          { prescriptionLineId: "line-2", status: "Rejected", notes: "Dose too high" },
        ],
      },
      "etag-1",
    );

    expect(apiPut).toHaveBeenCalledWith(
      "/api/prescriptions/rx-1/review",
      {
        reviews: [
          { prescriptionLineId: "line-1", status: "Approved", notes: null },
          { prescriptionLineId: "line-2", status: "Rejected", notes: "Dose too high" },
        ],
      },
      {
        params: { patientId: "p-1" },
        headers: { "If-Match": "etag-1" },
      },
    );
    expect(result).toBe("etag-next");
  });

  it("cancelPrescription posts to the cancel endpoint", async () => {
    apiPost.mockResolvedValueOnce({
      headers: { etag: '"etag-2"' },
    });

    const result = await cancelPrescription("rx-1", "Duplicate", "etag-1");

    expect(apiPost).toHaveBeenCalledWith(
      "/api/prescriptions/rx-1/cancel",
      { reason: "Duplicate" },
      { headers: { "If-Match": "etag-1" } },
    );
    expect(result).toBe("etag-2");
  });

  it("getPendingPrescriptions delegates to Created query and returns items", async () => {
    apiGet.mockResolvedValueOnce({
      data: {
        items: [{ id: "rx-pending" }],
        pageNumber: 1,
        pageSize: 20,
        totalCount: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    const result = await getPendingPrescriptions();

    expect(apiGet).toHaveBeenCalledWith("/api/prescriptions", {
      params: { pageNumber: 1, pageSize: 20, status: "Created" },
    });
    expect(result).toEqual([{ id: "rx-pending" }]);
  });

  it("getValidatedPrescriptions requests the Active queue", async () => {
    apiGet.mockResolvedValueOnce({
      data: { items: [] },
    });

    await getValidatedPrescriptions(50, 3);

    expect(apiGet).toHaveBeenCalledWith("/api/prescriptions", {
      params: {
        status: "Active",
        pageSize: 50,
        pageNumber: 3,
      },
    });
  });
});
