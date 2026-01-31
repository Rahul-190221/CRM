"use server";
export const blockUserStatus = async (userId: string, newStatus: string) => {
  const response = await fetch(
    `http://localhost:5000/api/v1/user/status/${userId}`,
    { method: "PUT", body: JSON.stringify({ status: newStatus }) }
  );
  return response.json();
};

