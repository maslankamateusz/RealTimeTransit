import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import useLineDetails from '../hooks/useLineDetails';
// import useStopDetails from '../hooks/useStopDetails';
import ServiceSelection from '../components/ServiceSelection';
import BlockTable from '../components/BlockTable';
import StopsList from '../components/StopsList';

const LineDetails: React.FC = () => {
  const { lineNumber } = useParams<{ lineNumber: string }>();
  const location = useLocation();
  const lineValue = location.state?.lineValue;

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const { lineDetails, serviceDetails, loading, error } = useLineDetails(lineNumber!, lineValue!, selectedService);

  // const { stopDetails, loading: stopsLoading, error: stopsError } = useStopDetails(lineNumber!);
  
  useEffect(() => {
    if (lineDetails && lineDetails.length > 0) {
      setSelectedService(lineDetails[0]['service_id']);
    }
  }, [lineDetails]);

  if (loading) return <div>Loading line details...</div>;
  if (error) return <div>Error loading line details: {error}</div>;



  return (
    <div className="text-gray-800 min-h-screen py-8">
      <div className="container mx-auto px-32">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Linia {lineNumber}</h1>
          <p className="text-lg">
            Linia obsługiwana przez <span className="font-semibold">MPK S.A. w Krakowie</span>
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <ServiceSelection serviceDetails={serviceDetails} selectedService={selectedService} setSelectedService={setSelectedService} />
            <BlockTable lineDetails={lineDetails} />
          </div>

          <aside>
            <StopsList lineNumber={lineNumber} />
          </aside>

        </div>
      </div>
    </div>
  );
};

export default LineDetails;
