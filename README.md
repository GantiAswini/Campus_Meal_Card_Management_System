# University Canteen Cashless Payment System

A comprehensive web-based solution for managing a cashless payment system in university canteens.

## 🏗️ Architecture Overview

This system implements a role-based cashless payment solution with three main components:
- **Backend API**: Node.js/Express server with role-based authentication
- **Web Dashboard**: React-based admin interface for staff roles
- **Mobile Web App**: Student-focused interface for card management

## 🎯 User Roles & Permissions

### Admin (University Management)
- Complete system oversight
- View all students, balances, and transactions
- System-wide statistics and reporting
- User management capabilities

### Manager
- Approve/reject student recharge requests
- Monitor student activity and spending patterns
- View detailed transaction reports
- Manage operational settings

### Cashier
- Process meal purchases by deducting balances
- Quick student lookup during rush hours
- View recent transactions
- Access to meal menu and pricing

### Student
- View current card balance
- Request card recharges (with mock payment)
- View complete transaction history
- Manage account settings

## 📊 Database Schema Design

### Users Table
```json
{
  "id": "string (UUID)",
  "email": "string (unique)",
  "password": "string (hashed)",
  "role": "admin | manager | cashier | student",
  "name": "string",
  "isActive": "boolean",
  "createdAt": "datetime"
}
```

### Students Table
```json
{
  "id": "string (UUID)",
  "userId": "string (FK to Users)",
  "studentNumber": "string (unique)",
  "yearLevel": "string",
  "department": "string"
}
```

### MealCards Table
```json
{
  "id": "string (UUID)",
  "studentId": "string (FK to Students)",
  "cardNumber": "string (unique)",
  "balance": "number (decimal)",
  "isActive": "boolean",
  "createdAt": "datetime",
  "lastUsed": "datetime"
}
```

### Transactions Table
```json
{
  "id": "string (UUID)",
  "cardId": "string (FK to MealCards)",
  "type": "recharge | meal_purchase",
  "amount": "number (decimal)",
  "description": "string",
  "status": "pending | approved | completed | rejected",
  "processedBy": "string (FK to Users)",
  "createdAt": "datetime"
}
```

### Meals Table (Bonus Feature)
```json
{
  "id": "string (UUID)",
  "name": "string",
  "price": "number (decimal)",
  "category": "string",
  "isAvailable": "boolean",
  "description": "string"
}
```

## 🔐 Design Decisions & Rationale

### 1. Data Modeling Decisions

**User-Role Separation**: Instead of separate tables for each role, I used a single Users table with role-based permissions. This simplifies authentication while maintaining flexibility.

**Card-Student Relationship**: One-to-one relationship between students and meal cards, ensuring each student has exactly one active card.

**Transaction Status Flow**: Transactions have status tracking (pending → approved → completed) to handle the approval workflow for recharges.

**Decimal Precision**: Using precise decimal handling for monetary values to avoid floating-point arithmetic issues.

### 2. Business Rules & Edge Cases

**Insufficient Balance**: System prevents meal purchases when balance is insufficient, showing clear error messages and suggesting recharge.

**Concurrent Transactions**: Transaction processing includes timestamp-based conflict resolution and atomic balance updates.

**Recharge Approval**: Recharges require manager approval to maintain control over fund injection into the system.

**Double-Transaction Prevention**: Each transaction has a unique ID and timestamp validation to prevent duplicates.

### 3. Dashboard Design Philosophy

**Admin Dashboard**: Focuses on high-level KPIs, system health, and comprehensive oversight with charts and summaries.

**Manager Dashboard**: Emphasizes approval workflows and operational metrics, with quick action capabilities.

**Cashier Dashboard**: Optimized for speed during rush hours with large buttons, quick search, and minimal steps for transactions.

**Student Interface**: Mobile-first design focusing on balance visibility, easy recharge, and transaction transparency.

## 🚀 Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Main application: `http://localhost:5173`
   - Admin login: admin@university.edu / admin123
   - Manager login: manager@university.edu / manager123
   - Cashier login: cashier@university.edu / cashier123
   - Student login: student@university.edu / student123

## 🔧 Key Features Implemented

### Core Functionality
- ✅ Role-based authentication and authorization
- ✅ Meal card balance management
- ✅ Transaction processing and history
- ✅ Manager approval workflow for recharges
- ✅ Real-time balance updates
- ✅ Comprehensive dashboards for each role

### Bonus Features
- ✅ Meal menu with categories and pricing
- ✅ Weekly/monthly statistics and reports
- ✅ Student spending analytics
- ✅ Export functionality for reports
- ✅ Responsive mobile-first student interface

## 🎯 Assumptions Made

1. **Payment Integration**: Mock payment system simulates real payment gateway integration
2. **Card Assignment**: Each student gets exactly one meal card upon registration
3. **Manager Approval**: All recharges require manager approval for financial control
4. **Operating Hours**: System assumes typical university canteen operating hours
5. **Currency**: All amounts are in local currency units (e.g., dollars)

## 📱 User Experience Highlights

- **Admin**: Comprehensive oversight with visual analytics
- **Manager**: Efficient approval workflows with detailed context
- **Cashier**: Lightning-fast transaction processing
- **Student**: Intuitive mobile interface with instant feedback

## 🔄 Future Enhancements

- QR code integration for contactless payments
- Real-time notifications for balance alerts
- Advanced analytics and predictive insights
- Integration with university student information systems
- Offline support for cashier operations

---

*This system demonstrates production-ready architecture with proper separation of concerns, comprehensive error handling, and user-centric design.*