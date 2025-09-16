# Learn Academy - Claude.md

## Project Overview
Learn Academy is an innovative educational platform offering interdisciplinary learning through 1-on-1 personalised tutoring and home schooling services. The website emphasizes "Learning for a Changing World" - breaking down traditional educational barriers.

### Core Philosophy
- **De-compartmentalized Education**: Connecting subjects naturally for real-world understanding
- **1-on-1 Personalised Learning**: Individual attention with customised pacing and immediate feedback
- **Multi-talented Educator**: Led by Hakim, bringing diverse expertise from healthcare, business, and education
- **Future-Ready Skills**: Preparing students for tomorrow's challenges through adaptive learning
- **Intrinsic Motivation**: Nurturing natural curiosity and transforming education from duty to joyful journey

## Tech Stack
- **Framework**: Next.js 15.1.3 with TypeScript
- **Styling**: Tailwind CSS v3.4 with custom color scheme
- **Animations**: Framer Motion v11.16
- **Icons**: Lucide React v0.468
- **UI Components**: Radix UI (Accordion, Dialog, Tabs)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Font**: Inter (body), Poppins (display)

## Project Structure
```
learn-academy/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with navigation/footer
│   ├── page.tsx           # Homepage with background images
│   ├── about/             # About page with educator profile & learning philosophy
│   ├── programs/          # Programs page with individual background images
│   ├── classroom/         # Virtual classroom page
│   ├── contact/           # Contact page with WhatsApp integration
│   ├── enrol/             # Enrolment page
│   ├── portal/            # Student/Admin portal
│   │   ├── login/         # Login page
│   │   ├── dashboard/     # Student dashboard
│   │   └── admin/         # Admin dashboard
│   ├── test-home/         # Test version of homepage
│   └── test-programs/     # Test version of programs page
├── components/            # Reusable React components
│   ├── Navigation.tsx     # Fixed top navigation with auth state
│   ├── Footer.tsx         # Site footer
│   ├── home/              # Homepage sections
│   │   ├── Hero.tsx       # Original hero component
│   │   ├── HeroWithBg.tsx # Hero with background image
│   │   ├── Philosophy.tsx # Educational philosophy grid
│   │   ├── Programs.tsx   # Program cards for homepage
│   │   └── [other components]
│   ├── portal/            # Portal components
│   │   ├── MaterialViewer.tsx # PDF/material viewing component
│   │   └── [other portal components]
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
│   └── supabase/          # Supabase client configuration
├── contexts/              # React contexts
│   └── DataContext.tsx    # Data management context
├── public/                # Static assets
└── types/                 # TypeScript type definitions
```

## Design System

### Color Palette
```css
academy-primary: #1e3a8a   /* Deep blue */
academy-secondary: #3730a3  /* Purple */
academy-accent: #7c3aed     /* Violet */
academy-light: #e0e7ff      /* Light blue */
```

### Visual Design
- **Background Images**: Contextually relevant images for each page section
- **Glass-morphism**: Backdrop blur effects with transparency
- **Animations**: Framer Motion for smooth transitions and hover effects
- **Typography**: Drop shadows and enhanced contrast for readability
- **Overlay Opacity**: 65% for good image visibility with text readability

### Component Patterns
- **Buttons**: `btn-primary` (gradient), `btn-secondary` (outlined)
- **Cards**: Glass-effect with backdrop blur (`bg-white/95 backdrop-blur-md`)
- **Text**: Gradient text using `gradient-text` class
- **Sections**: Consistent padding (`py-16`)
- **Container**: Max-width with responsive padding

## Programs Structure

### Foundation Program (Ages 8-11, Key Stage 2)
- Building strong fundamentals in National Curriculum subjects
- 50 minute sessions, 4 sessions/month - £50
- Subjects: English, Mathematics, Science, Technology & Computing
- Focus: Critical thinking, independent learning

### Elevate Program (Ages 11-14, Key Stage 3 & early KS4)
- Accelerated learning for early GCSE preparation
- 1 hour sessions, 4 sessions/month - £70
- Advanced analytical thinking and research skills

### GCSE Program (Ages 14-16)
- Comprehensive exam preparation
- 1 hour sessions, 4 sessions/month - £80
- Subjects: Mathematics, Biology, Chemistry, Physics
- Focus: Exam technique mastery

### A-Level Program (Ages 16-18)
- Advanced science specialisation for university
- 1 hour sessions, 4 sessions/month - £100
- Subjects: Biology, Chemistry, Physics
- Focus: University preparation

## Contact Information
- **Phone**: 07779-602503
- **Email**: info@learnacademy.co.uk
- **Location**: Office, B8 1AE (Birmingham)
- **Hours**: Monday - Saturday, 9:00 AM - 6:00 PM GMT
- **WhatsApp**: Integrated with phone number

## Student Portal Features
- **Authentication**: Supabase-based login system
- **Role-based Access**: Student and Admin portals
- **Material Access**: PDF viewing and downloads
- **Progress Tracking**: Mark materials as complete
- **Responsive Design**: Works on all devices

## Pages Implementation Status
- ✅ Homepage (complete with background images and animations)
- ✅ About page (educator profile, mission/vision, learning & motivation section)
- ✅ Programs page (detailed program information with background images)
- ✅ Classroom page (virtual classroom with meeting platform access)
- ✅ Contact page (contact form, location, FAQ with WhatsApp integration)
- ✅ Enrolment page (enrolment form)
- ✅ Student Portal (login, dashboard, material access)
- ✅ Admin Portal (student management, material upload)

## Key Features Implemented
- **Background Images**: Each page section has contextually relevant imagery
- **Student Authentication**: Supabase-powered login system
- **Material Management**: Upload, view, and track educational materials
- **Virtual Classroom**: Integration with Google Meet and Zoom
- **WhatsApp Integration**: Direct contact functionality
- **Responsive Design**: Mobile-first approach across all pages
- **Framer Motion**: Smooth animations and transitions

## Development Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Clear cache if needed
rm -rf .next
```

## Database Schema (Supabase)
- **profiles**: User profile information and roles
- **materials**: Educational materials and homework
- **student_materials**: Progress tracking for materials

## SEO & Metadata
- **Title**: "Learn Academy - Learning for a Changing World"
- **Description**: Innovative 1-on-1 personalised education breaking down subject barriers
- **Keywords**: tutoring, home schooling, interdisciplinary education, personalised learning, Birmingham

## Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Mobile navigation with hamburger toggle
- Responsive grid layouts for all components
- Touch-friendly interface elements

## Deployment Considerations
- Environment variables for Supabase keys
- Image optimization for performance
- SSL certificate for secure authentication
- Row Level Security (RLS) for data protection
- CDN for static assets
- Regular database backups

## Current Technical Debt
- Clean up test pages (test-home, test-programs) once satisfied with design
- Optimize image loading with Next.js Image component
- Add loading states for better UX
- Implement error boundaries

## Recent Updates
- Switched main pages to use enhanced versions with background images
- Updated all program information with correct pricing and structure
- Integrated WhatsApp contact functionality
- Enhanced classroom page with better imagery and animations
- Updated FAQ content to reflect 1-on-1 teaching approach
- Added learning & motivation philosophy section to about page

## Future Enhancements
- [ ] Email integration for contact forms
- [ ] Online booking system for consultations
- [ ] Payment integration for enrolment
- [ ] Push notifications for portal updates
- [ ] Video lesson streaming
- [ ] Progress analytics and reporting
- [ ] Parent dashboard access
- [ ] Calendar integration for scheduling

This educational platform provides a complete solution for personalised learning with modern web technologies and intuitive user experience.