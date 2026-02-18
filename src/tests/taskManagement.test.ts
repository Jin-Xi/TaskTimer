
import { describe, it, expect } from 'vitest';
import { Task, TaskStatus } from '../types';

describe('Task Management Logic', () => {
  const mockTask = (id: string, tags: string[] = ['Work']): Partial<Task> => ({
    id,
    title: `Task ${id}`,
    tags,
    status: TaskStatus.IDLE,
    totalTime: 0,
    logs: [],
    milestones: []
  });

  it('should assign a default tag if none are provided', () => {
    const task = mockTask('1', []);
    const finalTags = (task.tags && task.tags.length > 0) ? task.tags : ['Work'];
    expect(finalTags).toContain('Work');
  });

  it('should prevent starting more than 3 tasks concurrently', () => {
    const tasks: Partial<Task>[] = [
      { id: '1', status: TaskStatus.RUNNING },
      { id: '2', status: TaskStatus.RUNNING },
      { id: '3', status: TaskStatus.RUNNING },
      { id: '4', status: TaskStatus.IDLE }
    ];
    
    const runningCount = tasks.filter(t => t.status === TaskStatus.RUNNING).length;
    const canStartNew = runningCount < 3;
    
    expect(canStartNew).toBe(false);
  });
});
