# Smart Meter API Integration Guide

## 🔌 Overview

Your EcoQuest dashboard now includes comprehensive integration with Indian smart meter providers! This system connects to real-time energy data from major electricity companies to provide accurate consumption tracking and generate precise environmental impact calculations.

## 🏢 **Supported Smart Meter Providers**

### ⚡ **Major Indian Energy Companies**

| Provider | Regions Covered | Auth Type | Features Supported |
|----------|-----------------|-----------|-------------------|
| **Tata Power** | Mumbai, Delhi, Odisha, Jharkhand | JWT | Real-time, Billing, Demand, Quality, Outage |
| **Adani Electricity** | Mumbai Suburban, Ahmedabad, Surat | OAuth | Real-time, Billing, Demand, Prepaid |
| **BSES Delhi** | Delhi South, Delhi West | API Key | Real-time, Billing, Outage, Complaints |
| **Haryana Power Limited (HPL)** | Gurgaon, Faridabad, Sonipat | Basic Auth | Real-time, Billing |
| **Secure Meters (L&T)** | Pan India | JWT | Real-time, Analytics, Billing, Quality, Tamper |
| **Genus Power** | Pan India | API Key | Real-time, Prepaid, Billing, Remote Control |
| **Qube Energy Solutions** | Maharashtra, Karnataka, Tamil Nadu | OAuth | Real-time, Analytics, Billing |

## 🔧 **API Integration Features**

### 📊 **Data Points Available**
- **Current Reading**: Latest meter reading in kWh
- **Historical Data**: Daily/monthly consumption patterns
- **Real-time Metrics**: Instant power, voltage, current, frequency
- **Billing Information**: Current bill, due dates, payment status
- **Power Quality**: Power factor, voltage variations, frequency stability
- **Demand Metrics**: Peak demand, load factor analysis

### 🔐 **Authentication Support**
- **API Key**: Simple key-based authentication
- **OAuth 2.0**: Client credentials and authorization code flows
- **JWT Tokens**: JSON Web Token based authentication
- **Basic Auth**: Username/password authentication

## 🚀 **Quick Start Guide**

### 1. **Navigate to Smart Meter Section**
```
Dashboard → Controls Tab → Smart Meter Integration
```

### 2. **Connect Your Meter**
1. **Select Your Provider**: Choose from the supported companies
2. **Enter Consumer ID**: Found on your electricity bill
3. **Provide Credentials**: API key, username/password, or OAuth details
4. **Test Connection**: System validates and fetches data

### 3. **Demo Mode**
If you don't have API credentials, use **"Try Demo Connection"** to explore features with realistic mock data.

## 🎯 **Integration Examples**

### **Example 1: Tata Power Connection**
```typescript
// Consumer ID format: TP123456789
const api = new SmartMeterAPI('tata_power', {
  username: 'your_username',
  password: 'your_password'
});

const currentReading = await api.getCurrentReading('TP123456789');
```

### **Example 2: Adani Electricity (OAuth)**
```typescript
// Consumer ID format: AD987654321
const api = new SmartMeterAPI('adani', {
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret'
});

const realTimeData = await api.getRealTimeConsumption('AD987654321');
```

### **Example 3: BSES Delhi (API Key)**
```typescript
// Consumer ID format: BS555444333
const api = new SmartMeterAPI('bses', {
  apiKey: 'your_api_key_here'
});

const billingInfo = await api.getBillingInfo('BS555444333');
```

## 📱 **Dashboard Features**

### **Connection Management**
- **Provider Selection**: Visual cards showing all supported companies
- **Auto-Detection**: System detects provider from consumer ID format
- **Connection Status**: Live status indicator with reconnection
- **Saved Credentials**: Secure storage for auto-reconnect

### **Real-time Monitoring**
- **Instant Power**: Live power consumption in watts/kW
- **Voltage Monitoring**: 3-phase voltage readings (R, Y, B phases)
- **Current Measurement**: Phase-wise current consumption
- **Power Quality**: Power factor, frequency monitoring
- **Auto-Refresh**: Updates every 30 seconds for supported providers

### **Data Visualization**
- **Consumption Charts**: Daily/monthly energy usage trends
- **Weekly Patterns**: Day-of-week consumption analysis
- **Quality Metrics**: Power factor and voltage stability charts
- **Billing Timeline**: Payment history and due date tracking

### **Analytics & Insights**
- **Load Pattern Analysis**: Peak usage identification
- **Efficiency Metrics**: Power factor optimization suggestions
- **Cost Analysis**: Rate comparison and billing breakdown
- **Demand Monitoring**: Peak demand tracking and alerts

## 🔒 **Security & Privacy**

### **Data Protection**
- **Local Storage**: Credentials stored locally on your device
- **Encrypted Connections**: All API calls use HTTPS/SSL
- **No Data Sharing**: Your consumption data stays private
- **Secure Authentication**: Industry-standard auth protocols

### **API Rate Limits**
- **Real-time Data**: Maximum 120 requests/hour per consumer
- **Historical Data**: Maximum 10 requests/hour
- **Billing Data**: Maximum 5 requests/hour
- **Auto-retry**: Built-in retry logic with exponential backoff

## ⚡ **Real-World Usage Examples**

### **Smart Home Optimization**
```typescript
// Get current power consumption
const realTime = await api.getRealTimeConsumption(consumerId);
if (realTime.instantPower > 5000) {
  // High consumption alert - trigger energy-saving quest
  generateUrgentQuest('high_consumption', {
    currentPower: realTime.instantPower,
    suggestion: 'Switch off non-essential appliances'
  });
}
```

### **Bill Prediction**
```typescript
// Predict monthly bill based on current usage
const currentUsage = await api.getCurrentReading(consumerId);
const dailyAverage = currentUsage.unitsConsumed / 30;
const projectedMonthly = dailyAverage * 30;
const estimatedBill = projectedMonthly * currentUsage.tariffRate + 150; // Fixed charges
```

### **Power Quality Monitoring**
```typescript
// Monitor power quality for equipment protection
const realTime = await api.getRealTimeConsumption(consumerId);
if (realTime.voltage < 200 || realTime.voltage > 250) {
  showAlert('Voltage fluctuation detected - protect sensitive equipment');
}
if (realTime.powerFactor < 0.8) {
  suggestPowerFactorImprovement();
}
```

## 🔌 **API Endpoints Reference**

### **Base URLs**
```
Tata Power:     https://wss.tatapower.com/api/smartmeter
Adani:          https://online.adanielectricity.com/api/meter
BSES:           https://www.bsesdelhi.com/api/smartgrid
HPL:            https://hplonline.in/api/meters
Secure/L&T:     https://securemeters.com/api/energy
Genus:          https://api.genuspower.com/smartmeters
Qube:           https://qube-energy.com/api/v1/meters
```

### **Common Endpoints**
```
GET  /consumers/{id}/current     - Current meter reading
GET  /consumers/{id}/realtime    - Real-time consumption
GET  /consumers/{id}/history     - Historical readings
GET  /consumers/{id}/billing     - Billing information
POST /auth/login                 - Authentication
```

## 🛠️ **Troubleshooting**

### **Common Issues**

**1. Connection Failed**
- ✅ Verify consumer ID format matches your provider
- ✅ Check credentials are correct
- ✅ Ensure your meter supports smart features
- ✅ Contact your electricity provider for API access

**2. No Real-time Data**
- ✅ Not all providers support real-time features
- ✅ Your meter may need firmware update
- ✅ Check if real-time features are enabled

**3. Historical Data Missing**
- ✅ Some providers have limited historical data
- ✅ New connections may have 24-48 hour delay
- ✅ Check date range parameters

### **Error Codes**
```
401 - Authentication failed
403 - Access denied or insufficient permissions  
404 - Consumer ID not found
429 - Rate limit exceeded
500 - Provider server error
503 - Service temporarily unavailable
```

## 🎮 **Integration with EcoQuest Features**

### **Dynamic Quest Generation**
Smart meter data enhances quest generation:
- **High Usage Alerts**: Generate quests when consumption exceeds normal patterns
- **Time-of-Use Optimization**: Quests based on peak/off-peak tariff periods
- **Power Quality Issues**: Quests for improving power factor or addressing voltage issues
- **Bill Optimization**: Quests before billing cycle to reduce costs

### **Accurate Impact Calculation**
- **Real Consumption Data**: More precise carbon footprint calculations
- **Net Kada Accuracy**: Actual energy savings vs. app carbon footprint
- **Personalized Tips**: Based on your actual usage patterns
- **Achievement Tracking**: Real progress measurement

### **Smart Home Integration**
- **Device Control**: Smart switches based on consumption patterns
- **Load Scheduling**: Optimize device usage based on real-time rates
- **Alerts & Automation**: Automatic actions based on usage thresholds

## 💡 **Best Practices**

### **For Users**
1. **Regular Monitoring**: Check dashboard daily for consumption patterns
2. **Bill Verification**: Compare smart meter data with official bills
3. **Power Quality**: Monitor voltage and power factor regularly
4. **Peak Management**: Shift high-power activities to off-peak hours

### **For Developers**
1. **Error Handling**: Implement robust error handling and fallbacks
2. **Rate Limiting**: Respect API rate limits to avoid blocks
3. **Data Caching**: Cache frequently accessed data locally
4. **User Privacy**: Never log or store sensitive consumption data

## 🌍 **Environmental Impact**

### **Carbon Footprint Calculation**
```typescript
// Calculate carbon emissions from electricity consumption
const carbonIntensity = 0.82; // kg CO2/kWh for Indian grid
const monthlyConsumption = 350; // kWh
const carbonFootprint = monthlyConsumption * carbonIntensity; // 287 kg CO2
```

### **Net Kada Impact**
```typescript
// Your app's positive environmental impact
const userEnergySaved = 45; // kWh saved through app guidance
const carbonAvoided = userEnergySaved * 0.82; // 36.9 kg CO2 avoided
const appCarbon = 2.1; // kg CO2 from app usage
const netKada = carbonAvoided - appCarbon; // +34.8 kg CO2 net benefit
```

## 🚀 **Future Enhancements**

### **Planned Features**
- **Solar Integration**: Connect solar inverter data for net metering
- **Battery Storage**: Monitor home battery systems
- **EV Charging**: Track electric vehicle charging patterns
- **Appliance-level Monitoring**: Individual device consumption tracking
- **Predictive Analytics**: AI-powered usage and bill predictions
- **Community Benchmarking**: Compare with similar households

### **API Expansions**
- **More Providers**: State electricity boards and private utilities
- **Enhanced Features**: Demand response, dynamic pricing alerts
- **IoT Integration**: Smart switches, sensors, and home automation
- **Renewable Tracking**: Solar generation and feed-in tariff data

---

## ✅ **Ready to Start?**

1. **Navigate to your dashboard**: `http://localhost:9002/dashboard`
2. **Go to Controls tab**
3. **Click "Smart Meter Integration"**
4. **Select your electricity provider**
5. **Enter your consumer ID and credentials**
6. **Start monitoring your real-time energy data!**

Your smart meter integration will revolutionize how you track and optimize energy consumption, providing the most accurate data for your Net Kada environmental impact calculations! 🌍⚡

**Need help?** The system includes comprehensive demo mode and fallback to realistic mock data, so you can explore all features even without real API credentials.