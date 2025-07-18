import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TopicList } from '../TopicList';
import { useTopicsAutoLoad } from '../../../application/hooks/useTopics';
import { useSelection } from '../../../infrastructure/store/selectionStore';
import type { Topic } from '../../../domain/entities/Topic';
import { mockTopics } from '../../../mocks';

// Mock hooks
vi.mock('../../../application/hooks/useTopics');
vi.mock('../../../infrastructure/store/selectionStore');
vi.mock('../../../design-system/utils', () => ({
  createGradientStyle: vi.fn(() => ({ background: 'linear-gradient(to right, #3B82F6, #1E40AF)' }))
}));

const mockUseTopicsAutoLoad = useTopicsAutoLoad as ReturnType<typeof vi.mocked<typeof useTopicsAutoLoad>>;
const mockUseSelection = useSelection as ReturnType<typeof vi.mocked<typeof useSelection>>;


const mockUpdateTopic = vi.fn();
const mockSelectTopic = vi.fn();
const mockOnTopicSelect = vi.fn();

describe('TopicList Component - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock setup
    mockUseSelection.mockReturnValue({
      selection: { level: null, topic: null, user: null },
      level: null,
      topic: null,
      user: null,
      setSelected: vi.fn(),
      updateLevel: vi.fn(),
      updateTopic: mockUpdateTopic,
      updateUser: vi.fn(),
      clearSelection: vi.fn(),
      hasCompleteSelection: false,
      getSelection: vi.fn(() => ({ level: null, topic: null, user: null }))
    });
  });

  describe('Loading State', () => {
    test('should display loading state while fetching topics', () => {
      mockUseTopicsAutoLoad.mockReturnValue({
        topics: [],
        currentTopic: null,
        isLoading: true,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: false,
        topicsCount: 0
      });

      render(<TopicList />);

      expect(screen.getByText('Cargando topics...')).toBeInTheDocument();
      
      // Should show loading spinner
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    test('should apply custom className during loading', () => {
      mockUseTopicsAutoLoad.mockReturnValue({
        topics: [],
        currentTopic: null,
        isLoading: true,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: false,
        topicsCount: 0
      });

      const { container } = render(<TopicList className="custom-class" />);
      const topicsListElement = container.querySelector('.topics-list');
      
      expect(topicsListElement).toHaveClass('custom-class');
    });
  });

  describe('Error State', () => {
    test('should display error message when there is an error', () => {
      const errorMessage = 'Failed to fetch topics';
      mockUseTopicsAutoLoad.mockReturnValue({
        topics: [],
        currentTopic: null,
        isLoading: false,
        error: errorMessage,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: false,
        topicsCount: 0
      });

      render(<TopicList />);

      expect(screen.getByText('Error al cargar topics')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      
      // Should have error styling
      const errorContainer = screen.getByText(errorMessage).closest('.bg-red-50');
      expect(errorContainer).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    test('should display empty state when no topics are available', () => {
      mockUseTopicsAutoLoad.mockReturnValue({
        topics: [],
        currentTopic: null,
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: false,
        topicsCount: 0
      });

      render(<TopicList />);

      expect(screen.getByText('No hay topics disponibles')).toBeInTheDocument();
      expect(screen.getByText('Los topics aparecerán aquí cuando estén disponibles')).toBeInTheDocument();
      
      // Should show book emoji
      expect(screen.getByText('📚')).toBeInTheDocument();
    });
  });

  describe('Topics Display', () => {
    beforeEach(() => {
      mockUseTopicsAutoLoad.mockReturnValue({
        topics: mockTopics,
        currentTopic: null,
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: true,
        topicsCount: mockTopics.length
      });
    });

    test('should render topics list when data is loaded', () => {
      render(<TopicList />);
      
      // Check all topics are rendered
      mockTopics.forEach(topic => {
        expect(screen.getByText(topic.title)).toBeInTheDocument();
        expect(screen.getByText(topic.description ?? 'description')).toBeInTheDocument();
        expect(screen.getByText(topic.icon ?? '🧪')).toBeInTheDocument();
      });
    });

    test('should display topic icons correctly', () => {
      render(<TopicList />);

      mockTopics.forEach(topic => {
        expect(screen.getByText(topic.icon ?? '🧪')).toBeInTheDocument();

      });
    });

    test('should render topics in a grid layout', () => {
      const { container } = render(<TopicList />);
      const gridContainer = container.querySelector('.grid.grid-cols-3');
      
      expect(gridContainer).toBeInTheDocument();
    });

    test('should handle topics without description', () => {
      const topicWithoutDescription: Topic = {
        id: '4',
        title: 'Test Topic',
        description: '',
        icon: '🧪',
        color_scheme: '#000000'
      };

      mockUseTopicsAutoLoad.mockReturnValue({
        topics: [topicWithoutDescription],
        currentTopic: null,
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: true,
        topicsCount: 1
      });

      render(<TopicList />);
      
      expect(screen.getByText('Test Topic')).toBeInTheDocument();
      expect(screen.getByText('🧪')).toBeInTheDocument();
    });
  });

  describe('Topic Selection', () => {
    beforeEach(() => {
      mockUseTopicsAutoLoad.mockReturnValue({
        topics: mockTopics,
        currentTopic: null,
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: true,
        topicsCount: mockTopics.length
      });
    });

    test('should auto-load topics when level selected', () => {
      render(<TopicList />);
      
      // The useTopicsAutoLoad hook should be called, indicating auto-loading behavior
      expect(mockUseTopicsAutoLoad).toHaveBeenCalled();
    });

    test('should handle topic click and call appropriate functions', async () => {
      render(<TopicList onTopicSelect={mockOnTopicSelect} />);

      const firstTopicCard = screen.getByText(mockTopics[0].title).closest('[role="button"], button, [onClick], [clickable]') || 
                            screen.getByText(mockTopics[0].title).closest('div');
      
      if (firstTopicCard) {
        fireEvent.click(firstTopicCard);
      } else {
        // Fallback: click on the title directly
        fireEvent.click(screen.getByText(mockTopics[0].title));
      }

      await waitFor(() => {
        expect(mockSelectTopic).toHaveBeenCalledWith(mockTopics[0]);
        expect(mockUpdateTopic).toHaveBeenCalledWith(mockTopics[0].id);
        expect(mockOnTopicSelect).toHaveBeenCalledWith(mockTopics[0]);
      });
    });

    test('should work without onTopicSelect callback', async () => {
      render(<TopicList />);

      const firstTopicCard = screen.getByText(mockTopics[0].title).closest('div');
      
      if (firstTopicCard) {
        fireEvent.click(firstTopicCard);
      }

      await waitFor(() => {
        expect(mockSelectTopic).toHaveBeenCalledWith(mockTopics[0]);
        expect(mockUpdateTopic).toHaveBeenCalledWith(mockTopics[0].id);
      });
    });
  });

  describe('Selected Topic Indication', () => {
    test('should highlight selected topic via selectedTopicId prop', () => {
      mockUseTopicsAutoLoad.mockReturnValue({
        topics: mockTopics,
        currentTopic: null,
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: true,
        topicsCount: mockTopics.length
      });

      render(<TopicList selectedTopicId={mockTopics[1].id} />);

      // Should show SELECTED badge
      expect(screen.getByText('SELECTED')).toBeInTheDocument();
      
      // Should show checkmark icon
      expect(screen.getByText('✅')).toBeInTheDocument();
    });

    test('should highlight selected topic via currentTopic from hook', () => {
      const selectedTopic = mockTopics[2];
      mockUseTopicsAutoLoad.mockReturnValue({
        topics: mockTopics,
        currentTopic: selectedTopic,
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: true,
        topicsCount: mockTopics.length
      });

      render(<TopicList />);

      // Should show SELECTED badge
      expect(screen.getByText('SELECTED')).toBeInTheDocument();
      
      // Should show checkmark icon
      expect(screen.getByText('✅')).toBeInTheDocument();
    });

    test('should not show selection indicators when no topic is selected', () => {
      mockUseTopicsAutoLoad.mockReturnValue({
        topics: mockTopics,
        currentTopic: null,
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: true,
        topicsCount: mockTopics.length
      });

      render(<TopicList />);

      expect(screen.queryByText('SELECTED')).not.toBeInTheDocument();
      expect(screen.queryByText('✅')).not.toBeInTheDocument();
    });

    test('should show both currentTopic and selectedTopicId as selected when different', () => {
      mockUseTopicsAutoLoad.mockReturnValue({
        topics: mockTopics,
        currentTopic: mockTopics[0], // Different from selectedTopicId
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: true,
        topicsCount: mockTopics.length
      });

      render(<TopicList selectedTopicId={mockTopics[1].id} />);

      // Should show two SELECTED badges (one for currentTopic, one for selectedTopicId)
      const selectedBadges = screen.getAllByText('SELECTED');
      expect(selectedBadges).toHaveLength(2);
      
      // Both topics should have selection styling
      expect(screen.getByText(mockTopics[0].title)).toBeInTheDocument();
      expect(screen.getByText(mockTopics[1].title)).toBeInTheDocument();
    });
  });

  describe('Integration with Stores and Hooks', () => {
    test('should integrate correctly with useTopicsAutoLoad hook', () => {
      const mockHookReturn = {
        topics: mockTopics,
        currentTopic: mockTopics[0],
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: true,
        topicsCount: mockTopics.length
      };
      
      mockUseTopicsAutoLoad.mockReturnValue(mockHookReturn);

      render(<TopicList />);

      expect(mockUseTopicsAutoLoad).toHaveBeenCalled();
      expect(screen.getByText(mockTopics[0].title)).toBeInTheDocument();
    });

    test('should integrate correctly with useSelection store', () => {
      mockUseTopicsAutoLoad.mockReturnValue({
        topics: mockTopics,
        currentTopic: null,
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: true,
        topicsCount: mockTopics.length
      });

      render(<TopicList />);

      expect(mockUseSelection).toHaveBeenCalled();
    });
  });

  describe('Visual Styling and Color Schemes', () => {
    beforeEach(() => {
      mockUseTopicsAutoLoad.mockReturnValue({
        topics: mockTopics,
        currentTopic: null,
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: true,
        topicsCount: mockTopics.length
      });
    });

    test('should apply color scheme to topic icons', () => {
      const { container } = render(<TopicList />);
      
      // Check that icons have color styling
      const iconElements = container.querySelectorAll('[style*="color"]');
      expect(iconElements.length).toBeGreaterThan(0);
    });

    test('should create gradient styles for color indicators', () => {
      const { container } = render(<TopicList />);
      
      // Check for gradient bottom indicators
      const gradientElements = container.querySelectorAll('.absolute.bottom-0');
      expect(gradientElements.length).toBe(mockTopics.length);
    });

    test('should handle topics without color scheme', () => {
      const topicWithoutColor: Topic = {
        id: '5',
        title: 'No Color Topic',
        description: 'Topic without color scheme',
        icon: '⚪',
        color_scheme: ''
      };

      mockUseTopicsAutoLoad.mockReturnValue({
        topics: [topicWithoutColor],
        currentTopic: null,
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: true,
        topicsCount: 1
      });

      expect(() => render(<TopicList />)).not.toThrow();
      expect(screen.getByText('No Color Topic')).toBeInTheDocument();
    });
  });

  describe('Accessibility and UX', () => {
    beforeEach(() => {
      mockUseTopicsAutoLoad.mockReturnValue({
        topics: mockTopics,
        currentTopic: null,
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: true,
        topicsCount: mockTopics.length
      });
    });

    test('should apply custom className correctly', () => {
      const customClass = 'my-custom-topics-list';
      const { container } = render(<TopicList className={customClass} />);
      
      const topicsListElement = container.querySelector('.topics-list');
      expect(topicsListElement).toHaveClass(customClass);
    });

    test('should have hover effects on topic cards', () => {
      const { container } = render(<TopicList />);
      
      // Check for hover classes
      const cardElements = container.querySelectorAll('.hover\\:shadow-lg');
      expect(cardElements.length).toBe(mockTopics.length);
    });

    test('should handle multiple topic selections correctly', async () => {
      render(<TopicList onTopicSelect={mockOnTopicSelect} />);

      // Click first topic
      const firstTopicElement = screen.getByText(mockTopics[0].title).closest('div');
      if (firstTopicElement) {
        fireEvent.click(firstTopicElement);
      }

      // Click second topic
      const secondTopicElement = screen.getByText(mockTopics[1].title).closest('div');
      if (secondTopicElement) {
        fireEvent.click(secondTopicElement);
      }

      await waitFor(() => {
        expect(mockSelectTopic).toHaveBeenCalledTimes(2);
        expect(mockUpdateTopic).toHaveBeenCalledTimes(2);
        expect(mockOnTopicSelect).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle empty topics array gracefully', () => {
      mockUseTopicsAutoLoad.mockReturnValue({
        topics: [],
        currentTopic: null,
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: false,
        topicsCount: 0
      });

      render(<TopicList />);
      
      expect(screen.getByText('No hay topics disponibles')).toBeInTheDocument();
    });

    test('should not crash with undefined currentTopic', () => {
      mockUseTopicsAutoLoad.mockReturnValue({
        topics: mockTopics,
        currentTopic: undefined as unknown as Topic | null,
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: true,
        topicsCount: mockTopics.length
      });

      expect(() => render(<TopicList />)).not.toThrow();
      expect(screen.getByText(mockTopics[0].title)).toBeInTheDocument();
    });

    test('should handle topics with missing optional properties', () => {
      const minimalTopic: Topic = {
        id: 'minimal',
        title: 'Minimal Topic',
        description: '',
        icon: '',
        color_scheme: '',
      };

      mockUseTopicsAutoLoad.mockReturnValue({
        topics: [minimalTopic],
        currentTopic: null,
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: true,
        topicsCount: 1
      });

      expect(() => render(<TopicList />)).not.toThrow();
      expect(screen.getByText('Minimal Topic')).toBeInTheDocument();
    });

    test('should render correctly with large number of topics', () => {
      const manyTopics = Array.from({ length: 20 }, (_, i) => ({
        id: `topic-${i}`,
        title: `Topic ${i + 1}`,
        description: `Description for topic ${i + 1}`,
        icon: '📖',
        color_scheme: '#3B82F6',
        id_level: 'test'
      }));

      mockUseTopicsAutoLoad.mockReturnValue({
        topics: manyTopics,
        currentTopic: null,
        isLoading: false,
        error: null,
        selectTopic: mockSelectTopic,
        loadTopics: vi.fn(),
        loadTopicById: vi.fn(),
        clearTopicsError: vi.fn(),
        getTopicFromState: vi.fn(),
        hasTopics: true,
        topicsCount: manyTopics.length
      });

      render(<TopicList />);
      
      expect(screen.getByText('Topic 1')).toBeInTheDocument();
      expect(screen.getByText('Topic 20')).toBeInTheDocument();
    });
  });
});
