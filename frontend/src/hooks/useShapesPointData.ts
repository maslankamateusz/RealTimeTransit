import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const useShapesPointData = (tripId: string | null, type: string | null) => {
  interface ShapePoint {
    shape_pt_sequence: number;
    shape_pt_lat: number;
    shape_pt_lon: number;
  }

  const [shapesData, setShapesData] = useState<ShapePoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  
  useEffect(() => {
    if (!tripId || !type) {
      setShapesData(null);  
      setLoading(false);    
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/trip/shape?trip_id=${tripId}&vehicle_type=${type}`);
        const data = await response.json();

        setShapesData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tripId, type]);

  return { shapesData, loading, error };
};

export default useShapesPointData;
