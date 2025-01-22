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
  try {
    const response = await fetch('http://localhost:3000/services');
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

// Fetch time slots using the working proxy endpoint
async function fetchTimeSlots() {
  const dateStart = new Date().toISOString().split('T')[0];
  const dateEnd = new Date();
  dateEnd.setDate(dateEnd.getDate() + 30);

  const params = new URLSearchParams({
    dateStart,
    dateStop: dateEnd.toISOString().split('T')[0],
    onlineBookingUrlName: 'looksbooks',
    serviceIds: selectedService.serviceId,
    resourceIds: selectedStaff.resourceId,
  });

  try {
    const response = await fetch(`http://localhost:3000/timeslots?${params}`);
    const data = await response.json();
    displayTimeSlots(data);
  } catch (error) {
    console.error('Error fetching time slots:', error);
  }
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

    try {
      const reserveResponse = await fetch('http://localhost:3000/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onlineBookingUrlName: 'looksbooks',
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

    const confirmData = {
      onlineBookingUrlName: 'looksbooks',
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
      const confirmResponse = await fetch('http://localhost:3000/confirm', {
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

  // Automatically fetch time slots for the next 30 days
  fetchTimeSlots();
}

// Initialize the booking system
fetchServices();
