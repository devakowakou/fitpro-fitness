import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';
import DOMPurify from 'isomorphic-dompurify';

// Rate limiting setup (disabled for development - requires Redis in production)
const ratelimit = process.env.NODE_ENV === 'production' ? new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 requests per hour
  analytics: true,
}) : null;

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

// CSRF Token generation (in production, use a more secure method)
function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    // Rate limiting check (only in production)
    if (ratelimit) {
      const { success: rateLimitSuccess } = await ratelimit.limit(ip);
      if (!rateLimitSuccess) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
    }

    // Parse and validate form data
    const formData = await request.json();

    // CSRF token validation (basic implementation)
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || csrfToken !== formData.csrfToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

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

    // Sanitize inputs
    const sanitizedData = {
      firstName: DOMPurify.sanitize(firstName.trim()),
      lastName: DOMPurify.sanitize(lastName.trim()),
      email: DOMPurify.sanitize(email.trim().toLowerCase()),
      phone: DOMPurify.sanitize(phone.trim()),
      message: DOMPurify.sanitize(message.trim()),
    };

    // Additional security checks
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
      /onload=/i,
      /onerror=/i,
      /onclick=/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(message) || pattern.test(firstName) || pattern.test(lastName)) {
        return NextResponse.json(
          { error: 'Invalid content detected' },
          { status: 400 }
        );
      }
    }

    // In a real application, you would:
    // 1. Send email using a service like SendGrid, AWS SES, or similar
    // 2. Store the contact in a database
    // 3. Send confirmation email to user

    // For now, we'll just log the sanitized data
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

// GET endpoint to provide CSRF token
export async function GET() {
  const csrfToken = generateCSRFToken();

  return NextResponse.json({
    csrfToken,
    expiresAt: Date.now() + 3600000 // 1 hour
  });
}
