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
    expect(state.loading).toBe(false);
  });

  test('should set user and update authentication state', () => {
    const { setUser } = useUserStore.getState();
    
    // Act: Set user
    setUser(mockUser);
    
    // Assert: User is set
    const state = useUserStore.getState();
    expect(state.user).toEqual(mockUser);
  });

  test('should handle null user correctly', () => {
    const { setUser } = useUserStore.getState();
    
    // Arrange: Set a user first
    setUser(mockUser);
    expect(useUserStore.getState().user).not.toBeNull();
    
    // Act: Set user to null
    setUser(null);
    
    // Assert: User is null
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
  });

  test('should clear user on logout', () => {
    const { setUser, logout } = useUserStore.getState();
    
    // Arrange: Set a user first
    setUser(mockUser);
    expect(useUserStore.getState().user).not.toBeNull();
    
    // Act: Logout
    logout();
    
    // Assert: User is cleared
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
  });

  test('should update loading state', () => {
    const { setLoading } = useUserStore.getState();
    
    // Act: Set loading to true
    setLoading(true);
    
    // Assert: Loading is true
    expect(useUserStore.getState().loading).toBe(true);
    
    // Act: Set loading to false
    setLoading(false);
    
    // Assert: Loading is false
    expect(useUserStore.getState().loading).toBe(false);
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
    expect(state.loading).toBe(true);
  });
});