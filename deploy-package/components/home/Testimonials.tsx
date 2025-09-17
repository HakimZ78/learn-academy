"use client";

import { Star, Quote } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useEffect, useState } from "react";

export default function Testimonials() {
  const { homepageData, isLoading } = useData();
  const [testimonials, setTestimonials] = useState(homepageData.testimonials);

  useEffect(() => {
    setTestimonials(homepageData.testimonials);
  }, [homepageData.testimonials]);

  // Listen for real-time updates
  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      setTestimonials(event.detail.testimonials);
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

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold mb-6">
            What <span className="gradient-text">Parents Say</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Don't just take our word for it. Hear from parents who've seen the
            transformation in their children's learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md relative"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-academy-light" />
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "{testimonial.content}"
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
