import { useBookingState, useBookingDispatch } from '../../context/BookingContext';
import type { Service } from '../../types/booking';

export default function ServiceSelection() {
  const { services, selectedStaff, selectedService } = useBookingState();
  const dispatch = useBookingDispatch();

  if (!selectedStaff) return null;

  const staffServices = services.flatMap((group) =>
    group.services.filter((service) =>
      service.resourceServices.some(
        (rs) => rs.resourceId === selectedStaff.resourceId,
      ),
    ),
  );

  function handleClick(service: Service) {
    if (selectedService?.serviceId === service.serviceId) {
      dispatch({ type: 'SELECT_SERVICE', payload: null });
    } else {
      dispatch({ type: 'SELECT_SERVICE', payload: service });
    }
  }

  return (
    <div className="flex flex-col w-full">
      <h2>Vilken behandling vill du ha?</h2>
      <hr />
      <div className="flex flex-col gap-0 py-6">
        {staffServices.map((service) => {
          const isActive = selectedService?.serviceId === service.serviceId;

          return (
            <div
              key={service.serviceId}
              className={`flex justify-between p-3 transition-all duration-200 cursor-pointer border-l-[3px] border-transparent hover:bg-secondary hover:text-brand-white hover:rounded-lg ${isActive ? 'bg-secondary text-brand-white rounded-lg' : ''}`}
              onClick={() => handleClick(service)}
            >
              <div>
                <p className="m-0 p-0 font-bold mr-7">{service.name}</p>
              </div>
              <div className="flex gap-5 items-center">
                <p className="m-0 p-0 min-w-[66px]">{service.length} min</p>
                <p className="m-0 p-0 min-w-[85px] text-right">{service.priceIncludingVat} kr</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
