export const userAttendanceCount = async (userId: string) => {
  console.log(process.env.NEXT_PUBLIC_BACKEND_URL)
  const response = await fetch(
    `https://crm-eta-blush.vercel.app/api/v1/user/attendance-count/${userId}`
  );
  return response.json();
};