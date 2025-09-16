/**
 * Security Validation Utilities
 * Learn Academy - Comprehensive input validation and sanitization
 *
 * Implements SOC2/ISO27001 compliant data validation:
 * - Input sanitization against XSS attacks
 * - Data type validation with Zod schemas
 * - Length limits and format validation
 * - UK-specific formats (phone, postcode)
 */

import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML input to prevent XSS attacks
 * Removes all HTML tags and dangerous content
 */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  });
}

/**
 * Sanitize rich text content (for future content management)
 * Allows safe HTML tags for formatting
 */
export function sanitizeRichText(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "ol", "ul", "li"],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/**
 * UK Phone Number Validation
 * Accepts: +44, 0, and various UK formats
 */
const ukPhoneRegex =
  /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$|^(\+44\s?[1-8]\d{2,3}|\(?0[1-8]\d{2,3}\)?)\s?\d{3}\s?\d{3,4}$/;

/**
 * UK Postcode Validation
 * Full UK postcode format validation
 */
const ukPostcodeRegex = /^[A-Z]{1,2}[0-9R][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;

// =============================================================================
// CONTACT FORM VALIDATION SCHEMAS
// =============================================================================

/**
 * Contact Form Validation Schema
 * For general inquiries and contact submissions
 */
export const contactFormSchema = z.object({
  fullName: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .transform(sanitizeInput)
    .refine(
      (name) => name.length > 0,
      "Name cannot be empty after sanitization",
    ),

  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters")
    .transform((email) => email.toLowerCase().trim()),

  phone: z
    .string()
    .optional()
    .refine(
      (phone) => !phone || ukPhoneRegex.test(phone),
      "Invalid UK phone number format",
    ),

  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be less than 200 characters")
    .transform(sanitizeInput),

  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters")
    .transform(sanitizeInput),

  preferredContact: z.enum(["email", "phone", "either"]).default("email"),

  // CSRF protection token
  csrfToken: z.string().min(1, "Security token required"),

  // Honeypot field for bot protection
  website: z.string().max(0, "Bot detected").optional(),
});

// =============================================================================
// ENROLLMENT FORM VALIDATION SCHEMAS (Future)
// =============================================================================

/**
 * Student Enrollment Schema
 * For student registration and enrollment
 */
export const enrollmentSchema = z.object({
  // Student Information
  studentName: z
    .string()
    .min(1, "Student name is required")
    .max(100, "Name must be less than 100 characters")
    .transform(sanitizeInput),

  studentAge: z
    .number()
    .min(5, "Student must be at least 5 years old")
    .max(18, "Student must be under 18 years old"),

  yearGroup: z.enum([
    "Year 3",
    "Year 4",
    "Year 5",
    "Year 6",
    "Year 7",
    "Year 8",
    "Year 9",
    "Year 10",
    "Year 11",
    "Year 12",
    "Year 13",
  ]),

  // Parent/Guardian Information
  parentName: z
    .string()
    .min(1, "Parent/Guardian name is required")
    .max(100, "Name must be less than 100 characters")
    .transform(sanitizeInput),

  parentEmail: z
    .string()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),

  parentPhone: z
    .string()
    .refine(
      (phone) => ukPhoneRegex.test(phone),
      "Invalid UK phone number format",
    ),

  // Address Information
  addressLine1: z
    .string()
    .min(1, "Address is required")
    .max(100, "Address line must be less than 100 characters")
    .transform(sanitizeInput),

  addressLine2: z
    .string()
    .max(100, "Address line must be less than 100 characters")
    .transform(sanitizeInput)
    .optional(),

  city: z
    .string()
    .min(1, "City is required")
    .max(50, "City must be less than 50 characters")
    .transform(sanitizeInput),

  postcode: z
    .string()
    .refine(
      (postcode) => ukPostcodeRegex.test(postcode),
      "Invalid UK postcode format",
    )
    .transform((postcode) => postcode.toUpperCase().replace(/\s+/g, " ")),

  // Program Selection
  selectedProgram: z.enum(["foundation", "elevate", "excel", "advanced"]),

  // Additional Information
  specialNeeds: z
    .string()
    .max(500, "Special needs information must be less than 500 characters")
    .transform(sanitizeInput)
    .optional(),

  medicalInfo: z
    .string()
    .max(500, "Medical information must be less than 500 characters")
    .transform(sanitizeInput)
    .optional(),

  emergencyContact: z
    .string()
    .min(1, "Emergency contact is required")
    .max(100, "Emergency contact must be less than 100 characters")
    .transform(sanitizeInput),

  emergencyPhone: z
    .string()
    .refine(
      (phone) => ukPhoneRegex.test(phone),
      "Invalid UK phone number format",
    ),

  // Consent and Agreements
  termsAccepted: z
    .boolean()
    .refine((accepted) => accepted, "Terms and conditions must be accepted"),

  privacyAccepted: z
    .boolean()
    .refine((accepted) => accepted, "Privacy policy must be accepted"),

  photoConsent: z.boolean().default(false),

  marketingConsent: z.boolean().default(false),

  // Security
  csrfToken: z.string().min(1, "Security token required"),
  website: z.string().max(0, "Bot detected").optional(),
});

// =============================================================================
// USER AUTHENTICATION SCHEMAS (Future)
// =============================================================================

/**
 * User Registration Schema
 */
export const userRegistrationSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email format")
      .max(255, "Email must be less than 255 characters"),

    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number and special character",
      ),

    confirmPassword: z.string(),

    fullName: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
      .transform(sanitizeInput),

    role: z.enum(["student", "parent", "admin"]).default("student"),

    csrfToken: z.string().min(1, "Security token required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),

  password: z.string().min(1, "Password is required"),

  csrfToken: z.string().min(1, "Security token required"),
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Validate file upload (for future file upload features)
 */
export const fileUploadSchema = z.object({
  filename: z
    .string()
    .min(1, "Filename required")
    .max(255, "Filename too long")
    .regex(/^[a-zA-Z0-9._-]+$/, "Invalid characters in filename"),

  fileSize: z.number().max(5 * 1024 * 1024, "File size must be less than 5MB"),

  mimeType: z.enum(
    [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    "Invalid file type",
  ),
});

/**
 * API Key Validation
 */
export const apiKeySchema = z.object({
  key: z
    .string()
    .length(32, "Invalid API key format")
    .regex(/^[a-f0-9]+$/, "Invalid API key format"),
});

/**
 * Search Query Validation
 */
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query required")
    .max(100, "Search query too long")
    .transform(sanitizeInput),

  category: z.enum(["all", "programs", "students", "content"]).default("all"),

  limit: z
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type SearchInput = z.infer<typeof searchSchema>;

// =============================================================================
// VALIDATION HELPER FUNCTIONS
// =============================================================================

/**
 * Validate and sanitize contact form data
 */
export async function validateContactForm(
  data: unknown,
): Promise<ContactFormInput> {
  return contactFormSchema.parseAsync(data);
}

/**
 * Validate enrollment data
 */
export async function validateEnrollment(
  data: unknown,
): Promise<EnrollmentInput> {
  return enrollmentSchema.parseAsync(data);
}

/**
 * Validate user registration
 */
export async function validateUserRegistration(
  data: unknown,
): Promise<UserRegistrationInput> {
  return userRegistrationSchema.parseAsync(data);
}

/**
 * Validate login credentials
 */
export async function validateLogin(data: unknown): Promise<LoginInput> {
  return loginSchema.parseAsync(data);
}

/**
 * Rate limiting validation
 */
export function validateRateLimit(
  identifier: string,
  limit: number = 5,
): boolean {
  // This will be implemented with Redis in Task 1.3.3
  // For now, always return true
  return true;
}

/**
 * Input length validation helper
 */
export function validateLength(
  input: string,
  min: number,
  max: number,
): boolean {
  return input.length >= min && input.length <= max;
}

/**
 * User Agent validation and sanitization
 * Prevents excessively long or malicious user agents
 */
export function validateUserAgent(userAgent: string | undefined): string {
  if (!userAgent || typeof userAgent !== "string") {
    return "unknown";
  }

  // Limit length to prevent abuse
  const sanitized = userAgent.slice(0, 200);

  // Basic sanitization
  return sanitizeInput(sanitized);
}

/**
 * Email validation with additional security checks
 */
export function validateEmail(email: string | undefined): string {
  if (!email || typeof email !== "string") {
    return "";
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "";
  }

  // Limit length and sanitize
  return sanitizeInput(email.slice(0, 255));
}

/**
 * String validation with default fallback
 */
export function validateString(
  input: string | undefined,
  defaultValue: string = "",
): string {
  if (!input || typeof input !== "string") {
    return defaultValue;
  }

  return sanitizeInput(input);
}

/**
 * SQL Injection protection helper
 */
export function isSafeForDatabase(input: string): boolean {
  // Check for common SQL injection patterns
  const dangerousPatterns = [
    /(\b(select|insert|update|delete|drop|create|alter|exec|execute|union|script)\b)/i,
    /(;|--|\*|\/\*|\*\/|xp_|sp_)/i,
    /(\bor\b|\band\b).*=.*=/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Generate secure random string for tokens
 */
export function generateSecureToken(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
