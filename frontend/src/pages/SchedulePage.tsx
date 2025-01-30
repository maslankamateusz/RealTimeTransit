import { useParams } from "react-router-dom";
import { useState } from "react";
import useScheduleDetails from "../hooks/useScheduleDetails";
import useStopListForTrip from "../hooks/useStopListForTrip";

const SchedulePage: React.FC = () => {
  const { serviceId, scheduleNumber } = useParams<{ serviceId: string; scheduleNumber: string }>();
  const { scheduleDetails, loading, error } = useScheduleDetails(serviceId!, scheduleNumber!);

  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(null);

  const formatTime = (time: string) => time.slice(0, 5);

  const handleToggleTrip = (tripId: string, routeShortName: string) => {
    if (expandedTrip === tripId) {
      setExpandedTrip(null);
      setSelectedVehicleType(null);
    } else {
      const vehicleType = routeShortName.length === 3 ? "bus" : "tram";
      setExpandedTrip(tripId);
      setSelectedVehicleType(vehicleType);
    }
  };

  const { stopListForTrip, loading: stopsLoading, error: stopsError } = useStopListForTrip(expandedTrip, selectedVehicleType);

  if (loading) return <div className="text-center text-lg">Ładowanie danych...</div>;
  if (error) return <div className="text-center text-red-500">Błąd ładowania danych: {error}</div>;

  return (
    <div className="container mx-auto px-6 md:px-32 py-10">
      <h1 className="text-4xl font-semibold mb-6 text-center">
        Brygada {scheduleNumber} ({serviceId})
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse shadow-lg">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="border px-4 py-3">Nr</th>
              <th className="border px-4 py-3">Przerwa</th>
              <th className="border px-4 py-3">Odjazd</th>
              <th className="border px-4 py-3">Przyjazd</th>
              <th className="border px-4 py-3">Czas jazdy</th>
              <th className="border px-4 py-3">Przystanek początkowy</th>
              <th className="border px-4 py-3">Linia</th>
              <th className="border px-4 py-3">Kierunek</th>
              <th className="border px-4 py-3">Kurs</th>
            </tr>
          </thead>
          <tbody>
            {scheduleDetails &&
              scheduleDetails.map((trip: any, index: number) => {
                const prevTrip = scheduleDetails[index - 1];
                const tripDuration =
                  new Date(`1970-01-01T${trip.last_stop_time}`).getTime() -
                  new Date(`1970-01-01T${trip.first_stop_time}`).getTime();
                const breakTime =
                  index > 0
                    ? +new Date(`1970-01-01T${trip.first_stop_time}`) - +new Date(`1970-01-01T${prevTrip.last_stop_time}`)
                    : 0;
                const parts = trip.trip_id.split("_");
                const formattedTripId = `${parts[1]}/${parts[3]}/${parts[5]}`;
                    

                return (
                  <>
                    <tr key={trip.trip_id} className="even:bg-gray-100 hover:bg-gray-200 transition">
                      <td className="border px-4 py-2 text-center">{index + 1}</td>
                      <td className="border px-4 py-2 text-center">{index > 0 ? Math.floor(breakTime / 60000) + "’" : "-"}</td>
                      <td className="border px-4 py-2 text-center">{formatTime(trip.first_stop_time)}</td>
                      <td className="border px-4 py-2 text-center">{formatTime(trip.last_stop_time)}</td>
                      <td className="border px-4 py-2 text-center">{Math.floor(tripDuration / 60000)}’</td>
                      <td className="border px-4 py-2 text-center">{trip.trip_headsign}</td>
                      <td className="border px-4 py-2 text-center">{trip.route_short_name}</td>
                      <td className="border px-4 py-2 text-center">{trip.trip_headsign}</td>
                      <td className="border px-4 py-2 text-center">
                        <button
                          onClick={() => handleToggleTrip(trip.trip_id, trip.route_short_name)}
                          className="text-gray-800 font-medium hover:text-gray-900 hover:underline transition"
                        >
                          Rozkład kursu
                        </button>
                      </td>
                    </tr>

                    {expandedTrip === trip.trip_id && (
                      <tr>
                        <td colSpan={9} className="border px-4 py-4 bg-gray-50">
                          <div className="p-4 border rounded-md shadow-md bg-white">
                            <h3 className="text-lg font-semibold mb-2 text-center">Rozkład dla kursu {formattedTripId}</h3>

                            {stopsLoading ? (
                              <p className="text-gray-600">Ładowanie przystanków...</p>
                            ) : stopsError ? (
                              <p className="text-red-500">Błąd ładowania przystanków</p>
                            ) : stopListForTrip && stopListForTrip.length > 0 ? (
                              <table className="w-1/2 mx-auto border-collapse shadow-md">
                                <thead className="bg-gray-700 text-white">
                                  <tr>
                                    <th className="px-4 py-2 text-left">Odjazd</th>
                                    <th className="px-4 py-2 text-left">Przystanek</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {stopListForTrip.map((stop, i) => (
                                    <tr key={i} className={`border-b ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                                      <td className="px-4 py-2 text-gray-900">{formatTime(stop.time)}</td>
                                      <td className="px-4 py-2 text-gray-800">{stop.stopName}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-gray-500">Brak dostępnych przystanków</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchedulePage;
