import { useCallback, useEffect, useState } from "react";
import { getPrescriptionById } from "@prescription/api";
import { mapDetailsDto } from "@prescription/domain/mapper";
import type { PrescriptionDetails } from "@prescription/domain/model";

type Result = {
  data: PrescriptionDetails | null;
  etag: string;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Failed to load prescription";
}

export function usePrescriptionDetails(
  rxId: string,
  patientId: string,
): Result {
  const [data, setData] = useState<PrescriptionDetails | null>(null);
  const [etag, setEtag] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!rxId || !patientId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getPrescriptionById(rxId, patientId);
      setData(mapDetailsDto(response.data));
      setEtag(response.etag ?? "");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [patientId, rxId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    etag,
    loading,
    error,
    refetch: load,
  };
}
