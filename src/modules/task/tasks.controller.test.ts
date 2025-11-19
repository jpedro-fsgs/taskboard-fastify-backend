import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock services used by controller
vi.mock('./tasks.service', () => ({
  createTaskService: vi.fn(),
  getAllTasksService: vi.fn(),
  findTaskByIdService: vi.fn(),
  setTaskDoneService: vi.fn(),
  softDeleteTaskService: vi.fn(),
}));

vi.mock('../user/users.service', () => ({
  findUserByIdService: vi.fn(),
}));

import {
  createTaskService,
  getAllTasksService,
  findTaskByIdService,
  setTaskDoneService,
  softDeleteTaskService,
} from './tasks.service';
import { findUserByIdService } from '../user/users.service';
import {
  getTasksHandler,
  createTaskHandler,
  getTaskByIdHandler,
  setTaskDoneHandler,
  softDeleteTaskHandler,
} from './tasks.controller';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('tasks.controller', () => {
  it('returns tasks for authenticated user', async () => {
    (getAllTasksService as any).mockResolvedValue([{ id: '1' }]);

    const send = vi.fn();
    const code = vi.fn(() => ({ send }));
    const reply: any = { code };

    const request: any = { user: { sub: 'u1' } };

    await getTasksHandler(request, reply as any);

    expect(getAllTasksService).toHaveBeenCalledWith('u1');
    expect(code).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith({ items: [{ id: '1' }] });
  });

  it('returns 401 when creating a task without user', async () => {
    const send = vi.fn();
    const code = vi.fn(() => ({ send }));
    const reply: any = { code };

    const request: any = { body: { title: 't' }, user: {} };

    await createTaskHandler(request, reply as any);

    expect(code).toHaveBeenCalledWith(401);
    expect(send).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  it('returns 404 when authenticated user not found', async () => {
    (findUserByIdService as any).mockResolvedValue(null);

    const send = vi.fn();
    const code = vi.fn(() => ({ send }));
    const reply: any = { code };

    const request: any = { body: { title: 't' }, user: { sub: 'u1' }, log: { error: vi.fn() } };

    await createTaskHandler(request, reply as any);

    expect(findUserByIdService).toHaveBeenCalledWith('u1');
    expect(code).toHaveBeenCalledWith(404);
    expect(send).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('returns 403 when parent task belongs to another user', async () => {
    (findUserByIdService as any).mockResolvedValue({ id: 'u1' });
    (findTaskByIdService as any).mockResolvedValue({ id: 'p1', user_id: 'other', deleted_at: null });

    const send = vi.fn();
    const code = vi.fn(() => ({ send }));
    const reply: any = { code };

    const request: any = { body: { title: 't', parent_task_id: 'p1' }, user: { sub: 'u1' }, log: { error: vi.fn() } };

    await createTaskHandler(request, reply as any);

    expect(code).toHaveBeenCalledWith(403);
    expect(send).toHaveBeenCalledWith({ message: 'Parent task belongs to a different user' });
  });

  it('creates task successfully', async () => {
    (findUserByIdService as any).mockResolvedValue({ id: 'u1' });
    (findTaskByIdService as any).mockResolvedValue(null);
    const created = { id: 't1', title: 't' };
    (createTaskService as any).mockResolvedValue(created);

    const send = vi.fn();
    const code = vi.fn(() => ({ send }));
    const reply: any = { code };

    const request: any = { body: { title: 't' }, user: { sub: 'u1' }, log: { error: vi.fn() } };

    await createTaskHandler(request, reply as any);

    expect(createTaskService).toHaveBeenCalledWith({ title: 't' }, 'u1');
    expect(code).toHaveBeenCalledWith(201);
    expect(send).toHaveBeenCalledWith(created);
  });

  it('returns 404 for missing or deleted task by id', async () => {
    (findTaskByIdService as any).mockResolvedValue(null);

    const send = vi.fn();
    const code = vi.fn(() => ({ send }));
    const reply: any = { code };

    const request: any = { params: { id: 'x' } };

    await getTaskByIdHandler(request, reply as any);

    expect(code).toHaveBeenCalledWith(404);
    expect(send).toHaveBeenCalledWith({ message: 'Not found' });
  });

  it('returns task when found', async () => {
    const task = { id: 't2', title: 'ok', deleted_at: null };
    (findTaskByIdService as any).mockResolvedValue(task);

    const send = vi.fn();
    const code = vi.fn(() => ({ send }));
    const reply: any = { code };

    const request: any = { params: { id: 't2' } };

    await getTaskByIdHandler(request, reply as any);

    expect(code).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith(task);
  });

  it('sets task done and returns 200', async () => {
    const updated = { id: 't3', is_done: true };
    (setTaskDoneService as any).mockResolvedValue(updated);

    const send = vi.fn();
    const code = vi.fn(() => ({ send }));
    const reply: any = { code, log: { error: vi.fn() } };

    const request: any = { body: { id: 't3', is_done: true }, user: { sub: 'u1' } };

    await setTaskDoneHandler(request, reply as any);

    expect(setTaskDoneService).toHaveBeenCalledWith('t3', 'u1', true);
    expect(code).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith(updated);
  });

  it('returns 500 when setTaskDoneService throws', async () => {
    (setTaskDoneService as any).mockRejectedValue(new Error('boom'));

    const send = vi.fn();
    const code = vi.fn(() => ({ send }));
    const reply: any = { code };

    const request: any = { body: { id: 't3', is_done: true }, user: { sub: 'u1' }, log: { error: vi.fn() } };

    await setTaskDoneHandler(request, reply as any);

    expect(code).toHaveBeenCalledWith(500);
    expect(send).toHaveBeenCalledWith({ message: 'Internal error' });
  });

  describe('softDeleteTaskHandler', () => {
    it('returns 401 when no user', async () => {
      const send = vi.fn();
      const code = vi.fn(() => ({ send }));
      const reply: any = { code };

      const request: any = { params: { id: 'x' }, user: {} };

      await softDeleteTaskHandler(request, reply as any);

      expect(code).toHaveBeenCalledWith(401);
      expect(send).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('returns 404 when task missing or deleted', async () => {
      (findTaskByIdService as any).mockResolvedValue(null);

      const send = vi.fn();
      const code = vi.fn(() => ({ send }));
      const reply: any = { code };

      const request: any = { params: { id: 'x' }, user: { sub: 'u1' } };

      await softDeleteTaskHandler(request, reply as any);

      expect(findTaskByIdService).toHaveBeenCalledWith('x');
      expect(code).toHaveBeenCalledWith(404);
      expect(send).toHaveBeenCalledWith({ message: 'Not found' });
    });

    it('returns 403 when task belongs to another user', async () => {
      (findTaskByIdService as any).mockResolvedValue({ id: 't1', user_id: 'other', deleted_at: null });

      const send = vi.fn();
      const code = vi.fn(() => ({ send }));
      const reply: any = { code };

      const request: any = { params: { id: 't1' }, user: { sub: 'u1' } };

      await softDeleteTaskHandler(request, reply as any);

      expect(code).toHaveBeenCalledWith(403);
      expect(send).toHaveBeenCalledWith({ message: 'Forbidden' });
    });

    it('deletes task successfully and returns success true', async () => {
      (findTaskByIdService as any).mockResolvedValue({ id: 't2', user_id: 'u1', deleted_at: null });
      (softDeleteTaskService as any).mockResolvedValue({ id: 't2', deleted_at: new Date() });

      const send = vi.fn();
      const code = vi.fn(() => ({ send }));
      const reply: any = { code };

      const request: any = { params: { id: 't2' }, user: { sub: 'u1' }, log: { error: vi.fn() } };

      await softDeleteTaskHandler(request, reply as any);

      expect(softDeleteTaskService).toHaveBeenCalledWith('t2');
      expect(code).toHaveBeenCalledWith(200);
      expect(send).toHaveBeenCalledWith({ success: true });
    });

    it('returns 500 when softDeleteTaskService throws', async () => {
      (findTaskByIdService as any).mockResolvedValue({ id: 't3', user_id: 'u1', deleted_at: null });
      (softDeleteTaskService as any).mockRejectedValue(new Error('boom'));

      const send = vi.fn();
      const code = vi.fn(() => ({ send }));
      const reply: any = { code, log: { error: vi.fn() } };

      const request: any = { params: { id: 't3' }, user: { sub: 'u1' }, log: { error: vi.fn() } };

      await softDeleteTaskHandler(request, reply as any);

      expect(code).toHaveBeenCalledWith(500);
      expect(send).toHaveBeenCalledWith({ message: 'Internal error' });
    });
  });
});
