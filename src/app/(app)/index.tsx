import {
  type IAppointment,
  type IAvailableDates,
  TimeSlotPicker,
} from '@dgreasi/react-native-time-slot-picker';
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import React, { useState } from 'react';
import { View } from 'react-native';

import { type Post, usePosts } from '@/api';
import { Card } from '@/components/card';
import { SafeAreaView, Text } from '@/components/ui';

// Types
type TimeSlotConfig = {
  startHour: number;
  endHour: number;
  intervalMinutes: number;
  excludeWeekends?: boolean;
  daysToGenerate?: number;
  lunchBreakStart?: number;
  lunchBreakEnd?: number;
};

// Utility Functions
function generateTimeSlots(
  startHour: number,
  endHour: number,
  intervalMinutes: number,
  lunchBreakStart?: number,
  lunchBreakEnd?: number
): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    // Skip lunch break hours
    if (
      lunchBreakStart &&
      lunchBreakEnd &&
      hour >= lunchBreakStart &&
      hour < lunchBreakEnd
    ) {
      continue;
    }

    const currentSlots = [];
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;
      const endHour = minute + intervalMinutes >= 60 ? hour + 1 : hour;
      const endMinute = (minute + intervalMinutes) % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute
        .toString()
        .padStart(2, '0')}`;

      currentSlots.push(`${startTime}-${endTime}`);
    }
    slots.push(...currentSlots);
  }
  return slots;
}

function generateAvailableDates({
  startHour = 9,
  endHour = 17,
  intervalMinutes = 60,
  excludeWeekends = true,
  daysToGenerate = 7,
  lunchBreakStart = 12,
  lunchBreakEnd = 13,
}: TimeSlotConfig): IAvailableDates[] {
  const dates: IAvailableDates[] = [];

  for (let i = 0; i < daysToGenerate; i++) {
    const date = addDays(new Date(), i);
    // Set time to start of day to avoid timezone issues
    date.setHours(0, 0, 0, 0);
    const isWeekend = [0, 6].includes(date.getDay());

    dates.push({
      date: date.toISOString(),
      slotTimes:
        excludeWeekends && isWeekend
          ? []
          : generateTimeSlots(
              startHour,
              endHour,
              intervalMinutes,
              lunchBreakStart,
              lunchBreakEnd
            ),
    });
  }

  return dates;
}

// Generate available dates with custom configuration
const AVAILABLE_DATES = generateAvailableDates({
  startHour: 9, // 9 AM
  endHour: 22, // 5 PM
  intervalMinutes: 60, // 30-minute slots
  excludeWeekends: false,
  daysToGenerate: 7,
  lunchBreakStart: 12, // 12 PM lunch break start
  lunchBreakEnd: 13, // 1 PM lunch break end
});

// Debug log to verify generated dates
console.log(
  'Generated dates:',
  AVAILABLE_DATES.map((d) => {
    try {
      return {
        date: d.date,
        parsedDate: format(parseISO(d.date), 'PPP'),
        slots: d.slotTimes.length,
      };
    } catch (error) {
      return {
        date: d.date,
        error: 'Failed to parse date',
        slots: d.slotTimes.length,
      };
    }
  })
);

export default function Feed() {
  const { data, isPending, isError } = usePosts();
  const [dateOfAppointment, setDateOfAppointment] =
    useState<IAppointment | null>(null);

  const renderItem = React.useCallback(
    ({ item }: { item: Post }) => <Card {...item} />,
    []
  );

  const handleDateChange = React.useCallback(
    (appointment: IAppointment | null) => {
      setDateOfAppointment(appointment);
      if (appointment) {
        console.log('Raw appointment data:', appointment);
      }
    },
    []
  );

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">Error Loading data</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      {/* <FocusAwareStatusBar /> */}

      {/* Posts List */}
      {/* <View className="flex-1">
        <FlashList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<EmptyList isLoading={isPending} />}
          estimatedItemSize={300}
        />
      </View> */}

      {/* Time Slot Picker */}
      <View className="bg-white">
        <TimeSlotPicker
          availableDates={AVAILABLE_DATES}
          setDateOfAppointment={handleDateChange}
          theme={{
            backgroundColor: '#ffffff',
            calendarTextColor: '#000000',
            selectedDateBackgroundColor: '#007AFF',
            selectedDateTextColor: '#ffffff',
            dateTextColor: '#000000',
            dayTextColor: '#000000',
            timeSlotTextColor: '#000000',
            timeSlotBackgroundColor: '#f0f0f0',
            selectedTimeSlotBackgroundColor: '#007AFF',
            selectedTimeSlotTextColor: '#ffffff',
          }}
        />
      </View>
    </SafeAreaView>
  );
}
