import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { extractApiError } from "@core/errors/httpError";
import {
  cancelPrescription as cancelPrescriptionApi,
  createPrescription as createPrescriptionApi,
  getAllPrescriptions,
  getPrescriptionById,
} from "@prescription/api";
import { reviewPrescription as reviewPrescriptionApi } from "@validation/api";
import type {
  CreatePrescriptionRequestDto,
  PrescriptionHistoryQueryParams,
} from "@prescription/api";
import {
  mapDetailsDto,
  mapReviewToDto,
  mapSummaryDto,
} from "@prescription/domain/mapper";
import type {
  PrescriptionDetails,
  PrescriptionLineReviewDraft,
  PrescriptionSummary,
} from "@prescription/domain/model";

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

type SelectedPrescription = PrescriptionDetails;

export const createPrescription = createAsyncThunk<
  SelectedPrescription,
  CreatePrescriptionRequestDto,
  { rejectValue: string }
>("prescriptions/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await createPrescriptionApi(payload);
    return mapDetailsDto(res.data);
  } catch (error) {
    return rejectWithValue(extractApiError(error));
  }
});

export const fetchPrescriptionDetails = createAsyncThunk<
  SelectedPrescription,
  { id: string; patientId: string },
  { rejectValue: string }
>("prescriptions/details", async ({ id, patientId }, { rejectWithValue }) => {
  try {
    const res = await getPrescriptionById(id, patientId);
    return mapDetailsDto(res.data);
  } catch (error) {
    return rejectWithValue(extractApiError(error));
  }
});

export const fetchAllPrescriptions = createAsyncThunk<
  {
    items: PrescriptionSummary[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  },
  PrescriptionHistoryQueryParams | undefined,
  { rejectValue: string }
>("prescriptions/fetchAll", async (query, { rejectWithValue }) => {
  try {
    const response = await getAllPrescriptions(query ?? {});
    return {
      items: response.items.map(mapSummaryDto),
      pageNumber: response.pageNumber,
      pageSize: response.pageSize,
      totalCount: response.totalCount,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  } catch (error) {
    return rejectWithValue(extractApiError(error));
  }
});

export const cancelPrescription = createAsyncThunk<
  { id: string },
  { id: string; reason?: string; etag: string },
  { rejectValue: string }
>("prescriptions/cancel", async ({ id, reason, etag }, { rejectWithValue }) => {
  try {
    const effectiveEtag = etag.trim();
    if (!effectiveEtag) {
      throw new Error("Missing ETag");
    }

    await cancelPrescriptionApi(id, reason, effectiveEtag);
    return { id };
  } catch (error) {
    return rejectWithValue(extractApiError(error));
  }
});

export const reviewPrescription = createAsyncThunk<
  PrescriptionDetails,
  {
    id: string;
    patientId: string;
    reviews: PrescriptionLineReviewDraft[];
    etag: string;
  },
  { rejectValue: string }
>(
  "prescriptions/review",
  async ({ id, patientId, reviews, etag }, { rejectWithValue }) => {
    try {
      const payload = mapReviewToDto(reviews);
      console.log("Review thunk etag", etag);

      await reviewPrescriptionApi(
        id,
        patientId,
        payload,
        etag
      );

      const latest = await getPrescriptionById(id, patientId);

      return mapDetailsDto(latest.data);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export interface PrescriptionState {
  items: PrescriptionSummary[];
  selected?: PrescriptionDetails;
  continuationToken?: string | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  status: RequestStatus;
  error?: string;
}

const initialState: PrescriptionState = {
  items: [],
  selected: undefined,
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 1,
  status: "idle",
  error: undefined,
};

const slice = createSlice({
  name: "prescriptions",
  initialState,
  reducers: {
    clearPrescriptions: (state) => {
      state.items = [];
      state.pageNumber = 1;
      state.pageSize = 10;
      state.totalCount = 0;
      state.totalPages = 1;
      state.status = "idle";
      state.error = undefined;
    },
    clearSelected: (state) => {
      state.selected = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPrescription.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(createPrescription.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Unknown error";
      });

    builder
      .addCase(fetchPrescriptionDetails.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchPrescriptionDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchPrescriptionDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Unknown error";
      });

    builder
      .addCase(fetchAllPrescriptions.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchAllPrescriptions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllPrescriptions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Unknown error";
      });

    builder.addCase(cancelPrescription.fulfilled, (state, action) => {
      const id = action.payload.id;
      state.items = state.items.filter((item) => item.id !== id);

      if (state.selected?.id === id) {
        state.selected = undefined;
      }
    });

    builder
      .addCase(reviewPrescription.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(reviewPrescription.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(reviewPrescription.rejected, (state, action) => {
        state.status = "failed";

        state.error = action.payload ?? action.error.message ?? "Unknown error";
      });
  },
});

export const { clearPrescriptions, clearSelected } = slice.actions;
export default slice.reducer;
