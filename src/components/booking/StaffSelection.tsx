import { cn } from '../../lib/utils';
import { useBookingState, useBookingDispatch } from '../../context/BookingContext';
import type { Staff } from '../../types/booking';

const DEFAULT_STAFF: Staff[] = [
  { resourceId: 'emma', name: 'Emma' },
  { resourceId: 'petra', name: 'Petra' },
  { resourceId: 'fadi', name: 'Fadi' },
  { resourceId: 'hannah', name: 'Hannah' },
  { resourceId: 'simon', name: 'Simon' },
  { resourceId: 'olivia', name: 'Olivia' },
];

const STAFF_TITLES: Record<string, string> = {
  Petra: 'Frisör',
  Hannah: 'Frisör',
  Fadi: 'Frisör',
  Emma: 'Frisör',
  Olivia: 'Frisör',
  Simon: 'Frisör',
};

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

  return (
    <div id="who">
      <div className="flex flex-col w-full">
        <h2>Vem vill du ska ta hand om dig?</h2>
        <hr />
        <div className="flex flex-wrap justify-center gap-9 max-w-[800px] mx-auto py-6 max-md:gap-[22px]">
          {displayList.map((staff) => {
            const isActive = selectedStaff?.resourceId === staff.resourceId;
            const isDisabled = !isServicesLoaded;

            return (
              <div
                key={staff.resourceId}
                className={cn(
                  "w-[164px] flex flex-col items-center transition-transform duration-200 cursor-pointer relative text-center gap-2 max-md:w-[124px]",
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
                    className="box-border w-40 h-40 rounded-full object-cover relative border-4 border-primary max-md:w-32 max-md:h-32"
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
        </div>
      </div>
    </div>
  );
}
