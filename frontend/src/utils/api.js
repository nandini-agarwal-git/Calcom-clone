import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.error || err.message || 'Something went wrong';
    return Promise.reject(new Error(msg));
  }
);

// Users
export const getUser = () => api.get('/users').then(r => r.data);
export const updateUser = (data) => api.put('/users', data).then(r => r.data);

// Event Types
export const getEventTypes = () => api.get('/event-types').then(r => r.data);
export const getEventType = (id) => api.get(`/event-types/${id}`).then(r => r.data);
export const createEventType = (data) => api.post('/event-types', data).then(r => r.data);
export const updateEventType = (id, data) => api.put(`/event-types/${id}`, data).then(r => r.data);
export const deleteEventType = (id) => api.delete(`/event-types/${id}`).then(r => r.data);
export const toggleEventType = (id) => api.patch(`/event-types/${id}/toggle`).then(r => r.data);

// Availability
export const getSchedules = () => api.get('/availability').then(r => r.data);
export const getSchedule = (id) => api.get(`/availability/${id}`).then(r => r.data);
export const createSchedule = (data) => api.post('/availability', data).then(r => r.data);
export const updateSchedule = (id, data) => api.put(`/availability/${id}`, data).then(r => r.data);
export const addDateOverride = (id, data) => api.post(`/availability/${id}/overrides`, data).then(r => r.data);
export const deleteDateOverride = (scheduleId, overrideId) => api.delete(`/availability/${scheduleId}/overrides/${overrideId}`).then(r => r.data);

// Bookings
export const getBookings = (params) => api.get('/bookings', { params }).then(r => r.data);
export const getBooking = (id) => api.get(`/bookings/${id}`).then(r => r.data);
export const cancelBooking = (id, data) => api.patch(`/bookings/${id}/cancel`, data).then(r => r.data);
export const rescheduleBooking = (id, data) => api.post(`/bookings/${id}/reschedule`, data).then(r => r.data);

// Public
export const getPublicProfile = (username) => api.get(`/public/${username}`).then(r => r.data);
export const getPublicEventType = (username, slug) => api.get(`/public/${username}/${slug}`).then(r => r.data);
export const getAvailableSlots = (username, slug, date) => api.get(`/public/${username}/${slug}/slots`, { params: { date } }).then(r => r.data);
export const getAvailableDates = (username, slug, month, year) => api.get(`/public/${username}/${slug}/dates`, { params: { month, year } }).then(r => r.data);
export const createBooking = (username, slug, data) => api.post(`/public/${username}/${slug}/book`, data).then(r => r.data);

export default api;
