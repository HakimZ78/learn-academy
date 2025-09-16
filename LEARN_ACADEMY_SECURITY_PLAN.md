# Learn Academy Security Implementation Plan
## Specific Security & Compliance Requirements

### Executive Summary
This document outlines the specific security implementation plan for Learn Academy, an educational platform handling student data and parental information. Given the nature of handling minors' data and educational records, this plan prioritizes GDPR compliance, child protection, and educational data security standards.

---

## Risk Assessment

### Data Classification

| Data Type | Classification | Risk Level | Current Status | Required Protection |
|-----------|---------------|------------|----------------|-------------------|
| Student Names & Ages | PII - Sensitive | HIGH | Stored in Supabase | Encryption, Access Control |
| Parent Contact Info | PII - Confidential | HIGH | Stored in Supabase | Encryption, Limited Access |
| Student Academic Records | Educational Records | HIGH | Planned | FERPA Compliance |
| Session Recordings | Sensitive | MEDIUM | Not Implemented | Secure Storage, Consent |
| Payment Information | Financial | CRITICAL | Via Stripe | PCI DSS Compliance |
| Login Credentials | Authentication | CRITICAL | Supabase Auth | Hashing, MFA |
| Student Work/Homework | Educational Content | MEDIUM | Planned | Access Control |

### Threat Model

```yaml
Primary Threats:
  External:
    - Unauthorized access to student data
    - Data breach of parent information
    - DDoS attacks during enrollment periods
    - Phishing targeting parents
    
  Internal:
    - Accidental data exposure
    - Insufficient access controls
    - Lack of audit trails
    - Inadequate backup procedures
    
  Compliance:
    - GDPR violations (EU students)
    - Child data protection breaches
    - Educational record mishandling
```

---

## Immediate Security Implementations (Phase 1: Weeks 1-2)

### 1. HTTPS & Security Headers

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && 
      request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
      301
    )
  }

  const response = NextResponse.next()

  // Security headers
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // CSP for educational content
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://js.stripe.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://*.supabase.co https://api.stripe.com; " +
    "frame-src https://js.stripe.com https://hooks.stripe.com; " +
    "frame-ancestors 'none';"
  )

  return response
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
```

### 2. Environment Variables Security

```bash
# .env.local (production)
# Database
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_ROLE_KEY=[service_key] # Never expose to client

# Security
NEXTAUTH_SECRET=[32+ char random string] # Generate: openssl rand -base64 32
NEXTAUTH_URL=https://learn-academy.co.uk

# Encryption
ENCRYPTION_KEY=[32 byte key] # For PII encryption
SIGNING_KEY=[32 byte key] # For token signing

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000 # 15 minutes

# Session
SESSION_SECRET=[32+ char random string]
SESSION_MAX_AGE=1800 # 30 minutes for admin
```

### 3. Input Validation & Sanitization

```typescript
// lib/validation.ts
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// Student registration schema
export const studentRegistrationSchema = z.object({
  parentName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters in name'),
  
  studentName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters in name'),
  
  studentAge: z.number()
    .min(5, 'Minimum age is 5')
    .max(18, 'Maximum age is 18'),
  
  email: z.string()
    .email('Invalid email address')
    .toLowerCase(),
  
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number'),
  
  program: z.enum(['foundation', 'elevate', 'gcse', 'alevel']),
  
  consent: z.boolean()
    .refine(val => val === true, 'Consent required'),
  
  dataProcessing: z.boolean()
    .refine(val => val === true, 'Data processing agreement required')
})

// Sanitize user input for display
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  })
}

// Validate and sanitize contact form
export const contactFormSchema = z.object({
  name: z.string().min(2).max(100).transform(val => 
    val.replace(/<[^>]*>/g, '') // Strip HTML
  ),
  email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(2000).transform(sanitizeHTML),
  captchaToken: z.string().min(1, 'Please complete the captcha')
})
```

### 4. Authentication & Authorization Strategy

#### Academy-Managed Credentials System (Recommended)

**Security Advantage: Isolated Breach Impact**

Instead of using personal emails/passwords, Learn Academy implements academy-specific credentials that dramatically reduce security risks and privacy exposure.

```typescript
// lib/academyAuth.ts
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Academy credential structure
interface AcademyCredentials {
  studentId: string
  academyEmail: string        // student001@learn-academy.co.uk
  tempPassword: string        // Academy-specific password
  parentEmail: string         // For notifications only (not login)
  activationCode: string
  accountType: 'student' | 'parent' | 'staff'
}

// Credential generation system
export async function createStudentAccount(studentData: {
  name: string
  parentEmail: string
  program: string
}) {
  const studentId = generateStudentId()
  
  const credentials: AcademyCredentials = {
    studentId,
    academyEmail: `student${studentId}@learn-academy.co.uk`,
    tempPassword: generateSecurePassword(12),
    parentEmail: studentData.parentEmail, // Communication only
    activationCode: generateActivationCode(),
    accountType: 'student'
  }
  
  // Store only academy credentials in auth system
  await storeAcademyCredentials(credentials)
  
  // Send activation to parent's personal email
  await sendActivationEmail(credentials)
  
  return credentials
}

// Separate parent portal access
export async function createParentAccount(parentData: {
  email: string
  linkedStudentIds: string[]
}) {
  const parentId = generateParentId()
  
  return {
    parentId,
    academyEmail: `parent${parentId}@learn-academy.co.uk`,
    tempPassword: generateSecurePassword(12),
    personalEmail: parentData.email, // For communication only
    linkedStudents: parentData.linkedStudentIds,
    accountType: 'parent'
  }
}
```

#### Benefits of Academy Credentials

```yaml
Security Isolation:
  Personal Email Breach:
    - Exposes: All personal accounts, other services
    - Risk: Password reuse across platforms
    - Impact: Wide-ranging identity compromise
    
  Academy Email Breach:
    - Exposes: Only academy access credentials
    - Risk: Limited to academy services
    - Impact: Contained, no external account access

Privacy Protection:
  - No personal email addresses in auth database
  - Anonymized student identifiers
  - Clear separation between communication and authentication
  - Easier GDPR compliance and data deletion

Operational Benefits:
  - Centralized credential management
  - Forced unique passwords for academy
  - Easy account suspension/graduation
  - Professional email appearance
```

#### Role-Based Access Control

```typescript
// Role definitions with academy credentials
export const ROLES = {
  SUPER_ADMIN: 'super_admin',   // staff@learn-academy.co.uk
  ADMIN: 'admin',               // admin@learn-academy.co.uk
  TEACHER: 'teacher',           // teacher001@learn-academy.co.uk
  PARENT: 'parent',             // parent001@learn-academy.co.uk
  STUDENT: 'student'            // student001@learn-academy.co.uk
} as const

// Permission matrix
export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.ADMIN]: [
    'students:read', 'students:write',
    'parents:read', 'parents:write',
    'sessions:*', 'reports:*'
  ],
  [ROLES.TEACHER]: [
    'students:read',
    'sessions:read', 'sessions:write',
    'homework:*'
  ],
  [ROLES.PARENT]: [
    'linked-children:read',      // Only their children
    'own-payments:*',
    'own-messages:*'
  ],
  [ROLES.STUDENT]: [
    'own-profile:read',
    'own-homework:*',
    'own-sessions:read'
  ]
}

// Secure session management with academy credentials
export async function createSecureSession(academyEmail: string, role: string) {
  const userId = extractUserIdFromAcademyEmail(academyEmail)
  
  const token = jwt.sign(
    { 
      userId, 
      academyEmail,
      role,
      exp: Math.floor(Date.now() / 1000) + (30 * 60), // 30 min
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.SESSION_SECRET!,
    { algorithm: 'HS256' }
  )
  
  // Log authentication event
  await logAuditEvent({
    action: 'LOGIN',
    userId,
    academyEmail,
    role,
    timestamp: new Date(),
    ipAddress: getClientIP()
  })
  
  return token
}

// Academy account management
export class AcademyAccountManager {
  // Suspend academy access instantly
  async suspendStudent(studentId: string) {
    await this.disableAcademyEmail(studentId)
    await this.revokeAllSessions(studentId)
    // Personal email unaffected - can still receive notifications
  }
  
  // Reset academy credentials without affecting personal accounts
  async resetStudentAccess(studentId: string) {
    const newPassword = generateSecurePassword(12)
    await this.updateAcademyCredentials(studentId, { password: newPassword })
    
    // Notify parent via their personal email
    const parentContact = await this.getParentContact(studentId)
    await this.notifyParent(parentContact.personalEmail, 'credentials_reset', {
      newPassword,
      studentId
    })
  }
  
  // Graduate students - clean account closure
  async archiveStudent(studentId: string) {
    await this.exportStudentData(studentId)
    await this.anonymizeAcademyAccount(studentId)
    // No impact on personal accounts or external services
  }
}
```

#### VPS Email Server Architecture

```typescript
// VPS-hosted email system for Learn Academy
interface VPSEmailSystem {
  // Email server details
  server: {
    ip: '217.154.33.169',           // Your IONOS VPS
    hostname: 'mail.learn-academy.co.uk',
    software: 'Postfix + Dovecot',
    webmail: 'Roundcube',
    ssl: 'Let\'s Encrypt',
    antiSpam: 'SpamAssassin + custom rules'
  },
  
  // Academy email structure
  academyDomain: 'learn-academy.co.uk',
  emailFormats: {
    students: 'student{id}@learn-academy.co.uk',
    parents: 'parent{id}@learn-academy.co.uk',
    admin: 'admin@learn-academy.co.uk',
    support: 'support@learn-academy.co.uk',
    billing: 'billing@learn-academy.co.uk'
  },
  
  // Personal emails - for communication only
  notifications: {
    target: 'parent personal email',
    purpose: 'Important updates, bills, emergencies',
    storage: 'Encrypted, separate from auth system'
  }
}

// VPS email server configuration
const vpsEmailConfig = {
  // Mail server setup
  postfixConfig: {
    mydomain: 'learn-academy.co.uk',
    myhostname: 'mail.learn-academy.co.uk',
    myorigin: 'learn-academy.co.uk',
    smtpd_tls_cert_file: '/etc/letsencrypt/live/mail.learn-academy.co.uk/fullchain.pem',
    smtpd_tls_key_file: '/etc/letsencrypt/live/mail.learn-academy.co.uk/privkey.pem',
    virtual_mailbox_domains: 'learn-academy.co.uk',
    virtual_transport: 'lmtp:unix:private/dovecot-lmtp'
  },
  
  // Anti-spam configuration
  spamAssassin: {
    required_score: 5.0,
    use_bayes: true,
    bayes_auto_learn: true,
    custom_rules: [
      'Educational content whitelisting',
      'Parent email pattern recognition',
      'Academy-specific sender verification'
    ]
  },
  
  // Integration with Next.js app
  apiIntegration: {
    autoCreateMailboxes: true,
    passwordSyncWithPortal: true,
    emailForwarding: true,
    bulkNotifications: true
  }
}

// Enhanced notification system using VPS email
async function sendAcademyNotification(message: {
  type: 'grades' | 'billing' | 'emergency' | 'system'
  studentId: string
  content: string
  priority: 'low' | 'medium' | 'high'
}) {
  // Send through VPS email server
  const vpsMailer = new VPSMailer({
    host: 'mail.learn-academy.co.uk',
    port: 587,
    secure: true,
    auth: {
      user: 'system@learn-academy.co.uk',
      pass: process.env.SYSTEM_EMAIL_PASSWORD
    }
  })
  
  // Always log in academy system (for student portal history)
  await vpsMailer.sendMail({
    from: 'system@learn-academy.co.uk',
    to: `student${message.studentId}@learn-academy.co.uk`,
    subject: `Learn Academy: ${message.type}`,
    html: generateEmailTemplate(message)
  })
  
  // Send copy to parent's personal email for important items
  if (message.priority === 'medium' || message.priority === 'high') {
    const parentContact = await getParentContact(message.studentId)
    await vpsMailer.sendMail({
      from: 'notifications@learn-academy.co.uk',
      to: parentContact.personalEmail,
      subject: `Learn Academy Update: ${message.type}`,
      html: generateParentNotificationTemplate(message)
    })
  }
}

// VPS email account management
export class VPSEmailManager {
  // Create email account on VPS
  async createAcademyEmail(userId: string, accountType: 'student' | 'parent') {
    const emailAddress = `${accountType}${userId}@learn-academy.co.uk`
    const password = generateSecurePassword(16)
    
    // Create mailbox in Postfix/Dovecot
    await this.executeVPSCommand(`
      # Add virtual mailbox
      echo "${emailAddress} ${accountType}${userId}/" >> /etc/postfix/virtual_mailboxes
      
      # Create user account
      sudo doveadm user add ${emailAddress} -p ${password}
      
      # Reload postfix configuration
      sudo postfix reload
    `)
    
    return { emailAddress, password }
  }
  
  // Integrate with academy portal authentication
  async syncEmailPassword(academyEmail: string, newPassword: string) {
    // Update both portal and email server passwords
    await this.updatePortalPassword(academyEmail, newPassword)
    await this.executeVPSCommand(`
      sudo doveadm auth test ${academyEmail} ${newPassword}
    `)
  }
  
  // Advanced spam filtering for educational content
  async configureEducationSpamRules() {
    const educationRules = `
      # Whitelist educational domains
      whitelist_from_rcvd *@*.edu mail.learn-academy.co.uk
      whitelist_from_rcvd *@*.ac.uk mail.learn-academy.co.uk
      
      # Parent email patterns
      score PARENT_EMAIL_PATTERN -2.0
      body PARENT_EMAIL_PATTERN /homework|assignment|grades|school/i
      
      # Reduce spam score for known educational keywords
      score EDUCATION_KEYWORDS -1.0
      body EDUCATION_KEYWORDS /tuition|learning|student|academy/i
    `
    
    await this.updateSpamAssassinRules(educationRules)
  }
}
```

#### Implementation Options

```yaml
Option 1: VPS Email Server (RECOMMENDED)
  Cost: £0/month (using existing IONOS VPS Linux L)
  Server: 217.154.33.169 (your existing VPS)
  Setup:
    - Install Postfix + Dovecot on existing VPS
    - Configure DNS records (MX, SPF, DKIM)
    - Set up SSL with Let's Encrypt
    - Install SpamAssassin + custom rules
    - Create Roundcube web interface
  
  Pros:
    - Zero additional monthly cost
    - Unlimited academy email accounts
    - Complete control and customization
    - Better spam filtering than shared hosting
    - Dedicated IP for better deliverability
    - Perfect integration with academy portal
    - Enhanced security and privacy
  
  Cons:
    - Initial setup complexity (1-2 days)
    - Requires basic email server maintenance
    
  Perfect for Learn Academy because:
    - Already paying for VPS infrastructure
    - Technical skills available for setup
    - Complete control over student/parent emails
    - Can integrate directly with Next.js application

Option 2: IONOS Managed Email (Backup/Temporary)
  Cost: £2-5/month with catch-all forwarding
  Setup:
    - Enable managed email in IONOS control panel
    - Configure catch-all forwarding
    - Set up email filters and organization
  
  Pros:
    - Quick setup (30 minutes)
    - IONOS manages server maintenance
    - Built-in spam protection
    - Same provider as hosting
  
  Cons:
    - Monthly cost per mailbox
    - Limited customization
    - Shared IP reputation risks
    - Less integration flexibility
    
  Use case: Quick start while setting up VPS email

Option 3: Google Workspace (Not Recommended for Academy)
  Cost: £4-6 per user/month (expensive with scale)
  Setup:
    - Create Google Workspace account
    - Configure domain verification
    - Set up organizational units
  
  Pros:
    - Fully managed service
    - Advanced collaboration features
    - Professional appearance
  
  Cons:
    - High cost with many students/parents
    - Google dependency and data sharing
    - Less privacy control
    - Overkill for academy email needs
```

#### GDPR & Compliance Benefits

```typescript
// Simplified data management with academy credentials
export class GDPRCompliance {
  // Data minimization - only necessary data stored
  async processDataRequest(studentId: string, requestType: 'access' | 'delete') {
    if (requestType === 'access') {
      // Export only academy-related data
      return await this.exportAcademyData(studentId)
    }
    
    if (requestType === 'delete') {
      // Simple academy account deletion
      await this.deleteAcademyAccount(studentId)
      // Personal emails were never stored in primary systems
      // Much cleaner deletion process
    }
  }
  
  // Breach notification simplified
  async handleDataBreach(affectedAccounts: string[]) {
    // Only academy credentials potentially affected
    // Personal email addresses not in breached system
    
    return {
      scope: 'Academy login credentials only',
      personalDataExposed: 'Limited to academy identifiers',
      externalAccountRisk: 'None - isolated system',
      recommendedAction: 'Reset academy passwords'
    }
  }
}
```

#### Communication Flow Architecture

```mermaid
graph TD
    A[Student Registration] --> B[Generate Academy Credentials]
    B --> C[student001@learn-academy.co.uk]
    
    D[Student Logs In] --> E[Academy Email + Password]
    E --> F[Access Academy Portal]
    
    G[System Notification] --> H{Notification Type}
    H -->|Login/Security| I[Academy Email Only]
    H -->|Grades/Reports| J[Academy Email + Parent Personal]
    H -->|Billing/Emergency| K[Parent Personal Email]
    
    L[Data Breach] --> M[Only Academy Emails Exposed]
    M --> N[Personal Accounts Protected]
    
    O[Account Management] --> P[Academy System Only]
    P --> Q[No External Account Impact]
```

This academy-credential approach provides:
- **Isolated security perimeter** 
- **Reduced breach impact**
- **Better privacy protection**
- **Simplified compliance**
- **Professional appearance**
- **Centralized management**

---

## Critical Security Controls (Phase 2: Weeks 3-4)

### 5. Data Encryption

```typescript
// lib/encryption.ts
import crypto from 'crypto'

const algorithm = 'aes-256-gcm'
const keyLength = 32
const ivLength = 16
const tagLength = 16
const saltLength = 64

// Encrypt PII data
export function encryptPII(text: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
  const iv = crypto.randomBytes(ivLength)
  const salt = crypto.randomBytes(saltLength)
  
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ])
  
  const tag = cipher.getAuthTag()
  
  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64')
}

// Decrypt PII data
export function decryptPII(encryptedData: string): string {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
  const data = Buffer.from(encryptedData, 'base64')
  
  const salt = data.slice(0, saltLength)
  const iv = data.slice(saltLength, saltLength + ivLength)
  const tag = data.slice(saltLength + ivLength, saltLength + ivLength + tagLength)
  const encrypted = data.slice(saltLength + ivLength + tagLength)
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(tag)
  
  return decipher.update(encrypted) + decipher.final('utf8')
}

// Database encryption for sensitive fields
export const encryptedFields = {
  students: ['parentPhone', 'parentEmail', 'medicalInfo'],
  parents: ['phone', 'email', 'address'],
  payments: ['cardLast4', 'billingAddress']
}
```

### 6. Audit Logging

```typescript
// lib/audit.ts
import { createClient } from '@supabase/supabase-js'

interface AuditLog {
  timestamp: Date
  userId?: string
  action: string
  resource?: string
  resourceId?: string
  ipAddress: string
  userAgent: string
  result: 'success' | 'failure'
  metadata?: Record<string, any>
}

// Critical actions to audit
const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: 'User login',
  LOGOUT: 'User logout',
  LOGIN_FAILED: 'Failed login attempt',
  PASSWORD_CHANGE: 'Password changed',
  
  // Data Access
  STUDENT_VIEW: 'Student record viewed',
  STUDENT_EDIT: 'Student record modified',
  PARENT_VIEW: 'Parent information viewed',
  REPORT_GENERATE: 'Report generated',
  DATA_EXPORT: 'Data exported',
  
  // System
  SETTINGS_CHANGE: 'System settings modified',
  USER_CREATE: 'New user created',
  PERMISSION_CHANGE: 'User permissions modified'
}

export async function logAuditEvent(event: AuditLog) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Add hash for integrity
  const eventData = {
    ...event,
    hash: generateEventHash(event)
  }
  
  // Store in audit table
  const { error } = await supabase
    .from('audit_logs')
    .insert(eventData)
  
  // Alert on critical events
  if (isCriticalEvent(event)) {
    await sendSecurityAlert(event)
  }
  
  return !error
}

function isCriticalEvent(event: AuditLog): boolean {
  const criticalActions = [
    'LOGIN_FAILED',
    'DATA_EXPORT',
    'PERMISSION_CHANGE',
    'SETTINGS_CHANGE'
  ]
  
  return criticalActions.includes(event.action) || 
         event.result === 'failure'
}
```

### 7. Rate Limiting & DDoS Protection

```typescript
// middleware/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

// Different limits for different endpoints
const rateLimiters = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '15 m'),
  }),
  
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
  }),
  
  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
  })
}

export async function rateLimit(
  req: Request, 
  type: 'api' | 'auth' | 'contact' = 'api'
) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success, limit, reset, remaining } = await rateLimiters[type].limit(ip)
  
  if (!success) {
    // Log rate limit violation
    await logAuditEvent({
      action: 'RATE_LIMIT_EXCEEDED',
      ipAddress: ip,
      result: 'failure',
      metadata: { type, limit, reset }
    })
    
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
      },
    })
  }
  
  return null
}
```

---

## Compliance-Specific Requirements (Phase 3: Weeks 5-6)

### 8. GDPR & Child Data Protection

```typescript
// lib/privacy.ts

// Age verification for child protection
export function isMinor(age: number): boolean {
  return age < 16 // GDPR age of consent
}

// Parental consent management
export interface ConsentRecord {
  studentId: string
  parentId: string
  consentType: 'data_processing' | 'marketing' | 'photos' | 'recordings'
  granted: boolean
  timestamp: Date
  ipAddress: string
  version: string // Privacy policy version
}

export async function recordConsent(consent: ConsentRecord) {
  // Store consent with audit trail
  await supabase.from('consent_records').insert({
    ...consent,
    hash: generateConsentHash(consent)
  })
}

// Data subject rights
export class DataSubjectRights {
  // Right to access
  async exportUserData(userId: string) {
    const data = await collectAllUserData(userId)
    const encrypted = encryptExport(data)
    
    await logAuditEvent({
      action: 'DATA_EXPORT',
      userId,
      result: 'success'
    })
    
    return encrypted
  }
  
  // Right to erasure
  async deleteUserData(userId: string, confirmation: string) {
    if (confirmation !== 'DELETE_MY_DATA') {
      throw new Error('Invalid confirmation')
    }
    
    // Anonymize instead of hard delete for audit trail
    await anonymizeUserData(userId)
    
    await logAuditEvent({
      action: 'DATA_DELETION',
      userId,
      result: 'success'
    })
  }
  
  // Right to rectification
  async updateUserData(userId: string, updates: any) {
    const validated = validateUpdates(updates)
    await applyUpdates(userId, validated)
    
    await logAuditEvent({
      action: 'DATA_UPDATE',
      userId,
      result: 'success',
      metadata: { fields: Object.keys(updates) }
    })
  }
}
```

### 9. Cookie Consent & Privacy

```tsx
// components/CookieConsent.tsx
import { useState, useEffect } from 'react'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])
  
  const handleAccept = (type: 'all' | 'essential') => {
    const consent = {
      essential: true,
      analytics: type === 'all',
      marketing: false, // Never for children's data
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
    
    localStorage.setItem('cookie-consent', JSON.stringify(consent))
    setShowBanner(false)
    
    // Initialize only consented services
    if (consent.analytics) {
      // Initialize analytics
    }
  }
  
  if (!showBanner) return null
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 mr-4">
          <h3 className="font-semibold mb-1">Cookie Settings</h3>
          <p className="text-sm text-gray-600">
            We use essential cookies for site functionality. Analytics cookies help us improve our service.
            We never use marketing cookies or share data with third parties.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleAccept('essential')}
            className="px-4 py-2 border rounded"
          >
            Essential Only
          </button>
          <button 
            onClick={() => handleAccept('all')}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 10. Secure File Upload (Student Work)

```typescript
// api/upload.ts
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import crypto from 'crypto'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    // Validate file
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }
    
    // Scan for malware (integrate with ClamAV or similar)
    const isSafe = await scanFile(file)
    if (!isSafe) {
      await logAuditEvent({
        action: 'MALWARE_DETECTED',
        userId: session.userId,
        result: 'failure',
        metadata: { fileName: file.name }
      })
      return NextResponse.json({ error: 'File rejected' }, { status: 400 })
    }
    
    // Generate secure filename
    const fileId = nanoid()
    const ext = file.name.split('.').pop()
    const secureFilename = `${fileId}.${ext}`
    
    // Encrypt file before storage
    const encrypted = await encryptFile(file)
    
    // Store in secure location with restricted access
    const url = await storeFile(encrypted, secureFilename, session.userId)
    
    // Log upload
    await logAuditEvent({
      action: 'FILE_UPLOAD',
      userId: session.userId,
      resourceId: fileId,
      result: 'success',
      metadata: { 
        originalName: file.name,
        size: file.size,
        type: file.type 
      }
    })
    
    return NextResponse.json({ url, fileId })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
```

---

## Monitoring & Incident Response (Phase 4: Ongoing)

### 11. Security Monitoring Dashboard

```typescript
// lib/monitoring.ts

export interface SecurityMetrics {
  authentication: {
    failedLogins: number
    successfulLogins: number
    avgSessionDuration: number
    mfaAdoptionRate: number
  }
  
  dataAccess: {
    studentRecordsAccessed: number
    dataExports: number
    unauthorizedAttempts: number
  }
  
  system: {
    errorRate: number
    responseTime: number
    uptime: number
    sslCertExpiry: Date
  }
  
  compliance: {
    consentRecords: number
    dataRequests: number
    incidentReports: number
    lastAudit: Date
  }
}

// Real-time alerting
export async function checkSecurityThresholds() {
  const metrics = await getSecurityMetrics()
  
  // Failed login threshold
  if (metrics.authentication.failedLogins > 10) {
    await sendAlert('HIGH', 'Multiple failed login attempts detected')
  }
  
  // Unauthorized access
  if (metrics.dataAccess.unauthorizedAttempts > 0) {
    await sendAlert('CRITICAL', 'Unauthorized data access attempted')
  }
  
  // SSL cert expiry warning
  const daysUntilExpiry = Math.floor(
    (metrics.system.sslCertExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  if (daysUntilExpiry < 30) {
    await sendAlert('MEDIUM', `SSL certificate expires in ${daysUntilExpiry} days`)
  }
}
```

### 12. Incident Response Procedures

```markdown
## Incident Response Plan - Learn Academy

### Incident Categories
1. **Data Breach** - Unauthorized access to student/parent data
2. **Account Compromise** - Unauthorized account access
3. **Service Disruption** - DDoS, system failure
4. **Compliance Violation** - GDPR breach, consent issues

### Response Team
- **Incident Commander**: Hakim (Primary)
- **Technical Lead**: DevOps contractor
- **Legal Advisor**: TBD
- **Communications**: Marketing lead

### Response Procedures

#### 1. Data Breach Response
```yaml
Immediate (0-1 hour):
  - Isolate affected systems
  - Preserve evidence
  - Stop data exfiltration
  - Document timeline

Short-term (1-24 hours):
  - Assess scope of breach
  - Identify affected individuals
  - Prepare notifications
  - Implement fixes

Long-term (24-72 hours):
  - Notify authorities (ICO if UK)
  - Notify affected individuals
  - Public disclosure if required
  - Post-incident review
```

#### 2. Account Compromise
```yaml
Actions:
  - Disable compromised accounts
  - Force password reset
  - Review audit logs
  - Check for lateral movement
  - Enable additional monitoring
  - Notify affected users
```

### Contact Information
- **ICO (UK)**: 0303 123 1113
- **Hosting Provider**: IONOS Support
- **Legal Counsel**: [To be determined]
- **Cyber Insurance**: [To be obtained]
```

---

## Implementation Timeline

### Week 1-2: Foundation
- [x] Remove testimonials section
- [ ] Implement HTTPS redirect
- [ ] Add security headers
- [ ] Set up basic authentication
- [ ] Configure environment variables
- [ ] Implement input validation

### Week 3-4: Core Security
- [ ] Add encryption for PII
- [ ] Implement audit logging
- [ ] Set up rate limiting
- [ ] Configure CSRF protection
- [ ] Add session management
- [ ] Implement role-based access

### Week 5-6: Compliance
- [ ] Add cookie consent
- [ ] Implement GDPR rights
- [ ] Set up consent management
- [ ] Add privacy controls
- [ ] Configure data retention
- [ ] Document procedures

### Week 7-8: Monitoring
- [ ] Set up security monitoring
- [ ] Configure alerting
- [ ] Implement metrics dashboard
- [ ] Create incident response plan
- [ ] Conduct security testing
- [ ] Schedule penetration test

---

## Security Checklist

### Pre-Launch Requirements
- [ ] SSL certificate installed
- [ ] Security headers configured
- [ ] Authentication system tested
- [ ] Rate limiting active
- [ ] Input validation on all forms
- [ ] CSRF protection enabled
- [ ] Audit logging functional
- [ ] Backups configured and tested
- [ ] Incident response plan documented
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Cookie consent implemented
- [ ] GDPR compliance verified
- [ ] Security testing completed
- [ ] Staff training completed

### Post-Launch Monitoring
- [ ] Daily backup verification
- [ ] Weekly security scan
- [ ] Monthly access review
- [ ] Quarterly security assessment
- [ ] Annual penetration test
- [ ] Continuous log monitoring
- [ ] Regular security updates
- [ ] Incident drill practice

---

## Budget Considerations

### Cost-Effective Security Approach

**Security doesn't have to break the bank!** Most critical security can be implemented for free or very low cost.

### FREE Security Solutions (£0/month)

| Service | Purpose | Cost | Implementation |
|---------|---------|------|----------------|
| SSL Certificate | HTTPS encryption | FREE | Let's Encrypt |
| Security Headers | XSS, CSRF protection | FREE | Next.js middleware |
| Rate Limiting | DDoS protection | FREE | Built-in solutions |
| Input Validation | SQL injection prevention | FREE | Zod library |
| Authentication | User access control | FREE | NextAuth.js/Supabase |
| Audit Logging | Security monitoring | FREE | Built-in logging |
| Vulnerability Scanning | Code security | FREE | npm audit, ESLint |
| Code Analysis | Static security analysis | FREE | GitHub Actions |
| Basic Backup | Data recovery | FREE-£5 | Simple scripts + cloud |

**Phase 1 Total: £0-5/month** ✅ **Covers 80% of security needs!**

### LOW-COST Enhancements (£15-50/month)

| Service | Purpose | Cost/Month | Priority |
|---------|---------|------------|----------|
| Cloudflare Pro | Advanced DDoS, WAF | £20 | HIGH |
| Enhanced Monitoring | Uptime, performance | £0-7 (UptimeRobot) | MEDIUM |
| Professional Email | Secure communications | £4-10 (ProtonMail) | MEDIUM |
| Automated Backups | Reliable data recovery | £10-20 | HIGH |

**Phase 2 Total: £15-50/month** - **Professional-grade security**

### PREMIUM Options (Only if Required)

| Service | Purpose | Cost/Month | When Needed |
|---------|---------|------------|-------------|
| Advanced SIEM | Enterprise monitoring | £100+ | Large scale operations |
| Professional Penetration Testing | Annual security audit | £2000-5000/year | Compliance requirements |
| Dedicated Security Team | 24/7 monitoring | £500+ | Enterprise customers |
| Cyber Insurance | Liability coverage | £50-200 | High-value operations |

### **Recommended Implementation Strategy**

#### **Startup Phase (£0-5/month):**
```yaml
Essential Security Stack (All FREE):
  - Let's Encrypt SSL certificate
  - Security headers middleware
  - Zod input validation
  - NextAuth.js authentication
  - Basic rate limiting
  - npm audit vulnerability scanning
  - GitHub Actions security checks
  - Simple backup scripts
  - Environment variable security
  - Basic audit logging

Result: 80% enterprise security coverage for under £5/month
```

#### **Growth Phase (£20-50/month):**
```yaml
Enhanced Security Stack:
  - All Phase 1 features (FREE)
  - Cloudflare Pro (£20/month)
    - Advanced DDoS protection
    - Web Application Firewall
    - Analytics and insights
  - UptimeRobot Pro (£7/month)
    - Advanced monitoring
    - SMS/voice alerts
  - Professional email (£10/month)
  - Automated backups (£15/month)

Result: Enterprise-grade security for £52/month
```

#### **Enterprise Phase (£100+/month):**
Only needed for:
- Processing thousands of students
- Strict compliance requirements (SOC2 audit)
- 24/7 operations
- Multiple locations

### **Cost Comparison with Traditional Solutions**

| Security Level | Traditional Cost | Our Approach | Savings |
|----------------|------------------|--------------|---------|
| Basic Security | £200-500/month | £0-5/month | 95% savings |
| Professional | £500-1500/month | £20-50/month | 90% savings |
| Enterprise | £1500+/month | £100-300/month | 70% savings |

### **Implementation Priority by Budget**

#### **£0 Budget (Essential):**
1. SSL certificate (Let's Encrypt)
2. Security headers
3. Input validation
4. Basic authentication
5. Rate limiting
6. Vulnerability scanning

#### **£20 Budget (Recommended):**
1. All £0 features
2. Cloudflare Pro
3. Enhanced monitoring

#### **£50 Budget (Professional):**
1. All £20 features
2. Professional email
3. Automated backups
4. Advanced monitoring

### **ROI Analysis**

**Cost of Security Breach:**
- Data breach fine: £10,000-£100,000+
- Reputation damage: Immeasurable
- Customer loss: 60% after breach
- Recovery time: 6-12 months

**Investment in Security:**
- Prevention cost: £20-50/month (£240-600/year)
- Risk reduction: 95%+
- Peace of mind: Priceless

**Conclusion:** Even a £20/month security investment provides 1000x+ ROI compared to breach costs.

### **Free Security Resources**

```yaml
Learning & Implementation:
  - OWASP Top 10 (Free security guide)
  - Mozilla Security Guidelines
  - Next.js Security Best Practices
  - Supabase Security Documentation
  - Let's Encrypt Documentation
  
Tools:
  - npm audit (Free vulnerability scanning)
  - ESLint security plugins (Free code analysis)
  - GitHub security alerts (Free)
  - Cloudflare Free tier (Basic protection)
  - UptimeRobot Free (Basic monitoring)
```

### **Monthly Security Budget Recommendation**

**For Learn Academy specifically:**
- **Minimum viable security**: £0/month (using VPS email + free security tools)
- **Recommended professional setup**: £20-30/month (VPS email + Cloudflare Pro)
- **Premium setup (if scaling rapidly)**: £50-100/month

**VPS Email Benefits for Academy:**
- **£0 additional cost** (using existing IONOS VPS Linux L)
- **Unlimited academy email accounts** for students and parents
- **Complete control** over spam filtering and email routing
- **Better security** than shared email hosting
- **Perfect integration** with Next.js academy portal
- **Professional appearance** with @learn-academy.co.uk addresses

**Total Annual Security Investment:** 
- **Basic (VPS email)**: £0/year
- **Professional**: £240-360/year  
- **Premium**: £600-1200/year

**Compared to single data breach cost:** £10,000-100,000+

**Recommendation:** 
1. **Phase 1**: Start with VPS email server (£0 cost, maximum control)
2. **Phase 2**: Add Cloudflare Pro for enhanced DDoS protection (£20/month)
3. **Phase 3**: Add premium monitoring and backup services as you scale

**VPS Email Server Setup Priority:**
- **Week 1-2**: Install Postfix + Dovecot on existing VPS
- **Week 3**: Configure DNS records and SSL certificates  
- **Week 4**: Set up SpamAssassin with education-specific rules
- **Week 5**: Integrate with Next.js academy portal
- **Week 6**: Test and optimize email deliverability

---

## Support & Resources

### Security Contacts
- **NCSC (UK)**: https://www.ncsc.gov.uk
- **ICO (GDPR)**: https://ico.org.uk
- **Action Fraud**: 0300 123 2040

### Educational Resources
- OWASP Top 10 for Education
- FERPA Compliance Guide
- GDPR for Schools
- Cyber Essentials Scheme

### Tools & Services
- **Vulnerability Scanning**: Snyk, npm audit
- **Security Testing**: OWASP ZAP
- **Monitoring**: Datadog, New Relic
- **WAF**: Cloudflare, AWS WAF
- **Backup**: Restic, Duplicity

---

**Document Version**: 1.0
**Created**: December 2024
**Last Updated**: December 2024
**Review Schedule**: Quarterly
**Owner**: Learn Academy Technical Team
**Classification**: Confidential

This security plan should be reviewed and updated quarterly or after any significant security incident.