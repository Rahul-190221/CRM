export const userAttendanceCount = async (userId: string) => {
  console.log(process.env.NEXT_PUBLIC_BACKEND_URL)
  const response = await fetch(
    `http://localhost:5000/api/v1/user/attendance-count/${userId}`
  );
  return response.json();
};