import React, { useState } from 'react';
import useRealtimeData from '../hooks/useRealtimeData';
import useStopListWithLocationData from '../hooks/useStopListWithLocationData';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
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
      <div class="relative group" style="
        position: relative;
        width: ${iconSize}px;
        height: ${iconSize}px;
      ">
        <div class="absolute hidden group-hover:flex -top-10 left-1/2 transform -translate-x-1/2 flex-col items-center text-center">
          <div class="bg-white text-black p-3 rounded-lg shadow-lg border-2 border-gray-400 font-medium ">
            <span class="whitespace-nowrap text-xs"> ${vehicleId.slice(0,2)}<span class="text-base ps-[1px]">${vehicleId.slice(2)} </span> </span>
          </div>
          <div class="w-2 h-2 bg-black rotate-45 -mt-1"></div>
        </div>

        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(${direction}deg);
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${iconSize}px;
          height: ${iconSize}px;
          opacity: .9;
        ">
          <div style="
            background-color: #007bff;
            color: white;
            font-weight: bold;
            font-size: ${iconSize * 0.26}px;
            width: ${iconSize * 0.6}px;
            height: ${iconSize * 0.6}px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            z-index: 2;
            transform: rotate(${-direction}deg);
            border: 2px solid #0056b3;
          ">
            ${line}
          </div>
          <div style="
            position: absolute;
            top: 50%;
            left: calc(100% - 3px);
            transform: translate(-50%, -50%);
            width: 0;
            height: 0;
            border-top: ${iconSize * 0.14}px solid transparent;
            border-bottom: ${iconSize * 0.14}px solid transparent;
            border-left: ${iconSize * 0.24}px solid #007bff;
            z-index: 1;
          "></div>
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
      <div class="relative group" style="
        position: relative;
        width: ${iconSize}px;
        height: ${iconSize}px;
      ">
        <div class="absolute hidden group-hover:flex -top-10 left-1/2 transform -translate-x-1/2 flex-col items-center text-center">
          <div class="bg-white text-black p-3 rounded-lg shadow-lg border-2 border-gray-400 font-medium ">
            <span class="whitespace-nowrap text-xs"> ${vehicleId.slice(0,2)}<span class="text-base ps-[1px]">${vehicleId.slice(2)} </span> </span>
          </div>
          <div class="w-2 h-2 bg-black rotate-45 -mt-1"></div>
        </div>

        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(${direction}deg);
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${iconSize}px;
          height: ${iconSize}px;
          opacity: .85;
        ">
          <div style="
            background-color: #ff0000;
            color: white;
            font-weight: bold;
            font-size: ${iconSize * 0.26}px;
            width: ${iconSize * 0.6}px;
            height: ${iconSize * 0.6}px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            transform: rotate(${-direction}deg);
            border: 2px solid #cc0000; 
          ">
            ${line}
          </div>
          <div style="
            position: absolute;
            top: 50%;
            left: calc(100% - 3px);
            transform: translate(-50%, -50%);
            width: 0;
            height: 0;
            border-top: ${iconSize * 0.14}px solid transparent;
            border-bottom: ${iconSize * 0.14}px solid transparent;
            border-left: ${iconSize * 0.24}px solid #ff0000;
            z-index: 1;
          "></div>
        </div>
      </div>
    `,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
  });
};

const DynamicZoomHandler = ({ setZoom }: { setZoom: React.Dispatch<React.SetStateAction<number>> }) => {
  const map = useMap();

  React.useEffect(() => {
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
  const { realtimeData, loading, error } = useRealtimeData();
  const { stopData, loading: stopLoading, error: stopError } = useStopListWithLocationData();

  if (loading || stopLoading) return <div>Loading...</div>;
  if (error || stopError) return <div>Error loading data</div>;

  const iconSize = zoom > 13 ? 50 : 40;

  return (
    <div style={{ height: '92vh' }}>
      <style>{styles}</style>

      <MapContainer center={position} zoom={15} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <DynamicZoomHandler setZoom={setZoom} />

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
          >
            <Popup>
              Linia:
              <a
                href={`/lines/${vehicle.route_short_name}`}
                className="text-blue-500 font-bold no-underline hover:text-black visited:text-blue-500 focus:text-blue-500"
              >
                {vehicle.route_short_name}
              </a>
              <br />
              Kierunek:
              <a
                className="text-blue-500 font-bold no-underline hover:text-black visited:text-blue-500 focus:text-blue-500"
                href={`/stops/${vehicle.trip_headsign}`}
              >
                {vehicle.trip_headsign}
              </a>
              <br />
              Numer taborowy:
              <a
                className="text-blue-500 font-bold no-underline hover:text-black visited:text-blue-500 focus:text-blue-500"
                href={`/vehicle/${vehicle.vehicle_id}`}
              >
                <span className="text-xs">{vehicle.vehicle_id.slice(0, 2)}</span>
                {vehicle.vehicle_id.slice(2)}
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPage;

