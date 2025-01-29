import { useEffect, useState } from 'react';

interface StopSchedule {
  stopId: string;      
  stopName: string;    
  time: string;        
}

const useStopListForTrip = (tripId: string | null, type: string | null) => {
    const [stopListForTrip, setStopListForTrip] = useState<StopSchedule[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
  
    useEffect(() => {
      console.log("Próba fetgch");
  
      if (!tripId || !type) {
        setStopListForTrip(null);
        setLoading(false);
        return;
      }
  
      const fetchData = async () => {
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/trip/stops/delay?trip_id=${tripId}&vehicle_type=${type}`);
          const data = await response.json();
  
          const mappedData: StopSchedule[] = data.map((stop: any) => ({
            stopId: stop[0],
            stopName: stop[1],
            time: stop[2],
          }));
  
          setStopListForTrip(mappedData);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [tripId, type]);
  
    return { stopListForTrip, loading, error };
  };
export default useStopListForTrip;
