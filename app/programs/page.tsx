"use client";

import {
  Calendar,
  Users,
  Clock,
  Award,
  BookOpen,
  Brain,
  Target,
  Star,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProgramsPage() {
  const programs = [
    {
      id: "foundation",
      title: "Foundation Program",
      ageGroup: "Ages 8-11 (Key Stage 2)",
      description:
        "Building strong fundamentals in core National Curriculum subjects & towards 11+, setting the stage for accelerated learning.",
      duration: "50 minute sessions",
      groupSize: "Set Homework",
      price: "4 Sessions/month £60",
      bgImage:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022", // Young children learning
      curriculum: [
        {
          subject: "English Language",
          topics: [
            "Reading comprehension & understanding",
            "Writing & Vocabulary",
            "Grammar",
          ],
        },
        {
          subject: "Mathematics",
          topics: [
            "Number & Place Value",
            "Fractions, Decimals & Percentages",
            "Algebra & Geometry",
            "Statistics & Data",
          ],
        },
        {
          subject: "KS2 Science",
          topics: [
            "Living Things & Life Processes",
            "Forces, Light & Sound",
            "Materials & Chemistry",
            "Earth & Space",
          ],
        },
        {
          subject: "Technology & Computing",
          topics: [
            "Introduction to programming",
            "Digital literacy",
            "Problem-solving with technology",
            "Computational thinking",
          ],
        },
      ],
      keySkills: ["Critical thinking & reasoning", "Learning skills"],
      outcomes: [
        "Strong foundation for accelerated KS3 learning",
        "Confidence in tackling challenging problems",
        "Ready for advanced concepts earlier",
      ],
    },
    {
      id: "elevate",
      title: "Elevate Program",
      ageGroup: "Ages 11-14 (Key Stage 3 & early KS4)",
      description:
        "Accelerated learning programme designed to get students prepared well for GCSE's by age 14.",
      duration: "1 hour sessions",
      groupSize: "Post session homework",
      price: "4 Sessions/Month £80",
      bgImage:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2004", // Teenagers studying
      curriculum: [
        {
          subject: "English Literature & Language",
          topics: [
            "Literary analysis",
            "Writing skills",
            "Critical thinking",
            "Communication skills",
          ],
        },
        {
          subject: "KS3 & early KS4 Science & Mathematics",
          topics: [
            "All KS3 topics",
            "Early GCSE science concepts",
            "Mathematical problem-solving",
          ],
        },
        {
          subject: "Digital Skills & Coding",
          topics: [
            "Programming concepts & challenges",
            "Data analysis and interpretation",
            "Digital problem-solving",
          ],
        },
        {
          subject: "Study Skills",
          topics: [
            "Independent research methods",
            "Critical evaluation of subject",
            "Note-taking",
            "Subject preparation strategies",
          ],
        },
      ],
      keySkills: ["Advanced analytical thinking", "Independent research"],
      outcomes: [
        "Strong foundation for GCSE's",
        "Confident, independent learners",
      ],
    },
    {
      id: "gcse",
      title: "Excel Program",
      ageGroup: "Ages 14-16 (GCSE Level)",
      description:
        "Comprehensive GCSE preparation programme focused on achieving excellent results in core subjects.\n\nSubjects offered: Mathematics, Biology, Chemistry, Physics",
      duration: "1 hour sessions",
      groupSize: "Pre & post session homework",
      price: "4 Sessions/Month £100",
      bgImage:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070", // Students taking exams
      curriculum: [
        {
          subject: "Mathematics",
          topics: [
            "Algebra & equations",
            "Geometry & trigonometry",
            "Statistics & probability",
            "Problem-solving strategies",
          ],
        },
        {
          subject: "Biology",
          topics: [
            "Life processes & genetics",
            "Cellular biology",
            "Evolution & inheritance",
            "Ecology & ecosystems",
          ],
        },
        {
          subject: "Chemistry",
          topics: [
            "Atomic structure & reactions",
            "Chemical bonding",
            "Acids, bases & salts",
            "Organic chemistry",
          ],
        },
        {
          subject: "Physics",
          topics: [
            "Forces, energy & waves",
            "Electricity & magnetism",
            "Motion & forces",
            "Atomic physics",
          ],
        },
      ],
      keySkills: ["Exam technique mastery", "Critical analysis skills"],
      outcomes: [
        "Confident approach to GCSE examinations",
        "Strong foundation for A-Level studies",
      ],
    },
    {
      id: "alevel",
      title: "Advanced Program",
      ageGroup: "Ages 16-18 (A-Level)",
      description:
        "Advanced study programme specialising in the sciences, preparing students for university and future careers.\n\nSubjects offered: Biology, Chemistry, Physics",
      duration: "1 hour sessions",
      groupSize: "Pre & post session homework",
      price: "4 Sessions/Month £120",
      bgImage:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070", // University/advanced students
      curriculum: [
        {
          subject: "Biology A-Level",
          topics: [
            "Cell biology & biochemistry",
            "Genetics & evolution",
            "Ecology & human physiology",
            "Research & practical skills",
          ],
        },
        {
          subject: "Chemistry A-Level",
          topics: [
            "Atomic structure & bonding",
            "Organic chemistry",
            "Physical chemistry & kinetics",
            "Laboratory techniques",
          ],
        },
        {
          subject: "Physics A-Level",
          topics: [
            "Mechanics & materials",
            "Electricity & magnetism",
            "Waves & quantum physics",
            "Mathematical physics",
          ],
        },
      ],
      keySkills: ["Independent research", "University preparation"],
      outcomes: [
        "Ready for university-level science courses",
        "Confident in advanced scientific concepts",
      ],
    },
  ];

  const assessmentMethods = [
    "Continuous assessment through active feedback",
    "Mock examinations (where appropriate)",
  ];

  return (
    <div className="pt-24 pb-16 bg-gradient-to-br from-academy-primary via-academy-secondary to-academy-accent relative overflow-hidden">
      {/* Animated Blur Circles - More Subtle */}
      <motion.div
        className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-10"
        style={{
          background: "linear-gradient(120deg, #1e40af, #7c3aed)",
          filter: "blur(90px)",
        }}
        animate={{
          filter: ["blur(90px)", "blur(50px)", "blur(130px)", "blur(90px)"],
          opacity: [0.1, 0.2, 0.05, 0.1],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-10 left-16 w-64 h-64 rounded-full opacity-10"
        style={{
          background: "linear-gradient(60deg, #7c3aed, #10b981)",
          filter: "blur(75px)",
        }}
        animate={{
          filter: ["blur(75px)", "blur(115px)", "blur(45px)", "blur(75px)"],
          opacity: [0.1, 0.15, 0.05, 0.1],
          scale: [1, 1.3, 0.7, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Hero Section with Background */}
      <section className="relative bg-white/95 backdrop-blur-sm py-16 z-10 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=2070')`, // Education/learning environment
            }}
          >
            <div className="absolute inset-0 bg-white/65"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl font-display font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Our <span className="gradient-text">Programs</span>
            </motion.h1>
            <motion.p
              className="text-xl text-gray-800 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <strong>Boost your Child's success.</strong> Our accelerated
              programmes focus on core subjects - English, Mathematics, Science
              & Computing - to create confident, independent learners ready for
              early GCSE preparation and the future world.
            </motion.p>
            <motion.p
              className="text-lg text-gray-700 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              We create personalised learning plans for every student.
            </motion.p>
            <motion.div
              className="bg-black/10 backdrop-blur-sm border border-gray-200 rounded-lg p-4 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <p className="text-gray-800 font-medium">
                💡 The pre & post session homework for all our programs are
                available through the student login page.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Program Sections with Individual Backgrounds */}
      {programs.map((program, index) => (
        <motion.section
          key={program.id}
          className="py-16 relative z-10 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: index * 0.2 }}
        >
          {/* Program-Specific Background */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${program.bgImage}')`,
              }}
            >
              <div className="absolute inset-0 bg-white/65"></div>
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <motion.div
                  className="lg:col-span-2 bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/50"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  }}
                >
                  <div className="mb-4">
                    <h2 className="text-3xl font-display font-bold inline mr-3">
                      {program.title}
                    </h2>
                    <span className="text-2xl text-blue-600 font-semibold">
                      {program.ageGroup}
                    </span>
                  </div>
                  <p className="text-lg text-gray-700 mb-6 whitespace-pre-line">
                    {program.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span className="text-sm">{program.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-sm">{program.groupSize}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">
                        {program.price}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm">UK Curriculum</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/50"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 15px 30px rgba(0,0,0,0.12)",
                  }}
                >
                  <h3 className="text-xl font-semibold mb-4">
                    Key Skills Developed
                  </h3>
                  <ul className="space-y-2">
                    {program.keySkills.map((skill, idx) => (
                      <li key={idx} className="flex items-center">
                        <Brain className="h-4 w-4 text-purple-600 mr-2" />
                        <span className="text-sm">{skill}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-xl font-semibold mb-4 mt-6">
                    Learning Outcomes
                  </h3>
                  <ul className="space-y-2">
                    {program.outcomes.map((outcome, idx) => (
                      <li key={idx} className="flex items-start">
                        <Award className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Curriculum Breakdown - Only for Foundation and Elevate */}
              {(program.id === "foundation" || program.id === "elevate") && (
                <motion.div
                  className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/50"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.7 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                  }}
                >
                  <h3 className="text-2xl font-semibold mb-6">
                    Sessions cover
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {program.curriculum.map((subject, idx) => (
                      <motion.div
                        key={idx}
                        className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 border border-white/30"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.2 + idx * 0.1 + 0.9,
                        }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                        }}
                      >
                        <div className="flex items-center mb-3">
                          <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                          <h4 className="font-semibold text-lg">
                            {subject.subject}
                          </h4>
                        </div>
                        <ul className="space-y-1">
                          {subject.topics.map((topic, topicIdx) => (
                            <li
                              key={topicIdx}
                              className="text-sm text-gray-700 flex items-start"
                            >
                              <span className="w-2 h-2 bg-blue-300 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>
      ))}

      {/* Assessment Methods with Background */}
      <motion.section
        className="py-16 text-white relative z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Assessment Background */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1606686554842-3eee217c47b5?q=80&w=2074')`, // Assessment/testing environment
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              className="text-3xl font-display font-bold mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Our Assessment Approach
            </motion.h2>
            <motion.p
              className="text-xl mb-8 text-white/90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              We believe in holistic evaluation that goes beyond traditional
              testing, focusing on skill development & real understanding.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-4xl mx-auto">
              {assessmentMethods.map((method, index) => (
                <motion.div
                  key={index}
                  className="bg-white/20 backdrop-blur-md rounded-lg p-4 flex-1 text-center border border-white/30"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.2 }}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(255,255,255,0.25)",
                  }}
                >
                  <p className="text-sm">{method}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section with Background */}
      <motion.section
        className="py-16 relative z-10 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* CTA Background */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070')`, // Consultation/meeting environment
            }}
          >
            <div className="absolute inset-0 bg-white/65"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto border border-white/50"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
            }}
          >
            <motion.h2
              className="text-3xl font-display font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Ready to Explore Our Programs?
            </motion.h2>
            <motion.p
              className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Schedule a consultation to discuss which program best suits your
              child's needs and learning style. We'll create a personalised
              pathway to success.
            </motion.p>

            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <Link href="/contact" className="btn-primary shadow-lg">
                Schedule Consultation
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
