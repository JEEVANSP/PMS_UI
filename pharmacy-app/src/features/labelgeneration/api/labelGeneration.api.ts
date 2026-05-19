import api from "@core/api/apiClient";
import { ENDPOINTS } from "@core/api/endpoints";
import { extractApiError } from "@core/errors/httpError";
import { logger } from "@core/logger/logger";

import type {
  DispenseLabelDto,
  DispenseSummaryPagedDto,
} from "./labelGeneration.dto";

const PAID_DISPENSE_STATUS = "Paid";
const LABEL_QUEUE_PAGE_NUMBER = 1;
const LABEL_QUEUE_PAGE_SIZE = 100;

export async function getPaidDispenseQueue() {
  try {
    const response = await api.get<DispenseSummaryPagedDto>(ENDPOINTS.dispenses, {
      params: {
        status: PAID_DISPENSE_STATUS,
        pageNumber: LABEL_QUEUE_PAGE_NUMBER,
        pageSize: LABEL_QUEUE_PAGE_SIZE,
      },
    });

    return response.data;
  } catch (error) {
    logger.error("getPaidDispenseQueue failed", { error });

    throw new Error(
      extractApiError(error) || "Failed to load dispense queue"
    );
  }
}

export async function getDispenseLabel(
  dispenseId: string,
  patientId: string
) {
  try {
    const response = await api.get<DispenseLabelDto>(
      ENDPOINTS.dispenseLabel(dispenseId),
      {
        params: {
          patientId,
        },
      }
    );

    return response.data;
  } catch (error) {
    logger.error("getDispenseLabel failed", {
      dispenseId,
      patientId,
      error,
    });

    throw new Error(extractApiError(error) || "Failed to load label");
  }
}
