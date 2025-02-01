import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

interface VehicleHistoryEntry {
  date: string;
  schedule_number: string[];
  vehicle_id: string;
  route_short_names: number[][];
}

const useRouteHistory = (route_name: string, startDate: string, endDate: string) => {
  const [routeHistory, setRouteHistory] = useState<VehicleHistoryEntry[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!route_name || !startDate || !endDate) {
      return;
    }

    const fetchRouteHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}/api/history/route?route_name=${route_name}&start_date=${startDate}&end_date=${endDate}`
        );

        if (!response.ok) {
          throw new Error("Błąd pobierania danych pojazdu");
        }

        const data: VehicleHistoryEntry[] = await response.json();
        setRouteHistory(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Nieznany błąd");
      } finally {
        setLoading(false);
      }
    };

    fetchRouteHistory();
  }, [route_name, startDate, endDate]); 

  return { routeHistory, loading, error };
};

export default useRouteHistory;
