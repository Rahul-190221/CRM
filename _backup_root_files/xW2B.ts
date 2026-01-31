export const userBookingRequests = async (userId: string) => {
  const response = await fetch(
    `https://server-io-psi.vercel.app/api/v1/user/booking-requests/${userId}`
  );
  return response.json();
};
