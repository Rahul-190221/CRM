const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://crm-eta-blush.vercel.app/api';

export const getActivities = async (token: string) => {
  const response = await fetch(`${API_URL}/activities`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch activities');
  }

  return data;
};
