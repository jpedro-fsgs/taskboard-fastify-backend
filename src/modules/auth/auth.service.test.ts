import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependent modules before importing the service
vi.mock('../user/users.service', () => ({
  findUserByUsernameService: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    compareSync: vi.fn(),
  },
}));

import { findUserByUsernameService } from '../user/users.service';
import bcrypt from 'bcryptjs';
import { validateUserService } from './auth.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('auth.service', () => {
  it('returns null when user is not found', async () => {
    (findUserByUsernameService as any).mockResolvedValue(null);

    const res = await validateUserService('noone', 'pwd');

    expect(findUserByUsernameService).toHaveBeenCalledWith('noone');
    expect(res).toBeNull();
  });

  it('returns null when password does not match', async () => {
    const user = { id: '1', username: 'u', name: 'N', hashed_password: 'h' };
    (findUserByUsernameService as any).mockResolvedValue(user);
    (bcrypt.compareSync as any).mockReturnValue(false);

    const res = await validateUserService('u', 'wrong');

    expect(bcrypt.compareSync).toHaveBeenCalledWith('wrong', 'h');
    expect(res).toBeNull();
  });

  it('returns sanitized user when password matches', async () => {
    const user = { id: '2', username: 'u2', name: 'N2', hashed_password: 'h2' };
    (findUserByUsernameService as any).mockResolvedValue(user);
    (bcrypt.compareSync as any).mockReturnValue(true);

    const res = await validateUserService('u2', 'right');

    expect(bcrypt.compareSync).toHaveBeenCalledWith('right', 'h2');
    expect(res).toEqual({ id: '2', username: 'u2', name: 'N2' });
  });

  it('returns null when hashed_password is missing', async () => {
    const user = { id: '3', username: 'u3', name: 'N3' } as any;
    (findUserByUsernameService as any).mockResolvedValue(user);
    (bcrypt.compareSync as any).mockReturnValue(false);

    const res = await validateUserService('u3', 'any');

    expect(bcrypt.compareSync).toHaveBeenCalledWith('any', '');
    expect(res).toBeNull();
  });
});
