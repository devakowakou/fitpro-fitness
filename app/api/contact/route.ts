import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ratelimit = new Map<string, { count: number; resetTime: number }>();

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

  website: z.string().max(0, 'Spam detected').optional().or(z.literal('')),
});

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

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; 
  const maxRequests = 5; 

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

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') 
    .slice(0, 1000); 
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.json();

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

    if (website && website.length > 0) {
      return NextResponse.json(
        { error: 'Spam detected' },
        { status: 400 }
      );
    }

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

    const sanitizedData = {
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      email: sanitizeInput(email.toLowerCase()),
      phone: sanitizeInput(phone),
      message: sanitizeInput(message),
    };

    console.log('Contact form submission:', {
      ...sanitizedData,
      ip,
      timestamp: new Date().toISOString(),
    });

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

export async function GET() {
  const csrfToken = Math.random().toString(36).substring(2, 15) +
                   Math.random().toString(36).substring(2, 15);

  return NextResponse.json({
    csrfToken,
    expiresAt: Date.now() + 3600000 
  });
}
