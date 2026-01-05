<?php
require_once 'config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit();
}

// Validate required fields
if (empty($data['enquiryName']) || empty($data['contactNumber']) || empty($data['email']) || empty($data['channel'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

// Get database connection
$conn = getDBConnection();

// Determine enquiry type and insert into appropriate table
$enquiryType = $data['enquiryType'] ?? 'flight';

try {
    if ($enquiryType === 'flight') {
        $stmt = $conn->prepare("INSERT INTO flight (
            enquiryName, contactNumber, email, city, address, channel, reference,
            numAdults, numKids, numInfants, numTotalPax,
            flightTripType, flightDepartureCity, flightArrivalCity, 
            flightDepartureDate, flightReturnDate, flightPreferredAirline, flightClass, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->bind_param("sssssssiiisssssssss",
            $data['enquiryName'],
            $data['contactNumber'],
            $data['email'],
            $data['city'] ?? '',
            $data['address'] ?? '',
            $data['channel'],
            $data['reference'] ?? '',
            $data['numAdults'] ?? 1,
            $data['numKids'] ?? 0,
            $data['numInfants'] ?? 0,
            $data['numTotalPax'] ?? 1,
            $data['flightDetails']['tripType'] ?? 'One Way',
            $data['flightDetails']['departureCity'] ?? '',
            $data['flightDetails']['arrivalCity'] ?? '',
            $data['flightDetails']['departureDate'] ?? null,
            $data['flightDetails']['returnDate'] ?? null,
            $data['flightDetails']['preferredAirline'] ?? '',
            $data['flightDetails']['class'] ?? 'Economy',
            $data['flightDetails']['notes'] ?? ''
        );
        
    } elseif ($enquiryType === 'hotel') {
        $stmt = $conn->prepare("INSERT INTO hotel (
            enquiryName, contactNumber, email, city, address, channel, reference,
            numAdults, numKids, numInfants, numTotalPax,
            hotelDestination, hotelCheckinDate, hotelCheckoutDate, 
            hotelNumRooms, hotelRoomType, hotelStarRating, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->bind_param("sssssssiiiisssiiss",
            $data['enquiryName'],
            $data['contactNumber'],
            $data['email'],
            $data['city'] ?? '',
            $data['address'] ?? '',
            $data['channel'],
            $data['reference'] ?? '',
            $data['numAdults'] ?? 1,
            $data['numKids'] ?? 0,
            $data['numInfants'] ?? 0,
            $data['numTotalPax'] ?? 1,
            $data['hotelDetails']['destination'] ?? '',
            $data['hotelDetails']['checkinDate'] ?? null,
            $data['hotelDetails']['checkoutDate'] ?? null,
            $data['hotelDetails']['numRooms'] ?? 1,
            $data['hotelDetails']['roomType'] ?? 'Standard',
            $data['hotelDetails']['starRating'] ?? 'Any',
            $data['hotelDetails']['notes'] ?? ''
        );
        
    } elseif ($enquiryType === 'package') {
        $stmt = $conn->prepare("INSERT INTO trip (
            enquiryName, contactNumber, email, city, address, channel, reference,
            numAdults, numKids, numInfants, numTotalPax,
            packageDestination, packageDepartureDate, packageReturnDate, 
            packageBudget, packageInterests, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->bind_param("sssssssiiissssdss",
            $data['enquiryName'],
            $data['contactNumber'],
            $data['email'],
            $data['city'] ?? '',
            $data['address'] ?? '',
            $data['channel'],
            $data['reference'] ?? '',
            $data['numAdults'] ?? 1,
            $data['numKids'] ?? 0,
            $data['numInfants'] ?? 0,
            $data['numTotalPax'] ?? 1,
            $data['packageDetails']['destination'] ?? '',
            $data['packageDetails']['departureDate'] ?? null,
            $data['packageDetails']['returnDate'] ?? null,
            $data['packageDetails']['budget'] ?? 0,
            $data['packageDetails']['interests'] ?? '',
            $data['packageDetails']['notes'] ?? ''
        );
    }
    
    if ($stmt->execute()) {
        $insertId = $conn->insert_id;
        echo json_encode([
            'success' => true,
            'message' => 'Enquiry saved successfully',
            'id' => $insertId
        ]);
    } else {
        throw new Exception($stmt->error);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

closeDBConnection($conn);
?>

