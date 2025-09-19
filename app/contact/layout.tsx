import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Learn Academy Birmingham',
  description: 'Get in touch with Learn Academy for personalised tutoring consultation. Located in Birmingham B8 1AE. Call 07779-602503 or email info@learnacademy.co.uk',
  keywords: [
    'contact Learn Academy',
    'tutoring consultation Birmingham',
    'education assessment',
    'book tutoring session',
    'Birmingham tutor contact'
  ],
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Learn Academy - Book Your Consultation',
    description: 'Get in touch for personalised tutoring consultation in Birmingham.',
    url: 'https://learnacademy.co.uk/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}