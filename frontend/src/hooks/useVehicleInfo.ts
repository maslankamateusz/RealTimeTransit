import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

interface StopData {
  stop_id: string;
  time: string;
  stop_name: string;
}

interface Trip {
  trip_id: string;
  trip_number: string;
  route_name: string;
  stop_data: StopData[]; 
}

interface VehicleInfo {
  schedule_number: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  trip_id: string;
  stop_id: string;
  delay: number;
  bus_brand: string;
  depot: string;
  trips: Trip[];
}

const useVehicleInfo = (vehicleId: string) => {
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicleInfo = async () => {
      try {
        const response = await fetch(`${API_URL}/api/vehicle/?vehicle_id=${vehicleId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data: VehicleInfo = await response.json();
        console.log(data);
        
        setVehicleInfo(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleInfo();
    const intervalId = setInterval(() => {
        fetchVehicleInfo();
      }, 20000);
  
      return () => clearInterval(intervalId);
    }, []); 
  

  return { vehicleInfo, loading, error };
};

export default useVehicleInfo;
