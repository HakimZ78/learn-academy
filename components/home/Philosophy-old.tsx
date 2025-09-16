import { Brain, Palette, Code, Globe, Heart, Target } from "lucide-react";

export default function Philosophy() {
  const principles = [
    {
      icon: Brain,
      title: "Critical Thinking",
      description:
        "Develop analytical skills that cross disciplinary boundaries",
    },
    {
      icon: Palette,
      title: "Creative Expression",
      description: "Blend arts with sciences for innovative problem-solving",
    },
    {
      icon: Code,
      title: "Digital Literacy",
      description: "Master technology as a tool for learning and creation",
    },
    {
      icon: Globe,
      title: "Global Perspective",
      description: "Understanding interconnected systems and cultures",
    },
    {
      icon: Heart,
      title: "Emotional Intelligence",
      description: "Building self-awareness and interpersonal skills",
    },
    {
      icon: Target,
      title: "Purpose-Driven",
      description: "Connect learning to real-world applications and goals",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-display font-bold mb-6">
            Our Educational <span className="gradient-text">Philosophy</span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            In a rapidly evolving world, education must transcend traditional
            boundaries. We believe in de-compartmentalized learning that
            prepares students not just for exams, but for life's complex
            challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {principles.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-xl border border-gray-200 hover:border-academy-primary transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-academy-light rounded-lg group-hover:bg-gradient-to-br group-hover:from-academy-primary group-hover:to-academy-secondary transition-all duration-300">
                    <Icon className="h-6 w-6 text-academy-primary group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {principle.title}
                    </h3>
                    <p className="text-gray-600">{principle.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-gradient-to-r from-academy-primary to-academy-secondary rounded-2xl p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-display font-bold mb-4">
              "Education is not preparation for life; education is life itself."
            </h3>
            <p className="text-lg opacity-90">- John Dewey</p>
            <p className="mt-6 text-white/90">
              We embrace this philosophy by creating learning experiences that
              are immediately relevant, engaging, and transformative.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
