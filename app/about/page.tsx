import { Code, Brain, Heart, Award, Briefcase, BookOpen } from "lucide-react";

export default function AboutPage() {
  const expertise = [
    {
      icon: Code,
      title: "Technology",
      description: "Software engineering, AI, and digital innovation",
    },
    {
      icon: Briefcase,
      title: "Business",
      description: "Financial analysis, trading, and entrepreneurship",
    },
    {
      icon: Brain,
      title: "Healthcare",
      description: "Medical technology and healthcare systems",
    },
    {
      icon: BookOpen,
      title: "Education",
      description: "Curriculum design and innovative pedagogy",
    },
  ];

  const qualifications = [
    {
      text: "Optometrist, Pharmacist",
      link: "https://www.linkedin.com/in/zaehid-hakim-1004016b",
      linkText: "LinkedIn Profile",
    },
    {
      text: "Business",
      links: [
        { url: "https://homeeyeclinic.co.uk", text: "homeeyeclinic.co.uk" },
        { url: "https://locum-optom.co.uk", text: "locum-optom.co.uk" },
      ],
    },
    {
      text: "Programming & WebApp development",
      link: "https://forexacuity.co.uk",
      linkText: "forexacuity.co.uk",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-academy-primary via-academy-secondary to-academy-accent">
      {/* Hero Section with white header area */}
      <section className="bg-white/95 backdrop-blur-sm pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-display font-bold mb-6">
              About <span className="gradient-text">Learn Academy</span>
            </h1>
            <p className="text-xl text-gray-700">
              Where diverse expertise meets innovative education
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <h2 className="text-3xl font-display font-bold mb-6">
                  Meet Your Educator
                </h2>
                <p className="text-lg text-gray-700 mb-4">
                  I'm Zaehid Hakim, a multi-talented professional with a unique journey
                  from healthcare to technology, business & education, bringing
                  together diverse expertise to create an extraordinary learning
                  environment.
                </p>
                <p className="text-lg text-gray-700 mb-4">
                  I am both a qualified Optometrist & Pharmacist, involved in
                  business as well active in home-schooling. I have self-taught
                  Computer Science skills enabling me to build useful
                  applications and web-apps. This interdisciplinary
                  experience allows me to show students how different fields
                  connect and complement each other in the real world.
                </p>
                <p className="text-lg text-gray-700">
                  I believe that in our rapidly changing world, the most
                  valuable education is one that breaks down artificial barriers
                  between subjects and prepares students to think critically,
                  adapt quickly, and solve academic problems efficiently. I love
                  learning new things and genuinely want every child to achieve
                  their potential! You can read more about my background through
                  my professional background web links.
                </p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                <div className="">
                  <h3 className="text-xl font-semibold mb-4">
                    Professional Background
                  </h3>
                  <ul className="space-y-3">
                    {qualifications.map((qual, index) => (
                      <li key={index} className="flex items-start">
                        <Award className="h-5 w-5 text-academy-accent mt-0.5 mr-3 flex-shrink-0" />
                        <div className="text-gray-700">
                          {qual.text && (
                            <span>
                              {qual.text}
                              {qual.link && (
                                <span>
                                  {" ("}
                                  <a
                                    href={qual.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-academy-primary hover:text-academy-secondary underline transition-colors"
                                  >
                                    {qual.linkText}
                                  </a>
                                  {")"}
                                </span>
                              )}
                              {qual.links && (
                                <span>
                                  {": "}
                                  {qual.links.map((link, linkIndex) => (
                                    <span key={linkIndex}>
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-academy-primary hover:text-academy-secondary underline transition-colors"
                                      >
                                        {link.text}
                                      </a>
                                      {linkIndex < qual.links.length - 1 &&
                                        ", "}
                                    </span>
                                  ))}
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* DBS Certification */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800">
                          DBS Registered
                        </h4>
                        <p className="text-sm text-gray-600">
                          Certificate: 001843500001
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Enhanced DBS check for working with children
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {expertise.map((area, index) => {
                const Icon = area.icon;
                return (
                  <div
                    key={index}
                    className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
                  >
                    <div className="inline-flex p-4 bg-academy-light rounded-full mb-4">
                      <Icon className="h-8 w-8 text-academy-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{area.title}</h4>
                    <p className="text-sm text-gray-600">{area.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-center mb-12 text-white">
              Our <span className="text-yellow-300">Mission & Vision</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-xl">
                <Heart className="h-12 w-12 text-academy-primary mb-4" />
                <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
                <p className="text-gray-600">
                  To provide transformative education that prepares students for
                  a rapidly changing world by breaking down traditional subject
                  barriers and fostering critical thinking, creativity, and
                  adaptability.
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-xl">
                <Brain className="h-12 w-12 text-academy-secondary mb-4" />
                <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
                <p className="text-gray-600">
                  To be the leading innovator in interdisciplinary education,
                  creating a generation of learners who can seamlessly navigate
                  between different fields of knowledge and apply their learning
                  to solve real-world challenges.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-black/20 backdrop-blur-sm rounded-2xl p-8 text-white text-center border border-white/20">
              <h3 className="text-2xl font-semibold mb-4">
                "Education is not about filling minds with facts, but about
                teaching them how to think."
              </h3>
              <p className="text-white/90 mb-6">
                This philosophy drives everything we do at Learn Academy.
              </p>
              <div className="mt-6 pt-6 border-t border-white/20">
                <h4 className="text-xl font-semibold mb-3">
                  Learning & Motivation
                </h4>
                <p className="text-white/80 text-left">
                  Children are naturally curious learners, constantly asking
                  "why" and eagerly exploring the world around them. At Learn
                  Academy, we nurture this innate curiosity by focusing on
                  intrinsic motivation rather than external rewards. We believe
                  true learning happens when students feel autonomous in their
                  choices, connected to their peers and educator, and confident
                  in their growing abilities. By emphasising learning goals over
                  performance metrics, we help students develop resilience and
                  maintain their natural enthusiasm for discovery. Our approach
                  transforms education from a duty into a joyful journey,
                  ensuring that the spark of curiosity that drives young minds
                  never dims but instead grows stronger with each new challenge
                  they embrace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark footer section */}
      <section className="bg-black/40 backdrop-blur-sm py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-display font-bold text-white mb-4">
              Ready to Transform Your Learning Journey?
            </h3>
            <p className="text-white/80 mb-8">
              Join Learn Academy and experience education that adapts to the
              future
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/enrol"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-academy-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Enrol Now
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Schedule Consultation
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
