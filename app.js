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
    flightReturnDateInput.disabled = (selectedTripType === 'One Way' || selectedTripType === 'Multi-City');
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

// Function to update the email body dynamically
function updateEmailBody() {
    const enquiryName = document.getElementById('enquiryName').value || 'Enquiry Person';
    let bookingType = activeFormType.charAt(0).toUpperCase() + activeFormType.slice(1);
    let startDate = 'N/A';
    let endDate = 'N/A';

    if (activeFormType === 'flight') {
        startDate = formatDate(flightDepartureDateInput.value);
        const tripType = document.querySelector('input[name="flightTripType"]:checked')?.value;
        if (tripType === 'Round Trip') {
            endDate = formatDate(flightReturnDateInput.value);
        }
    } else if (activeFormType === 'hotel') {
        startDate = formatDate(hotelCheckinDateInput.value);
        endDate = formatDate(hotelCheckoutDateInput.value);
    } else if (activeFormType === 'package') {
        startDate = formatDate(packageDepartureDateInput.value);
        endDate = formatDate(packageReturnDateInput.value);
    }

    // Construct the subject line
    let subjectLine = `Travel Enquiry - ${bookingType} - ${enquiryName}`;
    if (startDate !== 'N/A') {
        subjectLine += ` - ${startDate}`;
    }
    if (endDate !== 'N/A' && endDate !== startDate) { // Avoid duplicating date if it's a single day or one-way
        subjectLine += ` - ${endDate}`;
    }

    let emailContent = `Subject: ${subjectLine}\n\n`;
    emailContent += `Dear Travel Agency,\n\n`;
    emailContent += `I would like to make an enquiry for a ${activeFormType} booking based on the following details:\n\n`;

    // Common Details
    emailContent += `--- Your Details ---\n`;
    emailContent += `Name: ${enquiryName}\n`;
    emailContent += `Contact Number(s): ${document.getElementById('contactNumber').value || 'N/A'}\n`;
    emailContent += `Email: ${document.getElementById('email').value || 'N/A'}\n`;
    emailContent += `Address: ${document.getElementById('address').value || 'N/A'}\n`;
    emailContent += `City: ${document.getElementById('city').value || 'N/A'}\n`;
    emailContent += `Channel: ${document.getElementById('channel').value || 'N/A'}\n`;
    emailContent += `Reference: ${document.getElementById('reference').value || 'N/A'}\n`;
    emailContent += `Total Passengers: ${numTotalPaxInput.value || 'N/A'}\n`;
    emailContent += `  - Adults: ${numAdultsInput.value || 'N/A'}\n`;
    emailContent += `  - Kids: ${numKidsInput.value || 'N/A'}\n`;
    emailContent += `  - Infants: ${numInfantsInput.value || 'N/A'}\n\n`;

    // Specific Details based on active form
    if (activeFormType === 'flight') {
        emailContent += `--- Flight Booking Details ---\n`;
        const tripType = document.querySelector('input[name="flightTripType"]:checked')?.value || 'N/A';
        emailContent += `Trip Type: ${tripType}\n`;
        emailContent += `Departure City: ${document.getElementById('flightDepartureCity').value || 'N/A'}\n`;
        emailContent += `Arrival City: ${document.getElementById('flightArrivalCity').value || 'N/A'}\n`;
        emailContent += `Departure Date: ${startDate}\n`;
        if (tripType === 'Round Trip') {
            emailContent += `Return Date: ${endDate}\n`;
        } else if (tripType === 'Multi-City') {
            emailContent += `Return Date: Not Applicable (Multi-City)\n`;
        }
        emailContent += `Preferred Airline: ${document.getElementById('flightPreferredAirline').value || 'Any'}\n`;
        emailContent += `Class: ${document.getElementById('flightClass').value || 'N/A'}\n`;
    } else if (activeFormType === 'hotel') {
        emailContent += `--- Hotel Booking Details ---\n`;
        emailContent += `Destination/Hotel Name: ${document.getElementById('hotelDestination').value || 'N/A'}\n`;
        emailContent += `Check-in Date: ${startDate}\n`;
        emailContent += `Check-out Date: ${endDate}\n`;
        emailContent += `Number of Rooms: ${document.getElementById('hotelNumRooms').value || 'N/A'}\n`;
        emailContent += `Room Type: ${document.getElementById('hotelRoomType').value || 'N/A'}\n`;
        emailContent += `Star Rating Preference: ${document.getElementById('hotelStarRating').value || 'Any'}\n`;
    } else if (activeFormType === 'package') {
        emailContent += `--- Trip Package Details ---\n`;
        emailContent += `Destination/Package Name: ${document.getElementById('packageDestination').value || 'N/A'}\n`;
        emailContent += `Departure Date: ${startDate}\n`;
        emailContent += `Return Date: ${endDate}\n`;
        emailContent += `Budget: ${document.getElementById('packageBudget').value ? `INR ${document.getElementById('packageBudget').value}` : 'N/A'}\n`;
        emailContent += `Interests/Activities: ${document.getElementById('packageInterests').value || 'N/A'}\n`;
    }

    emailContent += `\nKindly provide suitable options and quotes for this enquiry.\n\n`;
    emailContent += `Thank you,\n${enquiryName}`;

    emailBodyTextarea.value = emailContent;
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
        emailBody: emailBodyTextarea.value
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
            class: document.getElementById('flightClass').value
        };
    } else if (activeFormType === 'hotel') {
        formData.hotelDetails = {
            destination: document.getElementById('hotelDestination').value,
            checkinDate: hotelCheckinDateInput.value,
            checkoutDate: hotelCheckoutDateInput.value,
            numRooms: document.getElementById('hotelNumRooms').value,
            roomType: document.getElementById('hotelRoomType').value,
            starRating: document.getElementById('hotelStarRating').value
        };
    } else if (activeFormType === 'package') {
        formData.packageDetails = {
            destination: document.getElementById('packageDestination').value,
            departureDate: packageDepartureDateInput.value,
            returnDate: packageReturnDateInput.value,
            budget: document.getElementById('packageBudget').value,
            interests: document.getElementById('packageInterests').value
        };
    }

    return formData;
}

// Function to save enquiry to local file and localStorage
async function saveEnquiryToSheetDB() {
  try {
    const formData = collectFormData();

    // Validate required fields
    if (!formData.enquiryName || !formData.contactNumber || !formData.email || !formData.channel) {
      alert('Please fill in all required fields.');
      return false;
    }

    // Map to your SheetDB columns
    const enquiryRow = {
      Name: formData.enquiryName,
      ContactNumber: formData.contactNumber,
      Email: formData.email,
      City: formData.city,
      Address: formData.address,
      Channel: formData.channel,
      Reference: formData.reference,
      Adults: formData.numAdults,
      Kids: formData.numKids,
      Infants: formData.numInfants,
      TotalPassengers: formData.numTotalPax,
      TripType: formData.flightDetails?.tripType || "",
      DepartureCity: formData.flightDetails?.departureCity || "",
      ArrivalCity: formData.flightDetails?.arrivalCity || "",
      DepartureDate: formData.flightDetails?.departureDate || "",
      ReturnDate: formData.flightDetails?.returnDate || "",
      PreferredAirline: formData.flightDetails?.preferredAirline || "",
      Class: formData.flightDetails?.class || "",
      HotelDestination: formData.hotelDetails?.destination || "",
      HotelCheckinDate: formData.hotelDetails?.checkinDate || "",
      HotelCheckoutDate: formData.hotelDetails?.checkoutDate || "",
      NumberOfRooms: formData.hotelDetails?.numRooms || "",
      RoomType: formData.hotelDetails?.roomType || "",
      StarRating: formData.hotelDetails?.starRating || "",
      PackageDestination: formData.packageDetails?.destination || "",
      PackageDepartureDate: formData.packageDetails?.departureDate || "",
      PackageReturnDate: formData.packageDetails?.returnDate || "",
      Budget: formData.packageDetails?.budget || "",
      Interests: formData.packageDetails?.interests || "",
      Timestamp: new Date().toISOString()
    };

    // Send to SheetDB
    const response = await fetch("https://sheetdb.io/api/v1/d9vgt1cl45889", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [enquiryRow] })
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    showNotification('✅ Enquiry saved!', 'success');

    // Save to localStorage as backup
    saveToLocalStorage(formData);

    // Reset form
    enquiryForm.reset();
    calculateTotalPax();
    updateEmailBody();

    return true;
  } catch (error) {
    console.error("Error saving enquiry:", error);
    showNotification('❌ Failed to save enquiry. Please try again.', 'error');
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

    // Copy Email to Clipboard
    copyEmailButton.addEventListener('click', () => {
        emailBodyTextarea.select();
        document.execCommand('copy'); // Fallback for navigator.clipboard.writeText
        copyEmailButton.textContent = 'Copied!';
        setTimeout(() => {
            copyEmailButton.textContent = 'Copy Email to Clipboard';
        }, 2000);
    });

    // Form submission
    enquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Custom validation
        if (!validateForm()) {
            return;
        }
        
        await saveEnquiryToSheetDB();
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

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    
    // Initialize app immediately
    initializeApp();
    
    // Initialize storage system
    initializeStorage();
    
    console.log('App initialization complete');
});


