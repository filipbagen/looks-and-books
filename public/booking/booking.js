const config = {
  development: {
    baseUrl: 'http://localhost:3000',
    onlineBookingUrlName: 'looksbooks',
  },
  production: {
    baseUrl: 'https://looksandbooks.se/booking-api',
    onlineBookingUrlName: 'looksbooks',
  },
};

function getConfig() {
  return window.location.hostname === 'localhost'
    ? config.development
    : config.production;
}

let services = [];
let selectedStaff = null;
let selectedService = null;
let selectedDate = null;
let selectedTimeSlot = null;
let reservedAppointmentId = null;
let customerInfo = null;
let appointmentId = null;

// Fetch initial services data
async function fetchServices() {
  const cfg = getConfig();
  try {
    const response = await fetch(`${cfg.baseUrl}/services`);
    const data = await response.json();
    services = data.serviceGroups;
    // displayStaff();
    populateStaffContainer();
  } catch (error) {
    console.error('Error fetching services:', error);
  }
}

function populateStaffContainer() {
  const staffContainer = document.getElementById('staffButtons');
  if (staffContainer) {
    staffContainer.innerHTML = '';
  }

  const uniqueStaff = new Set();
  const staffList = [];

  services.forEach((group) => {
    group.services.forEach((service) => {
      service.resourceServices.forEach((staff) => {
        if (!uniqueStaff.has(staff.resourceId)) {
          uniqueStaff.add(staff.resourceId);
          staffList.push(staff);
        }
      });
    });
  });

  staffList.forEach((staff) => {
    const container = document.createElement('div');
    const imageContainer = document.createElement('div');
    const img = document.createElement('img');
    const ring = document.createElement('div');
    const firstName = document.createElement('p');

    container.classList.add('staff-button');
    imageContainer.classList.add('staff-image-container');

    container.addEventListener('click', function () {
      selectStaff(staff, container);
    });

    container.id = staff.resourceId;
    img.src = `../assets/img/profile/${staff.name || 'default'}.jpg`;
    img.onerror = () => (img.src = '../assets/img/profile/default.jpg');

    ring.classList.add('ring');
    firstName.textContent = staff.name;

    imageContainer.appendChild(ring);
    imageContainer.appendChild(img);
    container.appendChild(imageContainer);
    container.appendChild(firstName);

    if (staffContainer) {
      staffContainer.appendChild(container);
    }
  });
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
// function displayServices() {
//   const serviceContainer = document.getElementById('serviceButtons');
//   serviceContainer.innerHTML = '';

//   services.forEach((group) => {
//     group.services.forEach((service) => {
//       if (
//         service.resourceServices.some(
//           (rs) => rs.resourceId === selectedStaff.resourceId
//         )
//       ) {
//         const button = createButton(
//           `${service.name} - ${service.length}min (${service.priceIncludingVat}kr)`,
//           () => selectService(service)
//         );
//         serviceContainer.appendChild(button);
//       }
//     });
//   });

//   document.getElementById('serviceSection').classList.remove('hidden');
// }

function populateServiceContainer() {
  const serviceContainer = document.getElementById('serviceButtons');
  if (serviceContainer) {
    serviceContainer.innerHTML = ''; // Clear existing content
  }

  // Filter services for the selected staff
  const staffServices = services.flatMap((group) =>
    group.services.filter((service) =>
      service.resourceServices.some(
        (rs) => rs.resourceId === selectedStaff.resourceId
      )
    )
  );

  staffServices.forEach((service) => {
    const row = document.createElement('div');
    const name = document.createElement('p');
    const timeIcon = document.createElement('i');
    const time = document.createElement('p');
    const price = document.createElement('p');

    row.addEventListener('click', function () {
      selectService(service, row);
    });

    row.id = String(service.serviceId);
    name.textContent = service.name;

    // Add clock icon (using Font Awesome class, adjust if using different icon library)
    timeIcon.className = 'fa fa-clock';

    // Handle service duration display
    time.textContent = `${service.length}min`;

    // Format price
    price.textContent = `${service.priceIncludingVat}kr`;

    row.appendChild(name);
    row.appendChild(timeIcon);
    row.appendChild(time);
    row.appendChild(price);

    if (serviceContainer) {
      serviceContainer.appendChild(row);
    }
  });

  // Show service section
  document.getElementById('serviceSection').classList.remove('hidden');
}

// Fetch time slots using the working proxy endpoint
function fetchTimeSlots() {
  const cfg = getConfig();
  const dateStart = new Date().toISOString().split('T')[0];
  const dateEnd = new Date();
  dateEnd.setDate(dateEnd.getDate() + 30);

  const params = new URLSearchParams({
    dateStart,
    dateStop: dateEnd.toISOString().split('T')[0],
    onlineBookingUrlName: cfg.onlineBookingUrlName,
    serviceIds: selectedService.serviceId,
    resourceIds: selectedStaff.resourceId,
  });

  fetch(`${cfg.baseUrl}/timeslots?${params}`)
    .then((response) => response.json())
    .then(displayTimeSlots)
    .catch(console.error);
}

// Display available time slots
function displayTimeSlots(data) {
  if (!data || !data.dates || !Array.isArray(data.dates)) {
    console.error('Invalid data format:', data);
    document.getElementById('timeSlots').innerHTML =
      '<p>No available slots found.</p>';
    return;
  }

  const container = document.getElementById('timeSlots');
  container.innerHTML = '';

  data.dates.forEach((dateGroup) => {
    const dateHeader = document.createElement('h3');
    dateHeader.textContent = `Date: ${dateGroup.date}`;
    container.appendChild(dateHeader);

    dateGroup.timeSlots.forEach((slot) => {
      const timeButton = createButton(slot.startTime, () => {
        selectedDate = dateGroup.date;
        selectedTimeSlot = slot;
        showConfirmationForm();
      });
      container.appendChild(timeButton);
    });
  });

  document.getElementById('timeSection').classList.remove('hidden');
}

function showConfirmationForm() {
  const confirmationSection = document.getElementById('confirmationSection');
  confirmationSection.classList.remove('hidden');

  // Show initial summary and phone form
  const summaryHtml = `
    <h3>Booking Details</h3>
    <p><strong>Hairdresser:</strong> ${selectedStaff.name}</p>
    <p><strong>Service:</strong> ${selectedService.name}</p>
    <p><strong>Date:</strong> ${selectedDate}</p>
    <p><strong>Time:</strong> ${selectedTimeSlot.startTime}</p>
    <p><strong>Price:</strong> ${selectedService.priceIncludingVat}kr</p>
  `;
  document.getElementById('bookingSummary').innerHTML = summaryHtml;

  // Show phone form, hide final form
  document.getElementById('phoneForm').style.display = 'block';
  document.getElementById('finalBookingForm').style.display = 'none';
}

// Phone form submission
document
  .getElementById('phoneForm')
  .addEventListener('submit', async function (e) {
    e.preventDefault();
    const phoneNumber = document.getElementById('customerPhone').value;
    const cfg = getConfig();

    try {
      const reserveResponse = await fetch(`${cfg.baseUrl}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onlineBookingUrlName: cfg.onlineBookingUrlName,
          resourceIds: [selectedStaff.resourceId],
          serviceIds: [selectedService.serviceId],
          startDate: selectedDate,
          startTime: selectedTimeSlot.startTime,
          customerPhoneNumber: phoneNumber,
        }),
      });

      const reserveData = await reserveResponse.json();
      appointmentId = reserveData.appointmentId;

      // Show final booking form
      document.getElementById('phoneForm').style.display = 'none';
      document.getElementById('finalBookingForm').style.display = 'block';

      const nameInput = document.getElementById('customerName');
      const emailInput = document.getElementById('customerEmail');
      const nameGroup = document.querySelector('.name-group');
      const emailGroup = document.querySelector('.email-group');

      if (reserveData.maskedCustomers?.[0]) {
        customerInfo = {
          exists: true,
          name: reserveData.maskedCustomers[0].maskedName.replace(/\*/g, ''),
          email: reserveData.maskedCustomers[0].maskedEmail.replace(/\*/g, ''),
          customerId: reserveData.maskedCustomers[0].id,
        };
        nameInput.value = customerInfo.name;
        emailInput.value = customerInfo.email;
        nameInput.readOnly = true;
        emailInput.readOnly = true;
        nameGroup.style.display = 'none';
        emailGroup.style.display = 'none';
      } else {
        customerInfo = { exists: false };
        nameInput.value = '';
        emailInput.value = '';
        nameInput.readOnly = false;
        emailInput.readOnly = false;
        nameGroup.style.display = 'block';
        emailGroup.style.display = 'block';
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error checking customer. Please try again.');
    }
  });

async function showSuccessPage(confirmData) {
  const container = document.querySelector('.container');
  container.innerHTML = `
      <div class="success-section">
        <h2>Tack för din bokning!</h2>
        <div class="success-summary">
          <p><strong>Frisör:</strong> ${selectedStaff.name}</p>
          <p><strong>Behandling:</strong> ${selectedService.name}</p>
          <p><strong>Datum:</strong> ${selectedDate}</p>
          <p><strong>Tid:</strong> ${selectedTimeSlot.startTime}</p>
          <p><strong>Pris:</strong> ${selectedService.priceIncludingVat}kr</p>
          <hr>
          <p><strong>Telefon:</strong> ${confirmData.customerPhoneNumber}</p>
          ${
            customerInfo.exists
              ? ''
              : `
            <p><strong>Namn:</strong> ${confirmData.customerName}</p>
            <p><strong>Email:</strong> ${confirmData.customerEmail}</p>
          `
          }
          ${
            confirmData.notes
              ? `<p><strong>Meddelande:</strong> ${confirmData.notes}</p>`
              : ''
          }
        </div>
        <p class="success-message">En bokningsbekräftelse har skickats till din e-post</p>
      </div>
    `;
}

// Terms checkbox handler
document
  .getElementById('termsAccepted')
  .addEventListener('change', function (e) {
    const bookButton = document.getElementById('bookButton');
    const nameInput = document.getElementById('customerName');
    const emailInput = document.getElementById('customerEmail');

    const hasNameEmail =
      customerInfo.exists || (nameInput.value && emailInput.value);
    bookButton.disabled = !(e.target.checked && hasNameEmail);
  });

// Update form submission handler
document
  .getElementById('finalBookingForm')
  .addEventListener('submit', async function (e) {
    e.preventDefault();
    const cfg = getConfig();

    const confirmData = {
      onlineBookingUrlName: cfg.onlineBookingUrlName,
      appointmentId: appointmentId,
      customerPhoneNumber: document.getElementById('customerPhone').value,
      notes: document.getElementById('notes').value || '',
      termsAndConditionsApproved: true,
    };

    if (!customerInfo.exists) {
      confirmData.customerName = document.getElementById('customerName').value;
      confirmData.customerEmail =
        document.getElementById('customerEmail').value;
    } else {
      confirmData.customerId = customerInfo.customerId;
    }

    try {
      const confirmResponse = await fetch(`${cfg.baseUrl}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(confirmData),
      });

      if (!confirmResponse.ok) {
        throw new Error('Booking failed');
      }

      await showSuccessPage(confirmData);
    } catch (error) {
      console.error('Error:', error);
      alert('Error confirming booking. Please try again.');
    }
  });

// Helper function to create buttons
function createButton(text, onClick) {
  const button = document.createElement('button');
  button.className = 'button';
  button.textContent = text;
  button.onclick = onClick;
  return button;
}

// Event handlers
function selectStaff(staff, selectedElement) {
  // Remove active state from all staff elements
  document.querySelectorAll('#staffButtons > div').forEach((el) => {
    el.classList.remove('activeRing');
  });

  // Add active state to selected element
  if (selectedElement) {
    selectedElement.classList.add('activeRing');
  }

  // Store selected staff
  selectedStaff = staff;

  // Proceed to next step (likely displaying services)
  // displayServices();
  populateServiceContainer();
}

function selectService(service, selectedElement) {
  // Remove active state from all service elements
  document.querySelectorAll('#serviceButtons > div').forEach((el) => {
    el.classList.remove('activeResourceOption');
  });

  // Add active state to selected element
  if (selectedElement) {
    selectedElement.classList.add('activeResourceOption');
  }

  // Store selected service
  selectedService = service;

  // Fetch time slots
  fetchTimeSlots();
}

// CSS to match System 2's styling
const serviceContainerStyles = `
#serviceSection {
  max-width: 960px;
  width: 100vw;
}

#serviceButtons {
  display: flex;
  flex-direction: column;
}

#serviceButtons > div {
  display: flex;
  justify-content: space-between;
  transition: 200ms;
  cursor: pointer;
  border-left: 3px solid transparent;
}

#serviceButtons > div:hover {
  border-left: 3px solid #333;
}

#serviceButtons > div.activeResourceOption {
  background-color: #333;
  color: #fff;
}

#serviceButtons > div p {
  padding: 0 20px;
  display: flex;
  align-items: center;
  text-align: left;
}

#serviceButtons > div p:nth-of-type(2) {
  min-width: 66px;
  padding-right: 0;
}

#serviceButtons > div p:last-of-type {
  padding-left: 0;
  min-width: 85px;
  justify-content: flex-end;
}

#serviceButtons > div i {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
}
`;

// Add styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = serviceContainerStyles;
document.head.appendChild(styleElement);

// Initialize the booking system
fetchServices();

// npx http-server
// node proxy.js
