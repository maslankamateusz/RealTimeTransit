import React from 'react';

const ServiceSelection: React.FC<{
  serviceDetails: [string[], string][],
  selectedService: string | null,
  setSelectedService: (service: string) => void,
    }> = ({ serviceDetails, selectedService, setSelectedService }) => {
  const dayTranslations: { [key: string]: string } = {
    monday: 'poniedziałek',
    tuesday: 'wtorek',
    wednesday: 'środa',
    thursday: 'czwartek',
    friday: 'piątek',
    saturday: 'sobota',
    sunday: 'niedziela',
  };

  const handleDayChange = (service: string) => {
    setSelectedService(service);
  };

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Brygady</h2>
      <div className="mb-6">
        <form className="space-y-2">
          {serviceDetails.map(([days, service], index) => {
            const dayLabel = days.map((day) => dayTranslations[day]).join(', ');
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
    </section>
  );
};

export default ServiceSelection;
