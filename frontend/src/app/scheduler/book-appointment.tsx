import {
  type IAppointment,
  type IAvailableDates,
  TimeSlotPicker,
} from '@dgreasi/react-native-time-slot-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from 'expo-router';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { TextInput, Text, View, FlatList, TouchableOpacity } from 'react-native';

import { type Post, useAddPost } from '@/api';
import { Card } from '@/components/card';
import {
  Button,
  ControlledInput,
  FocusAwareStatusBar,
  SafeAreaView,
  showErrorMessage,
} from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { fetchServices } from '@/api/services/services';
import { AVAILABLE_DATES } from '@/lib/appointments/timeSlots'; // Import AVAILABLE_DATES

const schema = z.object({
  note: z.string().min(20),
});

type FormType = z.infer<typeof schema>;

export default function BookAppointment() {
  const { control, handleSubmit } = useForm<FormType>({
    resolver: zodResolver(schema),
  });
  const { mutate: addPost, isPending } = useAddPost();
  const { getToken } = useAuth();

  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [dateOfAppointment, setDateOfAppointment] = useState<IAppointment | null>(null);
  const [timeRange, setTimeRange] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<{ id: number; name: string } | null>(null);
  const [services, setServices] = useState<{ id: number; name: string }[]>([]); // State for services

  // Fetch services from API
  useEffect(() => {
    const loadServices = async () => {
      try {
        const servicesData = await fetchServices(); // Use the fetchServices function
        setServices(servicesData);
      } catch (error) {
        showErrorMessage('Failed to load services');
      }
    };

    loadServices();
  }, []);

  // Filter services based on the search query
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async (data: FormType) => {
    console.log('data', data);
    console.log('appointmentId', appointmentId);
    try {
      const token = getToken();
      const appointmentData = {
        userId: "99288e30-5576-4286-9452-e60c9f1f61e2",
        serviceId: selectedService?.id, // Use the selected service ID
        staffId: "32281634-f927-47e4-97d2-73acfc1aa70b",
        date: dateOfAppointment?.date,
        timeRange: timeRange,
        note: data.note,
      };

      if (appointmentId) {
        await axios.put(`http://localhost:3000/api/appointments/${appointmentId}`, {
          timeRange: timeRange,
          note: data.note,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token?.access}`,
          },
        });
        showMessage({
          message: 'Appointment updated successfully',
          type: 'success',
        });
      } else {
        const response = await axios.post('http://localhost:3000/api/appointments', appointmentData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token?.access}`,
          },
        });
        console.log('response', response.data);
        setAppointmentId(response.data);
        showMessage({
          message: 'Appointment registered successfully',
          type: 'success',
        });
      }
    } catch (error) {
      showErrorMessage('Error processing appointment');
      console.error(error);
    }
  };

  const renderItem = React.useCallback(
    ({ item }: { item: Post }) => <Card {...item} />,
    []
  );

  const handleDateChange = React.useCallback(
    (appointment: IAppointment | null) => {
      setDateOfAppointment(appointment);
      if (appointment) {
        console.log('Raw appointment data:', appointment);
        // If the appointment has an ID, set it to the appointmentId state
        if (appointment.id) {
          setAppointmentId(appointment.id);
        } else {
          // If no ID, reset the appointmentId state
          // setAppointmentId(null);
        }
        // Store the appointment date and time range from the selected appointment
        if (appointment.appointmentDate) {
          setDateOfAppointment({ ...dateOfAppointment, date: appointment.appointmentDate });
        }
        if (appointment.appointmentTime) {
          setTimeRange(appointment.appointmentTime);
        }
      }
    },
    []
  );
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Book Appointment',
          headerBackTitle: 'Booking',
        }}
      />
      <View className="flex-1 p-4 ">
        <TextInput
          placeholder="Search for services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            padding: 10,
            marginBottom: 20,
          }}
        />

        {/* Display filtered services as a combo box */}
        {searchQuery.length > 0 && (
          <View style={{ maxHeight: 150, marginBottom: 20 }}>
            <FlatList
              data={filteredServices}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedService(item);
                    setSearchQuery(item.name); // Set the search query to the selected service's name
                  }}
                  style={{
                    padding: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#ccc',
                  }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {selectedService && (
          <Text style={{ marginTop: 0, marginBottom: 10 }}>Selected Service: {selectedService.name}</Text>
        )}

        <ControlledInput
          name="note"
          control={control}
          multiline
          placeholder="Enter your notes here..."
          testID="note-input"
        />

        <SafeAreaView className="flex-1">
          <FocusAwareStatusBar />

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

        <Button
          label="Book Appointment"
          loading={isPending}
          onPress={() => {
            handleSubmit(onSubmit)();
          }}
          testID="btn-book-appointment"
        />
      </View>
    </>
  );
}
