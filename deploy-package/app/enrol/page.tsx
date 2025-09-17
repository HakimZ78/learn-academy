"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Send,
  CheckCircle,
} from "lucide-react";

export default function EnrolPage() {
  const [formData, setFormData] = useState({
    studentName: "",
    studentAge: "",
    parentName: "",
    email: "",
    phone: "",
    program: "",
    subjects: [] as string[],
    startDate: "",
    additionalInfo: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const programs = [
    {
      id: "foundation",
      name: "Foundation Program (Ages 8-11)",
      price: "£60/month",
    },
    { id: "elevate", name: "Elevate Program (Ages 11-14)", price: "£80/month" },
    { id: "gcse", name: "GCSE Program (Ages 14-16)", price: "£100/month" },
    {
      id: "a-level",
      name: "A-Level Program (Ages 16-18)",
      price: "£120/month",
    },
  ];

  const subjects = [
    "Mathematics",
    "Biology",
    "Chemistry",
    "Physics",
    "English Language",
    "English Literature",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubjectChange = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-academy-primary via-academy-secondary to-academy-accent pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Enrolment Submitted!
            </h1>
            <p className="text-gray-600 mb-8">
              Thank you for your interest in Learn Academy. We'll review your
              enrolment and contact you within 24 hours to schedule a
              consultation.
            </p>

            <div className="space-y-4">
              <Link
                href="/"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-academy-primary to-academy-accent text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-academy-primary via-academy-secondary to-academy-accent pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-4xl font-bold text-white mb-4">
            Enrol at <span className="text-yellow-300">Learn Academy</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Take the first step towards personalised, interdisciplinary
            education. Complete the form below and we'll contact you to schedule
            a consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-semibold mb-6">
                Enrolment Information
              </h2>

              {/* Student Information */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-academy-primary" />
                  Student Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="studentName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Student's Full Name *
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      name="studentName"
                      required
                      value={formData.studentName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none transition-all"
                      placeholder="Enter student's name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="studentAge"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Student's Age *
                    </label>
                    <input
                      type="number"
                      id="studentAge"
                      name="studentAge"
                      required
                      min="5"
                      max="18"
                      value={formData.studentAge}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none transition-all"
                      placeholder="Age"
                    />
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-academy-secondary" />
                  Parent/Guardian Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="parentName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Parent/Guardian Name *
                    </label>
                    <input
                      type="text"
                      id="parentName"
                      name="parentName"
                      required
                      value={formData.parentName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none transition-all"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none transition-all"
                      placeholder="07XXX XXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Program Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-academy-accent" />
                  Program Selection
                </h3>

                <div>
                  <label
                    htmlFor="program"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Choose Program *
                  </label>
                  <select
                    id="program"
                    name="program"
                    required
                    value={formData.program}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select a program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name} - {program.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Interests (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {subjects.map((subject) => (
                      <label key={subject} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.subjects.includes(subject)}
                          onChange={() => handleSubjectChange(subject)}
                          className="rounded border-gray-300 text-academy-primary focus:ring-academy-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {subject}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Date */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Preferred Start Date
                </h3>

                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Additional Information */}
              <div className="mb-8">
                <label
                  htmlFor="additionalInfo"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Additional Information or Specific Requirements
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  rows={4}
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-academy-primary focus:border-transparent outline-none transition-all"
                  placeholder="Tell us about any specific learning needs, goals, or questions you have..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-academy-primary to-academy-accent text-white font-semibold py-4 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Enrolment
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">What Happens Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-academy-primary text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Consultation Call</h4>
                    <p className="text-sm text-gray-600">
                      We'll contact you within 24 hours to schedule a
                      consultation
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-academy-secondary text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Personalised Plan</h4>
                    <p className="text-sm text-gray-600">
                      We'll create a tailored learning plan for your child
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-academy-accent text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Start Learning</h4>
                    <p className="text-sm text-gray-600">
                      Begin your personalised education journey
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-academy-primary to-academy-accent text-white rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
              <p className="mb-4 text-white/90">
                Have questions about enrolment or our programs?
              </p>
              <Link
                href="/contact"
                className="w-full bg-white text-academy-primary font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors text-center block"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
