import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateServerSeed, generateClientSeed, hashServerSeed } from '@/lib/fairness';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Normalize inputs
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { username: normalizedUsername },
        ],
      },
    });

    if (existingUser) {
      // Check which field is duplicate and return specific error
      if (existingUser.email === normalizedEmail && existingUser.username === normalizedUsername) {
        return NextResponse.json({ error: 'Both username and email are already taken' }, { status: 400 });
      }
      if (existingUser.email === normalizedEmail) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      if (existingUser.username === normalizedUsername) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and provably fair seed in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: normalizedUsername,
          email: normalizedEmail,
          passwordHash,
          coins: 1000.0, // Initial coins balance
          xp: 0,
          level: 1,
        },
      });

      const serverSeed = generateServerSeed();
      await tx.provablyFairSeed.create({
        data: {
          userId: newUser.id,
          serverSeed,
          serverSeedHash: hashServerSeed(serverSeed),
          clientSeed: generateClientSeed(),
          active: true,
        },
      });

      return newUser;
    });

    return NextResponse.json(
      { success: true, message: 'User registered successfully', userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error?.code === 'P2002') {
      const field = error?.meta?.target?.[0];
      if (field === 'username') {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }
      if (field === 'email') {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}
