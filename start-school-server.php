<?php

/**
 * Multi-Tenant School Server Starter
 * Usage: php start-school-server.php [port] [school_name]
 */

$port = $argv[1] ?? 8000;
$schoolName = $argv[2] ?? 'Platform';

echo "🚀 Starting server for $schoolName on port $port...\n";
echo "Access at: http://localhost:$port\n";
echo "Press Ctrl+C to stop\n\n";

// Start the server
$command = "php artisan serve --host=0.0.0.0 --port=$port";
passthru($command);



