import { useEffect } from 'react'
import { useBookingStore } from '@/store/bookingStore'
import { fetchServices } from '@/services/api/bookingApi'
import { STAFF_TITLES, DEFAULT_STAFF } from '@/utils/constants'
import type { Staff } from '@/services/api/types'

export function StaffSelector() {
  const {
    serviceGroups,
    isServicesLoaded,
    selectedStaff,
    setServiceGroups,
    setServicesLoaded,
    selectStaff,
  } = useBookingStore()

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchServices()
        setServiceGroups(data.serviceGroups)
        setServicesLoaded(true)
      } catch (error) {
        console.error('Failed to load services:', error)
      }
    }

    if (!isServicesLoaded) {
      loadServices()
    }
  }, [isServicesLoaded, setServiceGroups, setServicesLoaded])

  // Get unique staff from services or use defaults
  const staffList: Staff[] = isServicesLoaded
    ? Array.from(
        new Map(
          serviceGroups
            .flatMap((group) => group.services)
            .flatMap((service) => service.resourceServices)
            .map((staff) => [staff.resourceId, staff])
        ).values()
      )
    : DEFAULT_STAFF.map((s) => ({ resourceId: s.resourceId, name: s.name }))

  const handleStaffClick = (staff: Staff) => {
    if (!isServicesLoaded) return

    if (selectedStaff?.resourceId === staff.resourceId) {
      selectStaff(null)
    } else {
      selectStaff(staff)
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-6 md:gap-9">
      {staffList.map((staff) => {
        const isSelected = selectedStaff?.resourceId === staff.resourceId
        const isDisabled = !isServicesLoaded

        return (
          <button
            key={staff.resourceId}
            onClick={() => handleStaffClick(staff)}
            disabled={isDisabled}
            className={`flex w-32 flex-col items-center gap-2 transition-transform md:w-40 ${
              isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            } ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
          >
            <div className="relative">
              <img
                src={`/assets/images/profile/${staff.name}.jpg`}
                alt={staff.name}
                onError={(e) => {
                  e.currentTarget.src = '/assets/images/profile/default.jpg'
                }}
                className={`h-32 w-32 rounded-full border-4 object-cover md:h-40 md:w-40 ${
                  isSelected ? 'border-secondary' : 'border-secondary/50'
                }`}
              />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-display">{staff.name}</h2>
              <p className="text-xs text-secondary">{STAFF_TITLES[staff.name] ?? 'Frisör'}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
