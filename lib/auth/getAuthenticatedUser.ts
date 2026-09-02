/**
 * Authenticated User Extraction & Validation
 * Replaces duplicate authentication code across API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

/**
 * Extract authenticated user from request Authorization header
 *
 * Expects: Authorization: Bearer <access_token>
 *
 * Returns: Authenticated user object or error response
 *
 * Usage in API route:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const authResult = await getAuthenticatedUser(request);
 *   if (!authResult.user) {
 *     return authResult.response; // 401 Unauthorized
 *   }
 *   const user = authResult.user;
 *   // ... proceed with user.id
 * }
 * ```
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<{
  user: AuthenticatedUser | null;
  response: NextResponse | null;
}> {
  try {
    // Extract Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        user: null,
        response: NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
          },
          { status: 401 }
        ),
      };
    }

    const token = authHeader.substring(7);

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        user: null,
        response: NextResponse.json(
          {
            error: 'Unauthorized',
            message: 'Invalid or expired token',
          },
          { status: 401 }
        ),
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email || '',
        ...user.user_metadata,
      },
      response: null,
    };
  } catch (error) {
    console.error('[getAuthenticatedUser] Error:', error);
    return {
      user: null,
      response: NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'Failed to authenticate user',
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Validate request body matches expected schema
 * Returns parsed data or error response
 */
export function validateRequestBody<T>(
  body: unknown,
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: unknown } }
): {
  data: T | null;
  response: NextResponse | null;
} {
  try {
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorDetails = parsed.error instanceof Error ? parsed.error.message : JSON.stringify(parsed.error);
      return {
        data: null,
        response: NextResponse.json(
          {
            error: 'Bad Request',
            message: 'Invalid request body',
            details: errorDetails || 'Unknown validation error',
          },
          { status: 400 }
        ),
      };
    }

    return {
      data: parsed.data as T,
      response: null,
    };
  } catch (error) {
    console.error('[validateRequestBody] Error:', error);
    return {
      data: null,
      response: NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Failed to parse request body',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Parse JSON request body safely
 */
export async function parseRequestBody(request: NextRequest): Promise<unknown | null> {
  try {
    return await request.json();
  } catch (error) {
    console.error('[parseRequestBody] Error:', error);
    return null;
  }
}

/**
 * Create error response with consistent format
 */
export function createErrorResponse(
  statusCode: number,
  error: string,
  message: string,
  details?: unknown
) {
  const response: Record<string, unknown> = {
    error,
    message,
  };

  if (details) {
    response.details = details;
  }

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create success response with consistent format
 */
export function createSuccessResponse<T>(data: T, statusCode: number = 200) {
  return NextResponse.json(data, { status: statusCode });
}
