//usePrescriptionDetails 
import { useCallback, useEffect, useState } from "react";
import { getPrescriptionById } from "@prescription/api";
import { mapDetailsDto } from "@prescription/domain/mapper";
import type { PrescriptionDetails } from "@prescription/domain/model";

type Result = {
  data: PrescriptionDetails | null;
  Etag: string;
  etag: string;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") {
    return err;
  }
  if (typeof err === "object" && err !== null) {
    const obj = err as { response?: { data?: { message?: string } }; message?: string };
    return obj.response?.data?.message || obj.message || "Failed to load prescription";
  }
  return "Failed to load prescription";
}

export function usePrescriptionDetails(rxId: string, patientId: string): Result {
  const [data, setData] = useState<PrescriptionDetails | null>(null);
  const [Etag, setEtag] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    if (!rxId || !patientId) {
      setLoading(false);
      setData(null);
      setEtag("");
      setError("Missing patient context.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getPrescriptionById(rxId, patientId);
      const responseEtag = response.Etag ?? response.etag ?? "";
      console.log("Prescription details Etag", responseEtag);
      setData(mapDetailsDto(response.data));
      setEtag(responseEtag);
    } catch (err) {
      setError(getErrorMessage(err));
      // Preserve last successful snapshot.
      // Do NOT wipe concurrency token on transient failures.
    } finally {
      setLoading(false);
    }
  }, [patientId, rxId]);

  useEffect(() => {
    let mounted = true;
    const execute = async () => {
      if (!mounted) {
        return;
      }
      await run();
    };

    void execute();

    return () => {
      mounted = false;
    };
  }, [run]);

  return { data, Etag, etag: Etag, loading, error, refetch: run };
}
