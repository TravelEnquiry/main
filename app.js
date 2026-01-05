// Storage configuration - using local JSON file (perfect for GitHub Pages)
const STORAGE_CONFIG = {
    type: 'local-file', // Local file storage
    filename: 'data.json', // JSON file in the same folder
    key: 'travelEnquiries'
};

// Storage options
const STORAGE_OPTIONS = {
    localFile: true,         // Local JSON file - perfect for GitHub Pages
    localStorage: true,       // Browser localStorage as backup
    memory: true             // In-memory storage as fallback
};

let currentData = {
    travelEnquiries: [],
    createdAt: new Date().toISOString(),
    description: 'Travel Enquiry Form Data Storage',
    lastUpdated: new Date().toISOString()
};

// Initialize storage system
function initializeStorage() {
    try {
        console.log('Initializing local file storage system...');
        
        // Try to load existing data from localStorage first
        const storedData = localStorage.getItem('travelEnquiries');
        if (storedData) {
            try {
                currentData = JSON.parse(storedData);
                console.log(`Loaded ${currentData.travelEnquiries.length} enquiries from localStorage`);
            } catch (e) {
                console.log('Invalid localStorage data, starting fresh');
            }
        }
        
    } catch (error) {
        console.error('Storage initialization error:', error);
    }
}



// Global variables
let enquiryForm, emailBodyTextarea, copyEmailButton;
let whatsappEnquiryTextarea, copyWhatsappEnquiryButton;
let whatsappVendorTextarea, copyWhatsappVendorButton;
let flightDetails, hotelDetails, packageDetails;
let flightTab, hotelTab, packageTab;
let numAdultsInput, numKidsInput, numInfantsInput, numTotalPaxInput;
let flightTripTypeRadios, flightReturnDateInput, flightDepartureDateInput;
let hotelCheckinDateInput, hotelCheckoutDateInput;
let packageDepartureDateInput, packageReturnDateInput;
let activeFormType = 'flight'; // Default active form

// Function to initialize DOM elements
function initializeElements() {
    // Get references to elements
    enquiryForm = document.getElementById('enquiryForm');
    emailBodyTextarea = document.getElementById('emailBody');
    copyEmailButton = document.getElementById('copyEmailButton');
    whatsappEnquiryTextarea = document.getElementById('whatsappEnquiry');
    copyWhatsappEnquiryButton = document.getElementById('copyWhatsappEnquiryButton');
    whatsappVendorTextarea = document.getElementById('whatsappVendor');
    copyWhatsappVendorButton = document.getElementById('copyWhatsappVendorButton');

    flightDetails = document.getElementById('flightDetails');
    hotelDetails = document.getElementById('hotelDetails');
    packageDetails = document.getElementById('packageDetails');

    flightTab = document.getElementById('flightTab');
    hotelTab = document.getElementById('hotelTab');
    packageTab = document.getElementById('packageTab');

    numAdultsInput = document.getElementById('numAdults');
    numKidsInput = document.getElementById('numKids');
    numInfantsInput = document.getElementById('numInfants');
    numTotalPaxInput = document.getElementById('numTotalPax');

    flightTripTypeRadios = document.querySelectorAll('input[name="flightTripType"]');
    flightDepartureDateInput = document.getElementById('flightDepartureDate');
    flightReturnDateInput = document.getElementById('flightReturnDate');
    hotelCheckinDateInput = document.getElementById('hotelCheckinDate');
    hotelCheckoutDateInput = document.getElementById('hotelCheckoutDate');
    packageDepartureDateInput = document.getElementById('packageDepartureDate');
    packageReturnDateInput = document.getElementById('packageReturnDate');
}

// Function to set minimum date for date inputs to today
function setMinDateForInputs() {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = [
        flightDepartureDateInput,
        flightReturnDateInput,
        hotelCheckinDateInput,
        hotelCheckoutDateInput,
        packageDepartureDateInput,
        packageReturnDateInput
    ];
    dateInputs.forEach(input => {
        if (input) { // Check if element exists
            input.min = today;
        }
    });
}

// Function to show/hide form sections based on tab selection
function showForm(formType) {
    console.log('showForm called with:', formType);
    
    // Check if elements exist before using them
    if (!flightDetails || !hotelDetails || !packageDetails) {
        console.error('Form sections not found');
        return;
    }
    
    // Hide all sections
    flightDetails.classList.add('hidden');
    hotelDetails.classList.add('hidden');
    packageDetails.classList.add('hidden');

    // Deactivate all tabs
    if (flightTab) flightTab.classList.remove('active');
    if (hotelTab) hotelTab.classList.remove('active');
    if (packageTab) packageTab.classList.remove('active');

    // Show selected section
    if (formType === 'flight') {
        flightDetails.classList.remove('hidden');
        console.log('Flight form shown');
    } else if (formType === 'hotel') {
        hotelDetails.classList.remove('hidden');
        console.log('Hotel form shown');
    } else if (formType === 'package') {
        packageDetails.classList.remove('hidden');
        console.log('Package form shown');
    }
    
    activeFormType = formType;
    updateEmailBody(); // Update email body after switching forms
}

// Function to calculate total passengers
function calculateTotalPax() {
    const adults = parseInt(numAdultsInput.value) || 0;
    const kids = parseInt(numKidsInput.value) || 0;
    const infants = parseInt(numInfantsInput.value) || 0;
    numTotalPaxInput.value = adults + kids + infants;
}

// Function to validate dates (e.g., return date after departure date)
function validateDates() {
    // Flight Dates
    if (flightDepartureDateInput.value && flightReturnDateInput.value && !flightReturnDateInput.disabled) {
        if (new Date(flightReturnDateInput.value) < new Date(flightDepartureDateInput.value)) {
            flightReturnDateInput.setCustomValidity('Return date cannot be before departure date.');
        } else {
            flightReturnDateInput.setCustomValidity('');
        }
    }

    // Hotel Dates
    if (hotelCheckinDateInput.value && hotelCheckoutDateInput.value) {
        if (new Date(hotelCheckoutDateInput.value) < new Date(hotelCheckinDateInput.value)) {
            hotelCheckoutDateInput.setCustomValidity('Check-out date cannot be before check-in date.');
        } else {
            hotelCheckoutDateInput.setCustomValidity('');
        }
    }

    // Package Dates
    if (packageDepartureDateInput.value && packageReturnDateInput.value) {
        if (new Date(packageReturnDateInput.value) < new Date(packageDepartureDateInput.value)) {
            packageReturnDateInput.setCustomValidity('Return date cannot be before departure date.');
        } else {
            packageReturnDateInput.setCustomValidity('');
        }
    }
}

// Function to enable/disable return date for flight booking
function toggleFlightReturnDate() {
    const selectedTripType = document.querySelector('input[name="flightTripType"]:checked').value;
    flightReturnDateInput.disabled = (selectedTripType === 'One Way');
    if (flightReturnDateInput.disabled) {
        flightReturnDateInput.value = ''; // Clear value if disabled
        flightReturnDateInput.setCustomValidity(''); // Clear validation message
    }
    flightReturnDateInput.required = (selectedTripType === 'Round Trip');
}

// Function to format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to update all three sections dynamically
function updateEmailBody() {
    const enquiryName = document.getElementById('enquiryName').value || 'Enquiry Person';
    const contactNumber = document.getElementById('contactNumber').value || 'N/A';
    const email = document.getElementById('email').value || 'N/A';
    const address = document.getElementById('address').value || 'N/A';
    const city = document.getElementById('city').value || 'N/A';
    const channel = document.getElementById('channel').value || 'N/A';
    const reference = document.getElementById('reference').value || 'N/A';

    let bookingType = activeFormType.charAt(0).toUpperCase() + activeFormType.slice(1);
    let startDate = 'N/A';
    let endDate = 'N/A';
    let notes = '';

    if (activeFormType === 'flight') {
        startDate = formatDate(flightDepartureDateInput.value);
        const tripType = document.querySelector('input[name="flightTripType"]:checked')?.value;
        if (tripType === 'Round Trip') {
            endDate = formatDate(flightReturnDateInput.value);
        }
        notes = document.getElementById('flightNotes')?.value || '';
    } else if (activeFormType === 'hotel') {
        startDate = formatDate(hotelCheckinDateInput.value);
        endDate = formatDate(hotelCheckoutDateInput.value);
        notes = document.getElementById('hotelNotes')?.value || '';
    } else if (activeFormType === 'package') {
        startDate = formatDate(packageDepartureDateInput.value);
        endDate = formatDate(packageReturnDateInput.value);
        notes = document.getElementById('packageNotes')?.value || '';
    }

    // === 1. WhatsApp Enquiry (Customer) - Complete with ALL details ===
    let whatsappEnquiry = `🌍 *Travel Enquiry - ${bookingType}*\n\n`;
    whatsappEnquiry += `👤 *Customer Details:*\n`;
    whatsappEnquiry += `Name: ${enquiryName}\n`;
    whatsappEnquiry += `📞 Contact: ${contactNumber}\n`;
    whatsappEnquiry += `📧 Email: ${email}\n`;
    whatsappEnquiry += `🏠 Address: ${address}\n`;
    whatsappEnquiry += `🌆 City: ${city}\n`;
    whatsappEnquiry += `📍 Channel: ${channel}\n`;
    if (reference !== 'N/A') whatsappEnquiry += `🔗 Reference: ${reference}\n`;
    whatsappEnquiry += `\n👥 *Passengers:* ${numTotalPaxInput.value || 'N/A'}\n`;
    whatsappEnquiry += `Adults: ${numAdultsInput.value || 'N/A'} | Kids: ${numKidsInput.value || 'N/A'} | Infants: ${numInfantsInput.value || 'N/A'}\n\n`;

    // Add specific details
    whatsappEnquiry += getSpecificDetails(true);
    if (notes) whatsappEnquiry += `\n📝 *Notes:* ${notes}\n`;

    whatsappEnquiryTextarea.value = whatsappEnquiry;

    // === 2. Email Section (WITHOUT name, contact, email, address) ===
    let emailContent = `Subject: Travel Enquiry - ${bookingType} - ${startDate}\n\n`;
    emailContent += `Dear Travel Agency,\n\n`;
    emailContent += `I would like to make an enquiry for a ${activeFormType} booking:\n\n`;

    if (reference !== 'N/A') emailContent += `Reference: ${reference}\n`;
    emailContent += `Total Passengers: ${numTotalPaxInput.value || 'N/A'}\n`;
    emailContent += `  - Adults: ${numAdultsInput.value || 'N/A'}\n`;
    emailContent += `  - Kids: ${numKidsInput.value || 'N/A'}\n`;
    emailContent += `  - Infants: ${numInfantsInput.value || 'N/A'}\n\n`;

    emailContent += getSpecificDetails(false);
    if (notes) emailContent += `\nNotes/Preferences: ${notes}\n`;
    emailContent += `\nKindly provide suitable options and quotes.\n\nThank you`;

    emailBodyTextarea.value = emailContent;

    // === 3. WhatsApp Vendor (WITHOUT name, contact, email, address) ===
    let whatsappVendor = `🌍 *${bookingType} Enquiry*\n\n`;

    if (reference !== 'N/A') whatsappVendor += `Reference: ${reference}\n`;
    whatsappVendor += `\n👥 *Passengers:* ${numTotalPaxInput.value || 'N/A'}\n`;
    whatsappVendor += `Adults: ${numAdultsInput.value || 'N/A'} | Kids: ${numKidsInput.value || 'N/A'} | Infants: ${numInfantsInput.value || 'N/A'}\n\n`;

    whatsappVendor += getSpecificDetails(true);
    if (notes) whatsappVendor += `\n📝 *Notes:* ${notes}\n`;

    whatsappVendorTextarea.value = whatsappVendor;
}

// Helper function to get specific booking details
function getSpecificDetails(isWhatsApp) {
    let content = '';
    const prefix = isWhatsApp ? '*' : '';
    const suffix = isWhatsApp ? '*' : '';

    if (activeFormType === 'flight') {
        const tripType = document.querySelector('input[name="flightTripType"]:checked')?.value || 'N/A';
        const startDate = formatDate(flightDepartureDateInput.value);
        const endDate = formatDate(flightReturnDateInput.value);

        content += `${prefix}✈️ Flight Details:${suffix}\n`;
        content += `Trip Type: ${tripType}\n`;
        content += `From: ${document.getElementById('flightDepartureCity').value || 'N/A'}\n`;
        content += `To: ${document.getElementById('flightArrivalCity').value || 'N/A'}\n`;
        content += `Departure: ${startDate}\n`;
        if (tripType === 'Round Trip') {
            content += `Return: ${endDate}\n`;
        }
        content += `Airline: ${document.getElementById('flightPreferredAirline').value || 'Any'}\n`;
        content += `Class: ${document.getElementById('flightClass').value || 'N/A'}\n`;

    } else if (activeFormType === 'hotel') {
        const startDate = formatDate(hotelCheckinDateInput.value);
        const endDate = formatDate(hotelCheckoutDateInput.value);

        content += `${prefix}🏨 Hotel Details:${suffix}\n`;
        content += `Destination: ${document.getElementById('hotelDestination').value || 'N/A'}\n`;
        content += `Check-in: ${startDate}\n`;
        content += `Check-out: ${endDate}\n`;
        content += `Rooms: ${document.getElementById('hotelNumRooms').value || 'N/A'}\n`;
        content += `Room Type: ${document.getElementById('hotelRoomType').value || 'N/A'}\n`;
        content += `Star Rating: ${document.getElementById('hotelStarRating').value || 'Any'}\n`;

    } else if (activeFormType === 'package') {
        const startDate = formatDate(packageDepartureDateInput.value);
        const endDate = formatDate(packageReturnDateInput.value);

        content += `${prefix}🎒 Package Details:${suffix}\n`;
        content += `Destination: ${document.getElementById('packageDestination').value || 'N/A'}\n`;
        content += `Departure: ${startDate}\n`;
        content += `Return: ${endDate}\n`;
        content += `Budget: ${document.getElementById('packageBudget').value ? `INR ${document.getElementById('packageBudget').value}` : 'N/A'}\n`;
        content += `Interests: ${document.getElementById('packageInterests').value || 'N/A'}\n`;
    }

    return content;
}

// Function to validate form before submission
function validateForm() {
    console.log('Validating form...');
    
    // Check if elements exist
    if (!enquiryForm) {
        console.error('Form not found');
        return false;
    }
    
    // Get common required fields
    const enquiryName = document.getElementById('enquiryName')?.value;
    const contactNumber = document.getElementById('contactNumber')?.value;
    const email = document.getElementById('email')?.value;
    const channel = document.getElementById('channel')?.value;
    
    // Validate common fields
    if (!enquiryName || !contactNumber || !email || !channel) {
        alert('Please fill in all required fields (Name, Contact Number, Email, Channel)');
        return false;
    }
    
    // Validate based on active form type
    if (activeFormType === 'flight') {
        const departureCity = document.getElementById('flightDepartureCity')?.value;
        const arrivalCity = document.getElementById('flightArrivalCity')?.value;
        const departureDate = document.getElementById('flightDepartureDate')?.value;
        const flightClass = document.getElementById('flightClass')?.value;
        
        if (!departureCity || !arrivalCity || !departureDate || !flightClass) {
            alert('Please fill in all required flight details (Departure City, Arrival City, Departure Date, Class)');
            return false;
        }
    } else if (activeFormType === 'hotel') {
        const destination = document.getElementById('hotelDestination')?.value;
        const checkinDate = document.getElementById('hotelCheckinDate')?.value;
        const checkoutDate = document.getElementById('hotelCheckoutDate')?.value;
        const numRooms = document.getElementById('hotelNumRooms')?.value;
        const roomType = document.getElementById('hotelRoomType')?.value;
        
        if (!destination || !checkinDate || !checkoutDate || !numRooms || !roomType) {
            alert('Please fill in all required hotel details (Destination, Check-in Date, Check-out Date, Number of Rooms, Room Type)');
            return false;
        }
    } else if (activeFormType === 'package') {
        const destination = document.getElementById('packageDestination')?.value;
        const departureDate = document.getElementById('packageDepartureDate')?.value;
        const returnDate = document.getElementById('packageReturnDate')?.value;
        
        if (!destination || !departureDate || !returnDate) {
            alert('Please fill in all required package details (Destination, Departure Date, Return Date)');
            return false;
        }
    }
    
    console.log('Form validation passed');
    return true;
}

// Function to collect form data
function collectFormData() {
    const formData = {
        timestamp: new Date().toISOString(),
        enquiryType: activeFormType,
        enquiryName: document.getElementById('enquiryName').value,
        contactNumber: document.getElementById('contactNumber').value,
        email: document.getElementById('email').value,
        city: document.getElementById('city').value,
        address: document.getElementById('address').value,
        channel: document.getElementById('channel').value,
        reference: document.getElementById('reference').value,
        numAdults: parseInt(numAdultsInput.value) || 0,
        numKids: parseInt(numKidsInput.value) || 0,
        numInfants: parseInt(numInfantsInput.value) || 0,
        numTotalPax: parseInt(numTotalPaxInput.value) || 0,
        emailBody: emailBodyTextarea.value,
        whatsappEnquiry: whatsappEnquiryTextarea.value,
        whatsappVendor: whatsappVendorTextarea.value
    };

    // Add specific details based on enquiry type
    if (activeFormType === 'flight') {
        formData.flightDetails = {
            tripType: document.querySelector('input[name="flightTripType"]:checked')?.value,
            departureCity: document.getElementById('flightDepartureCity').value,
            arrivalCity: document.getElementById('flightArrivalCity').value,
            departureDate: flightDepartureDateInput.value,
            returnDate: flightReturnDateInput.value,
            preferredAirline: document.getElementById('flightPreferredAirline').value,
            class: document.getElementById('flightClass').value,
            notes: document.getElementById('flightNotes')?.value || ''
        };
    } else if (activeFormType === 'hotel') {
        formData.hotelDetails = {
            destination: document.getElementById('hotelDestination').value,
            checkinDate: hotelCheckinDateInput.value,
            checkoutDate: hotelCheckoutDateInput.value,
            numRooms: document.getElementById('hotelNumRooms').value,
            roomType: document.getElementById('hotelRoomType').value,
            starRating: document.getElementById('hotelStarRating').value,
            notes: document.getElementById('hotelNotes')?.value || ''
        };
    } else if (activeFormType === 'package') {
        formData.packageDetails = {
            destination: document.getElementById('packageDestination').value,
            departureDate: packageDepartureDateInput.value,
            returnDate: packageReturnDateInput.value,
            budget: document.getElementById('packageBudget').value,
            interests: document.getElementById('packageInterests').value,
            notes: document.getElementById('packageNotes')?.value || ''
        };
    }

    return formData;
}

// Function to save enquiry to MySQL database via PHP
async function saveEnquiryToDatabase() {
  let formData;

  try {
    formData = collectFormData();

    // Validate required fields
    if (!formData.enquiryName || !formData.contactNumber || !formData.email || !formData.channel) {
      alert('Please fill in all required fields.');
      return false;
    }

    // Send to PHP backend
    const response = await fetch("save_enquiry.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(formData)
    });

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      showNotification('✅ Enquiry saved successfully!', 'success');

      // Save to localStorage as backup
      saveToLocalStorage(formData);

      // Reset form
      enquiryForm.reset();
      calculateTotalPax();
      updateEmailBody();

      return true;
    } else {
      throw new Error(result.message || 'Failed to save enquiry');
    }

  } catch (error) {
    console.error("Error saving enquiry:", error);

    // More detailed error message
    let errorMsg = 'Failed to save enquiry';
    if (error.message.includes('Failed to fetch')) {
      errorMsg = 'Cannot connect to server. Please check if save_enquiry.php exists.';
    } else {
      errorMsg = error.message;
    }

    showNotification('❌ ' + errorMsg, 'error');

    // Save to localStorage as fallback (only if formData was collected)
    if (formData) {
      saveToLocalStorage(formData);
      showNotification('💾 Saved to local storage as backup', 'success');
    }

    return false;
  }
}


// Function to save enquiry to local storage as fallback
function saveToLocalStorage(formData) {
    try {
        // Get existing enquiries from local storage
        const existingEnquiries = JSON.parse(localStorage.getItem('travelEnquiries') || '[]');
        
        // Add new enquiry with timestamp
        const enquiryWithTimestamp = {
            ...formData,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };
        
        existingEnquiries.push(enquiryWithTimestamp);
        
        // Save back to local storage
        localStorage.setItem('travelEnquiries', JSON.stringify(existingEnquiries));
        
        console.log('Enquiry saved to local storage:', enquiryWithTimestamp);
        
        // Show data in console for easy access
        console.log('All local enquiries:', existingEnquiries);
        
    } catch (error) {
        console.error('Error saving to local storage:', error);
    }
}

// Function to view all stored enquiries
function viewAllEnquiries() {
    try {
        const enquiries = currentData.travelEnquiries || [];
        console.log('All stored enquiries:', enquiries);
        
        // Create a detailed display
        if (enquiries.length > 0) {
            const enquiryList = enquiries.map((enquiry, index) => {
                const date = new Date(enquiry.timestamp).toLocaleDateString();
                const time = new Date(enquiry.timestamp).toLocaleTimeString();
                return `${index + 1}. ${enquiry.enquiryName} (${enquiry.contactNumber})
   📧 ${enquiry.email}
   ✈️ ${enquiry.activeFormType || 'Flight'}
   📅 ${date} at ${time}
   👥 ${enquiry.numTotalPax} passengers
   🔗 ${enquiry.channel}
   ${enquiry.reference ? `📝 Ref: ${enquiry.reference}` : ''}
   ---`;
            }).join('\n');
            
            console.log('=== ENQUIRY DETAILS ===\n' + enquiryList);
            
            // Show summary in alert
            const summary = `📊 ENQUIRY SUMMARY\n\nTotal Enquiries: ${enquiries.length}\n\n${enquiries.map((e, i) => `${i+1}. ${e.enquiryName} - ${e.activeFormType || 'Flight'}`).join('\n')}`;
            alert(summary);
        } else {
            alert('📭 No enquiries found yet.\n\nSubmit your first enquiry to see it here!');
        }
        
        // Show in notification
        showNotification(`Found ${enquiries.length} enquiries. Check console for full details.`, 'success');
        
        return enquiries;
    } catch (error) {
        console.error('Error viewing enquiries:', error);
        showNotification('Error viewing enquiries', 'error');
        return [];
    }
}

// Function to export data to data.json file
function exportToDataJson() {
    try {
        const dataStr = JSON.stringify(currentData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = 'data.json';
        downloadLink.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        showNotification('Data exported to data.json successfully!', 'success');
        console.log('Data exported:', currentData);
        
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Export failed. Please try again.', 'error');
    }
}

// Function to clear all enquiries
function clearAllEnquiries() {
    if (confirm('⚠️ Are you sure you want to clear ALL enquiries?\n\nThis action cannot be undone!')) {
        try {
            currentData.travelEnquiries = [];
            currentData.lastUpdated = new Date().toISOString();
            
            // Update localStorage
            localStorage.setItem('travelEnquiries', JSON.stringify(currentData));
            
            showNotification('All enquiries cleared successfully!', 'success');
            console.log('All enquiries cleared');
            
        } catch (error) {
            console.error('Clear error:', error);
            showNotification('Failed to clear enquiries', 'error');
        }
    }
}

// Function to delete a specific enquiry
function deleteEnquiry(enquiryId) {
    if (confirm('🗑️ Are you sure you want to delete this enquiry?')) {
        try {
            const index = currentData.travelEnquiries.findIndex(e => e.id === enquiryId);
            if (index !== -1) {
                const deleted = currentData.travelEnquiries.splice(index, 1)[0];
                currentData.lastUpdated = new Date().toISOString();
                
                // Update localStorage
                localStorage.setItem('travelEnquiries', JSON.stringify(currentData));
                
                showNotification(`Enquiry for ${deleted.enquiryName} deleted successfully!`, 'success');
                console.log('Enquiry deleted:', deleted);
            }
        } catch (error) {
            console.error('Delete error:', error);
            showNotification('Failed to delete enquiry', 'error');
        }
    }
}

// Function to search enquiries
function searchEnquiries(searchTerm) {
    try {
        const enquiries = currentData.travelEnquiries || [];
        const filtered = enquiries.filter(enquiry => 
            enquiry.enquiryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enquiry.contactNumber.includes(searchTerm) ||
            enquiry.activeFormType?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (filtered.length > 0) {
            const results = filtered.map((enquiry, index) => 
                `${index + 1}. ${enquiry.enquiryName} - ${enquiry.activeFormType || 'Flight'} (${enquiry.contactNumber})`
            ).join('\n');
            
            alert(`🔍 SEARCH RESULTS\n\nFound ${filtered.length} matching enquiries:\n\n${results}`);
        } else {
            alert(`🔍 No enquiries found matching "${searchTerm}"`);
        }
        
        return filtered;
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

// Function to load data from uploaded data.json file
function loadFromDataJson() {
    try {
        // Create file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const loadedData = JSON.parse(e.target.result);
                        
                        if (loadedData.travelEnquiries && Array.isArray(loadedData.travelEnquiries)) {
                            currentData = loadedData;
                            localStorage.setItem('travelEnquiries', JSON.stringify(currentData));
                            
                            showNotification(`Successfully loaded ${loadedData.travelEnquiries.length} enquiries from data.json!`, 'success');
                            console.log('Data loaded from file:', currentData);
                        } else {
                            showNotification('Invalid data.json format. File must contain travelEnquiries array.', 'error');
                        }
                    } catch (parseError) {
                        console.error('JSON parse error:', parseError);
                        showNotification('Invalid JSON file. Please check the file format.', 'error');
                    }
                };
                reader.readAsText(file);
            }
        });
        
        // Trigger file selection
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
        
    } catch (error) {
        console.error('Load error:', error);
        showNotification('Failed to load data.json file', 'error');
    }
}

// Function to show notification
function showNotification(message, type) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}



// Function to initialize event listeners
function initializeEventListeners() {
    // Tab button event listeners
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            console.log('Tab button clicked:', button.id);
            const formType = button.getAttribute('data-form');
            console.log('Form type:', formType);
            
            showForm(formType);
            
            // Update active state
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            console.log('Active tab updated to:', button.id);
        });
    });

    // Form input event listeners for real-time email updates
    enquiryForm.addEventListener('input', () => {
        calculateTotalPax();
        validateDates();
        updateEmailBody();
    });

    // Specific listeners for pax count and flight trip type
    numAdultsInput.addEventListener('change', calculateTotalPax);
    numKidsInput.addEventListener('change', calculateTotalPax);
    numInfantsInput.addEventListener('change', calculateTotalPax);

    flightTripTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            toggleFlightReturnDate();
            updateEmailBody();
        });
    });

    // Copy WhatsApp Enquiry to Clipboard
    copyWhatsappEnquiryButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(whatsappEnquiryTextarea.value);
            copyWhatsappEnquiryButton.textContent = '✅ Copied!';
        } catch (err) {
            whatsappEnquiryTextarea.select();
            document.execCommand('copy');
            copyWhatsappEnquiryButton.textContent = '✅ Copied!';
        }
        setTimeout(() => {
            copyWhatsappEnquiryButton.textContent = '📋 Copy WhatsApp Enquiry';
        }, 2000);
    });

    // Copy Email to Clipboard
    copyEmailButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(emailBodyTextarea.value);
            copyEmailButton.textContent = '✅ Copied!';
        } catch (err) {
            emailBodyTextarea.select();
            document.execCommand('copy');
            copyEmailButton.textContent = '✅ Copied!';
        }
        setTimeout(() => {
            copyEmailButton.textContent = '📋 Copy Email to Clipboard';
        }, 2000);
    });

    // Copy WhatsApp Vendor to Clipboard
    copyWhatsappVendorButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(whatsappVendorTextarea.value);
            copyWhatsappVendorButton.textContent = '✅ Copied!';
        } catch (err) {
            whatsappVendorTextarea.select();
            document.execCommand('copy');
            copyWhatsappVendorButton.textContent = '✅ Copied!';
        }
        setTimeout(() => {
            copyWhatsappVendorButton.textContent = '📋 Copy WhatsApp Vendor Message';
        }, 2000);
    });

    // Form submission
    enquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Custom validation
        if (!validateForm()) {
            return;
        }

        await saveEnquiryToDatabase();
    });
}

// Main initialization function
function initializeApp() {
    initializeElements();
    initializeEventListeners();
    setMinDateForInputs();
    toggleFlightReturnDate(); // Set initial state for return date
    calculateTotalPax(); // Calculate total pax on load
    showForm('flight'); // Display flight form by default
    
    // Ensure flight tab is active by default
    if (flightTab) {
        flightTab.classList.add('active');
    }
    if (hotelTab) {
        hotelTab.classList.remove('active');
    }
    if (packageTab) {
        packageTab.classList.remove('active');
    }
    
    updateEmailBody(); // Generate initial email body
    console.log('App initialization complete');
}

// Logout functionality
function logout() {
    // Clear session storage
    sessionStorage.clear();

    // Redirect to login page
    window.location.href = 'login.html';
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');

    // Initialize app immediately
    initializeApp();

    // Initialize storage system
    initializeStorage();

    // Add logout button event listener
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    }

    console.log('App initialization complete');
});
