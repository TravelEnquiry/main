// =============================
// CONFIG
// =============================

const API_URL = "https://sheetdb.io/api/v1/d9vgt1cl45889"; 

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
    allEnquiries = await res.json();
    renderEnquiries(allEnquiries);
    renderStats(allEnquiries);
  } catch (err) {
    console.error("Error fetching enquiries:", err);
    enquiriesList.innerHTML = `<div class="p-6 text-center text-red-500">Failed to load enquiries</div>`;
  }
}

// =============================
// RENDER STATS
// =============================
function renderStats(data) {
  const flightCount = data.filter(e => e.TripType === "Flight").length;
  const hotelCount = data.filter(e => e.HotelDestination).length;
  const packageCount = data.filter(e => e.PackageDestination).length;

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
    div.className = "p-6 hover:bg-gray-50 cursor-pointer";
    div.innerHTML = `
      <div class="flex justify-between">
        <div>
          <h4 class="text-lg font-semibold text-gray-800">${enquiry.Name || "Unnamed"}</h4>
          <p class="text-sm text-gray-600">${enquiry.Email || ""} | ${enquiry.ContactNumber || ""}</p>
        </div>
        <div class="text-sm text-gray-500">${enquiry.Timestamp || ""}</div>
      </div>
    `;
    div.addEventListener("click", () => openModal(enquiry));
    enquiriesList.appendChild(div);
  });
}

// =============================
// OPEN MODAL
// =============================
function openModal(enquiry) {
  currentEnquiry = enquiry;
  modalTitle.textContent = enquiry.Name || "Enquiry Details";

  // Basic details
  modalContent.innerHTML = `
    <div class="space-y-2">
      <p><strong>Email:</strong> ${enquiry.Email || "-"}</p>
      <p><strong>Contact:</strong> ${enquiry.ContactNumber || "-"}</p>
      <p><strong>City:</strong> ${enquiry.City || "-"}</p>
      <p><strong>Trip Type:</strong> ${enquiry.TripType || "-"}</p>
      <p><strong>From:</strong> ${enquiry.DepartureCity || "-"} → <strong>To:</strong> ${enquiry.ArrivalCity || "-"}</p>
      <p><strong>Departure:</strong> ${enquiry.DepartureDate || "-"}</p>
      <p><strong>Return:</strong> ${enquiry.ReturnDate || "-"}</p>
      <p><strong>Submitted:</strong> ${enquiry.Timestamp || "-"}</p>
    </div>

    <div id="notesSection" class="mt-6">
      <h4 class="text-md font-semibold text-gray-800 mb-2">Notes</h4>
      <ul id="notesList" class="space-y-2 text-sm text-gray-700"></ul>
      <div class="mt-3 flex space-x-2">
        <input type="text" id="newNoteInput" placeholder="Add a note..." 
               class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
        <button id="addNoteBtn" 
                class="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
          Add
        </button>
      </div>
    </div>
  `;

  // Load existing notes
  const notesList = document.getElementById("notesList");
  Object.keys(enquiry).forEach((key) => {
    if (key.toLowerCase().startsWith("notes") && enquiry[key]) {
      const li = document.createElement("li");
      li.textContent = enquiry[key];
      notesList.appendChild(li);
    }
  });

  modal.classList.remove("hidden");
}

// =============================
// ADD NOTE (delegated listener)
// =============================
document.addEventListener("click", async (e) => {
  if (e.target && e.target.id === "addNoteBtn") {
    if (!currentEnquiry) return;

    const input = document.getElementById("newNoteInput");
    const newNote = input.value.trim();
    if (!newNote) return;

    // Find next empty Notes column
    let noteIndex = 1;
    while (currentEnquiry[`Notes${noteIndex}`]) {
      noteIndex++;
    }
    const noteKey = `Notes${noteIndex}`;

    try {
      await fetch(`${API_URL}/Timestamp/${encodeURIComponent(currentEnquiry.Timestamp)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [{ [noteKey]: newNote }],
        }),
      });

      // Update locally
      currentEnquiry[noteKey] = newNote;
      const li = document.createElement("li");
      li.textContent = newNote;
      document.getElementById("notesList").appendChild(li);

      // Clear input
      input.value = "";
    } catch (err) {
      console.error("Error saving note:", err);
      alert("Failed to save note");
    }
  }
});

// =============================
// MODAL CLOSE
// =============================
document.getElementById("closeModal").addEventListener("click", () => {
  modal.classList.add("hidden");
});
document.getElementById("closeModalBtn").addEventListener("click", () => {
  modal.classList.add("hidden");
});

// =============================
// REFRESH BUTTON
// =============================
document.getElementById("refreshBtn").addEventListener("click", fetchEnquiries);

// =============================
// INIT
// =============================
fetchEnquiries();
