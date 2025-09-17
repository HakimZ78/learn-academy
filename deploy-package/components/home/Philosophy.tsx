"use client";

import { Brain, Palette, Code, Globe, Heart, Target } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Philosophy() {
  const { homepageData, isLoading } = useData();
  const [principles, setPrinciples] = useState(homepageData.philosophy);

  useEffect(() => {
    setPrinciples(homepageData.philosophy);
  }, [homepageData.philosophy]);

  // Listen for real-time updates
  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      setPrinciples(event.detail.philosophy);
    };

    window.addEventListener(
      "homepage-data-updated",
      handleUpdate as EventListener,
    );
    return () => {
      window.removeEventListener(
        "homepage-data-updated",
        handleUpdate as EventListener,
      );
    };
  }, []);

  // Icon mapping
  const iconMap = {
    "Critical Thinking": Brain,
    "Creative Expression": Palette,
    "Digital Literacy": Code,
    "Global Perspective": Globe,
    "Emotional Intelligence": Heart,
    "Purpose-Driven": Target,
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={
        "py-16 relative overflow-hidden bg-gradient-to-br from-academy-primary via-academy-secondary to-academy-accent"
      }
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-display font-bold mb-6 text-white">
            Our Educational <span className="text-yellow-300">Philosophy</span>
          </h2>
          <p className="text-lg text-white/90 leading-relaxed">
            In a rapidly evolving world, education must transcend traditional
            boundaries. We believe in de-compartmentalized learning that
            prepares students not just for exams, but for life's complex
            challenges.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {principles.map((principle, index) => {
            // Get icon based on title, default to Brain
            const Icon = (iconMap as any)[principle.title] || Brain;
            return (
              <motion.div
                key={index}
                className="group p-6 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 bg-white/90 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    <Icon className="h-6 w-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {principle.title}
                    </h3>
                    <p className="text-gray-600">{principle.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated background effect */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h3 className="text-2xl font-display font-bold mb-4">
              "Education is not preparation for life; education is life itself."
            </h3>
            <p className="text-lg opacity-90">- John Dewey</p>
            <p className="mt-6 text-white/90">
              We embrace this philosophy by creating learning experiences that
              are immediately relevant, engaging, and transformative.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
