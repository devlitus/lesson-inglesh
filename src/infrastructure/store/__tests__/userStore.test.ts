import { describe, test, expect, beforeEach } from 'vitest';
import { useUserStore } from '../userStore';
import { mockUser } from "../../../mocks";


describe('User Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUserStore.getState().logout();
    useUserStore.getState().setLoading(false);
  });

  test('should have initial state', () => {
    const state = useUserStore.getState();
    
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  test('should set user and update authentication state', () => {
    const { setUser } = useUserStore.getState();
    
    // Act: Set user
    setUser(mockUser);
    
    // Assert: User is set and authenticated
    const state = useUserStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  test('should set user to null and update authentication state', () => {
    const { setUser } = useUserStore.getState();
    
    // Arrange: Set user first
    setUser(mockUser);
    expect(useUserStore.getState().isAuthenticated).toBe(true);
    
    // Act: Set user to null
    setUser(null);
    
    // Assert: User is null and not authenticated
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  test('should logout and clear user data', () => {
    const { setUser, logout } = useUserStore.getState();
    
    // Arrange: Set user first
    setUser(mockUser);
    expect(useUserStore.getState().isAuthenticated).toBe(true);
    
    // Act: Logout
    logout();
    
    // Assert: User is cleared and not authenticated
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  test('should set loading state', () => {
    const { setLoading } = useUserStore.getState();
    
    // Act: Set loading to true
    setLoading(true);
    
    // Assert: Loading state is true
    expect(useUserStore.getState().isLoading).toBe(true);
    
    // Act: Set loading to false
    setLoading(false);
    
    // Assert: Loading state is false
    expect(useUserStore.getState().isLoading).toBe(false);
  });

  test('should maintain user state after setting loading', () => {
    const { setUser, setLoading } = useUserStore.getState();
    
    // Arrange: Set user
    setUser(mockUser);
    
    // Act: Change loading state
    setLoading(true);
    
    // Assert: User state is preserved
    const state = useUserStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(true);
  });
});