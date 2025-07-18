import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardPage } from '../DashboardPage';
import { useUserStore } from '../../../infrastructure/store/userStore';
import type { User } from '../../../domain/entities/User';
import type { ReactNode } from 'react';

// Type definitions for mocked component props
interface HeaderProps {
  logo: ReactNode;
  user: User | null;
  onLogout: () => void;
}

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: string;
  size?: string;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: ReactNode;
  level?: string;
  className?: string;
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

// Mock dependencies
vi.mock('../../../infrastructure/store/userStore');
vi.mock('../../components/LevelsList', () => ({
  LevelsList: () => <div data-testid="levels-list">Levels List Component</div>
}));
vi.mock('../../components/TopicList', () => ({
  TopicList: () => <div data-testid="topic-list">Topic List Component</div>
}));
vi.mock('../../components/SelectionSaver', () => ({
  SelectionSaver: () => <div data-testid="selection-saver">Selection Saver Component</div>
}));
vi.mock('../../../design-system', () => ({
  Header: ({ logo, user, onLogout }: HeaderProps) => (
    <header data-testid="header">
      <div data-testid="logo">{logo}</div>
      {user && (
        <div data-testid="user-info">
          <span data-testid="user-name">{user.name}</span>
          <span data-testid="user-email">{user.email}</span>
        </div>
      )}
      <button data-testid="logout-button" onClick={onLogout}>Logout</button>
    </header>
  ),
  Card: ({ children, className, variant, size }: CardProps) => (
    <div data-testid="card" className={className} data-variant={variant} data-size={size}>
      {children}
    </div>
  )
}));
vi.mock('../../../design-system/components/molecules', () => ({
  CardHeader: ({ children, className }: CardHeaderProps) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, level, className }: CardTitleProps) => (
    <h1 data-testid="card-title" data-level={level} className={className}>{children}</h1>
  ),
  CardDescription: ({ children, className }: CardDescriptionProps) => (
    <p data-testid="card-description" className={className}>{children}</p>
  ),
  CardBody: ({ children, className }: CardBodyProps) => (
    <div data-testid="card-body" className={className}>{children}</div>
  )
}));

const mockUseUserStore = vi.mocked(useUserStore);

const mockUser: User = {
  id: 'user-123',
  name: 'Juan Pérez',
  email: 'juan@example.com'
};

const mockLogout = vi.fn();

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render user information correctly when user is authenticated', () => {
    // Arrange: Authenticated user in store
    mockUseUserStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      logout: mockLogout,
      setUser: vi.fn(),
      clearUser: vi.fn()
    });

    // Act: Render DashboardPage
    render(<DashboardPage />);

    // Assert: User name and email displayed
    expect(screen.getByTestId('user-name')).toHaveTextContent('Juan Pérez');
    expect(screen.getByTestId('user-email')).toHaveTextContent('juan@example.com');
    expect(screen.getByText('¡Bienvenido, Juan Pérez!')).toBeInTheDocument();
  });

  test('should render welcome message without user name when user is not authenticated', () => {
    // Arrange: No authenticated user
    mockUseUserStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: mockLogout,
      setUser: vi.fn(),
      clearUser: vi.fn()
    });

    // Act: Render DashboardPage
    render(<DashboardPage />);

    // Assert: Generic welcome message displayed
    expect(screen.getByText('¡Bienvenido!')).toBeInTheDocument();
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
  });

  test('should render all main components', () => {
    // Arrange: Authenticated user
    mockUseUserStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      logout: mockLogout,
      setUser: vi.fn(),
      clearUser: vi.fn()
    });

    // Act: Render DashboardPage
    render(<DashboardPage />);

    // Assert: All main components are rendered
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('levels-list')).toBeInTheDocument();
    expect(screen.getByTestId('topic-list')).toBeInTheDocument();
    expect(screen.getByTestId('selection-saver')).toBeInTheDocument();
  });

  test('should display correct section titles and descriptions', () => {
    // Arrange: Authenticated user
    mockUseUserStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      logout: mockLogout,
      setUser: vi.fn(),
      clearUser: vi.fn()
    });

    // Act: Render DashboardPage
    render(<DashboardPage />);

    // Assert: Section titles and descriptions are displayed
    expect(screen.getByText('Niveles de Aprendizaje')).toBeInTheDocument();
    expect(screen.getByText('Selecciona el nivel que mejor se adapte a tu conocimiento actual')).toBeInTheDocument();
    expect(screen.getByText('Topics Disponibles')).toBeInTheDocument();
    expect(screen.getByText('Explora diferentes temas para practicar tu inglés')).toBeInTheDocument();
    expect(screen.getByText('¿Listo para comenzar?')).toBeInTheDocument();
  });

  test('should handle logout correctly', () => {
    // Arrange: Authenticated user
    mockUseUserStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      logout: mockLogout,
      setUser: vi.fn(),
      clearUser: vi.fn()
    });

    // Act: Render DashboardPage and click logout
    render(<DashboardPage />);
    const logoutButton = screen.getByTestId('logout-button');
    logoutButton.click();

    // Assert: Logout function called
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  test('should display app logo and title', () => {
    // Arrange: Authenticated user
    mockUseUserStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      logout: mockLogout,
      setUser: vi.fn(),
      clearUser: vi.fn()
    });

    // Act: Render DashboardPage
    render(<DashboardPage />);

    // Assert: Logo and title are displayed
    expect(screen.getByText('🎓')).toBeInTheDocument();
    expect(screen.getByText('Learning English')).toBeInTheDocument();
  });

  test('should have proper page structure with gradient backgrounds', () => {
    // Arrange: Authenticated user
    mockUseUserStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      logout: mockLogout,
      setUser: vi.fn(),
      clearUser: vi.fn()
    });

    // Act: Render DashboardPage
    const { container } = render(<DashboardPage />);

    // Assert: Page has proper structure
    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('bg-gradient-to-br', 'from-blue-50', 'via-white', 'to-purple-50');
  });

  test('should display helpful tips and call to action', () => {
    // Arrange: Authenticated user
    mockUseUserStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      logout: mockLogout,
      setUser: vi.fn(),
      clearUser: vi.fn()
    });

    // Act: Render DashboardPage
    render(<DashboardPage />);

    // Assert: Tips and call to action are displayed
    expect(screen.getByText('Selecciona un nivel y un topic para empezar tu experiencia de aprendizaje personalizada.')).toBeInTheDocument();
    expect(screen.getByText('💡 Tip: Puedes cambiar de nivel y topic en cualquier momento')).toBeInTheDocument();
  });
});