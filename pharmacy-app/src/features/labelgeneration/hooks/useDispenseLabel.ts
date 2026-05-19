import { useEffect, useState } from "react";

import { getDispenseLabel } from "../api";
import { mapDispenseLabel } from "../domain";

import type { DispenseLabel } from "../domain";

export function useDispenseLabel(
  dispenseId: string | null,
  patientId: string | null
) {
  const [label, setLabel] = useState<DispenseLabel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dispenseId || !patientId) {
      setLabel(null);
      setError(null);
      setLoading(false);
      return;
    }

    const currentDispenseId = dispenseId;
    const currentPatientId = patientId;
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        setLabel(null);

        const dto = await getDispenseLabel(currentDispenseId, currentPatientId);

        if (!mounted) return;

        setLabel(mapDispenseLabel(dto));
      } catch (error) {
        if (!mounted) return;

        setError(
          error instanceof Error ? error.message : "Failed to load label"
        );
        setLabel(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [dispenseId, patientId]);

  return {
    label,
    loading,
    error,
  };
}
