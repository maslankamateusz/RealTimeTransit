import useStopDetails from "../hooks/useStopDetails";

interface TimetableSectionProps {
    lineNumber: string | undefined;
}
const TimetableSection: React.FC<TimetableSectionProps> = ({ lineNumber }) => {
    const { stopDetails, loading: stopsLoading, error: stopsError } = useStopDetails(lineNumber!);
    if (stopsLoading) return <div>Pobieranie danych</div>;
    if (stopsError) return <div>Błąd pobierania danych: {stopsError}</div>;
    const direction0 = Object(stopDetails)[0][0];
    const direction1 = Object(stopDetails)[1][0];
   
      return (
        <section className="mb-4">
        <h2 className="text-2xl font-semibold mb-4">Rozkład jazdy</h2>
        <ul className="space-y-2">
        <li>
            <a href={`/timetable/${lineNumber}/0`} className="text-blue-600 hover:underline">
                → {direction0.map((direction: string, index: number) => (
                <span key={index} className={index === 0 ? "text-lg font-semibold" : "text-md"}>
                    {direction}
                    {index < direction0.length - 1 && ", "}
                </span>
                ))}
            </a>
            </li>
            <li>
            <a href="#" className="text-blue-600 hover:underline">
                → {direction1.map((direction: string, index: number) => (
                <span key={index} className={index === 0 ? "text-lg font-semibold" : "text-sm"}>
                    {direction}
                    {index < direction1.length - 1 && ", "}
                </span>
                ))}
            </a>
            </li>

        </ul>
      </section>
    );
  };
  
export default TimetableSection;