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
  Charlotte: 'Hudterapeut & hudcoach',
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
  const staffContainer = document.getElementById('resourceContainer');
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

  // Add regular staff
  staffList.forEach((staff) => {
    const container = createStaffButton(staff);
    staffContainer.appendChild(container);
  });

  // Add Charlotte manually with Google redirect
  const charlotteContainer = document.createElement('div');
  charlotteContainer.classList.add('staff-button');
  charlotteContainer.addEventListener('click', () =>
    window.open(
      'https://bokadirekt.se/places/charlottes-hudv%C3%A5rd-61742',
      '_blank'
    )
  );

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('staff-image-container');

  const img = document.createElement('img');
  img.src = '../assets/img/profile/Charlotte.jpg';
  img.onerror = () => (img.src = '../assets/img/profile/default.jpg');

  const textContainer = document.createElement('div');
  textContainer.classList.add('staff-text-container');

  const name = document.createElement('h2');
  name.textContent = 'Charlotte';

  const title = document.createElement('p');
  title.textContent = staffTitles['Charlotte']; // Will show "Hudterapeut & hudcoach"

  imageContainer.appendChild(img);
  textContainer.appendChild(name);
  textContainer.appendChild(title);
  charlotteContainer.appendChild(imageContainer);
  charlotteContainer.appendChild(textContainer);

  staffContainer.appendChild(charlotteContainer);
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

  const textContainer = document.createElement('div');
  textContainer.classList.add('staff-text-container');

  const name = document.createElement('h2');
  name.textContent = staff.name;

  const title = document.createElement('p');
  title.textContent = staffTitles[staff.name] || 'Hair Dresser';

  imageContainer.appendChild(img);
  textContainer.appendChild(name);
  textContainer.appendChild(title);
  container.appendChild(imageContainer);
  container.appendChild(textContainer);

  return container;
}

// Populate service container for selected staff
function populateServiceContainer() {
  const serviceContainer = document.getElementById('serviceContainer');
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
  price.textContent = `${service.priceIncludingVat} kr`;

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
    day.classList.add('date-header'); // Add this line
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

    // Create slots container
    const slotsContainer = document.createElement('div');
    slotsContainer.classList.add('slots-wrapper');

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

        slotsContainer.appendChild(slotElement);
      });
    } else {
      day.classList.add('no-slots-available');
    }

    container.appendChild(slotsContainer);
    target.appendChild(container);
  }

  // Update the schedule infobar with the current week's dates
  populateScheduleDate();

  // Re-calculate and update the container height
  const whenSection = document.getElementById('when');
  if (whenSection && !whenSection.classList.contains('hidden')) {
    animateContainer(true, '#when');
  }
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

  // Update booking summary content
  const summaryHtml = `
    <h2>${bookingState.selectedService.name} av ${bookingState.selectedStaff.name}</h2>
    <p>${date}, ${slot.startTime} | [DURATION] / ${bookingState.selectedService.priceIncludingVat} kr</p>
  `;
  document.getElementById('bookingSummary').innerHTML = summaryHtml;

  // Show summary section with animation
  animateContainer(true, '#summary');
  smoothScrollTo('summary');
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
  smoothScrollTo('when');
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
    <p><strong>Price:</strong> ${bookingState.selectedService.priceIncludingVat} kr</p>
  `;
  document.getElementById('bookingSummary').innerHTML = summaryHtml;

  // Show final booking form directly, remove phone form step
  document.getElementById('phoneForm').style.display = 'none';
  document.getElementById('finalBookingForm').style.display = 'block';

  // Show all input fields
  document.querySelector('.name-group').style.display = 'block';
  document.querySelector('.email-group').style.display = 'block';

  // Add phone field to final form
  const phoneGroup = document.createElement('div');
  phoneGroup.classList.add('form-group');
  phoneGroup.innerHTML = `
    <label for="customerPhone">Telefonnummer:</label>
    <input type="tel" id="customerPhone" required placeholder="46XXXXXXXXX" />
  `;

  // Insert phone field at the beginning of the form
  const finalForm = document.getElementById('finalBookingForm');
  finalForm.insertBefore(phoneGroup, finalForm.firstChild);
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

    // Check if there's a recognized customer
    if (reserveData.maskedCustomers?.[0]) {
      const customer = reserveData.maskedCustomers[0];
      const maskedInfoHtml = `
        <div class="masked-info">
          <p>Välkommen tillbaka!</p>
          <p><strong>Namn:</strong> ${customer.maskedName}</p>
          <p><strong>E-post:</strong> ${customer.maskedEmail}</p>
        </div>
      `;

      // Update summary box with masked info
      const summaryBox = document.getElementById('bookingSummary');
      summaryBox.insertAdjacentHTML('beforeend', maskedInfoHtml);
    }

    // Show final booking form
    document.getElementById('phoneForm').style.display = 'none';
    document.getElementById('finalBookingForm').style.display = 'block';

    // Configure customer form and recalculate height
    configureCustomerForm(reserveData);

    // Wait for DOM updates and recalculate height
    requestAnimationFrame(() => {
      animateContainer(true, '#summary');
    });
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
  // Hide the summary section
  animateContainer(false, '#summary');

  // Show and populate the complete section
  const successSummary = document.getElementById('successSummary');
  successSummary.innerHTML = `
    <div class="success-summary">
      <p><strong>Frisör:</strong> ${bookingState.selectedStaff.name}</p>
      <p><strong>Behandling:</strong> ${bookingState.selectedService.name}</p>
      <p><strong>Datum:</strong> ${bookingState.selectedDate}</p>
      <p><strong>Tid:</strong> ${bookingState.selectedTimeSlot.startTime}</p>
      <p><strong>Pris:</strong> ${
        bookingState.selectedService.priceIncludingVat
      } kr</p>
      <hr>
      <p><strong>Telefon:</strong> ${confirmData.customerPhoneNumber}</p>
      ${
        !bookingState.customerInfo.exists
          ? `<p><strong>Namn:</strong> ${confirmData.customerName}</p>
           <p><strong>Email:</strong> ${confirmData.customerEmail}</p>`
          : ''
      }
      ${
        confirmData.notes
          ? `<p><strong>Meddelande:</strong> ${confirmData.notes}</p>`
          : ''
      }
      <p class="success-message">En bokningsbekräftelse har skickats till din e-post</p>
    </div>
  `;

  // Show complete section with animation
  animateContainer(true, '#complete');

  // Scroll to complete section
  requestAnimationFrame(() => {
    smoothScrollTo('complete');
  });
}

// Final booking confirmation handler
async function handleFinalBookingSubmit(e) {
  e.preventDefault();
  const cfg = getConfig();

  // Base confirm data
  const confirmData = {
    onlineBookingUrlName: cfg.onlineBookingUrlName,
    appointmentId: bookingState.appointmentId,
    customerPhoneNumber: document.getElementById('customerPhone').value,
    termsAndConditionsApproved: true,
  };

  // Only add email and name for new customers
  if (!bookingState.customerInfo?.exists) {
    confirmData.customerName = document.getElementById('customerName').value;
    confirmData.customerEmail = document.getElementById('customerEmail').value;
  } else {
    // For existing customers, add their customerId
    confirmData.customerId = bookingState.customerInfo.customerId;
  }

  // Add notes if present
  const notes = document.getElementById('notes').value;
  if (notes) {
    confirmData.notes = notes;
  }

  try {
    const confirmResponse = await fetch(`${cfg.baseUrl}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(confirmData),
    });

    if (!confirmResponse.ok) {
      const errorData = await confirmResponse.json();
      throw new Error(errorData.error?.error?.message || 'Booking failed');
    }

    const confirmResponseData = await confirmResponse.json();
    await showSuccessPage(confirmResponseData);
  } catch (error) {
    console.error('Error:', error);
    alert('Error confirming booking: ' + error.message);
  }
}

// Staff selection handler
function selectStaff(staff) {
  // Clear active state from all staff buttons
  document.querySelectorAll('.staff-button').forEach((btn) => {
    btn.classList.remove('activeRing');
  });

  // Hide service and time sections with animation
  animateContainer(false, '#what');
  animateContainer(false, '#when');
  animateContainer(false, '#summary');

  if (bookingState.selectedStaff?.resourceId === staff.resourceId) {
    // Deselecting current staff
    bookingState.selectedStaff = null;
    bookingState.selectedService = null;

    return;
  }

  // Selecting new staff
  document.getElementById(staff.resourceId).classList.add('activeRing');
  bookingState.selectedStaff = staff;

  // Show service section
  populateServiceContainer();
  animateContainer(true, '#what');
  animateContainer(false, '#when');

  smoothScrollTo('what');
}

function selectService(service, selectedElement) {
  // Remove active state from all service elements
  document.querySelectorAll('#serviceContainer > div').forEach((el) => {
    el.classList.remove('activeResourceOption');
  });

  if (bookingState.selectedService?.serviceId === service.serviceId) {
    // Deselecting current service
    bookingState.selectedService = null;
    selectedElement.classList.remove('activeResourceOption');
    animateContainer(false, '#when');
    return;
  }

  // Selecting new service
  selectedElement.classList.add('activeResourceOption');
  bookingState.selectedService = service;

  // Fetch and display time slots
  fetchTimeSlots();
  animateContainer(true, '#when');
  smoothScrollTo('when');
}

// Terms checkbox handler
function handleTermsCheckbox(e) {
  const bookButton = document.getElementById('bookButton');
  const nameInput = document.getElementById('customerName');
  const emailInput = document.getElementById('customerEmail');
  const phoneInput = document.getElementById('customerPhone');

  // Check if all required fields are filled
  const hasAllFields = nameInput.value && emailInput.value && phoneInput.value;
  bookButton.disabled = !(e.target.checked && hasAllFields);
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
