// Static data management for Learn Academy
// This can be easily upgraded to Supabase later

export interface HeroContent {
  title: string;
  subtitle: string;
  primaryButton: string;
  secondaryButton: string;
}

export interface PhilosophyPrinciple {
  title: string;
  description: string;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface HomepageData {
  hero: HeroContent;
  philosophy: PhilosophyPrinciple[];
  testimonials: Testimonial[];
}

// Default data - this is what gets loaded initially
export const defaultHomepageData: HomepageData = {
  hero: {
    title: "Learning for a Changing World",
    subtitle:
      "Breaking down educational barriers with interdisciplinary learning. Experience personalised tutoring and innovative home schooling online or in our teaching office.",
    primaryButton: "Explore Programs",
    secondaryButton: "Schedule Consultation",
  },
  philosophy: [
    {
      title: "Critical Thinking",
      description:
        "Develop analytical skills that cross disciplinary boundaries",
    },
    {
      title: "Study Skills",
      description:
        "Develop effective learning strategies and time management techniques",
    },
    {
      title: "Digital Literacy",
      description: "Master technology as a tool for learning and creation",
    },
    {
      title: "Global Perspective",
      description: "Understanding interconnected systems and cultures",
    },
    {
      title: "Emotional Intelligence",
      description: "Building self-awareness and interpersonal skills",
    },
    {
      title: "Purpose-Driven",
      description: "Connect learning to real-world applications and goals",
    },
  ],
  testimonials: [
    {
      name: "Sarah Johnson",
      role: "Parent of Year 8 Student",
      content:
        "The interdisciplinary approach has transformed how my daughter sees learning. She's making connections between subjects I never thought possible.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Parent of Year 10 Student",
      content:
        "The small group setting provides the perfect balance of individual attention and peer learning. My son's confidence has soared.",
      rating: 5,
    },
    {
      name: "Emma Williams",
      role: "Parent of Year 6 Student",
      content:
        "Finally, an educational approach that prepares children for the real world, not just exams. The practical skills taught here are invaluable.",
      rating: 5,
    },
  ],
};

// Local storage keys
const STORAGE_KEYS = {
  homepage: "learn-academy-homepage-data",
};

// Data management class
export class LocalDataManager {
  // Homepage data management
  static getHomepageData(): HomepageData {
    if (typeof window === "undefined") {
      return defaultHomepageData;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.homepage);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading homepage data:", error);
    }

    return defaultHomepageData;
  }

  static saveHomepageData(data: HomepageData): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.homepage, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Error saving homepage data:", error);
      return false;
    }
  }

  static resetHomepageData(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.homepage);
      return true;
    } catch (error) {
      console.error("Error resetting homepage data:", error);
      return false;
    }
  }

  // Utility methods
  static exportData(): string {
    const data = {
      homepage: this.getHomepageData(),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.homepage) {
        this.saveHomepageData(data.homepage);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }
}
