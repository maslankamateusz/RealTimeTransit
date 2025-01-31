import React, { useState, useEffect } from 'react';
import useRealtimeData from '../hooks/useRealtimeData';
import useStopListWithLocationData from '../hooks/useStopListWithLocationData';
import useShapesPointData from '../hooks/useShapesPointData';
import useStopListForTrip from '../hooks/useStopListForTrip'; 
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const styles = `
  .leaflet-marker-icon {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }
`;

interface RealtimeVehicleData {
  vehicle_id: string;
  route_short_name: string;
  schedule_number: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  stop_id: string;
  trip_id: string;
  route_id: string;
  trip_headsign: string;
  shape_id: string;
  bearing: number;
  type: string;
}

interface StopsData {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  type: string;
}

const busIcon = (line: string, direction: number, vehicleId: string, iconSize: number) => {
  direction = direction - 90;
  return new L.DivIcon({
    className: 'leaflet-div-icon',
    html: `
      <div class="relative group" style="position: relative; width: ${iconSize}px; height: ${iconSize}px;">
        <div class="absolute hidden group-hover:flex -top-10 left-1/2 transform -translate-x-1/2 flex-col items-center text-center">
          <div class="bg-white text-black p-3 rounded-lg shadow-lg border-2 border-gray-400 font-medium ">
            <span class="whitespace-nowrap text-xs"> ${vehicleId.slice(0,2)}<span class="text-base ps-[1px]">${vehicleId.slice(2)} </span> </span>
          </div>
          <div class="w-2 h-2 bg-black rotate-45 -mt-1"></div>
        </div>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(${direction}deg); display: flex; align-items: center; justify-content: center; width: ${iconSize}px; height: ${iconSize}px; opacity: .9;">
          <div style="background-color: #007bff; color: white; font-weight: bold; font-size: ${iconSize * 0.26}px; width: ${iconSize * 0.6}px; height: ${iconSize * 0.6}px; display: flex; align-items: center; justify-content: center; border-radius: 50%; z-index: 2; transform: rotate(${-direction}deg); border: 2px solid #0056b3;">
            ${line}
          </div>
          <div style="position: absolute; top: 50%; left: calc(100% - 3px); transform: translate(-50%, -50%); width: 0; height: 0; border-top: ${iconSize * 0.14}px solid transparent; border-bottom: ${iconSize * 0.14}px solid transparent; border-left: ${iconSize * 0.24}px solid #007bff; z-index: 1;"></div>
        </div>
      </div>
    `,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
  });
};
const tramIcon = (line: string, direction: number, vehicleId: string, iconSize: number) => {
  direction = direction - 90;
  return new L.DivIcon({
    className: 'leaflet-div-icon',
    html: `
      <div class="relative group" style="position: relative; width: ${iconSize}px; height: ${iconSize}px;">
        <div class="absolute hidden group-hover:flex -top-10 left-1/2 transform -translate-x-1/2 flex-col items-center text-center">
          <div class="bg-white text-black p-3 rounded-lg shadow-lg border-2 border-gray-400 font-medium ">
            <span class="whitespace-nowrap text-xs"> ${vehicleId.slice(0,2)}<span class="text-base ps-[1px]">${vehicleId.slice(2)} </span> </span>
          </div>
          <div class="w-2 h-2 bg-black rotate-45 -mt-1"></div>
        </div>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(${direction}deg); display: flex; align-items: center; justify-content: center; width: ${iconSize}px; height: ${iconSize}px; opacity: .85;">
          <div style="background-color: #ff0000; color: white; font-weight: bold; font-size: ${iconSize * 0.26}px; width: ${iconSize * 0.6}px; height: ${iconSize * 0.6}px; display: flex; align-items: center; justify-content: center; z-index: 2; transform: rotate(${-direction}deg); border: 2px solid #cc0000;">
            ${line}
          </div>
          <div style="position: absolute; top: 50%; left: calc(100% - 3px); transform: translate(-50%, -50%); width: 0; height: 0; border-top: ${iconSize * 0.14}px solid transparent; border-bottom: ${iconSize * 0.14}px solid transparent; border-left: ${iconSize * 0.24}px solid #ff0000; z-index: 1;"></div>
        </div>
      </div>
    `,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
  });
};

const DynamicZoomHandler = ({ setZoom }: { setZoom: React.Dispatch<React.SetStateAction<number>> }) => {
  const map = useMap();

  useEffect(() => {
    const handleZoom = () => {
      setZoom(map.getZoom());
    };

    map.on('zoomend', handleZoom);
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map, setZoom]);

  return null;
};

const MapPage: React.FC = () => {
  const position: [number, number] = [50.061417, 19.937778];
  const [zoom, setZoom] = useState(15);
  const [selectedVehicle, setSelectedVehicle] = useState<{
    tripId: string | null;
    type: string | null;
    timestamp: number | null;
    stopId: string | null;
  }>({
    tripId: null,
    type: null,
    timestamp: null,
    stopId: null,
  });

  const { realtimeData, loading, error } = useRealtimeData() as { realtimeData: RealtimeVehicleData[], loading: boolean, error: any };
  const { stopData, loading: stopLoading, error: stopError } = useStopListWithLocationData();
  const { shapesData, loading: shapesLoading, error: shapesError } = useShapesPointData(selectedVehicle.tripId, selectedVehicle.type);

  const { stopListForTrip, loading: stopListLoading, error: stopListError } = useStopListForTrip(selectedVehicle.tripId, selectedVehicle.type); // Używamy hooka tutaj
  console.log(stopListForTrip);
  
  if (loading || stopLoading || shapesLoading || stopListLoading) console.log("Downloading data");
  if (error || stopError || shapesError || stopListError) console.warn("Error fetching data");

  const iconSize = zoom > 13 ? 50 : 40;

  const handleVehicleClick = (tripId: string, type: string, stopId: string, timestamp: number) => {
    if (tripId && type) {
      setSelectedVehicle({ tripId, type, stopId, timestamp });
    } else {
      console.warn('Brak trip_id, type lub stop_id');
    }
  };

  const handleMapClick = () => {
    setSelectedVehicle({ tripId: null, type: null, timestamp: null, stopId: null });
  };

  const routeCoordinates: [number, number][] = selectedVehicle.tripId
    ? shapesData
      ? shapesData.map((point) => [point.shape_pt_lat, point.shape_pt_lon] as [number, number])
      : []
    : [];

  const MapClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  useEffect(() => {
    if (selectedVehicle.tripId) {
      const vehicleData = realtimeData.find((vehicle: RealtimeVehicleData) => vehicle.trip_id === selectedVehicle.tripId);
      if (vehicleData) {
        setSelectedVehicle({
          tripId: vehicleData.trip_id,
          type: vehicleData.type,
          stopId: vehicleData.stop_id,
          timestamp: vehicleData.timestamp,
        });
      }
    }
  }, [realtimeData, selectedVehicle.tripId]);

  return (
    <div className="flex h-[92vh]">
      <style>{styles}</style>

      <div className="flex-grow">
        <MapContainer
          center={position}
          zoom={15}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <DynamicZoomHandler setZoom={setZoom} />
          <MapClickHandler />

          {stopData.map((stop: StopsData) => (
            <CircleMarker
              key={stop.stop_id}
              center={[stop.stop_lat, stop.stop_lon]}
              radius={2.5}
              pathOptions={{
                color: stop.type === 'bus' ? '#0056b3' : '#bb0000',
                fillColor: stop.type === 'bus' ? '#0056b3' : '#bb0000',
                fillOpacity: 1,
              }}
            >
              <Popup><a href={`stop/${stop.stop_id}`}>{stop.stop_name}</a></Popup>
            </CircleMarker>
          ))}

          {realtimeData.map((vehicle: RealtimeVehicleData) => (
            <Marker
              key={vehicle.vehicle_id}
              position={[vehicle.latitude, vehicle.longitude]}
              icon={ 
                vehicle.type === 'bus'
                  ? busIcon(vehicle.route_short_name, vehicle.bearing, vehicle.vehicle_id, iconSize)
                  : tramIcon(vehicle.route_short_name, vehicle.bearing, vehicle.vehicle_id, iconSize)
              }
              eventHandlers={{
                click: () => handleVehicleClick(vehicle.trip_id, vehicle.type, vehicle.stop_id, vehicle.timestamp),
              }}
            >
              <Popup>
                Linia:
                <a
                  href={`/lines/${vehicle.route_short_name}`}
                  className="text-blue-500 font-bold no-underline hover:text-black visited:text-blue-500 focus:text-blue-500"
                >
                  <span className='ms-1'>{vehicle.route_short_name}</span>
                </a>
                <br />
                Kierunek: 
                <a
                  className="text-blue-500 font-bold no-underline hover:text-black visited:text-blue-500 focus:text-blue-500"
                  href={`/stops/${vehicle.trip_headsign}`}
                >
                  <span className='ms-1'>{vehicle.trip_headsign}</span>
                </a>
                <br />
                Numer taborowy: 
                <a
                  className="text-blue-500 font-bold no-underline hover:text-black visited:text-blue-500 focus:text-blue-500"
                  href={`/vehicle/${vehicle.vehicle_id}`}
                >
                  <span className="ms-1 text-xs">{vehicle.vehicle_id.slice(0, 2)}</span>
                  {vehicle.vehicle_id.slice(2)}
                </a>
                <br />
                Brygada: 
                <a
                  className="text-blue-500 font-bold no-underline hover:text-black visited:text-blue-500 focus:text-blue-500"
                  href={`/lines/${vehicle.route_short_name}`}
                >
                  <span className="ms-1">{vehicle.schedule_number}</span>
                </a>
              </Popup>
            </Marker>
          ))}

          {routeCoordinates.length > 0 && (
            <Polyline positions={routeCoordinates} color="black" weight={3} />
          )}
        </MapContainer>
      </div>

          
      {selectedVehicle.tripId && (
        <div className="w-[25%] overflow-y-scroll border-l border-gray-300 p-5">
          <div className="space-y-2">
            {stopListForTrip && stopListForTrip.length > 0 && (
              <div className="mt-1">
                <h4 className="text-xl font-semibold">Przystanki dla wybranej trasy:</h4>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full border border-gray-300 shadow-md rounded-lg">
                    <thead className="bg-gray-200 text-gray-700">
                      <tr>
                        <th className="border border-gray-400 px-4 py-2 text-left">Odjazd</th>
                        <th className="border border-gray-400 px-4 py-2 text-left">Przystanek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const currentStopIndex = stopListForTrip.findIndex(
                          (stop) => stop.stopId === selectedVehicle.stopId
                        );

                        const stopTime = stopListForTrip.find(
                          (stop) => stop.stopId === selectedVehicle.stopId
                        )?.time;

                        if (stopTime) {
                          const stopDate = new Date();
                          const stopTimeParts = stopTime.split(":");
                          stopDate.setHours(parseInt(stopTimeParts[0]), parseInt(stopTimeParts[1]), parseInt(stopTimeParts[2]), 0);

                          const vehicleTimestampDate = selectedVehicle.timestamp
                            ? new Date(selectedVehicle.timestamp * 1000)
                            : new Date();
                          const delayInMillis = vehicleTimestampDate.getTime() - stopDate.getTime();
                          const delayInMinutes = Math.round(delayInMillis / (1000 * 60)); 

                          return stopListForTrip.map((stop, index) => {
                            return (
                              <tr
                                key={stop.stopId}
                                className={`border border-gray-300 ${
                                  index < currentStopIndex
                                    ? "bg-gray-50 text-gray-400"
                                    : index === currentStopIndex
                                    ? "bg-amber-100 font-medium"
                                    : index % 2 === 0
                                    ? "bg-white"
                                    : "bg-gray-50"
                                }`}
                              >
                                <td className="px-4 py-2 relative">
                                  {stop.time.slice(0, 5)}
                                  {currentStopIndex > 0 && index > 0 && index >= currentStopIndex && (
                                    <span className="absolute top-0 right-0 text-red-500 text-xs font-bold">
                                      {delayInMinutes !== 0 
                                        ? `${delayInMinutes > 0 ? "+" : ""}${delayInMinutes} min` 
                                        : "OK"}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2 hover:underline"><a href={`/stop/${stop.stopName}`}>{stop.stopName}</a></td>
                              </tr>
                            );
                          });
                        }
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
