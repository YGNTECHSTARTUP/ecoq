# Smart Meter Test API Endpoints

## 🧪 **Overview**

Since real smart meter APIs from Indian energy providers require actual consumer credentials and are not publicly accessible for testing, I've created comprehensive **mock/test API endpoints** that simulate real smart meter provider APIs with realistic data patterns.

## 🔗 **Test API Base URL**
```
http://localhost:9002/api/mock-smart-meter
```

## 📋 **Available Test Endpoints**

### **1. Authentication**
```http
POST /api/mock-smart-meter?endpoint=auth
Content-Type: application/json

{
  "provider": "tata_power",
  "username": "test_user",
  "password": "test_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "mock_jwt_token_tata_1234567890",
  "expiresIn": 3600,
  "provider": "tata_power",
  "message": "Authentication successful"
}
```

### **2. Current Meter Reading**
```http
GET /api/mock-smart-meter?endpoint=current&consumerId=TP123456789&provider=tata_power
```

**Response:**
```json
{
  "consumerId": "TP123456789",
  "timestamp": "2025-01-17T10:33:20Z",
  "currentReading": 52847,
  "previousReading": 52812,
  "unitsConsumed": 35,
  "tariffRate": 6.8,
  "billAmount": 388,
  "powerFactor": 0.87,
  "maxDemand": 4.2,
  "voltage": { "r": 232.1, "y": 238.5, "b": 229.8 },
  "current": { "r": 12.5, "y": 14.2, "b": 11.8 },
  "frequency": 50.1,
  "energyImported": 52847,
  "energyExported": 0,
  "reactivePower": 75.3
}
```

### **3. Real-time Consumption Data**
```http
GET /api/mock-smart-meter?endpoint=realtime&consumerId=TP123456789&provider=tata_power
```

**Response:**
```json
{
  "instantPower": 3250,
  "voltage": 231.5,
  "current": 14.0,
  "frequency": 50.2,
  "powerFactor": 0.89,
  "timestamp": "2025-01-17T10:33:20Z",
  "phaseData": {
    "r": { "voltage": 232.1, "current": 4.9 },
    "y": { "voltage": 235.2, "current": 4.6 },
    "b": { "voltage": 228.8, "current": 4.5 }
  }
}
```

### **4. Historical Data**
```http
GET /api/mock-smart-meter?endpoint=history&consumerId=TP123456789&provider=tata_power&start=2025-01-01&end=2025-01-17
```

**Response:**
```json
{
  "consumerId": "TP123456789",
  "startDate": "2025-01-01",
  "endDate": "2025-01-17",
  "totalReadings": 17,
  "readings": [
    {
      "timestamp": "2025-01-01T00:00:00Z",
      "currentReading": 52000,
      "previousReading": 51965,
      "unitsConsumed": 35,
      "tariffRate": 6.5,
      "billAmount": 228,
      "powerFactor": 0.88,
      "energyImported": 52000,
      "energyExported": 0
    }
    // ... more readings
  ]
}
```

### **5. Billing Information**
```http
GET /api/mock-smart-meter?endpoint=billing&consumerId=TP123456789&provider=tata_power
```

**Response:**
```json
{
  "billNumber": "BILL20250117456",
  "billDate": "2025-01-01",
  "dueDate": "2025-01-25",
  "billingPeriod": {
    "from": "2024-12-01",
    "to": "2024-12-31"
  },
  "unitsConsumed": 450,
  "amount": 3075,
  "status": "unpaid",
  "breakdown": {
    "energyCharges": 2925,
    "fixedCharges": 150,
    "taxes": 351,
    "total": 3075
  },
  "tariffDetails": {
    "rate": 6.5,
    "fixedCharge": 150,
    "taxRate": 12
  },
  "paymentHistory": [
    {
      "date": "2024-12-20",
      "amount": 3025,
      "status": "paid"
    }
  ]
}
```

### **6. List Available Meters**
```http
GET /api/mock-smart-meter?endpoint=list-meters
```

**Response:**
```json
{
  "totalMeters": 5,
  "meters": [
    {
      "consumerId": "TP123456789",
      "provider": "tata_power",
      "status": "active",
      "lastReading": 52847,
      "lastUpdated": "2025-01-17T10:33:20Z"
    },
    {
      "consumerId": "AD987654321",
      "provider": "adani",
      "status": "active",
      "lastReading": 48523,
      "lastUpdated": "2025-01-17T10:33:20Z"
    }
    // ... more meters
  ]
}
```

### **7. Register New Meter**
```http
POST /api/mock-smart-meter?endpoint=register-meter
Content-Type: application/json

{
  "consumerId": "NEW123456",
  "provider": "genus"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meter registered successfully",
  "consumerId": "NEW123456",
  "provider": "genus",
  "initialReading": 45234
}
```

## 🎮 **Pre-loaded Test Consumer IDs**

These consumer IDs come with pre-generated realistic data:

| Consumer ID | Provider | Daily Consumption | Tariff Rate |
|-------------|----------|------------------|-------------|
| `TP123456789` | Tata Power | ~35 units | ₹6.8/unit |
| `AD987654321` | Adani | ~42 units | ₹6.2/unit |
| `BS555444333` | BSES Delhi | ~28 units | ₹7.1/unit |
| `HP777888999` | HPL | ~38 units | ₹5.9/unit |
| `DEMO123456` | Genus Power | ~32 units | ₹6.5/unit |

## 🔧 **How to Use Test APIs**

### **Method 1: Through Your Dashboard**
1. **Go to Dashboard → Controls → Smart Meter Integration**
2. **Select any provider**
3. **Enter one of the test Consumer IDs above**
4. **Leave credentials empty** (will automatically use test API)
5. **Click "Connect to Smart Meter"**

### **Method 2: Direct API Testing**
```bash
# Test current reading
curl "http://localhost:9002/api/mock-smart-meter?endpoint=current&consumerId=TP123456789&provider=tata_power"

# Test real-time data
curl "http://localhost:9002/api/mock-smart-meter?endpoint=realtime&consumerId=TP123456789&provider=tata_power"

# Test billing info
curl "http://localhost:9002/api/mock-smart-meter?endpoint=billing&consumerId=TP123456789&provider=tata_power"
```

### **Method 3: Postman/Thunder Client**
Import these as REST API collections for easy testing.

## ⚡ **Realistic Features**

### **Smart Data Generation**
- **Time-based Load Patterns**: Higher consumption during peak hours (6-9 AM, 6-10 PM)
- **Weekend vs Weekday**: Different consumption patterns
- **Voltage Fluctuations**: Realistic 3-phase voltage variations
- **Power Quality**: Dynamic power factor and frequency variations
- **Billing Cycles**: Monthly billing with proper date calculations

### **Error Simulation**
- **10% random API failures** (HTTP 503) to test error handling
- **Authentication failures** for invalid credentials
- **Rate limiting** simulation
- **Network delays** (500ms - 1.5s response times)

### **Provider-specific Authentication**
- **Tata Power**: JWT tokens with username/password
- **Adani**: OAuth with client credentials
- **BSES**: API key authentication
- **HPL**: Basic authentication
- **Others**: Generic token-based auth

## 🔄 **Auto-fallback System**

Your smart meter integration includes a smart fallback system:

1. **Real API First**: If you provide actual credentials, it tries the real provider API
2. **Test API Second**: If no credentials or development mode, uses test API  
3. **Built-in Mock**: If test API fails, uses built-in mock data generator

## 🎯 **Integration with Your Dashboard**

The test APIs are automatically integrated into your smart meter dashboard:

- **Automatic Detection**: System detects when to use test APIs vs real APIs
- **Seamless Experience**: Users can't tell the difference in the UI
- **Development Mode**: Set `NODE_ENV=development` to force test API usage
- **Environment Flag**: Use `NEXT_PUBLIC_USE_MOCK_SMART_METER=true` to override

## 📊 **Sample Usage in Code**

```typescript
// Your existing code automatically uses test APIs in development
const api = new SmartMeterAPI('tata_power', {
  // Empty credentials will trigger test API usage
});

const reading = await api.getCurrentReading('TP123456789');
const realTime = await api.getRealTimeConsumption('TP123456789');
const billing = await api.getBillingInfo('TP123456789');
```

## 🚀 **Ready to Test!**

1. **Start your Next.js app**: `npm run dev`
2. **Navigate to**: `http://localhost:9002/dashboard`
3. **Go to Controls tab**
4. **Try the Smart Meter Integration with test Consumer IDs**
5. **Explore all the realistic data and features!**

## 🔐 **Production vs Development**

| Environment | API Used | Authentication Required |
|-------------|----------|------------------------|
| **Development** | Test API | No (optional) |
| **Production** | Real Provider APIs | Yes (actual credentials) |
| **Demo Mode** | Test API | No |

The system automatically handles the switching between test and real APIs based on your environment and credential availability!

---

**🎉 Your smart meter integration now has comprehensive test APIs for development and demonstration!** 

These test endpoints provide realistic data patterns, proper error handling, and support all the features your dashboard needs for development and testing.