import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock prisma before importing the service so the service uses the mocked client
vi.mock('../../utils/prisma', () => {
  return {
    default: {
      task: {
        findMany: vi.fn(),
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    },
  };
});

import prisma from '../../utils/prisma';
import {
  getAllTasksService,
  createTaskService,
  findTaskByIdService,
  setTaskDoneService,
  softDeleteTaskService,
} from './tasks.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('tasks.service', () => {
  describe('getAllTasksService', () => {
    it('returns tasks and queries deleted_at null when no userId provided', async () => {
      (prisma.task.findMany as any).mockResolvedValue([{ id: '1', title: 't1' }]);

      const res = await getAllTasksService();

      expect(prisma.task.findMany).toHaveBeenCalledWith({ where: { deleted_at: null } });
      expect(res).toEqual([{ id: '1', title: 't1' }]);
    });

    it('adds user_id to where when userId is provided', async () => {
      (prisma.task.findMany as any).mockResolvedValue([{ id: '2', user_id: 'u1' }]);

      const res = await getAllTasksService('u1');

      expect(prisma.task.findMany).toHaveBeenCalledWith({ where: { deleted_at: null, user_id: 'u1' } });
      expect(res).toEqual([{ id: '2', user_id: 'u1' }]);
    });
  });

  describe('createTaskService', () => {
    it('creates a task and applies defaults for optional fields', async () => {
      const input = { title: 'a', description: undefined, is_done: undefined, parent_task_id: undefined } as any;
      const created = { id: '3', title: 'a', description: null, is_done: false, parent_task_id: null, user_id: 'u1' };
      (prisma.task.create as any).mockResolvedValue(created);

      const res = await createTaskService(input, 'u1');

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'a',
          description: null,
          is_done: false,
          parent_task_id: null,
          user_id: 'u1',
        },
      });

      expect(res).toEqual(created);
    });
  });

  describe('findTaskByIdService', () => {
    it('returns the task when found', async () => {
      (prisma.task.findUnique as any).mockResolvedValue({ id: '4', title: 'found' });

      const res = await findTaskByIdService('4');

      expect(prisma.task.findUnique).toHaveBeenCalledWith({ where: { id: '4' } });
      expect(res).toEqual({ id: '4', title: 'found' });
    });
  });

  describe('setTaskDoneService', () => {
    it('updates is_done when task exists, belongs to user and not deleted', async () => {
      (prisma.task.findUnique as any).mockResolvedValue({ id: '5', user_id: 'u1', deleted_at: null });
      (prisma.task.update as any).mockResolvedValue({ id: '5', is_done: true });

      const res = await setTaskDoneService('5', 'u1', true);

      expect(prisma.task.findUnique).toHaveBeenCalledWith({ where: { id: '5' } });
      expect(prisma.task.update).toHaveBeenCalledWith({ where: { id: '5' }, data: { is_done: true } });
      expect(res).toEqual({ id: '5', is_done: true });
    });

    it('throws when task not found', async () => {
      (prisma.task.findUnique as any).mockResolvedValue(null);

      await expect(setTaskDoneService('missing', 'u1', true)).rejects.toThrow('Task not found');
    });

    it("throws when the task belongs to another user (unauthorized)", async () => {
      (prisma.task.findUnique as any).mockResolvedValue({ id: '6', user_id: 'other', deleted_at: null });

      await expect(setTaskDoneService('6', 'u1', true)).rejects.toThrow("Unauthorized: cannot modify another user's task");
    });

    it('throws when the task is deleted', async () => {
      (prisma.task.findUnique as any).mockResolvedValue({ id: '7', user_id: 'u1', deleted_at: new Date() });

      await expect(setTaskDoneService('7', 'u1', true)).rejects.toThrow('Cannot modify a deleted task');
    });
  });

  describe('softDeleteTaskService', () => {
    it('soft deletes a task and recursively deletes children', async () => {
      // update will return the updated row
      (prisma.task.update as any).mockImplementation(async ({ where }: any) => ({ id: where.id, deleted_at: new Date() }));

      // findMany should return a child when parent_task_id === '1', and none for '2'
      (prisma.task.findMany as any).mockImplementation(async ({ where }: any) => {
        if (where && where.parent_task_id === '1') return [{ id: '2', parent_task_id: '1', deleted_at: null }];
        return [];
      });

      const res = await softDeleteTaskService('1');

      // top-level update called for id '1'
      expect(prisma.task.update).toHaveBeenCalled();
      expect(prisma.task.update).toHaveBeenCalledWith({ where: { id: '1' }, data: expect.objectContaining({ deleted_at: expect.any(Date) }) });

      // ensure child was also soft-deleted
      // second call should be for child id '2'
      expect((prisma.task.update as any).mock.calls.length).toBeGreaterThanOrEqual(2);
      expect((prisma.task.update as any).mock.calls[1][0]).toEqual({ where: { id: '2' }, data: expect.objectContaining({ deleted_at: expect.any(Date) }) });

      expect(res).toEqual({ id: '1', deleted_at: expect.any(Date) });
    });

    it('propagates errors from prisma update', async () => {
      (prisma.task.update as any).mockRejectedValue(new Error('db error'));
      (prisma.task.findMany as any).mockResolvedValue([]);

      await expect(softDeleteTaskService('bad-id')).rejects.toThrow('db error');
    });
  });
});
