import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { generateServerSeed, generateClientSeed, hashServerSeed } from './fairness';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  trustHost: true, // Required for Cloudflare Workers
  useSecureCookies: process.env.NODE_ENV === 'production',
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;
        if (user.banned) throw new Error('Account banned');

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.coins = (user as any).coins;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        (session.user as any).coins = token.coins;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For OAuth signins, create initial seed if needed
      if (account?.provider !== 'credentials') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { seeds: { where: { active: true } } },
        });
        
        if (existingUser && existingUser.seeds.length === 0) {
          const serverSeed = generateServerSeed();
          await prisma.provablyFairSeed.create({
            data: {
              userId: existingUser.id,
              serverSeed,
              serverSeedHash: hashServerSeed(serverSeed),
              clientSeed: generateClientSeed(),
            },
          });
        }
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Create initial provably fair seed for new user
      const serverSeed = generateServerSeed();
      await prisma.provablyFairSeed.create({
        data: {
          userId: user.id!,
          serverSeed,
          serverSeedHash: hashServerSeed(serverSeed),
          clientSeed: generateClientSeed(),
        },
      });
    },
  },
});
