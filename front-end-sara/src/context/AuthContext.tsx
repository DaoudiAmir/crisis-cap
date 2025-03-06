// context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

// Define the API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Configure axios defaults for CORS
axios.defaults.withCredentials = true; // This allows cookies to be sent with requests

// Set up axios interceptor for authentication
const setupAxiosInterceptors = (token: string | null) => {
  // Remove any existing interceptors
  axios.interceptors.request.handlers = [];
  
  // Add request interceptor
  axios.interceptors.request.use(
    (config) => {
      // If token exists, add it to the headers
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Map backend role values to frontend display values
export const mapRoleToDisplay = (backendRole: string): string => {
  switch (backendRole) {
    case 'sapeur-pompier':
      return 'FIREFIGHTER';
    case 'chef-agres':
      return 'TEAM_LEADER';
    case 'officier':
      return 'OFFICER';
    case 'coordinateur-regional':
      return 'REGIONAL_COORDINATOR';
    case 'logistic-officer':
      return 'LOGISTICS_MANAGER';
    default:
      return backendRole;
  }
};

// Define User type
export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  badgeNumber?: string;
  station?: string;
  department?: string;
} | null;

type AuthContextType = {
  user: User;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
};

type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  badgeNumber: string;
  role?: string;
  department?: string;
  station?: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Initialize axios interceptor with token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      setupAxiosInterceptors(storedToken);
    }
  }, []);

  // Update axios interceptor whenever token changes
  useEffect(() => {
    setupAxiosInterceptors(token);
  }, [token]);

  // Check if user is already logged in on component mount
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Fetch current user data - the cookie will be sent automatically
      const response = await axios.get(`${API_URL}/v1/users/me`);
      
      if (response.data && response.data.data && response.data.data.user) {
        // Map the backend role to frontend display value if needed
        const userData = response.data.data.user;
        if (userData.role) {
          userData.role = mapRoleToDisplay(userData.role);
        }
        setUser(userData);
        return true;
      }
      return false;
    } catch (err) {
      // Don't log errors for 401 (unauthorized) as this is expected for non-logged in users
      if (axios.isAxiosError(err) && err.response?.status !== 401) {
        console.error('Authentication check failed:', err);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check authentication on mount and when route changes
  useEffect(() => {
    // Define public pages that don't require authentication
    const isPublicPage = 
      router.pathname === '/LoginPage' || 
      router.pathname === '/SignupPage' || 
      router.pathname === '/' ||
      router.pathname === '/HomePage';
    
    // Only show loading state for protected pages
    if (!isPublicPage) {
      setIsLoading(true);
    }
    
    checkAuth().finally(() => {
      if (!isPublicPage) {
        setIsLoading(false);
      }
    });
  }, [router.pathname]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      if (response.data && response.data.user) {
        // Store token in localStorage
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
          setToken(response.data.token);
        }
        
        // Update user state
        const userData = response.data.user;
        if (userData.role) {
          userData.role = mapRoleToDisplay(userData.role);
        }
        setUser(userData);
        
        // Redirect based on user role
        if (userData.role === 'OFFICER' || userData.role === 'REGIONAL_COORDINATOR') {
          router.push('/chief-dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
      throw new Error(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      if (response.data && response.data.user) {
        // Store token in localStorage
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
          setToken(response.data.token);
        }
        
        // Update user state
        const user = response.data.user;
        if (user.role) {
          user.role = mapRoleToDisplay(user.role);
        }
        setUser(user);
        
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw new Error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout API with timeout and error handling
      try {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          timeout: 3000 // 3 second timeout
        });
        console.log('Successfully logged out from API');
      } catch (apiError: any) {
        // Log the error but continue with local logout
        console.warn('Error logging out from API:', apiError.message);
        if (apiError.response?.status === 429) {
          console.warn('Rate limit exceeded. Proceeding with local logout only.');
        }
        // Don't rethrow - we still want to clear local state
      }
      
      // Clear user data and token regardless of API success
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      
      // Redirect to login page
      router.push('/LoginPage');
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      // Still try to clear local state in case of unexpected errors
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      router.push('/LoginPage');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        register,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;