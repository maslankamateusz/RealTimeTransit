import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useStopDetails from '../hooks/useStopList';
import useServiceData from '../hooks/useServiceData';
import useTimetableData from '../hooks/useTimetableData';
import Button from '../components/Button';
import Loader from '../components/Loader';

interface Stop {
  stop_id: string;
  stop_name: string;
}

const dayTranslations: Record<string, string> = {
  monday: 'poniedziałek',
  tuesday: 'wtorek',
  wednesday: 'środa',
  thursday: 'czwartek',
  friday: 'piątek',
  saturday: 'sobota',
  sunday: 'niedziela',
};

const dayOrder: string[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const getToday = (): string => {
  const todayIndex = new Date().getDay();
  return dayOrder[todayIndex === 0 ? 6 : todayIndex - 1];
};

const TimetablePage: React.FC = () => {
  const { lineNumber, directionId } = useParams<{ lineNumber: string; directionId: string }>();
  const [selectedDirection, setSelectedDirection] = useState<number>(Number(directionId));
  const [selectedDay, setSelectedDay] = useState<string | null>(getToday());
  const [selectedStop, setSelectedStop] = useState<string | null>(null);

  const { stopDetails, loading: stopsLoading, error: stopsError } = useStopDetails(lineNumber!) as Record<string, any>;
  const { serviceData, loading: serviceLoading, error: serviceError } = useServiceData(lineNumber!) as Record<string, any>;

  useEffect(() => {
    if (!selectedStop && stopDetails[selectedDirection]?.[1]?.length > 0) {
      setSelectedStop(stopDetails[selectedDirection][1][0].stop_id);
    }
  }, [stopDetails, selectedDirection, selectedStop]);

  const { timetableData, loading: timetableLoading, error: timetableError } = useTimetableData(
    lineNumber!,
    selectedDirection.toString(),
    selectedStop || '',
    serviceData.find((service: any) => service.days.includes(selectedDay))?.service_id || ''
  );

  const destinationStop = stopDetails[selectedDirection]?.[1]?.slice(-1)[0]?.stop_name || "Brak danych";

  if (stopsLoading || serviceLoading) return <Loader />;
  if (stopsError || serviceError) return <div>Błąd ładowania danych: {stopsError}</div>;

  const sortedServiceData = [...serviceData].sort((a, b) => {
    const firstDayA = dayOrder.findIndex(day => a.days.includes(day));
    const firstDayB = dayOrder.findIndex(day => b.days.includes(day));
    return firstDayA - firstDayB;
  });

  return (
    <div className="container mx-auto px-6 lg:px-32 flex justify-around">
      <div className="me-10">
        <header className="mt-10">
          <h1 className="text-4xl font-bold mb-2">Linia {lineNumber}</h1>
          <p className="text-lg">
            Linia obsługiwana przez <span className="font-semibold">MPK S.A. w Krakowie</span>
          </p>
        </header>

        <div className="flex flex-col gap-2 my-4">
          {sortedServiceData.map((service, index) => {
            const dayLabel: string = service.days.map((day: string) => dayTranslations[day]).join(', ');
            return (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="day"
                  value={dayLabel}
                  checked={selectedDay === service.days[0]}
                  onChange={() => setSelectedDay(service.days[0])}
                />
                {dayLabel}
              </label>
            );
          })}
        </div>

        <Button onClick={() => setSelectedDirection((prev) => (prev === 1 ? 0 : 1))}>
          ↺ Przeciwny kierunek
        </Button>

        <ul className="list-disc list-inside space-y-1 my-3">
          {stopDetails[selectedDirection][1].map((stop: Stop) => (
            <li 
              key={stop.stop_id} 
              className={`cursor-pointer ${selectedStop === stop.stop_id ? "font-bold text-blue-600" : ""}`}
              onClick={() => setSelectedStop(stop.stop_id)}
            >
              {stop.stop_name}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="border border-gray-300 p-4 w-full mt-12">
          <div className="flex items-center pb-2 mb-3">
            <span className="text-5xl font-bold mr-4">{lineNumber}</span>
            <span className="text-lg font-semibold">{destinationStop}</span>
          </div>
          {timetableLoading ? (
            <p>Ładowanie rozkładu...</p>
          ) : timetableError ? (
            <p>Błąd ładowania rozkładu: {timetableError}</p>
          ) : (
            <table className="w-full border-collapse">
              <tbody>
                {Object.entries(timetableData).map(([hour, minutes]) => (
                  <tr key={hour}>
                    <td className="ps-6 w-1/6 font-bold border-1 border-r border-b border-t">{hour}</td>
                    <td className="ps-3 py-1 border-t border-b">{minutes.join(" ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-4 text-sm text-gray-600">
            Zakłócenia w ruchu powodują zmiany czasów odjazdów.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimetablePage;
