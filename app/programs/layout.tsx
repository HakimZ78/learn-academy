import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Educational Programs - Foundation, GCSE & A-Level Tutoring',
  description: 'Comprehensive tutoring programs for ages 8-18. Foundation (£50), Elevate (£70), GCSE (£80), and A-Level (£100) programs. 1-on-1 personalised learning.',
  keywords: [
    'Foundation program tutoring',
    'GCSE tutoring Birmingham',
    'A-Level science tutoring',
    'Key Stage 2 tutoring',
    'Key Stage 3 tutoring',
    'personalised learning programs',
    'accelerated learning',
    'exam preparation',
    'mathematics tutoring',
    'science tutoring',
    'biology tutoring',
    'chemistry tutoring',
    'physics tutoring'
  ],
  alternates: {
    canonical: '/programs',
  },
  openGraph: {
    title: 'Educational Programs - Personalised Tutoring for All Ages',
    description: 'Foundation, GCSE & A-Level programs with 1-on-1 tutoring. From £50/month.',
    url: 'https://learn-academy.co.uk/programs',
  },
}

export default function ProgramsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}