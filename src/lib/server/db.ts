import {PrismaClient} from '@prisma/client'

import { dev } from '$app/environment';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (dev) {
  globalForPrisma.prisma = new PrismaClient()
}