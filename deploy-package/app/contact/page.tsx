"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { validateContactForm } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    preferredContact: "email" as "email" | "phone" | "either",
    website: "", // Honeypot field
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSubmitError("");

    try {
      // Client-side validation using our validation schema
      const validatedData = await validateContactForm({
        ...formData,
        csrfToken: await generateCSRFToken(), // We'll implement this
      });

      // Submit to secure API endpoint
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to send message");
      }

      setSubmitted(true);
    } catch (error: any) {
      if (error.issues) {
        // Validation errors from Zod
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue: any) => {
          if (issue.path?.length > 0) {
            fieldErrors[issue.path[0]] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setSubmitError(error.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simple CSRF token generation (in production, get from server)
  const generateCSRFToken = async (): Promise<string> => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user makes selection
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "admin@learn-academy.co.uk",
      subtitle: "We respond within 24 hours",
    },
    {
      icon: Phone,
      title: "Phone",
      details: "07779-602503",
      subtitle: "Mon-Sat, 9:00 AM - 6:00 PM",
    },
    {
      icon: MapPin,
      title: "Location",
      details: "Office, B8 1AE",
      subtitle: "",
    },
    {
      icon: Clock,
      title: "Office Hours",
      details: "Monday - Saturday",
      subtitle: "9:00 AM - 6:00 PM GMT",
    },
  ];

  const faqs = [
    {
      question: "What are your class sizes?",
      answer:
        "1 on 1 for all levels. This personalised approach ensures each student receives focused attention, allowing for customised pacing and immediate feedback tailored to their individual learning style and needs.",
    },
    {
      question: "Do you follow the National Curriculum?",
      answer:
        "Yes, we exceed National Curriculum requirements while adding our interdisciplinary approach and real-world applications.",
    },
    {
      question: "Can students join mid-term?",
      answer:
        "Yes, we accept new students throughout the year. We provide catch-up support and personalised integration plans.",
    },
    {
      question: "What qualifications does the educator have?",
      answer:
        "Hakim brings multi-disciplinary expertise across healthcare, business, and education, with professional qualifications and extensive experience with children & students.",
    },
    {
      question: "How do you prepare students for exams?",
      answer:
        "We provide comprehensive GCSE and A-Level preparation with mock exams, study skills training, and personalised revision plans.",
    },
    {
      question: "What is your fee structure?",
      answer:
        "Foundation: £60/month, Elevate: £80/month, GCSE: £100/month, A-Level: £120/month. Payment plans available.",
    },
  ];

  return (
    <div className="pt-24 pb-16 bg-gradient-to-br from-academy-primary via-academy-secondary to-academy-accent">
      <section className="bg-white/95 backdrop-blur-sm py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-display font-bold mb-6">
              Get In <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-xl text-gray-800">
              Ready to discuss your child's educational journey? We're here to
              answer your questions and help you find the perfect learning path.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-display font-bold mb-6">
                Schedule a Free Consultation
              </h2>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
                  <p className="text-gray-600">
                    We've received your message and will get back to you within
                    24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot field - hidden from users */}
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    style={{ display: "none" }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-red-700">{submitError}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        Parent/Guardian Name *
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        placeholder="Your full name"
                        className={errors.fullName ? "border-red-300 bg-red-50" : ""}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-red-600">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email Address *
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        maxLength={255}
                        placeholder="your.email@example.com"
                        className={errors.email ? "border-red-300 bg-red-50" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone Number
                      </Label>
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="07123 456789 or +44 20 1234 5678"
                        className={errors.phone ? "border-red-300 bg-red-50" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredContact">
                        Preferred Contact Method
                      </Label>
                      <Select
                        value={formData.preferredContact}
                        onValueChange={(value) => handleSelectChange("preferredContact", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="either">Either</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      Subject / Program of Interest *
                    </Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => handleSelectChange("subject", value)}
                      required
                    >
                      <SelectTrigger className={errors.subject ? "border-red-300 bg-red-50" : ""}>
                        <SelectValue placeholder="Select a program or topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Foundation Program (Ages 8-11)">
                          Foundation Program (Ages 8-11)
                        </SelectItem>
                        <SelectItem value="Elevate Program (Ages 11-14)">
                          Elevate Program (Ages 11-14)
                        </SelectItem>
                        <SelectItem value="Excel Program (Ages 14-16)">
                          Excel Program (Ages 14-16)
                        </SelectItem>
                        <SelectItem value="Advanced Program (Ages 16-18)">
                          Advanced Program (Ages 16-18)
                        </SelectItem>
                        <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                        <SelectItem value="Free Consultation">
                          Free Consultation
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.subject && (
                      <p className="text-sm text-red-600">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      required
                      minLength={10}
                      maxLength={2000}
                      placeholder="Tell us about your child's needs, interests, or any questions you have... (minimum 10 characters)"
                      className={errors.message ? "border-red-300 bg-red-50" : ""}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-600">
                        {errors.message}
                      </p>
                    )}
                    <div className="text-sm text-gray-500 text-right">
                      {formData.message.length}/2000 characters
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-sm text-gray-500 text-center">
                    We'll respond within 24 hours to schedule your free
                    consultation.
                  </p>
                </form>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
                <h2 className="text-2xl font-display font-bold mb-6">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                  {contactInfo.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {item.title}
                          </h3>
                          <p className="text-gray-900">{item.details}</p>
                          <p className="text-sm text-gray-600">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold">Quick Contact</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  For immediate questions or to schedule a call, message us on
                  WhatsApp.
                </p>
                <a
                  href="https://wa.me/447779602503"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Message on WhatsApp
                </a>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Visit Our Learning Space
                </h3>
                <p className="text-gray-700 mb-4">
                  Located in Birmingham with excellent transport links.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Parents can sit in sessions</p>
                  <p>• Parking available nearby</p>
                  <p>• Accessible facilities</p>
                  <p>• Safe, welcoming environment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-700">
                Quick answers to common questions about our programs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="font-semibold mb-3 text-blue-800">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-600">
                Still have questions?
                <a
                  href="#contact-form"
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Get in touch
                </a>{" "}
                - we're happy to help!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
