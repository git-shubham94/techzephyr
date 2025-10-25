import api from './api';

// Create booking
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to create booking';
  }
};

// Get all bookings
export const getBookings = async () => {
  try {
    const response = await api.get('/bookings');
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch bookings';
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update booking';
  }
};

// Cancel booking
export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}`, { status: 'cancelled' });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to cancel booking';
  }
};

// Confirm booking
export const confirmBooking = async (bookingId) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}`, { status: 'confirmed' });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to confirm booking';
  }
};

// Complete booking
export const completeBooking = async (bookingId) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}`, { status: 'completed' });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to complete booking';
  }
};
