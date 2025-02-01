import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

interface RouteDetails {
  route_short_name: string;  
  trip_headsign: string;    
  schedule_number: string;   
  departure_time: string;   
  stop_number: number;      
  vehicle_id: string;        
  delay: number;            
}

type StopDetails = RouteDetails[];

const useStopDetails = (stop_name: string) => {
  const [stopDetails, setStopDetails] = useState<StopDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stop_name) return;

    const fetchStopDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}/api/stop/details?stop_name=${encodeURIComponent(stop_name)}`
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch data`);
        }

        const data: RouteDetails[] = await response.json();
        setStopDetails(data);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStopDetails();
  }, [stop_name]);

  return { stopDetails, loading, error };
};

export default useStopDetails;
