#!/bin/bash

# Multi-tenant School System Startup Script
# This script allows you to test different schools on different ports

echo "🚀 Starting Multi-Tenant School System..."
echo ""
echo "Available Schools:"
echo "🏫 St. Mary's Secondary School (SMSS) - http://localhost:8001"
echo "🏫 Kilimanjaro International School (KIS) - http://localhost:8002"
echo "🌐 Platform Level (Super Admin) - http://localhost:8000"
echo ""

# Function to start server on specific port
start_server() {
    local port=$1
    local school=$2
    
    echo "Starting server for $school on port $port..."
    php artisan serve --host=0.0.0.0 --port=$port &
    local pid=$!
    echo "Server started with PID: $pid"
    echo "Access at: http://localhost:$port"
    echo ""
}

# Start servers on different ports
start_server 8000 "Platform Level (Super Admin)"
start_server 8001 "St. Mary's Secondary School"
start_server 8002 "Kilimanjaro International School"

echo "✅ All servers started!"
echo ""
echo "📋 Access URLs:"
echo "   Super Admin: http://localhost:8000"
echo "   St. Mary's:  http://localhost:8001"
echo "   Kilimanjaro: http://localhost:8002"
echo ""
echo "🔐 Login Credentials:"
echo "   Super Admin: admin@edutz.com / password"
echo "   School Admin: admin@stmarys.ac.tz / password (for St. Mary's)"
echo "   School Admin: admin@kilimanjaro-intl.ac.tz / password (for Kilimanjaro)"
echo ""
echo "🔐 Alternative Test Users:"
echo "   Super Admin: superadmin@edutz.com / password"
echo "   Headteacher SMSS: headteacher@SMSS.ac.tz / password"
echo "   Headteacher KIS: headteacher@KIS.ac.tz / password"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait
