import { useEffect, useState } from 'react';

interface Stop {
  stop_id: string;
  stop_name: string;
}

interface StopDetails {
  directionId: number;
  tripHeadsign: string[];
  stops: Stop[];
}

const useStopDetails = (routeName: string) => {
  const [stopDetails, setStopDetails] = useState<StopDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStopDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/stops?route_number=${routeName}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        setStopDetails(data)
    
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

    fetchStopDetails();
  }, [routeName]); 
  return { stopDetails, loading, error };
};

export default useStopDetails;
