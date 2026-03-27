import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set!')
    throw new Error('DATABASE_URL environment variable is not set')
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
    errorFormat: 'pretty',
    // For Supabase connection pooling
    // Use directUrl for migrations (set in schema.prisma)
    // Use url (DATABASE_URL) for queries
  })
}

// Singleton pattern for Prisma Client
// Critical for serverless environments like Vercel
let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient()
} else {
  // In development, use global to prevent multiple instances during hot reload
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient()
  }
  prisma = globalForPrisma.prisma
}

export const db = prisma
export default db
