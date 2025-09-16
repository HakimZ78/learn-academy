import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-16 bg-gradient-to-r from-academy-primary via-academy-secondary to-academy-accent">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-4xl font-display font-bold mb-6">
            Ready to Transform Your Child's Education?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join us in reimagining what education can be. Schedule a free
            consultation to discuss how we can support your child's unique
            learning journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-academy-primary px-8 py-4 rounded-lg font-semibold inline-flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Free Consultation
            </Link>
            <Link
              href="/programs"
              className="bg-white/20 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-lg font-semibold inline-flex items-center justify-center hover:bg-white/30 transition-all duration-300"
            >
              Explore Programs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <p className="mt-8 text-sm text-white/80">
            Limited spaces available for the upcoming term. Enroll now to secure
            your place.
          </p>
        </div>
      </div>
    </section>
  );
}
