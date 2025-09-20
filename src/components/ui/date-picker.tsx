"use client";

import * as React from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  clearable?: boolean;
  fromDate?: Date;
  toDate?: Date;
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Pick a date",
  disabled = false,
  className,
  clearable = false,
  fromDate,
  toDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    onSelect?.(selectedDate);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal min-h-[44px] touch-manipulation",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">
            {date ? format(date, "PPP") : placeholder}
          </span>
          {clearable && date && (
            <X
              className="ml-2 h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={(date) => {
            if (fromDate && date < fromDate) return true;
            if (toDate && date > toDate) return true;
            return false;
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateRangePickerProps {
  dateRange?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  clearable?: boolean;
}

export function DateRangePicker({
  dateRange,
  onSelect,
  placeholder = "Pick a date range",
  disabled = false,
  className,
  clearable = false,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (range: DateRange | undefined) => {
    onSelect?.(range);
    if (range?.from && range?.to) {
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(undefined);
  };

  const formatRange = () => {
    if (!dateRange?.from) return placeholder;
    if (!dateRange.to) return format(dateRange.from, "PPP");
    return `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal min-h-[44px] touch-manipulation",
            !dateRange?.from && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">{formatRange()}</span>
          {clearable && dateRange?.from && (
            <X
              className="ml-2 h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateTimePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  clearable?: boolean;
  showTime?: boolean;
}

export function DateTimePicker({
  date,
  onSelect,
  placeholder = "Pick a date and time",
  disabled = false,
  className,
  clearable = false,
  showTime = true,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date
  );

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setSelectedDate(undefined);
      onSelect?.(undefined);
      return;
    }

    // Preserve time if we already have a selected date
    if (selectedDate && showTime) {
      const dateWithTime = new Date(newDate);
      dateWithTime.setHours(selectedDate.getHours());
      dateWithTime.setMinutes(selectedDate.getMinutes());
      setSelectedDate(dateWithTime);
      onSelect?.(dateWithTime);
    } else {
      setSelectedDate(newDate);
      onSelect?.(newDate);
    }

    if (!showTime) {
      setOpen(false);
    }
  };

  const handleTimeChange = (field: "hour" | "minute", value: string) => {
    if (!selectedDate) return;

    const newDate = new Date(selectedDate);
    if (field === "hour") {
      newDate.setHours(parseInt(value));
    } else {
      newDate.setMinutes(parseInt(value));
    }

    setSelectedDate(newDate);
    onSelect?.(newDate);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(undefined);
    onSelect?.(undefined);
  };

  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const formatDateTime = () => {
    if (!selectedDate) return placeholder;
    if (showTime) {
      return format(selectedDate, "PPP 'at' p");
    }
    return format(selectedDate, "PPP");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal min-h-[44px] touch-manipulation",
            !selectedDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">{formatDateTime()}</span>
          {clearable && selectedDate && (
            <X
              className="ml-2 h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />

          {showTime && selectedDate && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Time:</label>
                <select
                  value={selectedDate.getHours()}
                  onChange={(e) => handleTimeChange("hour", e.target.value)}
                  className="rounded border px-2 py-1 text-sm min-h-[44px] touch-manipulation"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={selectedDate.getMinutes()}
                  onChange={(e) => handleTimeChange("minute", e.target.value)}
                  className="rounded border px-2 py-1 text-sm min-h-[44px] touch-manipulation"
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                className="w-full mt-2 min-h-[44px] touch-manipulation"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
