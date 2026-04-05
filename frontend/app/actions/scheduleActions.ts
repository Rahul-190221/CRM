"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://crm-eta-blush.vercel.app";

export const deleteSchedule = async (id: string) => {
  const response = await fetch(
    `${API_URL}/api/v1/admin/delete-schedule/${id}`,
    { method: "DELETE" }
  );
  return response.json();
};

export const createSchedule = async (scheduleData: any) => {
  const response = await fetch(
    `${API_URL}/api/v1/admin/create-schedule`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scheduleData)
    }
  );
  return response.json();
};
