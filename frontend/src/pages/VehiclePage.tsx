import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Button from "../components/Button";
import useVehicleInfo from "../hooks/useVehicleInfo";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import L from "leaflet";

type StopData = [string, string, string]; 

const busIcon = new L.DivIcon({
    className: "custom-bus-icon",
    html: `<div class="w-[25px] h-[25px] bg-blue-500 border-4 border-white rounded-full shadow-md flex items-center justify-center text-white font-bold"></div>`, 
    iconSize: [30, 30],
    iconAnchor: [15, 15], 
  });
  
const MapFocus = ({ position }: { position: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(position, 14, { animate: true });
    }, [position, map]);
    return null;
  };

const VehiclePage: React.FC = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams<Record<string, string | undefined>>();
  const { vehicleInfo, loading, error } = useVehicleInfo(vehicleId || "");

  const [currentTripIndex, setCurrentTripIndex] = useState<number>(-1);
  const [currentTripNumber, setCurrentTripNumber] = useState<string>("");

  useEffect(() => {
    if (vehicleInfo) {
      const initialIndex = vehicleInfo.trips.findIndex((t) => t.trip_id === vehicleInfo.trip_id);
      setCurrentTripIndex(initialIndex);
      
      if (initialIndex !== -1) {
        setCurrentTripNumber(vehicleInfo.trips[initialIndex].trip_number);
      }
    }
  }, [vehicleInfo]);

  if (loading) return <Loader />;
  if (error) return <div>Błąd: {error}</div>;
  if (!vehicleInfo || currentTripIndex === -1) return <div>Brak danych dla pojazdu {vehicleId}</div>;

  const currentTrip = vehicleInfo.trips[currentTripIndex];
  const currentStopIndex = currentTrip.stop_data.findIndex((stop: any) => stop[0] === vehicleInfo.stop_id);


    const calculateTimeToDeparture = (index: number): string => {
    if (index === currentStopIndex) return ">>>";

    let timeToDeparture = 0;

    if (index > currentStopIndex) {
        for (let i = currentStopIndex; i < index; i++) {
            const previousStop: StopData = currentTrip.stop_data[i] as unknown as StopData;
            const currentStop: StopData = currentTrip.stop_data[i + 1] as unknown as StopData;
            

        if (!previousStop || !currentStop) return "-";

        const prevDeparture = previousStop[1].slice(0, 5);
        const currDeparture = currentStop[1].slice(0, 5);

        const [prevHours, prevMinutes] = prevDeparture.split(":").map(Number);
        const [currHours, currMinutes] = currDeparture.split(":").map(Number);

        const timeDiff = (currHours * 60 + currMinutes) - (prevHours * 60 + prevMinutes);

        timeToDeparture += timeDiff;
        }

        return `${timeToDeparture} min`;
    }

    return "-";
    };


  const handleNextTrip = () => {
    if (currentTripIndex < vehicleInfo.trips.length - 1) {
      setCurrentTripIndex(currentTripIndex + 1);
    }
  };

  const handlePreviousTrip = () => {
    if (currentTripIndex > 0) {
      setCurrentTripIndex(currentTripIndex - 1);
    }
  };

  const handleCurrentTrip = () => {
    const initialIndex = vehicleInfo.trips.findIndex((t) => t.trip_id === vehicleInfo.trip_id);
    setCurrentTripIndex(initialIndex);
    setCurrentTripNumber(vehicleInfo.trips[initialIndex]?.trip_number || "");
  };
  
  return (
    <div className="container mx-auto px-8 md:px-32 py-10">
        <div className="flex w-2/3 justify-between">
            <div>
            <h1 className="text-4xl font-semibold mb-4">{vehicleId}</h1>
            <p className="text-lg mb-3 font-semibold text-gray-800">{vehicleInfo.bus_brand}</p>
            <p className="text-md text-gray-700">{vehicleInfo.depot}</p>
            <p className="text-md text-gray-600 mb-2">MPK S.A. w Krakowie</p>

            <Button onClick={() => window.open(`https://fotozajezdnia.pl/search.php?search_keywords=%23${vehicleId}`, "_blank")}>
                Zdjęcia na Fotozajezdnia.pl
            </Button>

            <div className="mt-6">
                <div className="flex items-center">
                    <h2 className="text-2xl font-semibold mr-2">GTFS Realtime</h2>
                    <span className="text-gray-700 flex items-center mt-1">
                        <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                        {Math.round(Date.now() / 1000 - vehicleInfo.timestamp)} sek temu
                    </span>
                    </div>
                    <p className="text-lg mt-2">
                    Brygada: <span className="font-semibold">{vehicleInfo.schedule_number}</span>
                    </p>
                    <p className="text-lg">
                        Aktualny przystanek: <span className="font-semibold">
                        {(currentTrip.stop_data[currentStopIndex] as unknown as StopData)?.[2] || "Brak danych"}
                        </span>
                    </p>
                    <p className="text-lg mt-3">
                        Rozkład linii:<span className="font-semibold"> {currentTrip.route_name}</span>
                    </p>

                </div> 
            </div>
           
            <div className=" w-1/3 ">
            <h3 className="text-2xl font-semibold mb-2">Lokalizacja pojazdu</h3>
                <div className="w-full h-80 border rounded-lg shadow-md">
                <MapContainer center={[vehicleInfo.latitude, vehicleInfo.longitude]} zoom={14} className="w-full h-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapFocus position={[vehicleInfo.latitude, vehicleInfo.longitude]} />
                    <Marker position={[vehicleInfo.latitude, vehicleInfo.longitude]} icon={busIcon}></Marker>
                </MapContainer>
                </div>
            </div>
        </div>
      

      <div className="mt-2 p-4 w-2/3 border rounded-lg shadow-md bg-white">
        <table className="w-full text-left border-collapse">
            
          <thead>
            <tr className="border-b">
              <th className="py-2 px-2">Odjazd</th>
              <th className="py-2 px-2">Przystanek </th>
              <th className="py-2 px-2">Czas do odjazdu</th>
            </tr>
          </thead>
          <tbody>
            {currentTrip.stop_data.map((stop: any, index: number) => {
              const isCurrentStop = index === currentStopIndex;
              const isUpcomingStop = index > currentStopIndex;
              const departureTime = stop[1].slice(0, 5);
              const timeToDeparture = currentTripNumber === currentTrip.trip_number ? calculateTimeToDeparture(index) : "-"; // Tylko dla aktualnego tripu

              return (
                <tr
                  key={index}
                  className={`${
                    currentTripNumber === currentTrip.trip_number 
                      ? isCurrentStop
                        ? "bg-blue-100"
                        : index < currentStopIndex
                        ? "bg-gray-200"
                        : "bg-white"
                      : "bg-white"
                  } hover:bg-blue-50 relative border-b`}
                >
                  <td className="py-2 px-2 relative">
                    {departureTime}
                    {currentTripNumber === currentTrip.trip_number && ( 
                      (isCurrentStop || isUpcomingStop) && (
                        <span className="absolute top-0 right-0 text-xs text-red-600">
                          {vehicleInfo.delay > 0 ? `+${vehicleInfo.delay} min` : "OK"}
                        </span>
                      )
                    )}
                  </td>
                  <td className="py-2 px-2">{stop[2]}</td>
                  <td className="py-2 px-2">{timeToDeparture}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 mt-4">
    
        <Button onClick={handlePreviousTrip} disabled={currentTripIndex === 0}>
          Poprzedni kurs
        </Button>
        <Button onClick={handleCurrentTrip}>Aktualny kurs</Button>
        <Button onClick={handleNextTrip} disabled={currentTripIndex === vehicleInfo.trips.length - 1}>
          Następny kurs
        </Button>
        <Button onClick={() => navigate(`/schedule/${encodeURIComponent(vehicleInfo.schedule_number)}`)}>Pokaż brygadę</Button>

      </div>
     
    </div>
  );
};

export default VehiclePage;