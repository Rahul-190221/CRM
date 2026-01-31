"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const blockUserStatus = async (userId: string, newStatus: string) => {
  const response = await fetch(
    `${API_URL}/api/v1/user/status/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify({ status: newStatus }),
      headers: { "Content-Type": "application/json" }
    }
  );
  return response.json();
};

export const fetchAllUsers = async () => {
  const response = await fetch(`${API_URL}/api/v1/users`);
  return response.json();
};
