import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { executeOne, executeRun } from '@/lib/d1';
import { generateServerSeed, generateClientSeed, hashServerSeed } from '@/lib/fairness';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json() as { username: string; email: string; password: string };

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

    // Check if user already exists using D1 raw SQL
    const existingUser = await executeOne(
      'SELECT * FROM User WHERE email = ? OR username = ? LIMIT 1',
      [normalizedEmail, normalizedUsername]
    );

    if (existingUser) {
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

    // Generate UUID for user
    const userId = crypto.randomUUID();

    // Create user using D1 raw SQL
    await executeRun(
      `INSERT INTO User (id, username, email, passwordHash, role, coins, xp, level, banned, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, 'USER', 1000.0, 0, 1, 0, datetime('now'), datetime('now'))`,
      [userId, normalizedUsername, normalizedEmail, passwordHash]
    );

    // Create initial provably fair seed
    const serverSeed = generateServerSeed();
    const seedId = crypto.randomUUID();
    
    await executeRun(
      `INSERT INTO ProvablyFairSeed (id, userId, serverSeed, serverSeedHash, clientSeed, nonce, active, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 0, 1, datetime('now'), datetime('now'))`,
      [seedId, userId, serverSeed, hashServerSeed(serverSeed), generateClientSeed()]
    );

    return NextResponse.json(
      { success: true, message: 'User registered successfully', userId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}
