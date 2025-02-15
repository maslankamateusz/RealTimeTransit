import React, { useState } from 'react';
import useStopDetails from '../hooks/useStopList';

interface Stop {
  stop_id: string;
  stop_name: string;
}

interface StopsListProps {
  lineNumber: string | undefined;
}

const StopsList: React.FC<StopsListProps> = ({ lineNumber }) => {
  const [selectedDirection, setSelectedDirection] = useState<number>(0);

  const { stopDetails, loading: stopsLoading, error: stopsError } = useStopDetails(lineNumber!);

  if (stopsLoading) return <div>Ładowanie przystanków...</div>;
  if (stopsError) return <div>Błąd ładowania przystanków: {stopsError}</div>;

  const directionData = stopDetails ? stopDetails[selectedDirection] : null;
  const direction1 = Object(stopDetails)[0][0]
  const direction2 = Object(stopDetails)[1][0]
  const stops = Object(directionData)[1]
  return (
    <section className="mb-8">
    
      <div className="mb-4">
      <h2 className="text-2xl font-semibold mb-4">Kierunek</h2>
      <button
        onClick={() => setSelectedDirection(0)} 
        className={`px-4 py-2 ${selectedDirection === 0 ? 'bg-gray-800 text-white' : 'bg-gray-300'}`}
      >
        {direction1.map((direction:string, index:number) => (
          <span key={direction}>
            <span className={index === 0 ? 'text-xl' : 'text-md '}>
              {direction}
            </span>
            {index < direction1.length - 1 && ', '}
          </span>
        ))}
      </button>

      <button
        onClick={() => setSelectedDirection(1)} 
        className={`px-4 py-2 ${selectedDirection === 1 ? 'bg-gray-800 text-white' : 'bg-gray-300'}`}
      >
        {direction2.map((direction:string, index:number) => (
          <span key={direction}>
            <span className={index === 0 ? 'text-xl' : 'text-sm'}>
              {direction}
            </span>
            {index < direction2.length - 1 && ', '}
          </span>
        ))}
      </button>

      </div>
      <h2 className="text-2xl font-semibold mb-4">Przystanki</h2>
      {
        <>
          <ul className="list-disc list-inside space-y-1">
            {stops.map((stop: Stop) => (
              <li key={stop.stop_id}>
                <a href={`/stop/${stop.stop_name}`} target='_blank' className="text-blue-600 hover:underline">{stop.stop_name}</a>
              </li>
            ))}
          </ul>
        </>
      }
    </section>
  );
};

export default StopsList;