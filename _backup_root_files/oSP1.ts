export const userBookingRequests = async (userId: string) => {
  const response = await fetch(
    `http://localhost:5000/api/v1/user/booking-requests/${userId}`
  );
  return response.json();
};
