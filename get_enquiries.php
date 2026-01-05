<?php
require_once 'config.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get enquiry type from query parameter (default: all)
$type = $_GET['type'] ?? 'all';

// Get database connection
$conn = getDBConnection();

try {
    $enquiries = [];
    
    if ($type === 'all' || $type === 'flight') {
        $result = $conn->query("SELECT *, 'flight' as enquiryType FROM flight ORDER BY created_at DESC");
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $enquiries[] = $row;
            }
        }
    }
    
    if ($type === 'all' || $type === 'hotel') {
        $result = $conn->query("SELECT *, 'hotel' as enquiryType FROM hotel ORDER BY created_at DESC");
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $enquiries[] = $row;
            }
        }
    }
    
    if ($type === 'all' || $type === 'package') {
        $result = $conn->query("SELECT *, 'package' as enquiryType FROM trip ORDER BY created_at DESC");
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $enquiries[] = $row;
            }
        }
    }
    
    // Sort by created_at if fetching all
    if ($type === 'all') {
        usort($enquiries, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });
    }
    
    echo json_encode([
        'success' => true,
        'data' => $enquiries,
        'count' => count($enquiries)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

closeDBConnection($conn);
?>

