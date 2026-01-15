
import { describe, it, expect } from 'vitest';
import { TaskStatus } from '../types';

describe('Project Workflow Logic', () => {
  it('should lock a task if its parents are not completed', () => {
    const tasks = [
      { id: 'parent-1', status: TaskStatus.RUNNING },
      { id: 'child-1', parentTaskIds: ['parent-1'] }
    ];

    const child = tasks.find(t => t.id === 'child-1');
    const isLocked = child.parentTaskIds.some(pid => 
      tasks.find(t => t.id === pid)?.status !== TaskStatus.COMPLETED
    );

    expect(isLocked).toBe(true);
  });

  it('should unlock a task when all parents are completed', () => {
    const tasks = [
      { id: 'parent-1', status: TaskStatus.COMPLETED },
      { id: 'child-1', parentTaskIds: ['parent-1'] }
    ];

    const child = tasks.find(t => t.id === 'child-1');
    const isLocked = child.parentTaskIds.some(pid => 
      tasks.find(t => t.id === pid)?.status !== TaskStatus.COMPLETED
    );

    expect(isLocked).toBe(false);
  });
});
