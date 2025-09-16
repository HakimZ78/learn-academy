"use client";

import { Calendar, Users, Clock, Award } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Programs() {
  const programs = [
    {
      title: "Foundation Program",
      ageGroup: "8-11 years",
      description:
        "Building strong fundamentals in core National Curriculum subjects & towards 11+",
      features: [
        "Critical thinking & reasoning",
        "Independent learning skills",
        "Core subject mastery",
      ],
      schedule: "4 Sessions/month",
      sessionTime: "50 minutes per session",
      price: "£50/month",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Elevate Program",
      ageGroup: "11-14 years",
      description:
        "Accelerated learning designed to prepare students for GCSE success",
      features: [
        "Advanced analytical thinking",
        "Independent research skills",
        "GCSE preparation focus",
      ],
      schedule: "4 Sessions/month",
      sessionTime: "1 hour per session",
      price: "£70/month",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Excel Program",
      ageGroup: "14-16 years",
      description:
        "Comprehensive GCSE preparation focused on achieving excellent results",
      features: [
        "Exam technique mastery",
        "Critical analysis skills",
        "University preparation",
      ],
      schedule: "4 Sessions/month",
      sessionTime: "1 hour per session",
      price: "£80/month",
      color: "from-green-500 to-teal-500",
    },
    {
      title: "Advanced Program",
      ageGroup: "16-18 years",
      description:
        "Advanced sciences specialisation for university preparation",
      features: [
        "Independent research",
        "University preparation",
        "Advanced scientific concepts",
      ],
      schedule: "4 Sessions/month",
      sessionTime: "1 hour per session",
      price: "£100/month",
      color: "from-indigo-500 to-purple-600",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-academy-primary via-academy-secondary to-academy-accent relative overflow-hidden">
      {/* Blur circles with focus transitions */}
      <motion.div
        className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-20"
        style={{
          background: "linear-gradient(120deg, #1e40af, #7c3aed)",
          filter: "blur(90px)",
        }}
        animate={{
          filter: ["blur(90px)", "blur(50px)", "blur(130px)", "blur(90px)"],
          opacity: [0.2, 0.35, 0.1, 0.2],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-10 left-16 w-64 h-64 rounded-full opacity-15"
        style={{
          background: "linear-gradient(60deg, #7c3aed, #10b981)",
          filter: "blur(75px)",
        }}
        animate={{
          filter: ["blur(75px)", "blur(115px)", "blur(45px)", "blur(75px)"],
          opacity: [0.15, 0.3, 0.05, 0.15],
          scale: [1, 1.3, 0.7, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-display font-bold mb-6 text-white">
            Our <span className="text-yellow-300">Programs</span>
          </h2>
          <p className="text-lg text-white/90 max-w-3xl mx-auto mb-4">
            From foundation building to university preparation - our
            comprehensive programmes support students at every stage of their
            educational journey.
          </p>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            All our programmes have pre & post session personalised homework.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {programs.map((program, index) => (
            <motion.div
              key={index}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/50 hover:shadow-2xl transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
            >
              <div className={`h-2 bg-gradient-to-r ${program.color}`}></div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2">{program.title}</h3>
                <p className="text-academy-primary font-medium mb-4">
                  {program.ageGroup}
                </p>
                <p className="text-gray-600 mb-6">{program.description}</p>

                <div className="space-y-2 mb-6">
                  {program.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <Award className="h-5 w-5 text-academy-accent mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {program.schedule}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {program.sessionTime}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 font-semibold text-green-600">
                    <span className="text-lg">{program.price}</span>
                  </div>
                </div>

                <Link
                  href={`/programs#${program.title.toLowerCase().replace(" ", "-")}`}
                  className="inline-block mt-6 text-academy-primary font-semibold hover:text-academy-secondary transition-colors"
                >
                  Learn More →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link href="/programs" className="btn-primary">
            View All Programs
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
