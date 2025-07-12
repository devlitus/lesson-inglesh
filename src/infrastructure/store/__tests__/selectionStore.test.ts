import { describe, test, expect, beforeEach } from 'vitest';
import { useSelectionStore } from '../selectionStore';

describe('Selection Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSelectionStore.getState().clearSelection();
  });

  test('should have initial state', () => {
    const state = useSelectionStore.getState();
    
    expect(state.selection.level).toBeNull();
    expect(state.selection.topic).toBeNull();
    expect(state.selection.user).toBeNull();
    expect(state.hasCompleteSelection()).toBe(false);
  });

  test('should update level selection correctly', () => {
    const { updateLevel } = useSelectionStore.getState();
    
    // Act: Update level
    updateLevel('beginner');
    
    // Assert: Level is updated, others remain null
    const state = useSelectionStore.getState();
    expect(state.selection.level).toBe('beginner');
    expect(state.selection.topic).toBeNull();
    expect(state.selection.user).toBeNull();
    expect(state.hasCompleteSelection()).toBe(false);
  });

  test('should update topic selection correctly', () => {
    const { updateTopic } = useSelectionStore.getState();
    
    // Act: Update topic
    updateTopic('grammar');
    
    // Assert: Topic is updated, others remain null
    const state = useSelectionStore.getState();
    expect(state.selection.level).toBeNull();
    expect(state.selection.topic).toBe('grammar');
    expect(state.selection.user).toBeNull();
    expect(state.hasCompleteSelection()).toBe(false);
  });

  test('should update user selection correctly', () => {
    const { updateUser } = useSelectionStore.getState();
    
    // Act: Update user
    updateUser('user123');
    
    // Assert: User is updated, others remain null
    const state = useSelectionStore.getState();
    expect(state.selection.level).toBeNull();
    expect(state.selection.topic).toBeNull();
    expect(state.selection.user).toBe('user123');
    expect(state.hasCompleteSelection()).toBe(false);
  });

  test('should set complete selection correctly', () => {
    const { setSelected } = useSelectionStore.getState();
    
    // Act: Set complete selection
    setSelected({
      level: 'intermediate',
      topic: 'vocabulary',
      user: 'user456'
    });
    
    // Assert: All fields are set
    const state = useSelectionStore.getState();
    expect(state.selection.level).toBe('intermediate');
    expect(state.selection.topic).toBe('vocabulary');
    expect(state.selection.user).toBe('user456');
    expect(state.hasCompleteSelection()).toBe(true);
  });

  test('should validate complete selection correctly', () => {
    const { updateLevel, updateTopic, updateUser, hasCompleteSelection } = useSelectionStore.getState();
    
    // Initially incomplete
    expect(hasCompleteSelection()).toBe(false);
    
    // Add level - still incomplete
    updateLevel('advanced');
    expect(hasCompleteSelection()).toBe(false);
    
    // Add topic - still incomplete
    updateTopic('conversation');
    expect(hasCompleteSelection()).toBe(false);
    
    // Add user - now complete
    updateUser('user789');
    expect(hasCompleteSelection()).toBe(true);
  });

  test('should clear selection correctly', () => {
    const { setSelected, clearSelection } = useSelectionStore.getState();
    
    // Arrange: Set complete selection
    setSelected({
      level: 'beginner',
      topic: 'grammar',
      user: 'user123'
    });
    expect(useSelectionStore.getState().hasCompleteSelection()).toBe(true);
    
    // Act: Clear selection
    clearSelection();
    
    // Assert: All fields are null
    const state = useSelectionStore.getState();
    expect(state.selection.level).toBeNull();
    expect(state.selection.topic).toBeNull();
    expect(state.selection.user).toBeNull();
    expect(state.hasCompleteSelection()).toBe(false);
  });

  test('should get selection correctly', () => {
    const { setSelected, getSelection } = useSelectionStore.getState();
    
    const testSelection = {
      level: 'intermediate',
      topic: 'reading',
      user: 'user999'
    };
    
    // Act: Set selection
    setSelected(testSelection);
    
    // Assert: getSelection returns correct data
    const selection = getSelection();
    expect(selection).toEqual(testSelection);
  });

  test('should maintain partial selections when updating individual fields', () => {
    const { updateLevel, updateTopic, updateUser } = useSelectionStore.getState();
    
    // Build selection step by step
    updateLevel('beginner');
    updateUser('user123');
    
    // Verify partial state
    let state = useSelectionStore.getState();
    expect(state.selection.level).toBe('beginner');
    expect(state.selection.topic).toBeNull();
    expect(state.selection.user).toBe('user123');
    
    // Add topic
    updateTopic('listening');
    
    // Verify complete state
    state = useSelectionStore.getState();
    expect(state.selection.level).toBe('beginner');
    expect(state.selection.topic).toBe('listening');
    expect(state.selection.user).toBe('user123');
    expect(state.hasCompleteSelection()).toBe(true);
  });
});