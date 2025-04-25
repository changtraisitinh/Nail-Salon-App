import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useAuth } from '@/lib/auth';
import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { useEffect } from 'react';

// Types
type ServiceCategory = {
  id: string;
  name: string;
  description: string;
  image: string;
  services: string[];
};

function CategoryCard({ category }: { category: ServiceCategory }) {
  const router = useRouter();

  return (
    <View className="mb-6 overflow-hidden rounded-xl bg-white shadow-sm">
      <Image
        source={{ uri: category.imageUrl }}
        className="h-48 w-full"
        contentFit="cover"
      />
      <View className="p-4">
        <Text className="text-xl font-bold">{category.name}</Text>
        <Text className="mt-1 text-gray-600">{category.description}</Text>
        <Button
          className="mt-4"
          onPress={() => router.push(`/services/${category.id}`)}
        >
          <Text className="text-white">View Details</Text>
        </Button>
      </View>
    </View>
  );
}

export default function Services() {

  const [services, setServices] = React.useState<ServiceCategory[]>([]);
  const { getToken } = useAuth();
  const fetchServices = async () => {
    const token = getToken();
    console.log('token', token);
    try {
      const response = await fetch('http://localhost:3000/api/services', {
        headers: {
          'Authorization': `Bearer ${token?.access}`,
        },
        });
        
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      setServices(data); // Assuming the API returns an array of appointments
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      // setLoading(false); // Set loading to false after the API call
    }
  };

  useEffect(() => {
    fetchServices(); // Fetch appointments on component mount
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FocusAwareStatusBar />
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="mb-6 text-2xl font-bold">Our Services</Text>
          {services.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
