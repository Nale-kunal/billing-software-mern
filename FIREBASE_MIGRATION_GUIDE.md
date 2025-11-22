# Firebase Migration Guide

This document provides a complete guide for the MongoDB to Firebase migration.

## Overview

The entire codebase has been migrated from MongoDB/Mongoose to Firebase Firestore. All database operations now use Firebase Admin SDK.

## Migration Summary

### Files Converted

#### Services (New - Replaces Models)
- `backend/services/userService.js` - User operations
- `backend/services/itemService.js` - Item/Inventory operations
- `backend/services/customerService.js` - Customer operations
- `backend/services/invoiceService.js` - Invoice operations
- `backend/services/transactionService.js` - Transaction operations

#### Controllers Updated
- `backend/controllers/authController.js`
- `backend/controllers/inventoryController.js`
- `backend/controllers/customerController.js`
- `backend/controllers/posController.js`
- `backend/controllers/reportController.js`

#### Middleware Updated
- `backend/middlewares/authMiddleware.js`

#### Utilities Updated
- `backend/utils/stockAlert.js`

#### Configuration Files
- `backend/config/db.js` - Now uses Firebase
- `backend/config/firebase.config.js` - New Firebase configuration
- `backend/utils/firestoreHelpers.js` - New helper utilities

#### Package Management
- `backend/package.json` - Replaced mongoose with firebase-admin

### Firestore Collection Structures

#### users
```javascript
{
  _id: "auto-generated",
  name: String,
  email: String (unique, lowercase),
  password: String (hashed),
  shopName: String,
  phone: String,
  role: String ("owner" | "admin"),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### items
```javascript
{
  _id: "auto-generated",
  name: String,
  sku: String,
  category: String,
  costPrice: Number,
  sellingPrice: Number,
  stockQty: Number,
  lowStockLimit: Number,
  unit: String,
  addedBy: String (userId reference),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### customers
```javascript
{
  _id: "auto-generated",
  name: String,
  phone: String,
  email: String (lowercase),
  address: String,
  dues: Number,
  transactionHistory: Array[String] (transaction IDs),
  owner: String (userId reference),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### invoices
```javascript
{
  _id: "auto-generated",
  invoiceNo: String (unique),
  customer: String (customerId reference) | null,
  items: Array[{
    item: String (itemId reference),
    quantity: Number,
    price: Number,
    total: Number
  }],
  subtotal: Number,
  discount: Number,
  totalAmount: Number,
  paidAmount: Number,
  paymentStatus: String ("paid" | "unpaid" | "partial"),
  paymentMethod: String ("cash" | "upi" | "card" | "due"),
  createdBy: String (userId reference),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### transactions
```javascript
{
  _id: "auto-generated",
  type: String ("sale" | "due" | "payment" | "purchase" | "refund"),
  customer: String (customerId reference) | null,
  invoice: String (invoiceId reference) | null,
  amount: Number,
  paymentMethod: String ("cash" | "upi" | "card" | "due"),
  description: String,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install `firebase-admin` and remove the need for `mongoose`.

### 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database
4. Go to Project Settings > Service Accounts
5. Generate a new private key (JSON file)
6. Copy the contents of the JSON file

### 3. Environment Variables

Create a `.env` file in the `backend` directory with:

```env
# Server Configuration
PORT=5000

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}
```

**Important**: The `FIREBASE_SERVICE_ACCOUNT` should be the entire JSON object as a string. You can:
- Copy the entire JSON from the service account key file
- Remove all newlines and format as a single line
- Escape any quotes if needed

Alternatively, you can use Application Default Credentials:
```bash
gcloud auth application-default login
```

### 4. Firestore Security Rules

The security rules are defined in `firestore.rules`. Deploy them using:

```bash
firebase deploy --only firestore:rules
```

### 5. Firestore Indexes

The indexes are defined in `firestore.indexes.json`. Deploy them using:

```bash
firebase deploy --only firestore:indexes
```

## Deployment

### Firebase Hosting (Frontend)

```bash
# Build frontend
cd frontend
npm run build

# Deploy
firebase deploy --only hosting
```

### Firebase Functions (Backend)

If you want to deploy the backend as Firebase Functions:

1. Create `backend/index.js` (Functions entry point)
2. Deploy:
```bash
firebase deploy --only functions
```

### Alternative: Traditional Server Deployment

The backend can still run as a traditional Express server. Just:

```bash
cd backend
npm start
```

## Key Differences from MongoDB

1. **No Schema Validation**: Firestore doesn't enforce schemas. Validation is handled in application code.

2. **No Native Populate**: Firestore doesn't have a `populate()` method. We manually fetch referenced documents.

3. **Query Limitations**: Some complex queries (like `$expr`) are handled in memory after fetching.

4. **Transactions**: Firestore transactions work differently. For complex operations, use Firestore batch writes.

5. **ID Format**: Firestore uses auto-generated string IDs instead of ObjectIds.

## Testing

After migration, test all endpoints:

1. **Authentication**
   - POST `/api/auth/register`
   - POST `/api/auth/login`
   - GET `/api/auth/profile`

2. **Inventory**
   - GET `/api/inventory`
   - POST `/api/inventory`
   - PUT `/api/inventory/:id`
   - DELETE `/api/inventory/:id`

3. **Customers**
   - GET `/api/customers`
   - POST `/api/customers`
   - PUT `/api/customers/:id`
   - DELETE `/api/customers/:id`

4. **POS/Invoices**
   - POST `/api/pos/invoice`
   - GET `/api/pos/invoices`
   - GET `/api/pos/invoice/:id`
   - DELETE `/api/pos/invoice/:id`

5. **Reports**
   - GET `/api/reports/sales`
   - GET `/api/reports/stock`
   - GET `/api/reports/customers`

## Troubleshooting

### Connection Issues
- Verify `FIREBASE_PROJECT_ID` is correct
- Check that service account JSON is properly formatted
- Ensure Firestore is enabled in Firebase Console

### Permission Errors
- Review Firestore security rules
- Check that service account has proper permissions

### Query Performance
- Ensure all required indexes are created
- Check Firestore console for missing index warnings

## Migration Checklist

- [x] Firebase configuration created
- [x] All models converted to services
- [x] All controllers updated
- [x] Middleware updated
- [x] Utilities updated
- [x] Package.json updated
- [x] Firestore rules created
- [x] Firestore indexes defined
- [x] Firebase deployment config created
- [ ] Environment variables configured
- [ ] Firestore rules deployed
- [ ] Firestore indexes deployed
- [ ] All endpoints tested
- [ ] Data migrated (if existing data exists)

## Notes

- JWT authentication remains unchanged
- All business logic remains the same
- Only the database layer was changed
- Response formats are identical to before

