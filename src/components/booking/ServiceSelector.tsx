import { useBookingStore } from '@/store/bookingStore'
import type { Service } from '@/services/api/types'

export function ServiceSelector() {
  const { serviceGroups, selectedStaff, selectedService, selectService } = useBookingStore()

  if (!selectedStaff) return null

  // Filter services for the selected staff
  const availableServices = serviceGroups.flatMap((group) =>
    group.services.filter((service) =>
      service.resourceServices.some((rs) => rs.resourceId === selectedStaff.resourceId)
    )
  )

  const handleServiceClick = (service: Service) => {
    if (selectedService?.serviceId === service.serviceId) {
      selectService(null)
    } else {
      selectService(service)
    }
  }

  return (
    <div className="flex flex-col">
      {availableServices.map((service, index) => {
        const isSelected = selectedService?.serviceId === service.serviceId

        return (
          <div
            key={service.serviceId}
            onClick={() => handleServiceClick(service)}
            className={`flex cursor-pointer items-center justify-between border-l-4 p-3 transition-colors ${
              isSelected
                ? 'rounded-lg border-secondary bg-secondary text-white'
                : 'border-transparent hover:rounded-lg hover:bg-secondary hover:text-white'
            } ${index < availableServices.length - 1 ? 'border-b border-b-secondary/20 md:border-b-0' : ''}`}
          >
            <p className="mr-7 font-bold">{service.name}</p>
            <div className="flex items-center gap-5">
              <p className="min-w-[46px] text-right md:min-w-[66px]">{service.length} min</p>
              <p className="min-w-[70px] text-right md:min-w-[85px]">
                {service.priceIncludingVat} kr
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
