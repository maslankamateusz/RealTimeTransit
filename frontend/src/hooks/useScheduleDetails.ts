import { useEffect, useState } from "react";

interface Trip {
  trip_id: string;
  trip_headsign: string;
  route_short_name: string,
  first_stop_time: string;
  last_stop_time: string;
}


const useScheduleDetails = (serviceId: string, scheduleNumber: string) => {
  const [scheduleDetails, setScheduleDetails] = useState<Trip[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicleInfo = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/routes/schedule?schedule_number=${encodeURIComponent(scheduleNumber)}&service_id=${serviceId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data: Trip[] = await response.json();

        setScheduleDetails(data);
        setLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An unknown error occurred");
        setLoading(false);
      }
    };

    fetchVehicleInfo();
    const intervalId = setInterval(fetchVehicleInfo, 20000);

    return () => clearInterval(intervalId);
  }, [serviceId, scheduleNumber]);

  return { scheduleDetails, loading, error };
};

export default useScheduleDetails;
