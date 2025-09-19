import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Virtual Classroom - Interactive Online Learning',
  description: 'Access Learn Academy\'s virtual classroom for interactive online tutoring sessions. Join via Google Meet or Zoom for personalised 1-on-1 education.',
  keywords: [
    'virtual classroom',
    'online tutoring Birmingham',
    'Google Meet tutoring',
    'Zoom tutoring sessions',
    'interactive online learning'
  ],
  alternates: {
    canonical: '/classroom',
  },
  openGraph: {
    title: 'Virtual Classroom - Learn Academy Online',
    description: 'Interactive online tutoring sessions via Google Meet and Zoom.',
    url: 'https://learnacademy.co.uk/classroom',
  },
}

export default function ClassroomLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}