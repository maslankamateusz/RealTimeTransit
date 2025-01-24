import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import useLineDetails from '../hooks/useLineDetails';

type ServiceDetails = [string[], string];

const LineDetails: React.FC = () => {
  const { lineNumber } = useParams<{ lineNumber: string }>();
  const location = useLocation();
  const lineValue = location.state?.lineValue;

  if (!lineNumber || !lineValue) {
    return <div>Error: No line number provided</div>;
  }

  const [selectedService, setSelectedService] = useState<string | null>(null);
  
  const { lineDetails, serviceDetails, loading, error } = useLineDetails(lineNumber, lineValue, selectedService) as {
    lineDetails: any; 
    serviceDetails: ServiceDetails[];
    loading: boolean;
    error: string | null;
  };

  useEffect(() => {
    if (lineDetails && lineDetails.length > 0) {
      setSelectedService(lineDetails[0]['service_id']); 
    }
  }, [lineDetails]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const dayTranslations: { [key: string]: string } = {
    monday: "poniedziałek",
    tuesday: "wtorek",
    wednesday: "środa",
    thursday: "czwartek",
    friday: "piątek",
    saturday: "sobota",
    sunday: "niedziela",
  };

  const handleDayChange = (service: string) => {
    setSelectedService(service);
  }

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
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Rozkład jazdy</h2>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-blue-600 hover:underline">
                    → Direction 0
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-600 hover:underline">
                    → Direction 1
                  </a>
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Brygady</h2>
              <div className="mb-6">
                <form className="space-y-2">
                  {serviceDetails.map(([days, service], index) => {
                    const dayLabel = days.map((day) => dayTranslations[day]).join(", ");
                    const id = service;

                    return (
                      <div key={index}>
                        <input
                          type="radio"
                          id={id}
                          name="day"
                          className="mr-2"
                          value={service}
                          checked={selectedService === service} 
                          onChange={() => handleDayChange(service)} 
                        />
                        <label htmlFor={id}>{dayLabel}</label>
                      </div>
                    );
                  })}
                </form>
              </div>

              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-center">Od</th>
                    <th className="border border-gray-300 p-2 text-center">Do</th>
                    <th className="border border-gray-300 p-2 text-center">Linie</th>
                    <th className="border border-gray-300 p-2 text-center">Pojazd</th>
                    <th className="border border-gray-300 p-2 text-center">Brygada</th>
                  </tr>
                </thead>
                <tbody>
                {lineDetails.map((block: { block_id: string, start_time: string, end_time: string, schedule_number: string , route_short_names: string[]}) => {
                const startTimeWithoutSeconds: string = block.start_time.substring(0, 5);
                const endTimeWithoutSeconds: string = block.end_time.substring(0, 5);
                const lines = block.route_short_names;
                
                return (
                    <tr key={block.block_id}>
                        <td className="border border-gray-300 p-2 text-center">{startTimeWithoutSeconds}</td>
                        <td className="border border-gray-300 p-2 text-center">{endTimeWithoutSeconds}</td>
                        <td className="border border-gray-300 p-2 ">
                          <div className='flex justify-center'>
                            {lines.map((line) => {
                              const lineNumber = line;
                            
                              const isNightLine = (String(lineNumber).startsWith('6') || String(lineNumber).startsWith('9')) && String(lineNumber).length > 1;
                              const isSubstituteLine = String(lineNumber).startsWith('7') && String(lineNumber).length > 1;
                              
                              return(
                                <div className={`me-2 flex justify-center items-center text-center text-md font-semibold border transition-all
                                  ${isNightLine ? 'bg-black text-white border-black' : isSubstituteLine ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-black border-gray-900 hover:bg-gray-100'
                              }`}
                                  style={{
                                    width: '34px',
                                    height: '34px',
                                }}
                                key={`${block.block_id}-${block.schedule_number}-${lines.indexOf(line)}`}
                                >
                                  {lineNumber}
                                </div>
                              )
                            })}
                          </div>
                            
                        </td>
                        <td className="border border-gray-300 p-2 text-yellow-500 text-center" >⚠</td>
                        <td className="border border-gray-300 p-2 text-center">
                        <a href="#" className="text-blue-600 hover:underline">
                            {block.schedule_number}
                        </a>
                        </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </div>

          <aside>
            <h2 className="text-2xl font-semibold mb-4">Przystanki</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  Soboniowice
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  Drużbackiej
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  Krzemieniecka (nż)
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  Zajezdnia Wola Duchacka
                </a>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LineDetails;
