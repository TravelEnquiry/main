// =============================
// CONFIG
// =============================

const API_URL = "get_enquiries.php"; // PHP backend for MySQL

// =============================
// GLOBAL STATE
// =============================
let allEnquiries = [];
let currentEnquiry = null;

// =============================
// DOM ELEMENTS
// =============================
const enquiriesList = document.getElementById("enquiriesList");
const noResults = document.getElementById("noResults");
const modal = document.getElementById("enquiryModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");

// =============================
// FETCH ENQUIRIES
// =============================
async function fetchEnquiries() {
  enquiriesList.innerHTML = `
    <div class="p-6 text-center text-gray-500">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      Loading enquiries...
    </div>
  `;

  try {
    const res = await fetch(API_URL);
    const result = await res.json();

    if (result.success) {
      allEnquiries = result.data;
      renderEnquiries(allEnquiries);
      renderStats(allEnquiries);
    } else {
      throw new Error(result.message || 'Failed to fetch enquiries');
    }
  } catch (err) {
    console.error("Error fetching enquiries:", err);
    enquiriesList.innerHTML = `<div class="p-6 text-center text-red-500">Failed to load enquiries: ${err.message}</div>`;
  }
}

// =============================
// RENDER STATS
// =============================
function renderStats(data) {
  const flightCount = data.filter(e => e.enquiryType === "flight").length;
  const hotelCount = data.filter(e => e.enquiryType === "hotel").length;
  const packageCount = data.filter(e => e.enquiryType === "package").length;

  document.getElementById("flightCount").textContent = flightCount;
  document.getElementById("hotelCount").textContent = hotelCount;
  document.getElementById("packageCount").textContent = packageCount;
  document.getElementById("totalCount").textContent = data.length;
}

// =============================
// RENDER ENQUIRIES LIST
// =============================
function renderEnquiries(data) {
  enquiriesList.innerHTML = "";

  if (!data.length) {
    noResults.classList.remove("hidden");
    return;
  } else {
    noResults.classList.add("hidden");
  }

  data.forEach(enquiry => {
    const div = document.createElement("div");
    div.className = "p-6 hover:bg-gray-50 cursor-pointer border-b border-gray-200";

    // Get type icon
    let typeIcon = '✈️';
    let typeName = 'Flight';
    if (enquiry.enquiryType === 'hotel') {
      typeIcon = '🏨';
      typeName = 'Hotel';
    } else if (enquiry.enquiryType === 'package') {
      typeIcon = '🎒';
      typeName = 'Package';
    }

    div.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl">${typeIcon}</span>
            <h4 class="text-lg font-semibold text-gray-800">${enquiry.enquiryName || "Unnamed"}</h4>
            <span class="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">${typeName}</span>
          </div>
          <p class="text-sm text-gray-600">📧 ${enquiry.email || ""} | 📞 ${enquiry.contactNumber || ""}</p>
          <p class="text-sm text-gray-500 mt-1">👥 ${enquiry.numTotalPax || 0} passengers | 🌆 ${enquiry.city || "N/A"}</p>
        </div>
        <div class="text-sm text-gray-500">${formatDateTime(enquiry.created_at)}</div>
      </div>
    `;
    div.addEventListener("click", () => openModal(enquiry));
    enquiriesList.appendChild(div);
  });
}

// Helper function to format date/time
function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// =============================
// OPEN MODAL
// =============================
function openModal(enquiry) {
  currentEnquiry = enquiry;
  modalTitle.textContent = enquiry.enquiryName || "Enquiry Details";

  let detailsHTML = `
    <div class="space-y-3">
      <div class="bg-gray-50 p-4 rounded-lg">
        <h5 class="font-semibold text-gray-700 mb-2">👤 Customer Information</h5>
        <p><strong>Name:</strong> ${enquiry.enquiryName || "-"}</p>
        <p><strong>Email:</strong> ${enquiry.email || "-"}</p>
        <p><strong>Contact:</strong> ${enquiry.contactNumber || "-"}</p>
        <p><strong>City:</strong> ${enquiry.city || "-"}</p>
        <p><strong>Address:</strong> ${enquiry.address || "-"}</p>
        <p><strong>Channel:</strong> ${enquiry.channel || "-"}</p>
        ${enquiry.reference ? `<p><strong>Reference:</strong> ${enquiry.reference}</p>` : ''}
      </div>

      <div class="bg-gray-50 p-4 rounded-lg">
        <h5 class="font-semibold text-gray-700 mb-2">👥 Passengers</h5>
        <p><strong>Adults:</strong> ${enquiry.numAdults || 0} | <strong>Kids:</strong> ${enquiry.numKids || 0} | <strong>Infants:</strong> ${enquiry.numInfants || 0}</p>
        <p><strong>Total:</strong> ${enquiry.numTotalPax || 0} passengers</p>
      </div>
  `;

  // Add type-specific details
  if (enquiry.enquiryType === 'flight') {
    detailsHTML += `
      <div class="bg-blue-50 p-4 rounded-lg">
        <h5 class="font-semibold text-blue-700 mb-2">✈️ Flight Details</h5>
        <p><strong>Trip Type:</strong> ${enquiry.flightTripType || "-"}</p>
        <p><strong>From:</strong> ${enquiry.flightDepartureCity || "-"} → <strong>To:</strong> ${enquiry.flightArrivalCity || "-"}</p>
        <p><strong>Departure:</strong> ${enquiry.flightDepartureDate || "-"}</p>
        ${enquiry.flightReturnDate ? `<p><strong>Return:</strong> ${enquiry.flightReturnDate}</p>` : ''}
        <p><strong>Airline:</strong> ${enquiry.flightPreferredAirline || "Any"}</p>
        <p><strong>Class:</strong> ${enquiry.flightClass || "-"}</p>
        ${enquiry.notes ? `<p class="mt-2"><strong>Notes:</strong> ${enquiry.notes}</p>` : ''}
      </div>
    `;
  } else if (enquiry.enquiryType === 'hotel') {
    detailsHTML += `
      <div class="bg-green-50 p-4 rounded-lg">
        <h5 class="font-semibold text-green-700 mb-2">🏨 Hotel Details</h5>
        <p><strong>Destination:</strong> ${enquiry.hotelDestination || "-"}</p>
        <p><strong>Check-in:</strong> ${enquiry.hotelCheckinDate || "-"}</p>
        <p><strong>Check-out:</strong> ${enquiry.hotelCheckoutDate || "-"}</p>
        <p><strong>Rooms:</strong> ${enquiry.hotelNumRooms || "-"}</p>
        <p><strong>Room Type:</strong> ${enquiry.hotelRoomType || "-"}</p>
        <p><strong>Star Rating:</strong> ${enquiry.hotelStarRating || "Any"}</p>
        ${enquiry.notes ? `<p class="mt-2"><strong>Notes:</strong> ${enquiry.notes}</p>` : ''}
      </div>
    `;
  } else if (enquiry.enquiryType === 'package') {
    detailsHTML += `
      <div class="bg-purple-50 p-4 rounded-lg">
        <h5 class="font-semibold text-purple-700 mb-2">🎒 Package Details</h5>
        <p><strong>Destination:</strong> ${enquiry.packageDestination || "-"}</p>
        <p><strong>Departure:</strong> ${enquiry.packageDepartureDate || "-"}</p>
        <p><strong>Return:</strong> ${enquiry.packageReturnDate || "-"}</p>
        ${enquiry.packageBudget ? `<p><strong>Budget:</strong> INR ${enquiry.packageBudget}</p>` : ''}
        ${enquiry.packageInterests ? `<p><strong>Interests:</strong> ${enquiry.packageInterests}</p>` : ''}
        ${enquiry.notes ? `<p class="mt-2"><strong>Notes:</strong> ${enquiry.notes}</p>` : ''}
      </div>
    `;
  }

  detailsHTML += `
      <div class="bg-gray-50 p-4 rounded-lg">
        <p class="text-sm text-gray-600"><strong>Submitted:</strong> ${formatDateTime(enquiry.created_at)}</p>
      </div>
    </div>
  `;

  modalContent.innerHTML = detailsHTML;

  // Show modal
  modal.classList.remove("hidden");
}

// Close modal function
function closeModal() {
  modal.classList.add("hidden");
  currentEnquiry = null;
}

// Add event listener for close button
document.getElementById("closeModal")?.addEventListener("click", closeModal);

// Close modal when clicking outside
modal?.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});


document.getElementById("closeModalBtn").addEventListener("click", () => {
  modal.classList.add("hidden");
});

// =============================
// REFRESH BUTTON
// =============================
document.getElementById("refreshBtn").addEventListener("click", fetchEnquiries);

// =============================
// LOGOUT BUTTON
// =============================
document.getElementById("logoutButton")?.addEventListener("click", () => {
  if (confirm('Are you sure you want to logout?')) {
    sessionStorage.clear();
    window.location.href = 'login.html';
  }
});

// =============================
// INIT
// =============================
fetchEnquiries();
