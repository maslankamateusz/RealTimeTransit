import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

interface TimetableData {
  [hour: string]: number[];
}

const useTimetableData = (routeName: string, direction: string, stop_id: string, service_id: string) => {
  const [timetableData, setTimetableData] = useState<TimetableData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceData = async () => {
       
      try {
        const response = await fetch(
          `${API_URL}/api/routes/timetable?route_number=${routeName}&direction=${direction}&stop_id=${stop_id}&service_id=${service_id}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data: TimetableData = await response.json();
        setTimetableData(data);

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

    fetchServiceData();
  }, [routeName, direction, stop_id, service_id]); 

  return { timetableData, loading, error };
};

export default useTimetableData;
