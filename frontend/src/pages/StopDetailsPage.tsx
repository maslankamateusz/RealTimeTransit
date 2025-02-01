import { useParams } from "react-router-dom";
import useStopDetails from "../hooks/useStopDetails";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
const StopDetails: React.FC = () => {
  const { stopName } = useParams<{ stopName: string }>();
  const { stopDetails, loading, error } = useStopDetails(stopName!);
  const [departures, setDepartures] = useState<any[]>([]);

  useEffect(() => {
    if (!stopDetails) return;

    const now = new Date();
    const parsedDepartures = stopDetails.map((route) => {
        const { route_short_name, trip_headsign, departure_time, stop_number, schedule_number, vehicle_id, delay } = route;
        const [hour, minute] = departure_time.split(":").map(Number);
        const departureTime = new Date(now); 
        departureTime.setHours(hour, minute, 0, 0);
      
        const diffMinutes = Math.round((departureTime.getTime() - now.getTime()) / 60000); 
        const isPastDeparture = diffMinutes < 0;
      
        const timeToDeparture = isPastDeparture 
          ? "Odjechał" 
          : (diffMinutes <= 0 ? ">>>" : `${diffMinutes} min`);
      
        let displayDelay = "-";
        if (delay !== null && diffMinutes <= 60) {
          displayDelay = `${delay} min`; 
        }
      
        return {
          timeToDeparture,
          line: route_short_name,
          direction: trip_headsign || "Kierunek nieznany",
          scheduledDeparture: departure_time,
          vehicle: vehicle_id || "-",  
          platform: stop_number.toString(),
          delay: displayDelay,
          scheduleNumber: schedule_number, 
          departureTime,
          isPastDeparture,
        };
      });
      

    const finalDepartures = parsedDepartures.map((departure, index, arr) => {
      const isFirstDeparture = arr.findIndex(d => d.scheduleNumber === departure.scheduleNumber) === index;
      return {
        ...departure,
        delay: isFirstDeparture ? departure.delay : "-", 
      };
    });

    setDepartures(finalDepartures);
  }, [stopDetails]);

  if (loading) return <Loader />;
  if (error) return <div>Error loading line details: {error}</div>;

  return (
    <div className="container m-auto px-8 md:px-32 p-4 mt-1 py-10">
      <h1 className="text-4xl font-semibold mb-4">{stopName}</h1>
      <div className="overflow-x-auto">
        <table className="w-3/4 border border-gray-300 text-sm text-gray-900">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="border px-4 py-2 text-left">Czas do odjazdu</th>
              <th className="border px-4 py-2 text-left">Linia</th>
              <th className="border px-4 py-2 text-left">Kierunek</th>
              <th className="border px-4 py-2 text-left">Odjazd</th>
              <th className="border px-4 py-2 text-left">Pojazd</th>
              <th className="border px-4 py-2 text-left">Peron</th>
              <th className="border px-4 py-2 text-left">Opóźnienie</th>
              <th className="border px-4 py-2 text-left">Numer Brygady</th>
            </tr>
          </thead>
          <tbody>
            {departures.length === 0 ? (
              <tr>
                <td colSpan={8} className="border px-4 py-2 text-center">
                  Brak nadchodzących odjazdów
                </td>
              </tr>
            ) : (
              departures.map((departure, index) => (
                <tr
                  key={index}
                  className={`border-b hover:bg-gray-50 ${departure.isPastDeparture ? "bg-gray-200" : ""}`}
                >
                  <td className="border px-4 py-2">{departure.timeToDeparture}</td>
                  <td className="border px-4 py-2 font-semibold">
                    <a href={`/lines/${departure.line}`}>{departure.line}</a>
                  </td>
                  <td className="border px-4 py-2">{departure.direction}</td>
                  <td className="border px-4 py-2">{departure.scheduledDeparture}</td>
                  <td className="border px-4 py-2">{departure.vehicle}</td>
                  <td className="border px-4 py-2 text-blue-600 font-medium">{departure.platform}</td>
                  <td className="border px-4 py-2">{departure.delay}</td>
                  <td className="border px-4 py-2">{departure.scheduleNumber}</td> 
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StopDetails;
