/*
 * Sample Lessons Component - Currently Commented Out
 * Uncomment this code when ready to add YouTube video demonstrations
 */

// 'use client'

// import { Play, Clock, Users, ChevronRight } from 'lucide-react'
// import Link from 'next/link'
// import { motion } from 'framer-motion'

// export default function SampleLessons() {
//   const lessons = [
//     {
//       id: 'math-algebra',
//       title: 'Mathematics: Introduction to Algebra',
//       description: 'See how we make algebra accessible and engaging for young learners',
//       videoId: 'dQw4w9WgXcQ', // Replace with your actual YouTube video ID
//       duration: '15 min',
//       ageGroup: '11-14 years',
//       thumbnail: '/images/math-thumbnail.jpg', // Add your thumbnail
//     },
//     {
//       id: 'science-forces',
//       title: 'Science: Understanding Forces',
//       description: 'Explore our hands-on approach to teaching physics concepts',
//       videoId: 'dQw4w9WgXcQ', // Replace with your actual YouTube video ID
//       duration: '12 min',
//       ageGroup: '8-11 years',
//       thumbnail: '/images/science-thumbnail.jpg', // Add your thumbnail
//     },
//     {
//       id: 'english-creative',
//       title: 'English: Creative Writing Workshop',
//       description: 'Watch how we inspire creativity and improve writing skills',
//       videoId: 'dQw4w9WgXcQ', // Replace with your actual YouTube video ID
//       duration: '18 min',
//       ageGroup: '11-14 years',
//       thumbnail: '/images/english-thumbnail.jpg', // Add your thumbnail
//     },
//   ]

//   return (
//     <section className="py-16 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
//       {/* Animated blur effects */}
//       <motion.div
//         className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-20"
//         style={{
//           background: 'linear-gradient(135deg, #667eea, #764ba2)',
//           filter: 'blur(80px)',
//         }}
//         animate={{
//           scale: [1, 1.2, 1],
//           opacity: [0.2, 0.3, 0.2],
//         }}
//         transition={{
//           duration: 8,
//           repeat: Infinity,
//           ease: "easeInOut"
//         }}
//       />

//       <div className="container mx-auto px-4 relative z-10">
//         <motion.div
//           className="text-center mb-12"
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.8 }}
//         >
//           <h2 className="text-4xl font-display font-bold mb-6">
//             Experience Our <span className="gradient-text">Teaching Excellence</span>
//           </h2>
//           <p className="text-lg text-gray-700 max-w-2xl mx-auto">
//             Watch sample lessons to see how we bring subjects to life and make
//             learning an exciting journey for every student
//           </p>
//         </motion.div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
//           {lessons.map((lesson, index) => (
//             <motion.div
//               key={lesson.id}
//               className="group"
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.5, delay: index * 0.1 }}
//             >
//               <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
//                 {/* Video Thumbnail with Play Button Overlay */}
//                 <div className="relative aspect-video bg-gradient-to-br from-academy-primary to-academy-secondary">
//                   <iframe
//                     className="w-full h-full"
//                     src={`https://www.youtube.com/embed/${lesson.videoId}`}
//                     title={lesson.title}
//                     frameBorder="0"
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                     allowFullScreen
//                   ></iframe>
//                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
//                     <div className="bg-white rounded-full p-4">
//                       <Play className="h-8 w-8 text-academy-primary fill-academy-primary" />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Lesson Details */}
//                 <div className="p-6">
//                   <h3 className="text-xl font-semibold mb-2 group-hover:text-academy-primary transition-colors">
//                     {lesson.title}
//                   </h3>
//                   <p className="text-gray-600 mb-4 text-sm">
//                     {lesson.description}
//                   </p>

//                   <div className="flex items-center justify-between text-sm text-gray-500">
//                     <div className="flex items-center gap-3">
//                       <span className="flex items-center">
//                         <Clock className="h-4 w-4 mr-1" />
//                         {lesson.duration}
//                       </span>
//                       <span className="flex items-center">
//                         <Users className="h-4 w-4 mr-1" />
//                         {lesson.ageGroup}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </div>

//         {/* CTA Section */}
//         <motion.div
//           className="text-center mt-12"
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6, delay: 0.4 }}
//         >
//           <p className="text-gray-700 mb-6">
//             Ready to give your child the educational advantage they deserve?
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link href="/classroom" className="btn-primary inline-flex items-center justify-center group">
//               View Virtual Classroom
//               <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
//             </Link>
//             <Link href="/contact" className="btn-secondary inline-flex items-center justify-center">
//               Book a Free Consultation
//             </Link>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   )
// }

// Temporary placeholder component to prevent errors
export default function SampleLessons() {
  return null;
}
