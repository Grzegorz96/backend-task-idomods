# Backend Task - Idomods

Node.js/Express application for fetching and managing orders from Idosell API. The application automatically fetches orders, updates them in MongoDB database and provides REST API for retrieving them.

## 🚀 Quick Start

### 1. Requirements

- **Node.js** (version 18+)
- **Docker** and **Docker Compose**
- **npm** or **yarn**

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd backend-task-idomods

# Install dependencies
npm install
```

### 3. Environment Configuration

Copy `env.example` file to `.env` and fill in the values:

```bash
cp env.example .env
```

**The `.env` file should contain:**

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=idomods
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=mongoPass

# Idosell API Configuration
IDOSELL_ORDERS_URL=https://your-shop.yourtechnicaldomain.com/api/admin/v7/orders/orders?extra
IDOSELL_API_KEY=your_api_key_here

# Application Configuration
PORT=3000
POLLING_INTERVAL_MINUTES=5

# Security Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://example.com
```

### 4. Running Docker (MongoDB)

```bash
# Run MongoDB in Docker container
docker-compose -f compose.dev.yaml up -d

# Check if MongoDB is running
docker-compose -f compose.dev.yaml ps
```

### 5. Running the Application

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm run build
npm start
```

The application will be available at: `http://localhost:3000`

## 📋 API Endpoints

### GET /orders

Retrieves all orders in CSV format.

**Query Parameters:**

- `minWorth` (optional) - minimum order value
- `maxWorth` (optional) - maximum order value

**Examples:**

```bash
# All orders
GET http://localhost:3000/orders

# Orders within price range
GET http://localhost:3000/orders?minWorth=100&maxWorth=500

# Orders above specified amount
GET http://localhost:3000/orders?minWorth=200
```

**Response:** CSV file with headers:

```csv
orderNumber,totalAmount,currency,status,products
1050,0.96,CZK,new,2(12)
11,64,PLN,canceled,
```

### GET /orders/:orderNumber

Retrieves a specific order by number.

**Example:**

```bash
GET http://localhost:3000/orders/1050
```

**Response:**

```json
{
  "orderNumber": 1050,
  "totalAmount": 0.96,
  "currency": "CZK",
  "status": "new",
  "products": [
    {
      "productId": 2,
      "quantity": 12
    }
  ],
  "createdAt": "2025-01-20T10:30:00.000Z",
  "updatedAt": "2025-01-20T10:30:00.000Z"
}
```

## 🛡️ Security

### CORS (Cross-Origin Resource Sharing)

- Configured via `ALLOWED_ORIGINS` variable
- Only GET methods allowed by default
- Blocks requests without Origin header

### Rate Limiting

- **General limit:** 100 requests per 15 minutes per IP
- **Order endpoints:** 50 requests per 15 minutes per IP
- Automatic `RateLimit-*` headers

### Input Validation

- **Query parameters:** Validation via Zod DTO
- **Path parameters:** Order number validation
- **Automatic conversions:** String → Number
- **Range checking:** minWorth ≤ maxWorth, values ≥ 0

## 🔄 Automatic Order Fetching

The application automatically:

1. **Fetches all orders** on startup
2. **Updates existing** orders every X minutes
3. **Adds new** orders
4. **Stops updating** orders with statuses: `finished`, `lost`, `false`

Configure interval via `POLLING_INTERVAL_MINUTES`.

## 📁 Project Structure

```
src/
├── config/           # Environment configuration
│   ├── env-schema.ts # Environment variables validation
│   └── index.ts      # Configuration export
├── order/            # Orders module
│   ├── order.controller.ts    # HTTP controller
│   ├── order.service.ts      # Business logic
│   ├── order.repository.ts   # Database access
│   ├── order.model.ts        # MongoDB model
│   ├── order.dto.ts          # DTO validation
│   └── index.ts              # Module export
├── middlewares/       # Express middleware
│   ├── security.ts           # CORS, Rate Limiting
│   ├── validation.ts         # Request validation
│   ├── error-handler.ts      # Error handling
│   └── index.ts              # Middleware export
├── utils/             # Helper utilities
│   ├── csv.ts               # CSV conversion
│   ├── errors.ts            # Error classes
│   └── index.ts             # Utils export
├── app.ts             # Express configuration
└── index.ts           # Application entry point
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if Docker is running
docker ps

# Check MongoDB logs
docker-compose -f compose.dev.yaml logs mongo

# Restart MongoDB
docker-compose -f compose.dev.yaml restart mongo
```

### CORS Blocking Requests

- Check if origin is in `ALLOWED_ORIGINS`
- Add your origin to whitelist in `.env`
- Check CORS logs in application console

### Rate Limiting

- Check `RateLimit-*` headers in response
- Wait for time window reset
- Adjust limits in `src/middlewares/security.ts`

### Validation Errors

- Check query parameters format
- Ensure `minWorth ≤ maxWorth`
- Check if values are non-negative

## 📝 Scripts

```bash
# Development with auto-reload
npm run dev

# Build TypeScript
npm run build

# Start production
npm start

```

## 🔍 Monitoring

The application logs:

- MongoDB connections
- Order fetching from API
- Database updates
- CORS and validation errors
- Order statistics

## 📚 Technologies

- **Node.js** + **Express.js** - Backend framework
- **MongoDB** + **Mongoose** - Database
- **TypeScript** - Static typing
- **Zod** - Data validation
- **Axios** - HTTP client for API
- **node-cron** - Scheduled tasks
- **@json2csv/node** - CSV conversion
- **Docker** - MongoDB containerization
- **CORS** + **express-rate-limit** - Security
