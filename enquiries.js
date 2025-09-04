// enquiries.js

const API_URL = "https://sheetdb.io/api/v1/d9vgt1cl45889"; 

const enquiriesList = document.getElementById("enquiriesList");
const noResults = document.getElementById("noResults");

const flightCountEl = document.getElementById("flightCount");
const hotelCountEl = document.getElementById("hotelCount");
const packageCountEl = document.getElementById("packageCount");
const totalCountEl = document.getElementById("totalCount");

const refreshBtn = document.getElementById("refreshBtn");

// filters
const typeFilter = document.getElementById("typeFilter");
const statusFilter = document.getElementById("statusFilter");
const dateFilter = document.getElementById("dateFilter");
const searchInput = document.getElementById("searchInput");

// modal
const enquiryModal = document.getElementById("enquiryModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const closeModalBtn = document.getElementById("closeModalBtn");

let allEnquiries = [];

// ✅ Fetch data
async function fetchEnquiries() {
  enquiriesList.innerHTML = `
    <div class="p-6 text-center text-gray-500">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      Loading enquiries...
    </div>
  `;

  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    allEnquiries = data;
    renderEnquiries(allEnquiries);
    updateStats(allEnquiries);
  } catch (err) {
    enquiriesList.innerHTML = `<div class="p-6 text-center text-red-500">Error loading enquiries</div>`;
    console.error("Error fetching enquiries:", err);
  }
}

// ✅ Render list
function renderEnquiries(data) {
  if (!data.length) {
    enquiriesList.innerHTML = "";
    noResults.classList.remove("hidden");
    return;
  }

  noResults.classList.add("hidden");

  enquiriesList.innerHTML = data
    .map(
      (e, idx) => `
      <div class="enquiry-card p-6 hover:bg-gray-50 cursor-pointer" data-idx="${idx}">
        <div class="flex justify-between items-center">
          <div>
            <p class="font-semibold text-gray-900">${e.Name || "Unknown"}</p>
            <p class="text-sm text-gray-500">${e.Email || ""} • ${e.ContactNumber || ""}</p>
            <p class="text-xs text-gray-400">Submitted: ${e.Timestamp || ""}</p>
          </div>
          <span class="status-badge status-new">New</span>
        </div>
        <div class="mt-2 text-sm text-gray-700">
          ${
            e.TripType && e.DepartureCity && e.ArrivalCity
              ? `✈️ Flight: ${e.DepartureCity} → ${e.ArrivalCity} (${e.TripType})`
              : e.HotelDestination
              ? `🏨 Hotel: ${e.HotelDestination}`
              : e.PackageDestination
              ? `🎒 Package: ${e.PackageDestination}`
              : "General enquiry"
          }
        </div>
      </div>
    `
    )
    .join("");

  // attach click handlers for modal
  document.querySelectorAll(".enquiry-card").forEach((card) => {
    card.addEventListener("click", () => {
      const idx = card.dataset.idx;
      openModal(data[idx]);
    });
  });
}

// ✅ Stats
function updateStats(data) {
  let flights = 0,
    hotels = 0,
    packages = 0;

  data.forEach((e) => {
    if (e.TripType) flights++;
    else if (e.HotelDestination) hotels++;
    else if (e.PackageDestination) packages++;
  });

  flightCountEl.textContent = flights;
  hotelCountEl.textContent = hotels;
  packageCountEl.textContent = packages;
  totalCountEl.textContent = data.length;
}

// ✅ Modal
function openModal(enquiry) {
  modalTitle.textContent = enquiry.Name || "Enquiry Details";

  modalContent.innerHTML = `
    <div class="space-y-2">
      <p><strong>Email:</strong> ${enquiry.Email || "-"}</p>
      <p><strong>Contact:</strong> ${enquiry.ContactNumber || "-"}</p>
      <p><strong>City:</strong> ${enquiry.City || "-"}</p>
      <p><strong>Trip Type:</strong> ${enquiry.TripType || "-"}</p>
      <p><strong>From:</strong> ${enquiry.DepartureCity || "-"} → <strong>To:</strong> ${enquiry.ArrivalCity || "-"}</p>
      <p><strong>Departure:</strong> ${enquiry.DepartureDate || "-"}</p>
      <p><strong>Return:</strong> ${enquiry.ReturnDate || "-"}</p>
      <p><strong>Hotel:</strong> ${enquiry.HotelDestination || "-"}</p>
      <p><strong>Package:</strong> ${enquiry.PackageDestination || "-"}</p>
      <p><strong>Passengers:</strong> Adults ${enquiry.Adults || "0"}, Kids ${enquiry.Kids || "0"}, Infants ${enquiry.Infants || "0"}</p>
      <p><strong>Submitted:</strong> ${enquiry.Timestamp || "-"}</p>
    </div>
  `;

  enquiryModal.classList.remove("hidden");
}

closeModal.addEventListener("click", () => {
  enquiryModal.classList.add("hidden");
});
closeModalBtn.addEventListener("click", () => {
  enquiryModal.classList.add("hidden");
});

// ✅ Filters
function applyFilters() {
  let filtered = [...allEnquiries];

  const typeVal = typeFilter.value;
  const searchVal = searchInput.value.toLowerCase();

  if (typeVal === "flight") {
    filtered = filtered.filter((e) => e.TripType);
  } else if (typeVal === "hotel") {
    filtered = filtered.filter((e) => e.HotelDestination);
  } else if (typeVal === "package") {
    filtered = filtered.filter((e) => e.PackageDestination);
  }

  if (searchVal) {
    filtered = filtered.filter(
      (e) =>
        (e.Name && e.Name.toLowerCase().includes(searchVal)) ||
        (e.Email && e.Email.toLowerCase().includes(searchVal)) ||
        (e.City && e.City.toLowerCase().includes(searchVal))
    );
  }

  renderEnquiries(filtered);
  updateStats(filtered);
}

typeFilter.addEventListener("change", applyFilters);
statusFilter.addEventListener("change", applyFilters); // currently only filters visually, no API update
dateFilter.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);

refreshBtn.addEventListener("click", fetchEnquiries);

// load data on page start
fetchEnquiries();
