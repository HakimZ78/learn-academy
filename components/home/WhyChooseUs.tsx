"use client";

import { CheckCircle } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function WhyChooseUs() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0.3, 0.5], [0.3, 1]);
  const benefits = [
    {
      title: "Multi-Talented Educator",
      description:
        "Learn from a professional with diverse expertise across healthcare, technology, business, and education",
    },
    {
      title: "1 to 1 Mentoring",
      description:
        "Benefit from personalised attention and dedicated one-on-one guidance",
    },
    {
      title: "Flexible Learning Paths",
      description:
        "Customised curriculum that adapts to individual learning styles and goals",
    },
    {
      title: "Real-World Application",
      description:
        "Connect academic concepts to practical, everyday situations",
    },
    {
      title: "Holistic Development",
      description:
        "Focus on academic excellence alongside emotional and social growth",
    },
    {
      title: "Parent Partnership",
      description:
        "Regular communication and involvement in your child's learning journey",
    },
  ];

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Fixed gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"
        style={{
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
        }}
      />

      {/* Animated pattern overlay */}
      <motion.div className="absolute inset-0" style={{ opacity }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99,102,241,0.1) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-display font-bold mb-6">
              Why Choose <span className="gradient-text">Learn Academy</span>?
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              We're not just another tutoring service. We're reimagining
              education for the 21st century, where traditional boundaries
              between subjects dissolve and learning becomes an exciting journey
              of discovery.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">{benefit.title}</h4>
                    <p className="text-gray-600 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="bg-gradient-to-br from-academy-light/80 to-blue-50/80 backdrop-blur-sm rounded-2xl p-8"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50">
                <h3 className="text-2xl font-semibold mb-4">Our Approach</h3>
                <div className="space-y-4">
                  <motion.div
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-academy-primary rounded-full flex items-center justify-center text-white font-bold"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      1
                    </motion.div>
                    <div>
                      <h4 className="font-semibold">Assess</h4>
                      <p className="text-sm text-gray-600">
                        Understand each student's unique needs
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-academy-secondary rounded-full flex items-center justify-center text-white font-bold"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      2
                    </motion.div>
                    <div>
                      <h4 className="font-semibold">Design</h4>
                      <p className="text-sm text-gray-600">
                        Create personalised learning pathways
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-academy-accent rounded-full flex items-center justify-center text-white font-bold"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      3
                    </motion.div>
                    <div>
                      <h4 className="font-semibold">Engage</h4>
                      <p className="text-sm text-gray-600">
                        Deliver interactive, meaningful lessons
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      4
                    </motion.div>
                    <div>
                      <h4 className="font-semibold">Evolve</h4>
                      <p className="text-sm text-gray-600">
                        Continuously adapt and improve
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
