import { TokenType } from '@/lib/auth/utils';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/appointments';

export const fetchAppointments = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const searchAppointmentsByFilters = async (token: TokenType, filters: any) => {
  try {
    const response = await fetch('http://localhost:3000/api/appointments/filters', {
        headers: {
          'Authorization': `Bearer ${token?.access}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          query: {
            note: filters.toLowerCase(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      return data;
  } catch (error) {
    console.error('Error searching appointments by filters:', error);
    throw error;
  }
}
