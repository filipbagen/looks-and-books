import { cn } from '../../lib/utils';
import { useBookingState, useBookingDispatch } from '../../context/BookingContext';
import type { Staff } from '../../types/booking';
import { DEFAULT_STAFF, STAFF_TITLES, QUICKEST_AVAILABLE, isQuickestAvailable } from '../../config/staff';

function getProfileImage(name: string): string {
  return new URL(
    `../../assets/images/profile/${name}.jpg`,
    import.meta.url,
  ).href;
}

const defaultImage = new URL(
  '../../assets/images/profile/default.jpg',
  import.meta.url,
).href;

export default function StaffSelection() {
  const { isServicesLoaded, staffList, selectedStaff } = useBookingState();
  const dispatch = useBookingDispatch();

  const displayList = isServicesLoaded && staffList.length > 0 ? staffList : DEFAULT_STAFF;

  function handleClick(staff: Staff) {
    if (!isServicesLoaded) return;
    if (selectedStaff?.resourceId === staff.resourceId) {
      dispatch({ type: 'SELECT_STAFF', payload: null });
    } else {
      dispatch({ type: 'SELECT_STAFF', payload: staff });
    }
  }

  const isQuickActive = isQuickestAvailable(selectedStaff);
  const isDisabled = !isServicesLoaded;

  return (
    <div id="who">
      <div className="flex flex-col w-full">
        <h2>Vem vill du ska ta hand om dig?</h2>
        <hr />
        <div className="flex flex-wrap justify-center gap-9 max-w-3xl mx-auto py-6 max-md:gap-6">
          {displayList.map((staff) => {
            const isActive = selectedStaff?.resourceId === staff.resourceId;

            return (
              <div
                key={staff.resourceId}
                className={cn(
                  "w-40 flex flex-col items-center transition-transform duration-200 cursor-pointer relative text-center gap-2 max-md:w-32",
                  isDisabled && "opacity-50 pointer-events-none"
                )}
                onClick={() => handleClick(staff)}
              >
                <div
                  className={cn(
                    "relative transition-transform duration-300 ease-in-out hover:scale-110 hover:cursor-pointer",
                    isActive && "scale-110"
                  )}
                >
                  <img
                    src={getProfileImage(staff.name)}
                    alt={staff.name}
                    className="box-border w-40 h-40 rounded-full object-cover relative border-4 max-md:w-32 max-md:h-32"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultImage;
                    }}
                  />
                </div>
                <div>
                  <h2>{staff.name}</h2>
                  <p className="muted -mt-8">{STAFF_TITLES[staff.name] || 'Frisör'}</p>
                </div>
              </div>
            );
          })}

          {/* Quickest available time */}
          <div
            className={cn(
              "w-40 flex flex-col items-center transition-transform duration-200 cursor-pointer relative text-center gap-2 max-md:w-32",
              isDisabled && "opacity-50 pointer-events-none"
            )}
            onClick={() => handleClick(QUICKEST_AVAILABLE)}
          >
            <div
              className={cn(
                "relative transition-transform duration-300 ease-in-out hover:scale-110 hover:cursor-pointer",
                isQuickActive && "scale-110"
              )}
            >
              <img
                src={defaultImage}
                alt={QUICKEST_AVAILABLE.name}
                className="box-border w-40 h-40 rounded-full object-cover relative border-4 max-md:w-32 max-md:h-32"
              />
            </div>
            <div>
              <h2>{QUICKEST_AVAILABLE.name}</h2>
              <p className="muted -mt-8">Första lediga tid</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
