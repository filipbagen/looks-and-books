// let services = [];
// let selectedStaff = null;
// let selectedService = null;
// let selectedDate = null;
// let selectedTimeSlot = null;
// let reservedAppointmentId = null;

// // Fetch initial services data
// async function fetchServices() {
//   try {
//     const response = await fetch(
//       '/api/v1/open/calendar/onlineBooking/getServices?onlineBookingUrlName=looksbooks'
//     );
//     const data = await response.json();
//     services = data.serviceGroups;
//     displayStaff();
//   } catch (error) {
//     console.error('Error fetching services:', error);
//   }
// }

// // Display staff members
// function displayStaff() {
//   const staffContainer = document.getElementById('staffButtons');
//   const uniqueStaff = new Set();

//   services.forEach((group) => {
//     group.services.forEach((service) => {
//       service.resourceServices.forEach((staff) => {
//         if (!uniqueStaff.has(staff.resourceId)) {
//           uniqueStaff.add(staff.resourceId);
//           const button = createButton(staff.name, () => selectStaff(staff));
//           staffContainer.appendChild(button);
//         }
//       });
//     });
//   });
// }

// // Display services for selected staff
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

// // Fetch available time slots
// async function fetchTimeSlots() {
//   const dateStart = new Date().toISOString().split('T')[0];
//   const dateEnd = new Date();
//   dateEnd.setDate(dateEnd.getDate() + 30);

//   try {
//     const response = await fetch(
//       `/api/v1/open/calendar/onlineBooking/getAvailableTimeSlots?` +
//         `dateStart=${dateStart}&dateStop=${
//           dateEnd.toISOString().split('T')[0]
//         }&` +
//         `onlineBookingUrlName=looksbooks&` +
//         `serviceIds=${selectedService.serviceId}&` +
//         `resourceIds=${selectedStaff.resourceId}`
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     displayTimeSlots(data);
//   } catch (error) {
//     console.error('Error fetching time slots:', error);
//   }
// }

// // Display available time slots
// function displayTimeSlots(data) {
//   if (!data || !data.dates || !Array.isArray(data.dates)) {
//     console.error('Invalid data format:', data);
//     document.getElementById('timeSlots').innerHTML =
//       '<p>No available slots found.</p>';
//     return;
//   }

//   const container = document.getElementById('timeSlots');
//   container.innerHTML = '';

//   data.dates.forEach((dateGroup) => {
//     const dateHeader = document.createElement('h3');
//     dateHeader.textContent = `Date: ${dateGroup.date}`;
//     container.appendChild(dateHeader);

//     dateGroup.timeSlots.forEach((slot) => {
//       const timeButton = createButton(slot.startTime, () => {
//         selectedDate = dateGroup.date;
//         selectedTimeSlot = slot;
//         showConfirmationForm();
//       });
//       container.appendChild(timeButton);
//     });
//   });

//   document.getElementById('timeSection').classList.remove('hidden');
// }

// // Show confirmation form with booking summary
// function showConfirmationForm() {
//   // Show the confirmation section
//   const confirmationSection = document.getElementById('confirmationSection');
//   confirmationSection.classList.remove('hidden');

//   // Update booking summary
//   const summaryDiv = document.getElementById('bookingSummary');
//   summaryDiv.innerHTML = `
//     <h3>Booking Details:</h3>
//     <p>Staff: ${selectedStaff.name}</p>
//     <p>Service: ${selectedService.name} (${selectedService.length}min)</p>
//     <p>Date: ${selectedDate}</p>
//     <p>Time: ${selectedTimeSlot.startTime}</p>
//   `;

//   // Add form submission handler
//   const form = document.getElementById('confirmationForm');
//   form.onsubmit = handleFormSubmission;
// }

// // Update the handleFormSubmission function to get phone number earlier
// async function handleFormSubmission(event) {
//   event.preventDefault();

//   try {
//     // First, reserve the time slot
//     await reserveTimeSlot();

//     if (reservedAppointmentId) {
//       const customerName = document.getElementById('customerName').value;
//       const customerEmail = document.getElementById('customerEmail').value;
//       const customerPhone = document.getElementById('customerPhone').value;

//       // Then confirm the booking
//       await confirmBooking(customerName, customerEmail, customerPhone);
//     }
//   } catch (error) {
//     console.error('Booking failed:', error);
//     alert(`Booking failed: ${error.message}`);
//   }
// }

// async function reserveTimeSlot() {
//   // Format phone number to match required format
//   const phoneNumber = document.getElementById('customerPhone').value;
//   const formattedPhone = phoneNumber.startsWith('+46')
//     ? phoneNumber
//     : `+46${phoneNumber.replace(/^0/, '')}`;

//   const reservePayload = {
//     onlineBookingUrlName: 'looksbooks',
//     resourceIds: [selectedStaff.resourceId],
//     serviceIds: [selectedService.serviceId],
//     startDate: selectedDate,
//     startTime: selectedTimeSlot.startTime,
//     customerPhoneNumber: formattedPhone
//   };

//   console.log('Starting reservation with payload:', reservePayload);

//   try {
//     const response = await fetch(
//       '/api/v1/open/calendar/onlineBooking/reserveTimeSlot',
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         },
//         body: JSON.stringify(reservePayload)
//       }
//     );

//     // Log full response for debugging
//     console.log('Response status:', response.status);
//     const responseText = await response.text();
//     console.log('Response body:', responseText);

//     if (!response.ok) {
//       throw new Error(`Reservation failed: ${responseText}`);
//     }

//     const data = JSON.parse(responseText);
//     console.log('Reservation successful:', data);
//     reservedAppointmentId = data.appointmentId;
//     return data;
//   } catch (error) {
//     console.error('Error during reservation:', error);
//     throw error;
//   }
// }

// async function confirmBooking(name, email, phone) {
//   const confirmPayload = {
//     onlineBookingUrlName: 'looksbooks',
//     appointmentId: reservedAppointmentId,
//     customerName: name,
//     customerEmail: email,
//     customerPhoneNumber: phone,
//   };

//   const response = await fetch(
//     '/api/v1/open/calendar/onlineBooking/confirmOnlineBooking',
//     {
//       method: 'POST',
//       headers: {
//         accept: 'application/json, text/plain, */*',
//         'content-type': 'application/json',
//         priority: 'u=1, i',
//       },
//       body: JSON.stringify(confirmPayload),
//     }
//   );

//   if (!response.ok) {
//     throw new Error(`Confirmation failed: ${response.status}`);
//   }

//   return response.json();
// }

// async function confirmBooking(name, email, phone) {
//   const confirmPayload = {
//     onlineBookingUrlName: 'looksbooks',
//     appointmentId: reservedAppointmentId,
//     notes: null,
//     customerPhoneNumber: phone,
//     customerName: name,
//     customerEmail: email,
//   };

//   const response = await fetch(
//     '/api/v1/open/calendar/onlineBooking/reserveTimeSlot',
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Accept: 'application/json',
//       },
//       credentials: 'include', // Add this
//       body: JSON.stringify(reservePayload),
//     }
//   );

//   if (!response.ok) {
//     const errorText = await response.text();
//     console.error('Confirmation failed:', {
//       status: response.status,
//       text: errorText,
//     });
//     throw new Error(`Failed to confirm booking: ${response.status}`);
//   }

//   const data = await response.json();
//   console.log('Booking confirmed:', data);
//   return data;
// }

// // Handle the booking process
// async function handleBooking(slot) {
//   try {
//     // Prepare the payload
//     const payload = {
//       onlineBookingUrlName: 'looksbooks', // Required field
//       resourceIds: [selectedStaff.resourceId], // Array with the selected staff's resource ID
//       serviceIds: [selectedService.serviceId], // Array with the selected service's ID
//       startDate: selectedDate, // Ensure the correct date format
//       startTime: slot.startTime, // Ensure the correct time format
//       customerPhoneNumber: '46123456678', // Replace with actual user input
//     };

//     console.log('Reserving slot with:', payload);

//     // Make the request via the proxy
//     const reserveResponse = await fetch(
//       '/api/v1/open/calendar/onlineBooking/reserveTimeSlot',
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       }
//     );

//     if (!reserveResponse.ok) {
//       const errorDetails = await reserveResponse.json();
//       console.error('Reserve response error details:', errorDetails);
//       throw new Error(`Reserve slot failed: ${reserveResponse.status}`);
//     }

//     const reserveData = await reserveResponse.json();
//     console.log('Slot reserved successfully:', reserveData);

//     // Extract appointmentId for confirmation
//     const { appointmentId } = reserveData;

//     // Continue to confirmation
//     alert(`Slot reserved! Appointment ID: ${appointmentId}`);
//   } catch (error) {
//     console.error('Error making booking:', error);
//   }
// }

// // Helper function to create buttons
// function createButton(text, onClick) {
//   const button = document.createElement('button');
//   button.className = 'button';
//   button.textContent = text;
//   button.onclick = onClick;
//   return button;
// }

// // Event handlers
// function selectStaff(staff) {
//   selectedStaff = staff;
//   document
//     .querySelectorAll('#staffButtons .button')
//     .forEach((btn) => btn.classList.remove('selected'));
//   event.target.classList.add('selected');
//   displayServices();
// }

// function selectService(service) {
//   selectedService = service;
//   document
//     .querySelectorAll('#serviceButtons .button')
//     .forEach((btn) => btn.classList.remove('selected'));
//   event.target.classList.add('selected');

//   // Automatically fetch time slots for the next 30 days
//   fetchTimeSlots();
// }

// // Initialize the booking system
// fetchServices();

// booking.js
function makeBooking() {
  fetch('http://localhost:3000/book', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      onlineBookingUrlName: 'looksbooks',
      resourceIds: ['289994c7-5a6f-4dc4-9860-67ddcdade8b7'],
      serviceIds: ['d623e7e6-ffd3-4040-823b-3cf35693eb74'],
      startDate: '2025-02-19',
      startTime: '16:30',
      customerPhoneNumber: '46760915563',
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
}
