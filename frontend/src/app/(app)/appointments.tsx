import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useAuth } from '@/lib/auth'; // Assuming you have an auth context to get the user token
import AppointmentCard from '@/components/appointments/AppointmentCard'; // Corrected import path

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const { getToken } = useAuth(); // Assuming you have a method to get the user's token

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = getToken();
      try {
        const response = await fetch('http://localhost:3000/api/appointments', {
          headers: {
            'Authorization': `Bearer ${token?.access}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }

        const data = await response.json();
        setAppointments(data); // Assuming the API returns an array of appointments
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, [getToken]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Text className="mb-6 text-2xl font-bold">Appointments</Text>
        {appointments.length === 0 ? (
          <Text>No appointments found.</Text>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
