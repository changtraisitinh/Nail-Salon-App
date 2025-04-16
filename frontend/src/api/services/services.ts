import axios from 'axios';

const API_URL = 'http://localhost:3000/api/services';

export const fetchServices = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data; // Assuming the response data is an array of services
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error; // Rethrow the error for handling in the component
  }
};
