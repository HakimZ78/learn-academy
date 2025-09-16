# Student Portal Implementation Plan
## Learn Academy - Secure Pre-Session Materials Access

### 📋 Executive Summary

**Objective**: Create a secure student portal within the Learn Academy website that allows **VIEW-ONLY** access to pre-session materials without email distribution.

**Key Clarifications**:
- ✅ **Portal Purpose**: Pre-session material viewing ONLY
- ❌ **Not for**: Actual tutoring sessions (handled via Zoom/external providers)
- ❌ **No Downloads**: Students can only view materials online
- ❌ **No Printing**: Browser print functionality disabled
- ✅ **Control**: Complete access control over who sees what and when

**Current Material Structure Analysis**:
- 28+ weeks of biology content (HTML format)
- File naming: `week_X_topic_questions_STUDENT.html`
- File sizes: 10-40KB each
- Content: Comprehensive question sets with tables, diagrams, calculations
- Format: Clean HTML with structured headings and exam-style questions

---

## 🏗️ Technical Architecture Overview

### Recommended Stack
- **Frontend**: Next.js 15 (existing)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **File Storage**: Supabase Storage
- **Authorization**: Row Level Security (RLS)

### Why Supabase?
✅ Already mentioned as available option
✅ Built-in authentication with multiple providers
✅ Row Level Security for fine-grained access control
✅ File storage with access controls
✅ Real-time subscriptions for live updates
✅ Generous free tier

---

## 🔐 Authentication & Authorization System

### User Roles & Permissions

#### 1. **Admin (Hakim)**
- Upload/manage all materials
- Create/manage student accounts
- Assign materials to students
- View all student progress
- Control access periods

#### 2. **Students**
- **View assigned materials only** (no downloads/printing)
- **Read-only access** to pre-session questions
- **Track their progress** (materials viewed)
- **Secure browser viewing** with copy protection

#### 3. **Parents** (Optional Phase 2)
- View child's assigned materials
- Monitor progress
- Read-only access

### Authentication Methods
1. **Primary**: Email/Password (Supabase Auth)
2. **Optional**: Magic Links for easy student access
3. **Future**: Google SSO for families

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  program_type TEXT CHECK (program_type IN ('foundation', 'elevate', 'gcse', 'alevel')),
  date_of_birth DATE,
  parent_email TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials table
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  week_number INTEGER,
  subject TEXT, -- biology, chemistry, physics, maths, english
  difficulty_level TEXT CHECK (difficulty_level IN ('foundation', 'elevate', 'gcse', 'alevel')),
  file_path TEXT NOT NULL, -- Supabase storage path
  file_type TEXT DEFAULT 'html',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student material assignments
CREATE TABLE student_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  access_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_end TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false,
  completed_date TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id, material_id)
);

-- Access logs for monitoring
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  material_id UUID REFERENCES materials(id),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);
```

### Row Level Security (RLS) Policies

```sql
-- Students can only see their own data
CREATE POLICY "Students can view own profile" ON students
  FOR SELECT USING (auth.email() = email);

-- Students can only access assigned materials
CREATE POLICY "Students access assigned materials" ON materials
  FOR SELECT USING (
    id IN (
      SELECT material_id FROM student_assignments 
      WHERE student_id = (
        SELECT id FROM students WHERE email = auth.email()
      )
      AND access_start <= NOW() 
      AND (access_end IS NULL OR access_end > NOW())
    )
  );

-- Admin has full access
CREATE POLICY "Admin full access" ON students
  FOR ALL USING (auth.email() = 'hakim@learn-academy.co.uk');
```

---

## 📁 File Storage Strategy

### Supabase Storage Structure
```
materials/
├── biology/
│   ├── week_01/
│   │   ├── cells_questions_student.html
│   │   └── cells_questions_teacher.html
│   ├── week_02/
│   └── ...
├── chemistry/
├── physics/
├── mathematics/
└── english/
```

### Access Control
- **Public Access**: Disabled
- **Authenticated Access**: Via RLS policies
- **Signed URLs**: Generated dynamically for temporary access
- **View Control**: Zero download/save capabilities
- **Print Protection**: CSS and JavaScript to disable printing

### File Upload Process
1. Admin uploads via secure portal
2. Files stored with structured naming
3. Automatic metadata extraction
4. Database records created
5. Optional preprocessing (view-only formatting, copy protection)

---

## 🎨 User Interface Design

### Student Portal Layout

#### 1. **Dashboard**
```
┌─────────────────────────────────────┐
│ Welcome back, [Student Name]       │
├─────────────────────────────────────┤
│ Current Assignments (3)             │
│ ┌─────────────────────────────────┐ │
│ │ Week 5: Cell Membranes         │ │
│ │ Due: Tomorrow 3PM              │ │
│ │ [View Questions]              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Recent Materials                    │
│ ┌─────────────────────────────────┐ │
│ │ Week 4: DNA & RNA ✓ Completed  │ │
│ │ Week 3: Proteins ✓ Completed   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Progress: 15/28 topics completed    │
└─────────────────────────────────────┘
```

#### 2. **Materials Viewer**
- Clean HTML rendering with academy styling
- **View-only layout** (no print styles)
- **Copy protection** (CSS user-select: none)
- **Progress tracking** (viewed/not viewed)
- **Print disabled** via CSS and JavaScript

#### 3. **Admin Panel**
- Material upload interface
- Student management
- Assignment creation
- Progress monitoring
- Access control

---

## 🔄 Implementation Phases

### Phase 1: Core Functionality (2-3 weeks)
**Priority: HIGH**

#### Week 1: Foundation Setup
- [x] Supabase project setup and configuration
- [x] Database schema creation with RLS policies
- [x] Basic authentication implementation
- [x] Student registration/login pages

#### Week 2: Material Management
- [x] File upload system for admin
- [x] Material viewer component
- [x] Student assignment system
- [x] Basic admin panel

#### Week 3: Integration & Testing
- [x] Navigation integration
- [x] Security testing
- [x] User acceptance testing
- [x] Performance optimization

### Phase 2: Enhanced Features (1-2 weeks)
**Priority: MEDIUM**

- [ ] Progress tracking and analytics
- [ ] Parent portal access
- [ ] Mobile app optimization
- [ ] Material search and filtering
- [ ] Notification system
- [ ] **Admin Messaging System for Student Communication**

### Phase 3: Advanced Features (Future)
**Priority: LOW**

- [ ] Interactive question components
- [ ] Online submission system
- [ ] Collaborative features
- [ ] Integration with virtual classroom
- [ ] API for external tools

---

## 💾 Data Migration Strategy

### Current Files → Supabase Storage
1. **Batch Upload Script**
   ```javascript
   // Migration script to upload existing files
   const uploadMaterials = async () => {
     const files = await glob('/Users/hakim/Documents/Development/Tuition/Questions/*_STUDENT.html')
     
     for (const file of files) {
       const { week, topic } = parseFileName(file)
       const { data } = await supabase.storage
         .from('materials')
         .upload(`biology/week_${week}/${topic}.html`, file)
       
       // Create database record
       await supabase.from('materials').insert({
         title: `Week ${week}: ${topic}`,
         week_number: week,
         subject: 'biology',
         file_path: data.path
       })
     }
   }
   ```

### Metadata Extraction
- Automatic title extraction from HTML `<h1>` tags
- Question count parsing
- Difficulty assessment
- Topic categorization

---

## 🔒 Security Considerations

### Data Protection
- **GDPR Compliance**: Proper data handling for UK students
- **Student Privacy**: Minimal data collection
- **Parental Consent**: Required for under-16 students
- **Data Retention**: Automatic cleanup policies

### Access Security
- **Session Management**: Secure JWT tokens
- **Rate Limiting**: Prevent abuse
- **IP Restriction**: Optional for sensitive content
- **Audit Logging**: Track all access attempts

### File Security
- **No Direct URLs**: All access via authenticated viewer
- **View-Only Mode**: Zero download/save capabilities
- **Session-Based Access**: URLs expire with login session
- **Print/Copy Disabled**: CSS and JavaScript protection
- **Right-Click Disabled**: Prevent save-as attempts

---

## 📊 User Experience Flow

### Student Experience Flow
The portal serves as a **preparation tool** where students:
1. **Login before their session**
2. **Review pre-session questions online**
3. **Prepare mentally for the upcoming lesson**
4. **Join their actual tutoring session** via Zoom/external platform

**Clear Separation**:
- **Portal**: Pre-session preparation (View-only questions)
- **Sessions**: Live tutoring via Zoom/Meet/Teams  
- **No Downloads**: Students must return to portal to re-read
- **No Overlap**: Two completely separate systems

### Student Login Flow
1. Student visits `/portal/login`
2. Enters email/password
3. Redirected to personal dashboard
4. Views assigned materials for current week
5. Clicks material → **secure view-only reader opens**
6. **Views questions online only** - prepares for upcoming session

### Admin Material Upload Flow
1. Admin visits `/portal/admin`
2. Clicks "Add New Material"
3. Uploads file + fills metadata
4. Selects students to assign
5. Sets access dates/restrictions
6. Material instantly available to students

### Assignment Flow
1. Admin creates assignment
2. Students receive notification (optional)
3. Material appears in student dashboard
4. Student completes work offline
5. Admin can track who accessed what

---

## 💰 Cost Analysis

### Supabase Pricing (Monthly)
- **Free Tier**: 
  - 500MB database
  - 1GB storage
  - 50,000 monthly active users
  - **Cost**: £0

- **Pro Tier** (when needed):
  - 8GB database
  - 100GB storage
  - 100,000 monthly active users
  - **Cost**: £20/month

### Development Time
- **Phase 1**: 40-60 hours (£2,000-3,000)
- **Phase 2**: 20-40 hours (£1,000-2,000)
- **Maintenance**: 2-5 hours/month (£100-250/month)

### Alternative Costs
- Custom server hosting: £50-100/month
- Third-party LMS: £30-100/month per feature
- Email distribution: Security/control issues

---

## 🚀 Quick Start Implementation

### Immediate Actions Needed
1. **Create Supabase Account**
   - Sign up at supabase.com
   - Create new project: "learn-academy-portal"
   - Note down API keys

2. **Environment Setup**
   ```bash
   npm install @supabase/supabase-js @supabase/auth-ui-react
   ```

3. **Basic Pages Structure**
   ```
   app/
   ├── portal/
   │   ├── login/page.tsx
   │   ├── dashboard/page.tsx
   │   ├── admin/page.tsx
   │   └── material/[id]/page.tsx
   ```

4. **Student Data Collection**
   - Create simple student registration form
   - Collect: name, email, program level, parent contact

---

## 📋 Success Metrics

### Technical Metrics
- **Uptime**: >99.5%
- **Load Time**: <2 seconds for material viewing
- **Security**: Zero unauthorized access incidents

### Educational Metrics
- **Engagement**: % of students accessing materials
- **Completion**: % of assigned work completed
- **Feedback**: Student satisfaction scores

### Business Metrics
- **Time Saved**: Hours not spent on email management
- **Control**: 100% visibility into student access
- **Scalability**: Support for growing student base

---

## 🔮 Future Enhancements

### Advanced Features (6+ months)
- **AI-Powered Recommendations**: Suggest additional materials
- **Interactive Assessments**: Online quiz completion
- **Progress Analytics**: Detailed learning insights
- **Mobile App**: Native iOS/Android applications
- **Integration Hub**: Connect with other educational tools

### Monetization Opportunities
- **Premium Features**: Advanced analytics for parents
- **White-Label Solution**: Sell to other tutoring businesses
- **API Access**: Third-party integrations

---

## ✅ Implementation Checklist

### Pre-Development
- [x] Supabase account setup. pass = 42f5NeO6Q0EygpRH
- [x] Database schema review
- [x] Security requirements validation
- [x] Student data collection plan

### Development Phase 1
- [x] Authentication system
- [x] File upload functionality
- [x] Student dashboard
- [x] Material viewer
- [x] Admin panel basics

### Testing & Launch
- [x] Security penetration testing
- [x] User acceptance testing
- [x] Performance optimization
- [x] Documentation creation
- [x] Student onboarding process

### Post-Launch
- [ ] Monitor usage patterns
- [ ] Collect feedback
- [ ] Plan Phase 2 features
- [ ] Scale infrastructure as needed

---

**This implementation plan provides a comprehensive roadmap for creating a secure, scalable student portal that gives you complete control over material distribution while providing an excellent user experience for your students.**

**Recommended: Start with Phase 1 implementation using Supabase for fastest time-to-market with minimal ongoing costs.**