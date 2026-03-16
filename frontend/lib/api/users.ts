const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const userAttendanceCount = async (userId: string) => {
  const response = await fetch(
    `${API_URL}/api/v1/user/attendance-count/${userId}`
  );
  return response.json();
};

export const userBookingRequests = async (userId: string) => {
  const response = await fetch(
    `${API_URL}/api/v1/user/booking-requests/${userId}`
  );
  return response.json();
};

export const getAllUsers = async () => {
  const response = await fetch(`${API_URL}/api/v1/users`);
  return response.json();
};

export const getUserById = async (userId: string) => {
  const response = await fetch(`${API_URL}/api/v1/users/${userId}`);
  return response.json();
};
