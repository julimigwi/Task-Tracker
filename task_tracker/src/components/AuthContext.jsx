// src/context/MockAuthContext.jsx
import { createContext, useState } from 'react';

export const MockAuthContext = createContext();

export const MockAuthProvider = ({ children }) => {
  // Mock user data - change isLoggedIn to test protected routes
  const [mockUser, setMockUser] = useState({
    isLoggedIn: true,      // Toggle this to simulate login state
    id: 'mock-user-123',   // Match this with task userIds in db.json
    email: 'mock@user.com'
  });

  // Mock functions that do nothing (for compatibility)
  const mockAuth = {
    user: mockUser.isLoggedIn ? mockUser : null,
    login: () => setMockUser({ ...mockUser, isLoggedIn: true }),
    logout: () => setMockUser({ ...mockUser, isLoggedIn: false }),
    isLoading: false,      // Simulate instant auth check
    error: null
  };

  return (
    <MockAuthContext.Provider value={mockAuth}>
      {children}
    </MockAuthContext.Provider>
  );
};