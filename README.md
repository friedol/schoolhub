# EduTZ-GroupSMS - Multi-School Management System for Tanzania

A comprehensive, multi-tenant, bilingual (English & Swahili) web-based platform that allows educational groups, franchise owners, or organizations to manage multiple independent schools across Tanzania, from Nursery to Advanced Level.

## 🌟 Key Features

### Multi-Tenant Architecture
- **Complete Data Isolation**: Each school operates in a fully isolated environment
- **Centralized Oversight**: Platform Super Admins can monitor all schools from one dashboard
- **Scalable Design**: Easy to add new schools as the group expands
- **Customizable per School**: Each school can customize its settings, fee structures, and academic calendar

### User Roles & Access Control
- **Platform Super Admin**: Full platform management and oversight
- **School Admin**: Complete school management within their institution
- **Headteacher**: Academic and administrative oversight
- **Bursar**: Financial management and fee collection
- **Teacher**: Class and student management
- **Student**: Student portal access
- **Parent**: Parent portal with child monitoring

### Tanzania-Specific Features
- **Bilingual Support**: Full English and Swahili language switching
- **Tanzanian Shillings (TZS)**: Native currency support
- **NECTA Compliance**: Built-in support for NECTA examination management
- **Mobile Money Integration**: Support for M-Pesa, Tigo Pesa, Airtel Money, and HaloPesa
- **Mobile-First Design**: Optimized for mobile devices and tablets

## 🏗️ System Architecture

### Database Design
The system uses a **shared database with schema separation** approach for optimal balance between data isolation and efficiency:

```
├── platforms (Platform information)
├── schools (School-specific data)
├── users (Multi-tenant user management)
├── roles & permissions (RBAC system)
├── school_classes (Class management)
├── subjects (Subject management)
├── academic_terms (Academic calendar)
├── fee_categories (Fee management)
└── [Additional school-specific tables]
```

### Multi-Tenancy Implementation
- **Data Isolation**: All school data is isolated using `school_id` foreign keys
- **User Context**: Users are automatically scoped to their school or platform
- **Security**: Robust middleware ensures users can only access their authorized data
- **Scalability**: Designed to handle hundreds of schools with thousands of users

## 🚀 Installation & Setup

### Prerequisites
- PHP 8.1 or higher
- Composer
- Node.js 18+ and npm
- MySQL 8.0 or PostgreSQL 13+
- Redis (for caching and sessions)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/edutz-groupsms.git
   cd edutz-groupsms
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database configuration**
   Update your `.env` file with database credentials:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=edutz_groupsms
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

6. **Run migrations and seeders**
   ```bash
   php artisan migrate
   php artisan db:seed --class=MultiTenantSeeder
   ```

7. **Build frontend assets**
   ```bash
   npm run build
   ```

8. **Start the development server**
   ```bash
   php artisan serve
   ```

## 👥 User Management

### Platform Super Admin
- **Access**: Full platform management
- **Capabilities**:
  - Create and manage schools
  - View platform-wide analytics
  - Manage subscriptions and billing
  - Access all school data (read-only)
  - Platform settings management

### School Admin
- **Access**: Complete school management
- **Capabilities**:
  - Manage students, teachers, and classes
  - Configure school settings
  - Manage fee structures
  - Academic calendar management
  - Communication management

### Teachers
- **Access**: Class and student management
- **Capabilities**:
  - View assigned classes
  - Record academic data
  - Communicate with students and parents
  - Manage class activities

### Students
- **Access**: Student portal
- **Capabilities**:
  - View academic records
  - Check fee status
  - Receive communications
  - Update profile information

### Parents
- **Access**: Parent portal
- **Capabilities**:
  - Monitor children's progress
  - Pay school fees
  - Receive communications
  - View academic reports

## 📊 Key Modules

### 1. Student Lifecycle Management
- Student registration and enrollment
- Class assignment and transfers
- Academic progress tracking
- Parent/guardian management
- Student profile management

### 2. Academic Management (NECTA Compliant)
- Subject management
- Class and stream organization
- Academic term management
- Grade recording and reporting
- NECTA examination preparation
- Academic calendar management

### 3. Fee Management
- Flexible fee structure configuration
- Multiple payment methods
- Mobile money integration
- Fee collection tracking
- Arrears management
- Financial reporting

### 4. Communication Portal
- School-wide announcements
- Class-specific communications
- Parent-teacher messaging
- Cross-school announcements (Super Admin)
- SMS and email notifications

### 5. Analytics & Reporting
- Platform-wide analytics (Super Admin)
- School-specific reports
- Student performance tracking
- Fee collection reports
- User activity monitoring

## 🌐 Bilingual Support

The system provides complete bilingual support:

### Language Switching
- Real-time language switching
- User preference persistence
- Session-based language storage
- Automatic locale detection

### Supported Languages
- **English**: Primary language for international users
- **Kiswahili**: Native language for Tanzania

### Implementation
```typescript
// Language switching component
<LanguageSwitcher 
    currentLanguage={user.language_preference} 
    className="ml-auto" 
/>
```

## 💳 Mobile Money Integration

### Supported Providers
- **M-Pesa**: Vodacom Tanzania
- **Tigo Pesa**: Tigo Tanzania
- **Airtel Money**: Airtel Tanzania
- **HaloPesa**: Halotel

### Payment Flow
1. User selects payment method
2. Enters phone number
3. Confirms payment details
4. Receives payment request on phone
5. Enters PIN to complete payment
6. Receives confirmation

### Implementation
```typescript
<MobileMoneyPayment
    isOpen={showPayment}
    onClose={() => setShowPayment(false)}
    amount={feeAmount}
    currency="TZS"
    description="School Fee Payment"
    onSuccess={handlePaymentSuccess}
/>
```

## 🔒 Security Features

### Role-Based Access Control (RBAC)
- Granular permission system
- Role-based data access
- School-level data isolation
- Platform-level oversight

### Data Protection
- Encrypted sensitive data
- Secure password hashing
- CSRF protection
- XSS prevention
- SQL injection protection

### Multi-Tenant Security
- School data isolation
- User context validation
- Secure API endpoints
- Audit logging

## 📱 Mobile Optimization

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Optimized for tablets
- Progressive Web App (PWA) ready

### Performance
- Lazy loading
- Image optimization
- Caching strategies
- CDN support

## 🧪 Testing

### Test Coverage
- Unit tests for models
- Feature tests for controllers
- Integration tests for APIs
- Frontend component tests

### Running Tests
```bash
# PHP tests
php artisan test

# Frontend tests
npm run test

# Coverage report
php artisan test --coverage
```

## 📚 Documentation

### API Documentation
- RESTful API endpoints
- Authentication methods
- Request/response examples
- Error handling

### User Guides
- Super Admin manual
- School Admin guide
- Teacher handbook
- Student/parent guide

### Developer Documentation
- Code architecture
- Database schema
- Deployment guide
- Contributing guidelines

## 🚀 Deployment

### Production Requirements
- PHP 8.1+
- MySQL 8.0+ or PostgreSQL 13+
- Redis
- Nginx or Apache
- SSL certificate
- Domain configuration

### Deployment Steps
1. Configure production environment
2. Set up database
3. Run migrations
4. Build frontend assets
5. Configure web server
6. Set up SSL
7. Configure monitoring

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- Check the [documentation](docs/)
- Search [existing issues](https://github.com/your-org/edutz-groupsms/issues)
- Create a [new issue](https://github.com/your-org/edutz-groupsms/issues/new)

### Contact
- Email: support@edutz-group.com
- Phone: +255 22 123 4567
- Website: https://edutz-group.com

## 🎯 Roadmap

### Upcoming Features
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] AI-powered insights
- [ ] Integration with government systems
- [ ] Advanced reporting tools
- [ ] Multi-currency support
- [ ] Advanced communication features

### Version History
- **v1.0.0**: Initial release with core multi-tenant functionality
- **v1.1.0**: Mobile money integration
- **v1.2.0**: Enhanced analytics
- **v2.0.0**: Mobile app release

---

**EduTZ-GroupSMS** - Empowering Education Across Tanzania 🇹🇿
# schoolhub
