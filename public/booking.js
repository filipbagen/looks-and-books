let services = [];
let selectedStaff = null;
let selectedService = null;
let selectedDate = null;

// Fetch initial services data
async function fetchServices() {
  try {
    const response = await fetch(
      '/api/v1/open/calendar/onlineBooking/getServices?onlineBookingUrlName=looksbooks'
    );
    const data = await response.json();
    services = data.serviceGroups;
    displayStaff();
  } catch (error) {
    console.error('Error fetching services:', error);
  }
}

// Display staff members
function displayStaff() {
  const staffContainer = document.getElementById('staffButtons');
  const uniqueStaff = new Set();

  services.forEach((group) => {
    group.services.forEach((service) => {
      service.resourceServices.forEach((staff) => {
        if (!uniqueStaff.has(staff.resourceId)) {
          uniqueStaff.add(staff.resourceId);
          const button = createButton(staff.name, () => selectStaff(staff));
          staffContainer.appendChild(button);
        }
      });
    });
  });
}

// Display services for selected staff
function displayServices() {
  const serviceContainer = document.getElementById('serviceButtons');
  serviceContainer.innerHTML = '';

  services.forEach((group) => {
    group.services.forEach((service) => {
      if (
        service.resourceServices.some(
          (rs) => rs.resourceId === selectedStaff.resourceId
        )
      ) {
        const button = createButton(
          `${service.name} - ${service.length}min (${service.priceIncludingVat}kr)`,
          () => selectService(service)
        );
        serviceContainer.appendChild(button);
      }
    });
  });

  document.getElementById('serviceSection').classList.remove('hidden');
}

// Fetch available time slots
async function fetchTimeSlots() {
  const dateStart = selectedDate;
  const dateEnd = new Date(selectedDate);
  dateEnd.setDate(dateEnd.getDate() + 6);

  try {
    const response = await fetch(
      `https://boka.easycashier.se/v1/open/calendar/onlineBooking/getAvailableTimeSlots?` +
        `dateStart=${dateStart}&dateStop=${
          dateEnd.toISOString().split('T')[0]
        }&` +
        `onlineBookingUrlName=looksbooks&` +
        `serviceIds=${selectedService.serviceId}&` +
        `resourceIds=${selectedStaff.resourceId}`
    );
    const data = await response.json();
    displayTimeSlots(data.availableSlots || []);
  } catch (error) {
    console.error('Error fetching time slots:', error);
  }
}

// Display available time slots
function displayTimeSlots(slots) {
  const container = document.getElementById('timeSlots');
  container.innerHTML = '';

  slots.forEach((slot) => {
    const time = new Date(slot.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const button = createButton(time, () => handleBooking(slot));
    container.appendChild(button);
  });

  document.getElementById('timeSection').classList.remove('hidden');
}

// Handle the booking process
async function handleBooking(slot) {
  try {
    // Step 1: Reserve the slot
    const reserveResponse = await fetch(
      'https://boka.easycashier.se/v1/open/calendar/onlineBooking/reserveTimeSlot',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedService.serviceId,
          resourceId: selectedStaff.resourceId,
          startTime: slot.startTime,
          // Add other required fields based on your network analysis
        }),
      }
    );

    if (reserveResponse.ok) {
      // Step 2: Confirm the booking
      const confirmResponse = await fetch(
        'https://boka.easycashier.se/v1/open/calendar/onlineBooking/confirmOnlineBooking',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Add required fields based on your network analysis
          }),
        }
      );

      if (confirmResponse.ok) {
        alert('Booking confirmed!');
      }
    }
  } catch (error) {
    console.error('Error making booking:', error);
  }
}

// Helper function to create buttons
function createButton(text, onClick) {
  const button = document.createElement('button');
  button.className = 'button';
  button.textContent = text;
  button.onclick = onClick;
  return button;
}

// Event handlers
function selectStaff(staff) {
  selectedStaff = staff;
  document
    .querySelectorAll('#staffButtons .button')
    .forEach((btn) => btn.classList.remove('selected'));
  event.target.classList.add('selected');
  displayServices();
}

function selectService(service) {
  selectedService = service;
  document
    .querySelectorAll('#serviceButtons .button')
    .forEach((btn) => btn.classList.remove('selected'));
  event.target.classList.add('selected');
  document.getElementById('dateSection').classList.remove('hidden');
}

// Date input handler
document.getElementById('dateSelect').addEventListener('change', (e) => {
  selectedDate = e.target.value;
  if (selectedDate) {
    fetchTimeSlots();
  }
});

// Initialize the booking system
fetchServices();
