import {
  google,
  outlook,
  office365,
  yahoo,
  ics,
} from 'https://cdn.skypack.dev/calendar-link';
import { smoothScrollTo } from './smoothScroll.js';
import {
  getDayShortName,
  getMonthShortName,
  addDays,
  getWeekNumber,
  isSameDate,
  animateContainer,
} from './utils.js';

console.log('Booking system loaded');

let isServicesLoaded = false;
let activeSchedule = getPreviousMonday(new Date()); // Start with the previous Monday

// Configuration management
const CONFIG = {
  development: {
    baseUrl: 'http://localhost:8888', // Netlify dev server port
    onlineBookingUrlName: 'looksbooks',
  },
  production: {
    baseUrl: '', // Empty for production (will use relative paths)
    onlineBookingUrlName: 'looksbooks',
  },
};

function getConfig() {
  return window.location.hostname === 'localhost'
    ? CONFIG.development
    : CONFIG.production;
}

const defaultStaffList = [
  { resourceId: 'emma', name: 'Emma' },
  { resourceId: 'petra', name: 'Petra' },
  { resourceId: 'fadi', name: 'Fadi' },
  { resourceId: 'hannah', name: 'Hannah' },
  { resourceId: 'simon', name: 'Simon' },
  { resourceId: 'olivia', name: 'Olivia' },
  { resourceId: 'meja', name: 'Meja' },
  { resourceId: 'charlotte', name: 'Charlotte' },
];

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

function renderPlaceholderStaff() {
  const staffContainer = document.getElementById('resourceContainer');
  if (!staffContainer) return;
  staffContainer.innerHTML = '';

  defaultStaffList.forEach((staff) => {
    const container = createStaffButton(staff);
    // (Optionally, add a disabled look)
    container.classList.add('disabled');
    staffContainer.appendChild(container);
  });
}

// Fetch and initialize services
async function fetchServices() {
  const cfg = getConfig();
  console.log('Fetching services from:', `${cfg.baseUrl}/services`);
  try {
    const response = await fetch(`${cfg.baseUrl}/services`);
    const data = await response.json();
    console.log('Services received:', data);
    bookingState.services = data.serviceGroups;
    isServicesLoaded = true;
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
  img.src = '/assets/img/profile/Charlotte.jpg';
  img.onerror = () => (img.src = '/assets/img/profile/default.jpg');

  const textContainer = document.createElement('div');
  const name = document.createElement('h2');
  name.textContent = 'Charlotte';

  const title = document.createElement('p');
  title.classList.add('muted');
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
  img.src = `/assets/img/profile/${staff.name || 'default'}.jpg`;
  img.onerror = () => (img.src = './assets/img/profile/default.jpg');

  const textContainer = document.createElement('div');
  const name = document.createElement('h2');
  name.textContent = staff.name;

  const title = document.createElement('p');
  title.classList.add('muted');
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

  // Show service section after content is populated
  setTimeout(() => {
    animateContainer(true, '#what');
    smoothScrollTo('what');
  }, 10); // Small delay to ensure DOM is updated
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
  name.style.fontWeight = 'bold';
  name.style.marginRight = '28px';
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
  if (!bookingState.selectedStaff || !bookingState.selectedService) {
    console.error('No staff or service selected');
    return;
  }

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
  if (!target) {
    console.error('Time slots container not found');
    return;
  }

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
        slotElement.addEventListener('click', (evt) =>
          selectTimeSlot(dateGroup.date, slot, evt.currentTarget)
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

function formatDateWord(dateStr) {
  const dateObj = new Date(dateStr);
  // Use toLocaleDateString with Swedish locale:
  return dateObj.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' });
}

function selectTimeSlot(date, slot, target) {
  // Remove active state from all slot elements
  document.querySelectorAll('#timeSlots .slot').forEach((el) => {
    el.classList.remove('activeSlot');
  });

  // Add active state to the selected slot
  target.classList.add('activeSlot');

  // Store selected date and time slot
  bookingState.selectedDate = date;
  bookingState.selectedTimeSlot = slot;

  // Format the date in words (e.g., "20 februari")
  const formattedDate = formatDateWord(date);

  // Update booking summary content
  const summaryHtml = `
    <h2>${bookingState.selectedService.name} hos ${bookingState.selectedStaff.name}</h2>
    <p>${formattedDate}, ${slot.startTime} | ${bookingState.selectedService.length} min / ${bookingState.selectedService.priceIncludingVat} kr</p>
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

// Phone form submission handler
async function handlePhoneFormSubmit(e) {
  e.preventDefault();
  const cfg = getConfig();
  let phoneNumber = document.getElementById('customerPhone').value.trim();

  // Validate the phone number: it must start with "0" or "46"
  const validFormat = /^(46|0|\+46)/.test(phoneNumber); // Allow +46
  if (!validFormat) {
    // Do not proceed if the format is invalid
    return;
  }

  // If number starts with "0", convert to country code format "46"
  if (phoneNumber.startsWith('0')) {
    phoneNumber = '46' + phoneNumber.slice(1);
  }

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

    if (!reserveResponse.ok) {
      const errorData = await reserveResponse.json();
      throw new Error(errorData.error?.error?.message || 'Reservation failed');
    }

    const reserveData = await reserveResponse.json();
    bookingState.appointmentId = reserveData.appointmentId;

    // Hide phone form and show final booking form
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
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupFinalBookingListeners();
  const customerPhoneInput = document.getElementById('customerPhone');
  const newButton = document.querySelector('#phoneForm .new-button');

  customerPhoneInput.addEventListener('input', () => {
    const value = customerPhoneInput.value.trim();
    let isValid = false;

    if (value.startsWith('0')) {
      // Must be exactly 10 digits when starting with 0
      isValid = /^\d{10}$/.test(value);
    } else if (value.startsWith('46')) {
      // Must be exactly 11 digits when starting with 46
      isValid = /^\d{11}$/.test(value);
    }

    // Update the button state and opacity based on validity
    newButton.disabled = !isValid;
    newButton.style.opacity = isValid ? '1' : '0.5';
  });
});

// Configure customer form based on existing customer
function configureCustomerForm(reserveData) {
  // Set phone number value in the pre-defined input
  const phoneFinalInput = document.getElementById('customerPhoneFinal');
  if (phoneFinalInput) {
    phoneFinalInput.value = reserveData.customerPhoneNumber;
  }

  const nameGroup = document.querySelector('.name-group');
  const emailGroup = document.querySelector('.email-group');

  if (reserveData.maskedCustomers?.[0]) {
    const customer = reserveData.maskedCustomers[0];
    nameGroup.style.display = 'block';
    emailGroup.style.display = 'block';

    document.getElementById('customerName').value = customer.maskedName;
    document.getElementById('customerEmail').value = customer.maskedEmail;
    document.getElementById('customerName').readOnly = true;
    document.getElementById('customerEmail').readOnly = true;

    bookingState.customerInfo = {
      exists: true,
      customerId: customer.id,
    };
  } else {
    nameGroup.style.display = 'block';
    emailGroup.style.display = 'block';
    document.getElementById('customerName').readOnly = false;
    document.getElementById('customerEmail').readOnly = false;

    bookingState.customerInfo = {
      exists: false,
    };
  }

  // Show the final booking form
  document.getElementById('finalBookingForm').style.display = 'flex';

  // Check if required fields are set so that the "Boka" button becomes active.
  checkFinalBookingForm();
}

// Validate final booking form: name & phone must be present.
function checkFinalBookingForm() {
  const nameVal = document.getElementById('customerName').value.trim();
  const phoneVal = document.getElementById('customerPhoneFinal').value.trim();
  const bookButton = document.getElementById('bookButton');

  // Enable the button if both name and phone have values.
  bookButton.disabled = !(nameVal && phoneVal);
}

// Set up event listeners for the final booking form.
function setupFinalBookingListeners() {
  const nameInput = document.getElementById('customerName');
  nameInput.addEventListener('input', checkFinalBookingForm);
}

// Show success page
// Inside your showSuccessPage function after the summary has been set...
async function showSuccessPage(confirmData) {
  // Hide the summary section (if needed)
  animateContainer(false, '#summary');

  // Build the summary content similar to the booking summary
  const formattedDate = formatDateWord(bookingState.selectedDate);
  const summaryHtml = `
    <h2>${bookingState.selectedService.name} hos ${bookingState.selectedStaff.name}</h2>
    <p>${formattedDate}, ${bookingState.selectedTimeSlot.startTime} | ${bookingState.selectedService.length} min / ${bookingState.selectedService.priceIncludingVat} kr</p>
  `;

  // Set the summary in the new container
  document.getElementById('completeSummary').innerHTML = summaryHtml;

  // Show complete section with animation
  animateContainer(true, '#complete');

  // Scroll to complete section
  requestAnimationFrame(() => {
    smoothScrollTo('complete');
  });

  // Now set up the calendar button
  // Create a calendar event based on the booking details. Adjust start/duration as needed.
  const calendarEvent = {
    title: `${bookingState.selectedService.name} hos ${bookingState.selectedStaff.name}`,
    start: `${bookingState.selectedDate} ${bookingState.selectedTimeSlot.startTime}:00 +0100`,
    duration: [bookingState.selectedService.length, 'minute'],
    description: 'Bokningsbekräftelse',
    location: 'Köpmangatan 3, 722 15 Västerås, Sweden',
  };

  const calendarButton = document.getElementById('calendarButton');
  // Clear any previous listeners to avoid duplicates.
  calendarButton.replaceWith(calendarButton.cloneNode(true));
  document.getElementById('calendarButton').addEventListener('click', () => {
    // Generate the ICS link, you can change the provider as needed
    const calendarUrl = ics(calendarEvent);
    // Open the link in a new tab
    window.open(calendarUrl, '_blank');
  });
}

// Final booking confirmation handler
async function handleFinalBookingSubmit(e) {
  e.preventDefault();
  const cfg = getConfig();

  // Get the phone number from the finalBookingForm input
  let finalPhoneNumber = document
    .getElementById('customerPhoneFinal')
    .value.trim();
  // If phone starts with "0", convert to international format by replacing with "46"
  if (finalPhoneNumber.startsWith('0')) {
    finalPhoneNumber = '46' + finalPhoneNumber.slice(1);
  }

  // Base confirm data
  const confirmData = {
    onlineBookingUrlName: cfg.onlineBookingUrlName,
    appointmentId: bookingState.appointmentId,
    customerPhoneNumber: finalPhoneNumber,
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

function selectStaff(staff) {
  // If services haven't loaded, do nothing
  if (!isServicesLoaded) return;

  // Check if we're deselecting the current staff first
  if (bookingState.selectedStaff?.resourceId === staff.resourceId) {
    // Deselecting current staff
    bookingState.selectedStaff = null;
    bookingState.selectedService = null;

    // Remove active state and hide sections
    document.getElementById(staff.resourceId).classList.remove('activeRing');
    animateContainer(false, '#what');
    animateContainer(false, '#when');
    animateContainer(false, '#summary');
    animateContainer(false, '#complete');

    return;
  }

  // Clear active state from all staff buttons
  document.querySelectorAll('.staff-button').forEach((btn) => {
    btn.classList.remove('activeRing');
  });

  // Selecting new staff
  document.getElementById(staff.resourceId).classList.add('activeRing');
  bookingState.selectedStaff = staff;

  // Hide time and summary sections
  animateContainer(false, '#when');
  animateContainer(false, '#summary');

  // Show and populate service section
  populateServiceContainer();
  animateContainer(true, '#what');

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
  animateContainer(false, '#summary');
  smoothScrollTo('when');
}

// Event listeners
function setupEventListeners() {
  document
    .getElementById('phoneForm')
    .addEventListener('submit', handlePhoneFormSubmit);

  document
    .getElementById('finalBookingForm')
    .addEventListener('submit', handleFinalBookingSubmit);

  document.getElementById('customerName').addEventListener('input', () => {
    const nameValue = document.getElementById('customerName').value.trim();
    const phoneValue = document
      .getElementById('customerPhoneFinal')
      .value.trim();
    const bookButton = document.getElementById('bookButton');
    bookButton.disabled = !(nameValue && phoneValue);
  });
}

// Initialize the booking system
export function initBookingSystem() {
  renderPlaceholderStaff(); // Render immediately using default data
  setupEventListeners();
  fetchServices(); // Fetch actual data asynchronously
}

window['scheduleArrowClick'] = scheduleArrowClick;

// npx http-server
// node proxy.js
