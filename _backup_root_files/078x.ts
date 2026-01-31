"use server";

export const deleteSchedule = async (id: string) => {
  const response = await fetch(
    `http://localhost:5000/api/v1/admin/delete-schedule/${id}`,
    { method: "DELETE" }
  );
  return response.json();
};
