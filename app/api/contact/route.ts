import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Simplified rate limiting for development (no external dependencies)
const ratelimit = new Map<string, { count: number; resetTime: number }>();

// Input validation schema
const contactSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),

  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),

  email: z.email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),

  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[\d\s\-\+\(\)\.]+$/, 'Phone number contains invalid characters'),

  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),

  // Honeypot field
  website: z.string().max(0, 'Spam detected').optional().or(z.literal('')),
});

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

// Simple rate limiting for development
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 5; // 5 requests per minute

  const userLimit = ratelimit.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    ratelimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Basic input sanitization (no external dependencies)
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    // Simple rate limiting check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate form data
    const formData = await request.json();

    // Validate input data
    const validationResult = contactSchema.safeParse(formData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues.map((issue: z.ZodIssue) => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, message, website } = validationResult.data;

    // Basic security checks
    if (website && website.length > 0) {
      return NextResponse.json(
        { error: 'Spam detected' },
        { status: 400 }
      );
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
    ];

    const combinedInput = `${firstName} ${lastName} ${message}`.toLowerCase();
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(combinedInput)) {
        return NextResponse.json(
          { error: 'Invalid content detected' },
          { status: 400 }
        );
      }
    }

    // Basic sanitization
    const sanitizedData = {
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      email: sanitizeInput(email.toLowerCase()),
      phone: sanitizeInput(phone),
      message: sanitizeInput(message),
    };

    // Log the submission (in production, you'd save to database/send email)
    console.log('Contact form submission:', {
      ...sanitizedData,
      ip,
      timestamp: new Date().toISOString(),
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message! We\'ll get back to you soon.'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for CSRF token (simplified)
export async function GET() {
  const csrfToken = Math.random().toString(36).substring(2, 15) +
                   Math.random().toString(36).substring(2, 15);

  return NextResponse.json({
    csrfToken,
    expiresAt: Date.now() + 3600000 // 1 hour
  });
}
