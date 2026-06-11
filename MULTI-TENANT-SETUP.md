# Multi-Tenant School System Setup

## Overview
This system allows you to test different schools through different local URLs/ports, simulating a multi-tenant environment.

## Available Schools

### 1. St. Mary's Secondary School (SMSS)
- **URL**: http://localhost:8001
- **Code**: SMSS
- **Email**: info@stmarys.ac.tz

### 2. Kilimanjaro International School (KIS)
- **URL**: http://localhost:8002
- **Code**: KIS
- **Email**: info@kilimanjaro-intl.ac.tz

### 3. Platform Level (Super Admin)
- **URL**: http://localhost:8000
- **Access**: Super Admin dashboard and platform management

## How to Start the Multi-Tenant System

### Option 1: Using the Shell Script
```bash
./start-multi-tenant.sh
```

### Option 2: Manual Start
```bash
# Terminal 1 - Platform Level
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2 - St. Mary's Secondary School
php artisan serve --host=0.0.0.0 --port=8001

# Terminal 3 - Kilimanjaro International School
php artisan serve --host=0.0.0.0 --port=8002
```

### Option 3: Using PHP Script
```bash
# Start individual servers
php start-school-server.php 8000 "Platform Level"
php start-school-server.php 8001 "St. Mary's Secondary School"
php start-school-server.php 8002 "Kilimanjaro International School"
```

## Login Credentials

### Super Admin
- **Email**: admin@edutz.com
- **Password**: password
- **Access**: All schools and platform management

### School Admin - St. Mary's
- **Email**: admin@stmarys.ac.tz
- **Password**: password
- **Access**: St. Mary's Secondary School only

### School Admin - Kilimanjaro
- **Email**: admin@kilimanjaro-intl.ac.tz
- **Password**: password
- **Access**: Kilimanjaro International School only

### Alternative Test Users (from seeder)
- **Super Admin**: superadmin@edutz.com / password
- **Headteacher SMSS**: headteacher@SMSS.ac.tz / password
- **Headteacher KIS**: headteacher@KIS.ac.tz / password
- **Bursar SMSS**: bursar@SMSS.ac.tz / password
- **Bursar KIS**: bursar@KIS.ac.tz / password

## Testing Multi-Tenancy

1. **Access Platform Level**: http://localhost:8000
   - Login as Super Admin
   - View platform-wide statistics
   - Manage all schools

2. **Access St. Mary's School**: http://localhost:8001
   - Login as any user
   - View school-specific dashboard
   - School context indicator shows "St. Mary's Secondary School (SMSS)"

3. **Access Kilimanjaro School**: http://localhost:8002
   - Login as any user
   - View school-specific dashboard
   - School context indicator shows "Kilimanjaro International School (KIS)"

## Features

### School Context Indicator
- Shows which school you're currently accessing
- Appears in the header of all pages
- Displays "Platform Level" for super admin access

### Multi-Tenant Middleware
- Automatically detects school based on URL/port
- Sets school context for all requests
- Ensures users can only access their assigned school

### Data Isolation
- Each school has its own data context
- Super admin can access any school
- School users are restricted to their school only

## Troubleshooting

### Server Not Starting
- Check if ports 8000, 8001, 8002 are available
- Use `lsof -i :8000` to check port usage
- Kill existing processes: `pkill -f "php artisan serve"`

### School Context Not Showing
- Clear browser cache
- Check if middleware is properly registered
- Verify school codes in database

### Access Denied
- Ensure user belongs to the correct school
- Check user roles and permissions
- Verify school is active in database

## Development Notes

- The system uses port-based multi-tenancy
- School context is set via middleware
- All controllers check for current school context
- Super admin can access any school through different URLs
