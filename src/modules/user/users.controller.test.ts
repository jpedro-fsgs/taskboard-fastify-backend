import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock services used by controller
vi.mock('./users.service', () => ({
  createUserService: vi.fn(),
  getAllUsersService: vi.fn(),
}));

import { createUserService, getAllUsersService } from './users.service';
import { getUsersHandler, registerUserHandler } from './users.controller';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('users.controller', () => {
  it('returns users list', async () => {
    const users = [{ id: '1', username: 'u1', name: 'Name' }];
    (getAllUsersService as any).mockResolvedValue(users);

    const send = vi.fn();
    const code = vi.fn(() => ({ send }));
    const reply: any = { code };

    const request: any = {};

    await getUsersHandler(request, reply as any);

    expect(getAllUsersService).toHaveBeenCalled();
    expect(code).toHaveBeenCalledWith(200);
    expect(send).toHaveBeenCalledWith({ data: users });
  });

  it('registers a user and returns public fields', async () => {
    const input = { username: 'u2', name: 'N', password: 'p' } as any;
    const created = { id: '2', username: 'u2', name: 'N', hashed_password: 'h' } as any;
    (createUserService as any).mockResolvedValue(created);

    const send = vi.fn();
    const code = vi.fn(() => ({ send }));
    const reply: any = { code };
    const request: any = { body: input, log: { error: vi.fn() } };

    await registerUserHandler(request, reply as any);

    expect(createUserService).toHaveBeenCalledWith(input);
    expect(code).toHaveBeenCalledWith(201);
    expect(send).toHaveBeenCalledWith({ id: '2', username: 'u2', name: 'N' });
  });

  it('returns 409 on unique constraint violation', async () => {
    const err: any = { code: 'P2002' };
    (createUserService as any).mockRejectedValue(err);

    const send = vi.fn();
    const code = vi.fn(() => ({ send }));
    const reply: any = { code };
    const request: any = { body: { username: 'u' }, log: { error: vi.fn() } };

    await registerUserHandler(request, reply as any);

    expect(code).toHaveBeenCalledWith(409);
    expect(send).toHaveBeenCalledWith({ message: 'Username already exists' });
  });
});
