"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  EngagementContext,
  TaskEnergyLevel,
  TaskDuration,
} from "@/types/database";
import {
  MapPin,
  Battery,
  Clock,
  Smartphone,
  Home,
  Building,
  Settings,
  Zap,
  ZapOff,
  Timer,
} from "lucide-react";

interface ContextSelectorProps {
  context: EngagementContext;
  onContextChange: (context: Partial<EngagementContext>) => void;
  className?: string;
}

const locationOptions = [
  { value: "home", label: "Home", icon: Home },
  { value: "office", label: "Office", icon: Building },
  { value: "mobile", label: "Mobile", icon: Smartphone },
] as const;

const energyOptions = [
  { value: "high", label: "High Energy", icon: Zap, color: "text-green-600" },
  {
    value: "medium",
    label: "Medium Energy",
    icon: Battery,
    color: "text-yellow-600",
  },
  { value: "low", label: "Low Energy", icon: ZapOff, color: "text-red-600" },
] as const;

const timeOptions = [
  { value: "5min", label: "5 minutes", duration: "5min" },
  { value: "15min", label: "15 minutes", duration: "15min" },
  { value: "30min", label: "30 minutes", duration: "30min" },
  { value: "1hour", label: "1 hour", duration: "1hour" },
  { value: "2hour+", label: "2+ hours", duration: "2hour+" },
] as const;

export function ContextSelector({
  context,
  onContextChange,
  className,
}: ContextSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentLocation = locationOptions.find(
    (opt) => opt.value === context.current_location
  );
  const currentEnergy = energyOptions.find(
    (opt) => opt.value === context.current_energy
  );
  const currentTime = timeOptions.find(
    (opt) => opt.value === context.available_time
  );

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Quick Context Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Location */}
              <div className="flex items-center gap-2">
                {currentLocation && (
                  <>
                    <currentLocation.icon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">
                      {currentLocation.label}
                    </span>
                  </>
                )}
              </div>

              {/* Energy */}
              <div className="flex items-center gap-2">
                {currentEnergy && (
                  <>
                    <currentEnergy.icon
                      className={`h-4 w-4 ${currentEnergy.color}`}
                    />
                    <span className="text-sm">{currentEnergy.label}</span>
                  </>
                )}
              </div>

              {/* Time */}
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-gray-600" />
                <span className="text-sm">{currentTime?.label}</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Expanded Context Controls */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              {/* Location Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </label>
                <Select
                  value={context.current_location}
                  onValueChange={(value) =>
                    onContextChange({
                      current_location: value as "home" | "office" | "mobile",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Energy Level Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Battery className="h-4 w-4" />
                  Energy Level
                </label>
                <Select
                  value={context.current_energy}
                  onValueChange={(value) =>
                    onContextChange({
                      current_energy: value as TaskEnergyLevel,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {energyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className={`h-4 w-4 ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Available Time Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Available Time
                </label>
                <Select
                  value={context.available_time}
                  onValueChange={(value) =>
                    onContextChange({ available_time: value as TaskDuration })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {!isExpanded && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Quick set:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onContextChange({
                    current_location: "home",
                    current_energy: "high",
                    available_time: "1hour",
                  })
                }
                className="h-6 px-2 text-xs"
              >
                Deep Work
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onContextChange({
                    current_location: "mobile",
                    current_energy: "medium",
                    available_time: "15min",
                  })
                }
                className="h-6 px-2 text-xs"
              >
                Quick Tasks
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onContextChange({
                    current_location: "office",
                    current_energy: "low",
                    available_time: "30min",
                  })
                }
                className="h-6 px-2 text-xs"
              >
                Admin Work
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
