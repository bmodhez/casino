import { NextResponse } from 'next/server';

/**
 * Safely handle API errors and return appropriate responses
 */
export function handleApiError(error: unknown, context: string = 'API') {
  console.error(`[${context}] Error:`, error);

  // Default error response
  let statusCode = 500;
  let message = 'An unexpected error occurred. Please try again.';

  // Handle known error types
  if (error instanceof Error) {
    // Database errors
    if (error.message.includes('D1_ERROR') || error.message.includes('database')) {
      statusCode = 503;
      message = 'Database is temporarily unavailable. Please try again in a moment.';
    }
    // Authentication errors
    else if (error.message.includes('Unauthorized') || error.message.includes('auth')) {
      statusCode = 401;
      message = 'Authentication required. Please sign in again.';
    }
    // Validation errors
    else if (error.message.includes('Invalid') || error.message.includes('validation')) {
      statusCode = 400;
      message = 'Invalid request. Please check your input.';
    }
    // Timeout errors
    else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      statusCode = 504;
      message = 'Request timed out. Please try again.';
    }
    // Rate limit errors
    else if (error.message.includes('rate limit') || error.message.includes('too many')) {
      statusCode = 429;
      message = 'Too many requests. Please slow down.';
    }
  }

  // In production, don't expose internal error details
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { 
        success: false, 
        error: message,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }

  // In development, include more details for debugging
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    },
    { status: statusCode }
  );
}

/**
 * Wrap async API handlers with error handling
 */
export function withErrorHandling(
  handler: (req: any) => Promise<Response>,
  context?: string
) {
  return async (req: any) => {
    try {
      return await handler(req);
    } catch (error) {
      return handleApiError(error, context);
    }
  };
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Cloudflare Rate Limiting or Durable Objects
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Clean up old rate limit records periodically
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}
