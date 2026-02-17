import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Log if DATABASE_URL is set (for debugging)
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  // Mask password in logs
  const masked = url.replace(/:([^@]+)@/, ':****@');
  console.log('[DB] DATABASE_URL set:', masked);
} else {
  console.log('[DB] DATABASE_URL not set!');
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
