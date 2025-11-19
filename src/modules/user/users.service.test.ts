import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock prisma before importing the service
vi.mock('../../utils/prisma', () => {
  return {
    default: {
      user: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    },
  };
});

import prisma from '../../utils/prisma';
import {
  createUserService,
  getAllUsersService,
  findUserByIdService,
  findUserByUsernameService,
} from './users.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('users.service', () => {
  describe('createUserService', () => {
    it('hashes the password and returns public user fields', async () => {
      const input = { username: 'u1', name: 'Name', password: 'secret' } as any;
      const created = { id: '1', username: 'u1', name: 'Name', hashed_password: 'hashed' };
      (prisma.user.create as any).mockResolvedValue(created);

      const res = await createUserService(input);

      expect(prisma.user.create).toHaveBeenCalled();
      // Ensure returned object excludes hashed_password
      expect(res).toEqual({ id: '1', username: 'u1', name: 'Name' });
    });
  });

  describe('getAllUsersService', () => {
    it('returns selected user fields', async () => {
      const users = [{ id: '1', username: 'u1', name: 'Name' }];
      (prisma.user.findMany as any).mockResolvedValue(users);

      const res = await getAllUsersService();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: { id: true, username: true, name: true },
      });
      expect(res).toEqual(users);
    });
  });

  describe('findUserByIdService', () => {
    it('returns selected user when found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: '2', username: 'u2', name: 'N2' });

      const res = await findUserByIdService('2');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '2' }, select: { id: true, username: true, name: true } });
      expect(res).toEqual({ id: '2', username: 'u2', name: 'N2' });
    });
  });

  describe('findUserByUsernameService', () => {
    it('returns full user record including hashed_password', async () => {
      const user = { id: '3', username: 'u3', name: 'N3', hashed_password: 'h' };
      (prisma.user.findUnique as any).mockResolvedValue(user);

      const res = await findUserByUsernameService('u3');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { username: 'u3' } });
      expect(res).toEqual(user);
    });
  });
});
