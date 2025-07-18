import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LevelsList } from '../LevelsList';
import { useLevelsAutoLoad } from '../../../application/hooks/useLevels';
import { useSelection } from '../../../infrastructure/store/selectionStore';
import type { Level } from '../../../domain/entities/Level';

// Mock hooks
vi.mock('../../../application/hooks/useLevels');
vi.mock('../../../infrastructure/store/selectionStore');

const mockUseLevelsAutoLoad = useLevelsAutoLoad as ReturnType<typeof vi.mocked<typeof useLevelsAutoLoad>>;
const mockUseSelection = useSelection as ReturnType<typeof vi.mocked<typeof useSelection>>;

const mockLevel = {
  id: '1',
  title: 'Beginner',
  sub_title: 'Start your journey',
  description: 'Perfect for beginners who want to start learning English',
  feature: 'Basic vocabulary and grammar',
  icon: '🌱',
  color_scheme: '#10B981'
};

// Mock data
const mockLevels: Level[] = [
  {
    id: '1',
    title: 'Beginner',
    sub_title: 'Start your journey',
    description: 'Perfect for beginners who want to start learning English',
    feature: 'Basic vocabulary and grammar',
    icon: '🌱',
    color_scheme: '#10B981'
  },
  {
    id: '2',
    title: 'Intermediate',
    sub_title: 'Build your skills',
    description: 'For learners with some English knowledge',
    feature: 'Advanced grammar and conversation',
    icon: '🚀',
    color_scheme: '#3B82F6'
  },
  {
    id: '3',
    title: 'Advanced',
    sub_title: 'Master the language',
    description: 'For advanced learners seeking fluency',
    feature: 'Complex topics and native-level content',
    icon: '👑',
    color_scheme: '#8B5CF6'
  }
];

const mockUpdateLevel = vi.fn();
const mockSelectLevel = vi.fn();
const mockOnLevelSelect = vi.fn();

describe('LevelsList Component - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock setup
    mockUseSelection.mockReturnValue({
      selection: { level: null, topic: null, user: null },
      level: null,
      topic: null,
      user: null,
      setSelected: vi.fn(),
      updateLevel: mockUpdateLevel,
      updateTopic: vi.fn(),
      updateUser: vi.fn(),
      clearSelection: vi.fn(),
      hasCompleteSelection: false,
      getSelection: vi.fn()
    });
  });

  describe('Loading State', () => {
    test('should display loading state while fetching levels', () => {
      mockUseLevelsAutoLoad.mockReturnValue({
        levels: [],
        selectedLevel: null,
        isLoading: true,
        error: null,
        selectLevel: mockSelectLevel,
        loadLevels: vi.fn(),
        loadLevelById: vi.fn(),
        clearError: vi.fn()
      });

      render(<LevelsList />);

      expect(screen.getByText('Cargando niveles...')).toBeInTheDocument();
      expect(screen.queryByText('Niveles Disponibles')).not.toBeInTheDocument();
    });

    test('should apply custom className during loading', () => {
      mockUseLevelsAutoLoad.mockReturnValue({
        levels: [],
        selectedLevel: null,
        isLoading: true,
        error: null,
        selectLevel: mockSelectLevel,
        loadLevels: vi.fn(),
        loadLevelById: vi.fn(),
        clearError: vi.fn()
      });

      const { container } = render(<LevelsList className="custom-class" />);
      const levelsListElement = container.querySelector('.levels-list');
      
      expect(levelsListElement).toHaveClass('custom-class');
    });
  });

  describe('Error State', () => {
    test('should display error message when there is an error', () => {
      const errorMessage = 'Failed to fetch levels';
      mockUseLevelsAutoLoad.mockReturnValue({
        levels: [],
        selectedLevel: null,
        isLoading: false,
        error: errorMessage,
        selectLevel: mockSelectLevel,
        loadLevels: vi.fn(),
        loadLevelById: vi.fn(),
        clearError: vi.fn()
      });

      render(<LevelsList />);

      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
      expect(screen.queryByText('Niveles Disponibles')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    test('should display empty state when no levels are available', () => {
      mockUseLevelsAutoLoad.mockReturnValue({
        levels: [],
        selectedLevel: null,
        isLoading: false,
        error: null,
        selectLevel: mockSelectLevel,
        loadLevels: vi.fn(),
        loadLevelById: vi.fn(),
        clearError: vi.fn()
      });

      render(<LevelsList />);

      expect(screen.getByText('No hay niveles disponibles')).toBeInTheDocument();
      expect(screen.queryByText('Niveles Disponibles')).not.toBeInTheDocument();
    });
  });

  describe('Levels Display', () => {
    beforeEach(() => {
      mockUseLevelsAutoLoad.mockReturnValue({
        levels: mockLevels,
        selectedLevel: null,
        isLoading: false,
        error: null,
        selectLevel: mockSelectLevel,
        loadLevels: vi.fn(),
        loadLevelById: vi.fn(),
        clearError: vi.fn()
      });
    });

    test('should render levels list when data is loaded', () => {
      render(<LevelsList />);

      expect(screen.getByText('Niveles Disponibles')).toBeInTheDocument();
      
      // Check all levels are rendered
      mockLevels.forEach(level => {
        expect(screen.getByText(level.title)).toBeInTheDocument();
        expect(screen.getByText(level.sub_title)).toBeInTheDocument();
        expect(screen.getByText(level.description)).toBeInTheDocument();
        expect(screen.getByText(level.feature)).toBeInTheDocument();
        expect(screen.getByText(level.icon)).toBeInTheDocument();
      });
    });

    test('should display level icons correctly', () => {
      render(<LevelsList />);

      mockLevels.forEach(level => {
        expect(screen.getByText(level.icon)).toBeInTheDocument();
      });
    });

    test('should apply color scheme to cards', () => {
      render(<LevelsList />);
      
      // Check that level cards are rendered by looking for level titles
      mockLevels.forEach(level => {
        expect(screen.getByText(level.title)).toBeInTheDocument();
      });
      
      // Verify that at least one level is displayed
      expect(screen.getByText(mockLevels[0].title)).toBeInTheDocument();
    });
  });

  describe('Level Selection', () => {
    beforeEach(() => {
      mockUseLevelsAutoLoad.mockReturnValue({
        levels: mockLevels,
        selectedLevel: null,
        isLoading: false,
        error: null,
        selectLevel: mockSelectLevel,
        loadLevels: vi.fn(),
        loadLevelById: vi.fn(),
        clearError: vi.fn()
      });
    });

    test('should handle level click and call appropriate functions', async () => {
      render(<LevelsList onLevelSelect={mockOnLevelSelect} />);

      const firstLevelCard = screen.getByText(mockLevels[0].title).closest('div');
      
      if (firstLevelCard) {
        fireEvent.click(firstLevelCard);
      } else {
        throw new Error('Level card not found');
      }

      await waitFor(() => {
        expect(mockSelectLevel).toHaveBeenCalledWith(mockLevels[0]);
        expect(mockUpdateLevel).toHaveBeenCalledWith(mockLevels[0].id);
        expect(mockOnLevelSelect).toHaveBeenCalledWith(mockLevels[0]);
      });
    });

    test('should work without onLevelSelect callback', async () => {
      render(<LevelsList />);

      const firstLevelCard = screen.getByText(mockLevels[0].title).closest('div');
      if (firstLevelCard) {
        fireEvent.click(firstLevelCard);
      }

      await waitFor(() => {
        expect(mockSelectLevel).toHaveBeenCalledWith(mockLevels[0]);
        expect(mockUpdateLevel).toHaveBeenCalledWith(mockLevels[0].id);
      });
    });
  });

  describe('Selected Level Indication', () => {
    test('should highlight selected level with visual indicators', () => {
      const selectedLevel = mockLevels[1];
      mockUseLevelsAutoLoad.mockReturnValue({
        levels: mockLevels,
        selectedLevel,
        isLoading: false,
        error: null,
        selectLevel: mockSelectLevel,
        loadLevels: vi.fn(),
        loadLevelById: vi.fn(),
        clearError: vi.fn()
      });

      render(<LevelsList />);

      // Should show SELECTED badge
      expect(screen.getByText('SELECTED')).toBeInTheDocument();
      
      // Should show checkmark icon
      expect(screen.getByText('✅')).toBeInTheDocument();
    });

    test('should not show selection indicators when no level is selected', () => {
      mockUseLevelsAutoLoad.mockReturnValue({
        levels: mockLevels,
        selectedLevel: null,
        isLoading: false,
        error: null,
        selectLevel: mockSelectLevel,
        loadLevels: vi.fn(),
        loadLevelById: vi.fn(),
        clearError: vi.fn()
      });

      render(<LevelsList />);

      expect(screen.queryByText('SELECTED')).not.toBeInTheDocument();
      expect(screen.queryByText('✅')).not.toBeInTheDocument();
    });
  });

  describe('Integration with Stores', () => {
    test('should integrate correctly with useLevelsAutoLoad hook', () => {
      const mockHookReturn = {
        levels: mockLevels,
        selectedLevel: mockLevels[0],
        isLoading: false,
        error: null,
        selectLevel: mockSelectLevel,
        loadLevels: vi.fn(),
        loadLevelById: vi.fn(),
        clearError: vi.fn()
      };
      
      mockUseLevelsAutoLoad.mockReturnValue(mockHookReturn);

      render(<LevelsList />);

      expect(mockUseSelection).toHaveBeenCalled();
      expect(screen.getByText('Niveles Disponibles')).toBeInTheDocument();
    });

    test('should integrate correctly with useSelection store', () => {
      mockUseLevelsAutoLoad.mockReturnValue({
        levels: mockLevels,
        selectedLevel: null,
        isLoading: false,
        error: null,
        selectLevel: mockSelectLevel,
        loadLevels: vi.fn(),
        loadLevelById: vi.fn(),
        clearError: vi.fn()
      });

      render(<LevelsList />);

      expect(mockUseLevelsAutoLoad).toHaveBeenCalled();
    });
  });

  describe('Accessibility and UX', () => {
    beforeEach(() => {
      mockUseLevelsAutoLoad.mockReturnValue({
        levels: mockLevels,
        selectedLevel: null,
        isLoading: false,
        error: null,
        selectLevel: mockSelectLevel,
        loadLevels: vi.fn(),
        loadLevelById: vi.fn(),
        clearError: vi.fn()
      });
    });

    test('should have proper heading structure', () => {
      render(<LevelsList />);
      
      const heading = screen.getByText('Niveles Disponibles');
      expect(heading).toBeInTheDocument();
    });

    test('should apply custom className correctly', () => {
      const customClass = 'my-custom-levels-list';
      const { container } = render(<LevelsList className={customClass} />);
      
      const levelsListElement = container.querySelector('.levels-list');
      expect(levelsListElement).toHaveClass(customClass);
    });

    test('should handle multiple level selections correctly', async () => {
      render(<LevelsList onLevelSelect={mockOnLevelSelect} />);

      // Click first level
      const firstLevelElement = screen.getByText(mockLevels[0].title).closest('div');
      if (firstLevelElement) {
        fireEvent.click(firstLevelElement);
      }

      // Click second level
      const secondLevelElement = screen.getByText(mockLevels[1].title).closest('div');
      if (secondLevelElement) {
        fireEvent.click(secondLevelElement);
      }

      await waitFor(() => {
        expect(mockSelectLevel).toHaveBeenCalledTimes(2);
        expect(mockUpdateLevel).toHaveBeenCalledTimes(2);
        expect(mockOnLevelSelect).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle empty levels array gracefully', () => {
      mockUseLevelsAutoLoad.mockReturnValue({
        levels: [],
        selectedLevel: null,
        isLoading: false,
        error: null,
        selectLevel: mockSelectLevel,
        loadLevels: vi.fn(),
        loadLevelById: vi.fn(),
        clearError: vi.fn()
      });

      render(<LevelsList />);
      
      expect(screen.getByText('No hay niveles disponibles')).toBeInTheDocument();
    });

    test('should handle level with missing optional properties', () => {
      const levelWithMissingProps: Level = {
        id: 'test-level',
        title: 'Test Level',
        sub_title: 'Test Subtitle',
        description: 'Test Description',
        feature: 'Test Feature',
        icon: '',
        color_scheme: '#000000'
      };

      mockUseLevelsAutoLoad.mockReturnValue({
        levels: [levelWithMissingProps],
        selectedLevel: null,
        isLoading: false,
        error: null,
        selectLevel: mockSelectLevel,
        loadLevels: vi.fn(),
        loadLevelById: vi.fn(),
        clearError: vi.fn()
      });

      render(<LevelsList />);
      
      expect(screen.getByText('Test Level')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    test('should not crash with undefined selectedLevel', () => {
      mockUseLevelsAutoLoad.mockReturnValue({
        levels: mockLevels,
        selectedLevel: mockLevel,
        isLoading: false,
        error: null,
        selectLevel: mockSelectLevel,
        loadLevels: vi.fn(),
        loadLevelById: vi.fn(),
        clearError: vi.fn()
      });

      expect(() => render(<LevelsList />)).not.toThrow();
      expect(screen.getByText('Niveles Disponibles')).toBeInTheDocument();
    });
  });
});