import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useAuth } from '@/lib/auth'; // Assuming you have an auth context to get the user token
import AppointmentCard from '@/components/appointments/AppointmentCard'; // Corrected import path
import Timeline from '@/components/appointments/Timeline'; // Import the Timeline component
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the icon library

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [refreshing, setRefreshing] = useState(false); // Refreshing state
  const { getToken } = useAuth(); // Assuming you have a method to get the user's token
  const [searchQuery, setSearchQuery] = useState(''); // State for search query


  const fetchAppointments = async () => {
    const token = getToken();
    console.log('token', token);
    try {
      const response = await fetch('http://localhost:3000/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token?.access}`,
        },
      });

      

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      console.log('data', data);
      setAppointments(data); // Assuming the API returns an array of appointments
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false); // Set loading to false after the API call
    }
  };

  useEffect(() => {
    fetchAppointments(); // Fetch appointments on component mount
  }, [getToken]);

  const onRefresh = async () => {
    setRefreshing(true); // Set refreshing to true
    await fetchAppointments(); // Fetch appointments again
    setRefreshing(false); // Set refreshing to false after fetching
  };

  const handleCloseAppointment = (id: string) => {
    setAppointments((prevAppointments) => 
      prevAppointments.filter((appointment) => appointment.id !== id)
    );
  };

   // Function to group appointments by date
   const groupAppointmentsByDate = (appointments) => {
    return appointments.reduce((groups, appointment) => {
      const date = new Date(appointment.date).toDateString(); // Assuming appointment.date is a valid date
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appointment);
      return groups;
    }, {});
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
      <View className="flex-row items-center border border-gray-300 rounded p-2 mb-4"> {/* Wrap in a flex-row */}
        <Icon name="search" size={20} color="#000" className="mr-2" /> {/* Search icon */}
        <TextInput
          placeholder="Search appointments..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ flex: 1, padding: 0 }} // Make TextInput take remaining space
        />
      </View>
    </View>
      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row items-center mb-6">
          <Icon name="clipboard" size={30} color="#000" />
          <Text className="ml-2 text-3xl font-bold">Your Appointments</Text>
        </View>
        {loading ? ( // Show loading indicator while fetching
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className="mt-2">Loading appointments...</Text>
          </View>
        ) : appointments.length === 0 ? (
          <Text className="text-center text-lg">No appointments found.</Text>
        ) : (
          <Timeline appointments={appointments.map(appointment => ({ ...appointment, onClose: handleCloseAppointment }))} /> // Pass the close function
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
