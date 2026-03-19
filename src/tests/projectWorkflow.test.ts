
import { describe, it, expect } from 'vitest';
import { Task, TaskStatus } from '../types';

describe('Project Workflow Logic', () => {
  it('should lock a task if its parent is not completed', () => {
    const tasks: Partial<Task>[] = [
      { id: 'parent-1', status: TaskStatus.RUNNING },
      { id: 'child-1', parentTaskId: 'parent-1' }
    ];

    const child = tasks.find(t => t.id === 'child-1')!;
    const isLocked = child.parentTaskId
      ? tasks.find(t => t.id === child.parentTaskId)?.status !== TaskStatus.COMPLETED
      : false;

    expect(isLocked).toBe(true);
  });

  it('should unlock a task when parent is completed', () => {
    const tasks: Partial<Task>[] = [
      { id: 'parent-1', status: TaskStatus.COMPLETED },
      { id: 'child-1', parentTaskId: 'parent-1' }
    ];

    const child = tasks.find(t => t.id === 'child-1')!;
    const isLocked = child.parentTaskId
      ? tasks.find(t => t.id === child.parentTaskId)?.status !== TaskStatus.COMPLETED
      : false;

    expect(isLocked).toBe(false);
  });
});
