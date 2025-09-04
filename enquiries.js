// =============================
// CONFIG
// =============================
const API_URL = "https://sheetdb.io/api/v1/d9vgt1cl45889"; 

const enquiriesList = document.getElementById("enquiriesList");
const noResults = document.getElementById("noResults");
const modal = document.getElementById("enquiryModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const closeModalBtn = document.getElementById("closeModalBtn");

let allEnquiries = [];
let currentEnquiry = null;

// =============================
// FETCH & RENDER ENQUIRIES
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
  } catch (err) {
    console.error("Error fetching enquiries:", err);
    enquiriesList.innerHTML = `<div class="p-6 text-center text-red-500">Error loading enquiries</div>`;
  }
}

function renderEnquiries(data) {
  if (!data || data.length === 0) {
    enquiriesList.innerHTML = "";
    noResults.classList.remove("hidden");
    return;
  }

  noResults.classList.add("hidden");

  enquiriesList.innerHTML = data
    .map(
      (enquiry, index) => `
      <div class="p-6 enquiry-card cursor-pointer hover:bg-gray-50" data-index="${index}">
        <div class="flex justify-between items-center">
          <div>
            <p class="font-semibold text-gray-800">${enquiry.Name || "Unnamed"}</p>
            <p class="text-sm text-gray-500">${enquiry.Email || "No email"} • ${enquiry.ContactNumber || "No phone"}</p>
          </div>
          <span class="status-badge status-new">New</span>
        </div>
        <p class="mt-2 text-sm text-gray-600">
          ${enquiry.TripType || ""} • ${enquiry.DepartureCity || ""} → ${enquiry.ArrivalCity || ""}
        </p>
      </div>
    `
    )
    .join("");

  // Attach click handlers
  document.querySelectorAll(".enquiry-card").forEach((card) => {
    card.addEventListener("click", () => {
      const index = card.getAttribute("data-index");
      openModal(allEnquiries[index]);
    });
  });

  // Update stats
  document.getElementById("flightCount").textContent = data.filter(
    (e) => e.TripType && e.TripType.toLowerCase().includes("flight")
  ).length;
  document.getElementById("hotelCount").textContent = data.filter(
    (e) => e.HotelDestination
  ).length;
  document.getElementById("packageCount").textContent = data.filter(
    (e) => e.PackageDestination
  ).length;
  document.getElementById("totalCount").textContent = data.length;
}

// =============================
// MODAL & NOTES
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

  // Attach note add event
  document.getElementById("addNoteBtn").addEventListener("click", addNote);

  modal.classList.remove("hidden");
}

async function addNote() {
  if (!currentEnquiry) return;

  const newNote = document.getElementById("newNoteInput").value.trim();
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
    document.getElementById("newNoteInput").value = "";
  } catch (err) {
    console.error("Error saving note:", err);
    alert("Failed to save note");
  }
}

// =============================
// MODAL CONTROLS
// =============================
closeModal.addEventListener("click", () => modal.classList.add("hidden"));
closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));

// =============================
// REFRESH BUTTON
// =============================
document.getElementById("refreshBtn").addEventListener("click", fetchEnquiries);

// =============================
// INIT
// =============================
fetchEnquiries();
