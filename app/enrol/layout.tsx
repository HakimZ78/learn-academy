import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Enrol Now - Start Your Learning Journey',
  description: 'Enrol in Learn Academy\'s personalised tutoring programs. Foundation, GCSE, and A-Level programs available. Quick and easy online enrolment process.',
  keywords: [
    'enrol tutoring Birmingham',
    'sign up for tutoring',
    'register for GCSE tutoring',
    'A-Level enrolment',
    'start tutoring Birmingham'
  ],
  alternates: {
    canonical: '/enrol',
  },
  openGraph: {
    title: 'Enrol at Learn Academy - Start Your Educational Journey',
    description: 'Quick and easy enrolment for personalised tutoring programs.',
    url: 'https://learnacademy.co.uk/enrol',
  },
}

export default function EnrolLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}