import type { MockTestPackage, MockTestSchedule, FilterState } from '@/types/admin';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_BASE_URL = `${API_URL}/api`;

const getAuthHeader = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Legacy functions
export const updateMockNumber = async (userId: string, mockData: any) => {
  const response = await fetch(`${API_URL}/api/v1/user/mock-tests/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockData),
  });
  return response.json();
};

export const getMockTests = async (userId: string) => {
  const response = await fetch(`${API_URL}/api/v1/user/mock-tests/${userId}`);
  return response.json();
};

// Mock Test Packages
export const getMockTestPackages = async (): Promise<MockTestPackage[]> => {
  const response = await fetch(`${API_BASE_URL}/mock-tests/packages`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch mock test packages');
  return response.json();
};

export const getMockTestPackage = async (id: string): Promise<MockTestPackage> => {
  const response = await fetch(`${API_BASE_URL}/mock-tests/packages/${id}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch mock test package');
  return response.json();
};

export const createMockTestPackage = async (data: Omit<MockTestPackage, '_id' | 'createdAt' | 'updatedAt'>): Promise<MockTestPackage> => {
  const response = await fetch(`${API_BASE_URL}/mock-tests/packages`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create mock test package');
  return response.json();
};

export const updateMockTestPackage = async (id: string, data: Partial<MockTestPackage>): Promise<MockTestPackage> => {
  const response = await fetch(`${API_BASE_URL}/mock-tests/packages/${id}`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update mock test package');
  return response.json();
};

export const deleteMockTestPackage = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/mock-tests/packages/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to delete mock test package');
};

// Mock Test Schedules
export const getMockTestSchedules = async (filters?: FilterState): Promise<MockTestSchedule[]> => {
  const params = new URLSearchParams();
  if (filters?.testType && filters.testType !== 'all') params.append('testType', filters.testType);
  if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);

  const response = await fetch(`${API_BASE_URL}/mock-tests/schedules?${params}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch mock test schedules');
  return response.json();
};

export const getMockTestSchedule = async (id: string): Promise<MockTestSchedule> => {
  const response = await fetch(`${API_BASE_URL}/mock-tests/schedules/${id}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch mock test schedule');
  return response.json();
};

export const createMockTestSchedule = async (data: Omit<MockTestSchedule, '_id' | 'createdAt' | 'updatedAt'>): Promise<MockTestSchedule> => {
  const response = await fetch(`${API_BASE_URL}/mock-tests/schedules`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create mock test schedule');
  return response.json();
};

export const updateMockTestSchedule = async (id: string, data: Partial<MockTestSchedule>): Promise<MockTestSchedule> => {
  const response = await fetch(`${API_BASE_URL}/mock-tests/schedules/${id}`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update mock test schedule');
  return response.json();
};

export const deleteMockTestSchedule = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/mock-tests/schedules/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to delete mock test schedule');
};
