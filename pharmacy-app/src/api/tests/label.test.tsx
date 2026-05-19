import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getDispenseLabel, getPaidDispenseQueue } from "@labels/api";

import api from "@core/api/apiClient";
import { ENDPOINTS } from "@core/api/endpoints";
import { logger } from "@core/logger/logger";

vi.mock("@core/api/apiClient", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("@core/api/endpoints", () => ({
  ENDPOINTS: {
    dispenses: "/api/dispenses",
    dispenseLabel: (id: string) => `/api/dispenses/${id}/label`,
  },
}));

vi.mock("@core/logger/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("label generation API", () => {
  const apiGet = api.get as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getPaidDispenseQueue", () => {
    it("calls dispenses endpoint with paid status and queue paging", async () => {
      const mockResponse = {
        data: {
          items: [
            {
              id: "disp-1",
              prescriptionId: "rx-1",
              patientId: "patient-1",
              patientName: "John Doe",
              dispenseDate: "2026-02-10T09:00:00.000Z",
              status: "Paid",
              itemCount: 2,
              grandTotal: 10,
            },
          ],
          pageSize: 100,
          totalCount: 1,
        },
      };
      apiGet.mockResolvedValueOnce(mockResponse);

      const result = await getPaidDispenseQueue();

      expect(apiGet).toHaveBeenCalledTimes(1);
      expect(apiGet).toHaveBeenCalledWith(ENDPOINTS.dispenses, {
        params: {
          status: "Paid",
          pageNumber: 1,
          pageSize: 100,
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("wraps queue API errors with shared error handling", async () => {
      const error = new Error("Queue fetch failed");
      apiGet.mockRejectedValueOnce(error);

      await expect(getPaidDispenseQueue()).rejects.toThrow(
        "Queue fetch failed"
      );
      expect(logger.error).toHaveBeenCalledWith("getPaidDispenseQueue failed", {
        error,
      });
    });
  });

  describe("getDispenseLabel", () => {
    it("calls dispense label endpoint with patientId", async () => {
      const dispenseId = "disp-123";
      const patientId = "patient-123";
      const mockPayload = {
        dispenseId,
        prescriptionId: "rx-123",
        patientId,
        patientName: "John Doe",
        dispenseDate: "2026-03-11T15:36:46.220Z",
        status: "Paid",
        pharmacistId: "pharm-1",
        items: [
          {
            prescriptionLineId: "line-1",
            productId: "prod-1",
            productName: "Amoxicillin",
            frequency: "BID",
            instructions: "Take one capsule twice daily",
            refillNumber: 0,
            quantityDispensed: 10,
            isManualAdjustment: false,
            lotsUsed: [],
            pricing: {
              unitPrice: 1,
              total: 10,
              insurancePaid: 5,
              patientPayable: 5,
            },
          },
        ],
      };

      apiGet.mockResolvedValueOnce({ data: mockPayload });

      const result = await getDispenseLabel(dispenseId, patientId);

      expect(apiGet).toHaveBeenCalledTimes(1);
      expect(apiGet).toHaveBeenCalledWith(ENDPOINTS.dispenseLabel(dispenseId), {
        params: { patientId },
      });
      expect(result).toEqual(mockPayload);
    });

    it("wraps label API errors with shared error handling", async () => {
      const error = new Error("Not Found");
      apiGet.mockRejectedValueOnce(error);

      await expect(
        getDispenseLabel("disp-err", "patient-err")
      ).rejects.toThrow("Not Found");
      expect(logger.error).toHaveBeenCalledWith("getDispenseLabel failed", {
        dispenseId: "disp-err",
        patientId: "patient-err",
        error,
      });
    });
  });
});
