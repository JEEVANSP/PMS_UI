import { useEffect, useState } from "react";

import { getPaidDispenseQueue } from "../api";
import { mapQueueItem } from "../domain";

import type { LabelQueueItem } from "../domain";

export function usePaidDispenseQueue() {
  const [items, setItems] = useState<LabelQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await getPaidDispenseQueue();

        if (!mounted) return;

        setItems(response.items.map(mapQueueItem));
      } catch (error) {
        if (!mounted) return;

        setError(
          error instanceof Error ? error.message : "Failed to load queue"
        );
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
  }, []);

  return {
    items,
    loading,
    error,
  };
}
