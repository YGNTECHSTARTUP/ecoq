# EcoQuest Dashboard Setup Guide

## 🎯 What's New

Your dashboard has been significantly improved with **clear functionality** and **real-time environmental quests**! Here's what you now have:

### ✨ Enhanced Features
- **5 Clear Dashboard Tabs**: Overview, Live Quests, Impact, Community, Controls
- **Real-Time Environmental Monitoring**: Weather-based quest generation
- **Dynamic Quest System**: Quests adapt to temperature, humidity, air quality, and weather conditions
- **Interactive Progress Tracking**: Complete objectives and earn points
- **Live Notifications**: Get alerts for urgent environmental actions
- **Carbon Impact Metrics**: See your "Net Kada" environmental impact

## 🚀 Quick Start

### 1. Install Dependencies
Your existing dependencies already include everything needed! The dashboard uses:
- ✅ `lucide-react` (already installed)
- ✅ `@radix-ui/react-*` components (already installed)
- ✅ `recharts` for charts (already installed)

### 2. Set Up Environment Variables (Optional)
For real weather data, copy `.env.example` to `.env.local` and add your OpenWeather API key:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:
```env
OPENWEATHER_API_KEY=your_actual_api_key_here
```

**Don't worry if you don't have an API key** - the dashboard works perfectly with realistic mock data!

### 3. Run Your App
```bash
npm run dev
```

Navigate to `http://localhost:9002/dashboard` to see the new dashboard!

## 📱 How to Use the Dashboard

### Overview Tab
- **Environmental Conditions**: Live weather and air quality data
- **Impact Metrics**: Your daily energy savings and carbon footprint
- **Quick Stats**: Community stats and recent activity summary

### Live Quests Tab ⚡
- **Real-Time Quests**: Generated based on current weather conditions
- **Environmental Triggers**: 
  - 🌡️ High temperature (>30°C) → Cooling optimization quests
  - 💧 High humidity (>70%) → Moisture management quests  
  - ☀️ Sunny conditions → Solar energy optimization quests
  - 🌫️ Poor air quality → Indoor air quality quests
- **Interactive Objectives**: Click "Complete" to mark tasks done
- **Point System**: Earn points for each completed objective
- **Urgent Alerts**: Get notified of time-sensitive environmental actions

### Impact Tab 📊
- **Net Kada Tracking**: See your positive environmental impact
- **Carbon Metrics**: Energy saved vs. app carbon footprint
- **Visual Charts**: Energy usage patterns and trends
- **Achievement Badges**: Unlock rewards for consistent action

### Community Tab 👥  
- **Leaderboards**: See how you rank among other users
- **Community Impact**: Collective energy savings and CO₂ avoided
- **Social Features**: Connect with other energy warriors

### Controls Tab 🎛️
- **Smart Home Integration**: Control connected devices
- **Simulation Tools**: Test different energy scenarios
- **Settings**: Customize your experience

## 🔧 Technical Architecture

### API Routes Created
- `/api/weather` - Fetches current weather data (with fallback to mock data)
- `/api/quests/generate` - Generates contextual quests based on conditions
- `/api/quests/[id]/[action]` - Handles quest accept/complete/skip actions

### Components Structure
```
src/app/dashboard/page.tsx - Main dashboard with tabs
src/components/dashboard/enhanced-real-time-quests.tsx - Real-time quest system
```

### Real-Time Features
- **Weather Monitoring**: Checks conditions every 5 minutes
- **Quest Updates**: Refreshes available quests every 30 minutes  
- **Live Notifications**: Browser and in-app alerts for urgent quests
- **Auto-Generation**: New quests appear when conditions change significantly

## 🎮 Quest System Logic

### Quest Generation Triggers
1. **Temperature Quests**: When temp > 30°C
2. **Humidity Quests**: When humidity > 70%
3. **Solar Quests**: During clear/sunny weather
4. **Air Quality Quests**: When AQI ≥ 3
5. **General Efficiency**: Always available daily tasks

### Urgency Levels
- 🔴 **EXTREME**: Immediate action needed (temp >35°C)
- 🟠 **HIGH**: Important action (temp 30-35°C)
- 🟡 **MEDIUM**: Moderate priority
- 🟢 **LOW**: General efficiency tasks

### Point System
- **Quest Completion**: 50-150 points based on complexity
- **Objective Completion**: 20-70 points per task
- **Energy Savings Bonus**: Extra points for high-impact actions

## 🔌 Energy Impact Calculations

Each quest objective shows:
- **Energy Savings**: Estimated kWh saved (e.g., "0.8 kWh/hour")
- **Tips**: Educational information about energy efficiency
- **Environmental Context**: Why this action matters right now

### Net Kada Formula
```
Net Environmental Impact = 
  (User Energy Saved × Carbon Intensity) - (App Carbon Footprint)
```

## 📊 Mock Data vs. Real Data

### Without API Keys (Mock Data)
- ✅ Realistic weather data for Hyderabad
- ✅ Dynamic quest generation
- ✅ Full functionality demonstration
- ✅ Varied environmental conditions

### With API Keys (Real Data)
- ✅ Actual weather from OpenWeatherMap
- ✅ Location-specific conditions
- ✅ Real-time weather changes trigger new quests

## 🛠️ Customization Options

### Location Settings
Update user location in `dashboard/page.tsx`:
```typescript
const userLocation = { lat: 17.385, lng: 78.4867 }; // Hyderabad
```

### Quest Thresholds
Modify environmental thresholds in `/api/quests/generate/route.ts`:
- Temperature thresholds
- Humidity limits  
- AQI trigger levels

### Update Intervals
Adjust monitoring frequency in components:
- Weather checks: Currently 5 minutes
- Quest refresh: Currently 30 minutes

## 🎯 Next Steps

1. **Test the Dashboard**: Navigate through all tabs
2. **Accept a Quest**: Click "Accept Quest" on any active quest
3. **Complete Objectives**: Mark objectives as complete to earn points
4. **Watch for Notifications**: New quests appear based on conditions
5. **Track Your Impact**: Monitor your Net Kada in the Impact tab

## 🤝 Integration with Your Existing Code

The new dashboard components work alongside your existing:
- ✅ Firebase authentication
- ✅ Existing UI components
- ✅ Current routing structure
- ✅ Smart meter simulations
- ✅ AI tip generation

Everything is designed to enhance, not replace, your current functionality!

## 📱 Mobile Responsive

The dashboard is fully responsive and works great on:
- 💻 Desktop (optimal experience)
- 📱 Tablets (good experience)  
- 📱 Mobile phones (functional)

---

**Ready to save the planet with data-driven environmental action? 🌍⚡**

Your dashboard now provides **clear, actionable, real-time guidance** for energy efficiency based on live environmental conditions!