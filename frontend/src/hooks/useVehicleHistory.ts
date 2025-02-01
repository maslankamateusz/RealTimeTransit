import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

interface VehicleHistoryEntry {
  date: string;
  schedule_number: string[];
  route_short_names: number[][];
}

const useVehicleHistory = (vehicleId: string, startDate: string, endDate: string) => {
  const [vehicleHistory, setVehicleHistory] = useState<VehicleHistoryEntry[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    
    if (!vehicleId || !startDate || !endDate) {
      return; 
    }

    const fetchVehicleHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}/api/history/vehicle?vehicle_id=${vehicleId}&start_date=${startDate}&end_date=${endDate}`
        );

        if (!response.ok) {
          throw new Error("Błąd pobierania danych pojazdu");
        }

        const data: VehicleHistoryEntry[] = await response.json();
        
        setVehicleHistory(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Nieznany błąd");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleHistory();
  }, [vehicleId, startDate, endDate]); 

  return { vehicleHistory, loading, error };
};

export default useVehicleHistory;
