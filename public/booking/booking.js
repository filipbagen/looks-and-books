import { smoothScrollTo } from '../assets/js/smoothScroll.js';

// Configuration management
const CONFIG = {
  development: {
    baseUrl: 'http://localhost:3000',
    onlineBookingUrlName: 'looksbooks',
  },
  production: {
    baseUrl: 'https://looksandbooks.se/booking-api',
    onlineBookingUrlName: 'looksbooks',
  },
};

// Booking state management
const bookingState = {
  services: [],
  selectedStaff: null,
  selectedService: null,
  selectedDate: null,
  selectedTimeSlot: null,
  appointmentId: null,
  customerInfo: null,
};

// Helper function to get configuration based on environment
function getConfig() {
  return window.location.hostname === 'localhost'
    ? CONFIG.development
    : CONFIG.production;
}

// Fetch and initialize services
async function fetchServices() {
  const cfg = getConfig();
  try {
    const response = await fetch(`${cfg.baseUrl}/services`);
    const data = await response.json();
    bookingState.services = data.serviceGroups;
    populateStaffContainer();
  } catch (error) {
    console.error('Error fetching services:', error);
  }
}

// Populate staff container with unique staff members
function populateStaffContainer() {
  const staffContainer = document.getElementById('staffButtons');
  if (!staffContainer) return;

  staffContainer.innerHTML = '';
  const uniqueStaff = new Set();
  const staffList = [];

  bookingState.services.forEach((group) => {
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
    const container = createStaffButton(staff);
    staffContainer.appendChild(container);
  });
}

// Create staff button element
function createStaffButton(staff) {
  const container = document.createElement('div');
  const imageContainer = document.createElement('div');
  const img = document.createElement('img');
  const ring = document.createElement('div');
  const firstName = document.createElement('p');

  container.classList.add('staff-button');
  imageContainer.classList.add('staff-image-container');

  container.addEventListener('click', () => selectStaff(staff, container));

  container.id = staff.resourceId;
  img.src = `../assets/img/profile/${staff.name || 'default'}.jpg`;
  img.onerror = () => (img.src = '../assets/img/profile/default.jpg');

  ring.classList.add('ring');
  firstName.textContent = staff.name;

  imageContainer.appendChild(ring);
  imageContainer.appendChild(img);
  container.appendChild(imageContainer);
  container.appendChild(firstName);

  return container;
}

// Populate service container for selected staff
function populateServiceContainer() {
  const serviceContainer = document.getElementById('serviceButtons');
  if (!serviceContainer) return;

  serviceContainer.innerHTML = '';

  // Filter services for the selected staff
  const staffServices = bookingState.services.flatMap((group) =>
    group.services.filter((service) =>
      service.resourceServices.some(
        (rs) => rs.resourceId === bookingState.selectedStaff.resourceId
      )
    )
  );

  staffServices.forEach((service) => {
    const row = createServiceRow(service);
    serviceContainer.appendChild(row);
  });

  // Show service section
  document.getElementById('serviceSection').classList.remove('hidden');
}

// Create service row element
function createServiceRow(service) {
  const row = document.createElement('div');
  const name = document.createElement('p');
  const timeIcon = document.createElement('i');
  const time = document.createElement('p');
  const price = document.createElement('p');

  row.addEventListener('click', () => selectService(service, row));

  row.id = String(service.serviceId);
  name.textContent = service.name;
  timeIcon.className = 'fa fa-clock';
  time.textContent = `${service.length}min`;
  price.textContent = `${service.priceIncludingVat}kr`;

  row.appendChild(name);
  row.appendChild(timeIcon);
  row.appendChild(time);
  row.appendChild(price);

  return row;
}

// Fetch available time slots
function fetchTimeSlots() {
  const cfg = getConfig();
  const dateStart = new Date().toISOString().split('T')[0];
  const dateEnd = new Date();
  dateEnd.setDate(dateEnd.getDate() + 30);

  const params = new URLSearchParams({
    dateStart,
    dateStop: dateEnd.toISOString().split('T')[0],
    onlineBookingUrlName: cfg.onlineBookingUrlName,
    serviceIds: bookingState.selectedService.serviceId,
    resourceIds: bookingState.selectedStaff.resourceId,
  });

  fetch(`${cfg.baseUrl}/timeslots?${params}`)
    .then((response) => response.json())
    .then(displayTimeSlots)
    .catch(console.error);
}

// Display available time slots
function displayTimeSlots(data) {
  const container = document.getElementById('timeSlots');

  if (!data?.dates || !Array.isArray(data.dates)) {
    container.innerHTML = '<p>No available slots found.</p>';
    return;
  }

  container.innerHTML = '';

  data.dates.forEach((dateGroup) => {
    const dateHeader = document.createElement('h3');
    dateHeader.textContent = `Date: ${dateGroup.date}`;
    container.appendChild(dateHeader);

    dateGroup.timeSlots.forEach((slot) => {
      const timeButton = createButton(slot.startTime, () => {
        selectDateAndTime(dateGroup.date, slot);
      });
      container.appendChild(timeButton);
    });
  });

  document.getElementById('timeSection').classList.remove('hidden');
}

// Show confirmation form
function showConfirmationForm() {
  const confirmationSection = document.getElementById('confirmationSection');
  confirmationSection.classList.remove('hidden');

  const summaryHtml = `
    <h3>Booking Details</h3>
    <p><strong>Hairdresser:</strong> ${bookingState.selectedStaff.name}</p>
    <p><strong>Service:</strong> ${bookingState.selectedService.name}</p>
    <p><strong>Date:</strong> ${bookingState.selectedDate}</p>
    <p><strong>Time:</strong> ${bookingState.selectedTimeSlot.startTime}</p>
    <p><strong>Price:</strong> ${bookingState.selectedService.priceIncludingVat}kr</p>
  `;
  document.getElementById('bookingSummary').innerHTML = summaryHtml;

  // Show phone form, hide final form
  document.getElementById('phoneForm').style.display = 'block';
  document.getElementById('finalBookingForm').style.display = 'none';
}

// Phone form submission handler
async function handlePhoneFormSubmit(e) {
  e.preventDefault();
  const cfg = getConfig();
  const phoneNumber = document.getElementById('customerPhone').value;

  try {
    const reserveResponse = await fetch(`${cfg.baseUrl}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        onlineBookingUrlName: cfg.onlineBookingUrlName,
        resourceIds: [bookingState.selectedStaff.resourceId],
        serviceIds: [bookingState.selectedService.serviceId],
        startDate: bookingState.selectedDate,
        startTime: bookingState.selectedTimeSlot.startTime,
        customerPhoneNumber: phoneNumber,
      }),
    });

    const reserveData = await reserveResponse.json();
    bookingState.appointmentId = reserveData.appointmentId;

    // Show final booking form
    document.getElementById('phoneForm').style.display = 'none';
    document.getElementById('finalBookingForm').style.display = 'block';

    configureCustomerForm(reserveData);
  } catch (error) {
    console.error('Error:', error);
    alert('Error checking customer. Please try again.');
  }
}

// Configure customer form based on existing customer
function configureCustomerForm(reserveData) {
  const nameInput = document.getElementById('customerName');
  const emailInput = document.getElementById('customerEmail');
  const nameGroup = document.querySelector('.name-group');
  const emailGroup = document.querySelector('.email-group');

  if (reserveData.maskedCustomers?.[0]) {
    bookingState.customerInfo = {
      exists: true,
      name: reserveData.maskedCustomers[0].maskedName.replace(/\*/g, ''),
      email: reserveData.maskedCustomers[0].maskedEmail.replace(/\*/g, ''),
      customerId: reserveData.maskedCustomers[0].id,
    };

    nameInput.value = bookingState.customerInfo.name;
    emailInput.value = bookingState.customerInfo.email;
    nameInput.readOnly = true;
    emailInput.readOnly = true;
    nameGroup.style.display = 'none';
    emailGroup.style.display = 'none';
  } else {
    bookingState.customerInfo = { exists: false };
    nameInput.value = '';
    emailInput.value = '';
    nameInput.readOnly = false;
    emailInput.readOnly = false;
    nameGroup.style.display = 'block';
    emailGroup.style.display = 'block';
  }
}

// Show success page
async function showSuccessPage(confirmData) {
  const container = document.querySelector('.container');
  container.innerHTML = `
    <div class="success-section">
      <h2>Tack för din bokning!</h2>
      <div class="success-summary">
        <p><strong>Frisör:</strong> ${bookingState.selectedStaff.name}</p>
        <p><strong>Behandling:</strong> ${bookingState.selectedService.name}</p>
        <p><strong>Datum:</strong> ${bookingState.selectedDate}</p>
        <p><strong>Tid:</strong> ${bookingState.selectedTimeSlot.startTime}</p>
        <p><strong>Pris:</strong> ${
          bookingState.selectedService.priceIncludingVat
        }kr</p>
        <hr>
        <p><strong>Telefon:</strong> ${confirmData.customerPhoneNumber}</p>
        ${
          !bookingState.customerInfo.exists
            ? `
          <p><strong>Namn:</strong> ${confirmData.customerName}</p>
          <p><strong>Email:</strong> ${confirmData.customerEmail}</p>
        `
            : ''
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

// Final booking confirmation handler
async function handleFinalBookingSubmit(e) {
  e.preventDefault();
  const cfg = getConfig();

  const confirmData = {
    onlineBookingUrlName: cfg.onlineBookingUrlName,
    appointmentId: bookingState.appointmentId,
    customerPhoneNumber: document.getElementById('customerPhone').value,
    notes: document.getElementById('notes').value || '',
    termsAndConditionsApproved: true,
  };

  if (!bookingState.customerInfo.exists) {
    confirmData.customerName = document.getElementById('customerName').value;
    confirmData.customerEmail = document.getElementById('customerEmail').value;
  } else {
    confirmData.customerId = bookingState.customerInfo.customerId;
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
}

// Staff selection handler
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
  bookingState.selectedStaff = staff;

  // Populate and reveal service container
  populateServiceContainer();

  // Smoothly scroll to the services section
  const serviceSection = document.getElementById('serviceSection');
  if (serviceSection) {
    // Ensure the section is visible
    serviceSection.classList.remove('hidden');

    // Use smooth scroll to move to the services
    smoothScrollTo('serviceSection');
  }
}

// Service selection handler
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
  bookingState.selectedService = service;

  // Fetch and display time slots
  fetchTimeSlots();

  // Smoothly scroll to the time slots section
  const timeSection = document.getElementById('timeSection');
  if (timeSection) {
    // Ensure the section is visible
    timeSection.classList.remove('hidden');

    // Use smooth scroll to move to the time slots
    smoothScrollTo('timeSection');
  }
}

function selectDateAndTime(date, timeSlot) {
  // Remove active state from all time slot elements
  document.querySelectorAll('#timeSlots > button').forEach((el) => {
    el.classList.remove('activeTimeSlot');
  });

  // Store selected date and time slot
  bookingState.selectedDate = date;
  bookingState.selectedTimeSlot = timeSlot;

  // Show confirmation form
  showConfirmationForm();

  // Smoothly scroll to the confirmation section
  const confirmationSection = document.getElementById('confirmationSection');
  if (confirmationSection) {
    // Ensure the section is visible
    confirmationSection.classList.remove('hidden');

    // Use smooth scroll to move to the confirmation
    smoothScrollTo('confirmationSection');
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

// Terms checkbox handler
function handleTermsCheckbox(e) {
  const bookButton = document.getElementById('bookButton');
  const nameInput = document.getElementById('customerName');
  const emailInput = document.getElementById('customerEmail');

  const hasNameEmail =
    bookingState.customerInfo.exists || (nameInput.value && emailInput.value);
  bookButton.disabled = !(e.target.checked && hasNameEmail);
}

// Event listeners
function setupEventListeners() {
  document
    .getElementById('phoneForm')
    .addEventListener('submit', handlePhoneFormSubmit);

  document
    .getElementById('finalBookingForm')
    .addEventListener('submit', handleFinalBookingSubmit);

  document
    .getElementById('termsAccepted')
    .addEventListener('change', handleTermsCheckbox);
}

// Initialize the booking system
export function initBookingSystem() {
  setupEventListeners();
  fetchServices();
}
