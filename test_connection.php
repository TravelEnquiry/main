<?php
/**
 * Database Connection Test Script
 * Use this to verify your database connection is working
 */

require_once 'config.php';

echo "<h1>Database Connection Test</h1>";

try {
    $conn = getDBConnection();
    
    echo "<p style='color: green;'>✅ Database connection successful!</p>";
    
    // Test if tables exist
    $tables = ['flight', 'hotel', 'trip'];
    echo "<h2>Checking Tables:</h2>";
    
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result && $result->num_rows > 0) {
            echo "<p style='color: green;'>✅ Table '$table' exists</p>";
            
            // Count records
            $countResult = $conn->query("SELECT COUNT(*) as count FROM $table");
            if ($countResult) {
                $row = $countResult->fetch_assoc();
                echo "<p style='margin-left: 20px;'>Records in '$table': {$row['count']}</p>";
            }
        } else {
            echo "<p style='color: red;'>❌ Table '$table' does NOT exist</p>";
        }
    }
    
    closeDBConnection($conn);
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Database connection failed!</p>";
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<h2>PHP Information:</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>MySQL Extension: " . (extension_loaded('mysqli') ? '✅ Loaded' : '❌ Not Loaded') . "</p>";

echo "<hr>";
echo "<p><a href='index.html'>← Back to Form</a></p>";
?>

