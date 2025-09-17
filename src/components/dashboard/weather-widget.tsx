'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSimulatedData } from "@/hooks/use-simulated-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Cloud, CloudRain, Thermometer, Wind, Droplets, Haze } from "lucide-react";
import { cn } from "@/lib/utils";

export function WeatherWidget() {
  const { weather, loading } = useSimulatedData();

  const getWeatherIcon = (condition: string) => {
    if (condition.includes("Cloud")) return <Cloud className="h-8 w-8 text-primary" />;
    if (condition.includes("Rain")) return <CloudRain className="h-8 w-8 text-primary" />;
    return <Sun className="h-8 w-8 text-primary" />;
  };

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return "text-green-500";
    if (aqi <= 100) return "text-yellow-500";
    if (aqi <= 150) return "text-orange-500";
    if (aqi <= 200) return "text-red-500";
    return "text-purple-500";
  };

  if (loading || !weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Conditions - {weather.location}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {getWeatherIcon(weather.condition)}
            <div>
              <p className="text-4xl font-bold">{weather.temperature}°C</p>
              <p className="text-muted-foreground">{weather.condition}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn("text-2xl font-bold", getAqiColor(weather.airQuality.index))}>{weather.airQuality.index}</p>
            <p className="text-muted-foreground text-sm">{weather.airQuality.category}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            <span>Humidity: {weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <span>Wind: {weather.windSpeed} km/h</span>
          </div>
           <div className="flex items-center gap-2">
            <Haze className="h-4 w-4 text-muted-foreground" />
            <span>AQI</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
