import { smoothScrollTo } from '../assets/js/smoothScroll.js';
import {
  getDayShortName,
  getMonthShortName,
  addDays,
  getWeekNumber,
  isSameDate,
  animateContainer,
} from './utils.js';

let activeSchedule = getPreviousMonday(new Date()); // Start with the previous Monday

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

const staffTitles = {
  Petra: 'Frisör',
  Hannah: 'Frisör',
  Fadi: 'Frisör',
  Emma: 'Frisör',
  Olivia: 'Frisör',
  Simon: 'Frisör',
  Charlotte: 'Hudterapeut & hudcoach ',
  Meja: 'Nagelterapeut',
  // Add more staff members as needed
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
  container.classList.add('staff-button');
  container.id = staff.resourceId;
  container.addEventListener('click', () => selectStaff(staff, container));

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('staff-image-container');

  const img = document.createElement('img');
  img.src = `../assets/img/profile/${staff.name || 'default'}.jpg`;
  img.onerror = () => (img.src = '../assets/img/profile/default.jpg');

  const ring = document.createElement('div');
  ring.classList.add('ring');

  const textContainer = document.createElement('div');
  textContainer.classList.add('staff-text-container');

  const name = document.createElement('h2');
  name.textContent = staff.name;

  const title = document.createElement('p');
  title.textContent = staffTitles[staff.name] || 'Hair Dresser';

  imageContainer.appendChild(ring);
  imageContainer.appendChild(img);
  textContainer.appendChild(name);
  textContainer.appendChild(title);
  container.appendChild(imageContainer);
  container.appendChild(textContainer);

  return container;
}

// Populate service container for selected staff
function populateServiceContainer() {
  const serviceContainer = document.getElementById('serviceButtons');
  if (!serviceContainer) return;

  serviceContainer.innerHTML = '';

  // Check if a staff is selected
  if (!bookingState.selectedStaff) {
    animateContainer(false, '#what');
    return;
  }

  // Filter services for the selected staff
  const staffServices = bookingState.services.flatMap((group) =>
    group.services.filter((service) =>
      service.resourceServices.some(
        (rs) => rs.resourceId === bookingState.selectedStaff.resourceId
      )
    )
  );

  if (staffServices.length === 0) {
    // No services available for this staff
    animateContainer(false, '#what');
    return;
  }

  staffServices.forEach((service) => {
    const row = createServiceRow(service);
    serviceContainer.appendChild(row);
  });

  // Show service section
  document.getElementById('what').classList.remove('hidden');
}

// Create service row element
function createServiceRow(service) {
  const row = document.createElement('div');
  const leftDiv = document.createElement('div');
  const rightDiv = document.createElement('div');
  const name = document.createElement('p');
  const time = document.createElement('p');
  const price = document.createElement('p');

  row.addEventListener('click', () => selectService(service, row));

  row.id = String(service.serviceId);
  name.textContent = service.name;
  time.textContent = `${service.length} min`;
  price.textContent = `${service.priceIncludingVat}kr`;

  rightDiv.classList.add('service-info');

  leftDiv.appendChild(name);
  rightDiv.appendChild(time);
  rightDiv.appendChild(price);
  row.appendChild(leftDiv);
  row.appendChild(rightDiv);

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

function displayTimeSlots(data) {
  if (!data || !data.dates || !Array.isArray(data.dates)) {
    console.error('Invalid data format:', data);
    return;
  }

  const target = document.getElementById('timeSlots');
  if (!target) return;

  target.innerHTML = '';
  const startDate = activeSchedule;
  const oneWeekForward = addDays(new Date(startDate.getTime()), 6);

  // Render time slots for each day in the week
  for (
    let i = new Date(startDate.getTime());
    i <= oneWeekForward;
    i = addDays(i, 1)
  ) {
    const container = document.createElement('div');
    container.classList.add('column');

    // Create date header
    const day = document.createElement('div');
    const dayName = document.createElement('h2');
    const dayDate = document.createElement('p');

    dayName.textContent = getDayShortName(i);
    dayDate.textContent = `${i.getDate()} ${getMonthShortName(i)}`;

    day.appendChild(dayName);
    day.appendChild(dayDate);
    container.appendChild(day);

    // Find time slots for the current date
    const dateGroup = data.dates.find((group) =>
      isSameDate(new Date(group.date), i)
    );
    if (dateGroup && dateGroup.timeSlots.length > 0) {
      dateGroup.timeSlots.forEach((slot) => {
        const slotElement = document.createElement('div');
        slotElement.classList.add('slot');

        const timeText = document.createElement('p');
        timeText.textContent = slot.startTime;

        slotElement.appendChild(timeText);
        slotElement.addEventListener('click', () =>
          selectTimeSlot(dateGroup.date, slot)
        );

        container.appendChild(slotElement);
      });
    } else {
      const noSlotsElement = document.createElement('p');
      noSlotsElement.textContent = 'Inga lediga tider';
      noSlotsElement.style.fontSize = '10px';
      container.appendChild(noSlotsElement);
    }

    target.appendChild(container);
  }

  // Update the schedule infobar with the current week's dates
  populateScheduleDate();
}

function selectTimeSlot(date, slot) {
  // Remove active state from all slot elements
  document.querySelectorAll('#timeSlots .slot').forEach((el) => {
    el.classList.remove('activeSlot');
  });

  // Add active state to selected slot
  event.target.classList.add('activeSlot');

  // Store selected date and time slot
  bookingState.selectedDate = date;
  bookingState.selectedTimeSlot = slot;

  // Proceed to next step
  showConfirmationForm();
}

function populateScheduleDate() {
  const scheduleInfobar = document.getElementById('scheduleInfobar');
  if (scheduleInfobar) {
    scheduleInfobar.innerHTML = '';

    const weekElement = document.createElement('h2');
    const dateElement = document.createElement('p');

    const startDate = activeSchedule;
    const oneWeekForward = addDays(new Date(startDate.getTime()), 6);

    weekElement.textContent = `Vecka ${getWeekNumber(startDate)}`;
    dateElement.textContent = `${startDate.getDate()} ${getMonthShortName(
      startDate
    )} - ${oneWeekForward.getDate()} ${getMonthShortName(oneWeekForward)}`;

    scheduleInfobar.appendChild(weekElement);
    scheduleInfobar.appendChild(dateElement);
  }
}

function getPreviousMonday(date) {
  const day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  return new Date(date.setDate(diff));
}

function scheduleArrowClick(type) {
  if (type === 'forward') {
    activeSchedule = addDays(activeSchedule, 7);
  } else if (type === 'backward') {
    activeSchedule = addDays(activeSchedule, -7);
  }

  // Fetch and display time slots for the new week
  fetchTimeSlots();
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
  const container = document.querySelector('.content');
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

function toggleActiveState(selector, className, targetElement) {
  document.querySelectorAll(selector).forEach((el) => {
    el.classList.remove(className);
  });
  if (targetElement) {
    targetElement.classList.add(className);
  }
}

// Staff selection handler
function selectStaff(staff, selectedElement) {
  toggleActiveState('#staffButtons > div', 'activeRing', selectedElement);

  if (bookingState.selectedStaff?.resourceId === staff.resourceId) {
    bookingState.selectedStaff = null;
    animateContainer(false, '#what');
    return;
  }

  bookingState.selectedStaff = staff;
  populateServiceContainer();
  animateContainer(true, '#what');
  smoothScrollTo('what');
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
  const when = document.getElementById('when');
  if (when) {
    // Ensure the section is visible
    when.classList.remove('hidden');

    // Animate time section
    animateContainer(true, '#when');
    smoothScrollTo('when');
  }
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

window['scheduleArrowClick'] = scheduleArrowClick;

// npx http-server
// node proxy.js
