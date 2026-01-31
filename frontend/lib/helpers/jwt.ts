import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface DecodedToken {
    id?: string;
    userId?: string;
    email?: string;
    role?: string;
    exp?: number;
    iat?: number;
}

export const getUserIdFromToken = (): DecodedToken | null => {
    try {
        // Try to get token from cookie first, then localStorage
        const token = Cookies.get('accessToken') || localStorage.getItem('accessToken');

        if (!token) {
            return null;
        }

        const decoded = jwtDecode<DecodedToken>(token);

        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            // Token expired, clean up
            Cookies.remove('accessToken');
            localStorage.removeItem('accessToken');
            return null;
        }

        return decoded;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const getToken = (): string | null => {
    return Cookies.get('accessToken') || localStorage.getItem('accessToken');
};

export const removeToken = (): void => {
    Cookies.remove('accessToken');
    localStorage.removeItem('accessToken');
};

export const isAuthenticated = (): boolean => {
    const decoded = getUserIdFromToken();
    return decoded !== null;
};
