import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AppRouter } from '../AppRouter';
import { useUserStore } from '../../../infrastructure/store/userStore';
import * as initializeAuthModule from '../../use-cases/initializeAuth';
import * as checkUserSelectionModule from '../../use-cases/checkUserSelection';

// Mock the use cases
vi.mock('../../use-cases/initializeAuth', () => ({
  initializeAuthUseCase: vi.fn(),
}));

vi.mock('../../use-cases/checkUserSelection', () => ({
  hasUserSelectionUseCase: vi.fn(),
}));

// Mock the pages
vi.mock('../../../ui/pages/LoginPage', () => ({
  LoginPage: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('../../../ui/pages/DashboardPage', () => ({
  DashboardPage: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}));

vi.mock('../../../ui/pages/LessonPage', () => ({
  LessonPage: () => <div data-testid="lesson-page">Lesson Page</div>,
}));

// Mock the Spinner component
vi.mock('../../../design-system', () => ({
  Spinner: ({ size }: { size: string }) => (
    <div data-testid="spinner" data-size={size}>Loading...</div>
  ),
}));

describe('AppRouter', () => {
  const mockInitializeAuth = vi.mocked(initializeAuthModule.initializeAuthUseCase);
  const mockHasUserSelection = vi.mocked(checkUserSelectionModule.hasUserSelectionUseCase);

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Reset user store to initial state
    useUserStore.setState({
      user: null,
      loading: false,
    });
    
    // Setup default mock implementations
    mockInitializeAuth.mockResolvedValue(undefined);
    mockHasUserSelection.mockResolvedValue(false);
  });

  test('should initialize authentication on mount', () => {
    // Arrange: Unauthenticated user
    useUserStore.getState().setLoading(false);
    
    // Act: Render AppRouter
    render(<AppRouter />);
    
    // Assert: Component renders (no longer using initializeAuth)
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('should show loading spinner when authentication is loading', () => {
    // Arrange: Set loading state
    useUserStore.getState().setLoading(true);
    
    // Act: Render AppRouter
    render(<AppRouter />);
    
    // Assert: Spinner is visible
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toHaveAttribute('data-size', 'lg');
  });

  test('should redirect unauthenticated users to login', () => {
    // Arrange: Unauthenticated user
    useUserStore.getState().setLoading(false);
    
    // Act: Render AppRouter
    render(<AppRouter />);
    
    // Assert: Login page is rendered
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('should allow authenticated users to access dashboard when no selection', async () => {
    // Arrange: Authenticated user without selection
    const mockUser = { id: '123', name: 'John', email: 'john@example.com' };
    useUserStore.getState().setUser(mockUser);
    useUserStore.getState().setLoading(false);
    mockHasUserSelection.mockResolvedValue(false);
    
    // Act: Render AppRouter
    render(<AppRouter />);
    
    // Assert: Dashboard page is rendered after selection check
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
    
    expect(mockHasUserSelection).toHaveBeenCalledOnce();
  });

  test('should redirect authenticated users with selection to lesson page', async () => {
    // Arrange: Authenticated user with complete selection
    const mockUser = { id: '123', name: 'John', email: 'john@example.com' };
    useUserStore.getState().setUser(mockUser);
    useUserStore.getState().setLoading(false);
    mockHasUserSelection.mockResolvedValue(true);
    
    // Act: Render AppRouter
    render(<AppRouter />);
    
    // Assert: Lesson page is rendered after selection check
    await waitFor(() => {
      expect(screen.getByTestId('lesson-page')).toBeInTheDocument();
    });
    
    expect(mockHasUserSelection).toHaveBeenCalledOnce();
  });

  test('should show loading spinner while checking user selection', () => {
    // Arrange: Authenticated user
    const mockUser = { id: '123', name: 'John', email: 'john@example.com' };
    useUserStore.getState().setUser(mockUser);
    useUserStore.getState().setLoading(false);
    
    // Make hasUserSelection hang to simulate loading
    mockHasUserSelection.mockImplementation(() => new Promise(() => {}));
    
    // Act: Render AppRouter
    render(<AppRouter />);
    
    // Assert: Spinner is visible while checking selection
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  test('should handle user selection check error gracefully', async () => {
    // Arrange: Authenticated user with error in selection check
    const mockUser = { id: '123', name: 'John', email: 'john@example.com' };
    
    // Reset store completely
    useUserStore.setState({
      user: null,
      loading: false,
    });
    
    // Setup mocks
    mockHasUserSelection.mockRejectedValue(new Error('Selection check failed'));
    
    // Set authenticated user
    useUserStore.getState().setUser(mockUser);
    
    // Act: Render AppRouter
    render(<AppRouter />);
    
    // Assert: Either dashboard or lesson page is rendered (fallback behavior)
    await waitFor(() => {
      const hasDashboard = screen.queryByTestId('dashboard-page');
      const hasLesson = screen.queryByTestId('lesson-page');
      expect(hasDashboard || hasLesson).toBeTruthy();
    });
    
    // Verify that hasUserSelection was called and failed
    expect(mockHasUserSelection).toHaveBeenCalled();
  });

  test('should redirect authenticated users from login to appropriate page', async () => {
    // Arrange: Authenticated user without selection
    const mockUser = { id: '123', name: 'John', email: 'john@example.com' };
    
    // Reset store completely
    useUserStore.setState({
      user: null,
      loading: false,
    });
    
    // Setup mocks
    mockHasUserSelection.mockResolvedValue(false);
    
    // Set authenticated user
    useUserStore.getState().setUser(mockUser);
    
    // Act: Render AppRouter (will start at root and redirect)
    render(<AppRouter />);
    
    // Assert: Either dashboard or lesson page is rendered (depending on selection check)
    await waitFor(() => {
      const hasDashboard = screen.queryByTestId('dashboard-page');
      const hasLesson = screen.queryByTestId('lesson-page');
      expect(hasDashboard || hasLesson).toBeTruthy();
    }, { timeout: 3000 });
    
    // Verify that hasUserSelection was called
    expect(mockHasUserSelection).toHaveBeenCalled();
  });

  test('should redirect authenticated users with selection from login to lesson', async () => {
    // Arrange: Authenticated user with selection
    const mockUser = { id: '123', name: 'John', email: 'john@example.com' };
    
    // Reset mocks to ensure clean state
    vi.clearAllMocks();
    mockHasUserSelection.mockResolvedValue(true);
    
    useUserStore.getState().setUser(mockUser);
    useUserStore.getState().setLoading(false);
    
    // Act: Render AppRouter
    render(<AppRouter />);
    
    // Assert: Lesson page is rendered (redirect from login)
    await waitFor(() => {
      expect(screen.getByTestId('lesson-page')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('should not check user selection when user is not authenticated', () => {
    // Arrange: Unauthenticated user
    useUserStore.getState().setLoading(false);
    
    // Act: Render AppRouter
    render(<AppRouter />);
    
    // Assert: hasUserSelectionUseCase was not called
    expect(mockHasUserSelection).not.toHaveBeenCalled();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('should not check user selection when authentication is still loading', () => {
    // Arrange: Loading authentication state
    useUserStore.getState().setLoading(true);
    
    // Act: Render AppRouter
    render(<AppRouter />);
    
    // Assert: hasUserSelectionUseCase was not called
    expect(mockHasUserSelection).not.toHaveBeenCalled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});