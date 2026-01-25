"use client";

import Link from "next/link";
import { FaCalendarAlt, FaSun, FaNewspaper, FaImages, FaHandsHelping, FaStar, FaInfoCircle } from "react-icons/fa";
import { Suravaram, Mallanna } from "next/font/google";

const suravaram = Suravaram({
  subsets: ["telugu"],
  weight: "400",
});

const mallanna = Mallanna({
  subsets: ["telugu"],
  weight: "400",
});

export default function AboutPage() {
  const features = [
    {
      icon: FaCalendarAlt,
      title: "Daily Panchangam",
      description: "Get accurate daily astrological details including Tithi, Nakshatra, Yoga, Karana, Rahu Kalam, Yamagandam, and Gulika Kalam. Plan your day effectively with precise timings.",
      gradient: "from-blue-400 to-blue-600"
    },
    {
      icon: FaSun,
      title: "Gauri Panchangam",
      description: "Consult the traditional Gauri Panchangam to identify the most auspicious times during the day for starting new ventures, travel, or important activities.",
      gradient: "from-orange-400 to-orange-600"
    },
    {
      icon: FaStar,
      title: "Ashta Siddhanta Panchangam",
      description: "Access detailed planetary positions and astrological data based on the renowned Ashta Siddhanta system for deeper insights.",
      gradient: "from-purple-400 to-purple-600"
    },
    {
      icon: FaNewspaper,
      title: "Spiritual Blog",
      description: "Read insightful articles exploring the significance of festivals, rituals, ancient traditions, and Hindu dharma to enrich your spiritual knowledge.",
      gradient: "from-green-400 to-green-600"
    },
     {
      icon: FaImages,
      title: "Devotional Wallpapers",
      description: "Download high-quality, divine wallpapers of deities to bring positive energy and spiritual vibes to your mobile and desktop screens.",
      gradient: "from-pink-400 to-pink-600"
    },
    {
      icon: FaHandsHelping,
      title: "Online Muhurtham Services",
      description: "Connect with expert astrologers to find the perfect Muhurtham for weddings, housewarmings, naming ceremonies, and other life milestones.",
      gradient: "from-yellow-400 to-yellow-600"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 pb-24 animate-fade-in">
      {/* Hero Section */}
      <div className="glass rounded-3xl p-8 mb-8 shadow-soft border border-white/50 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 leading-relaxed via-white to-saffron-50 opacity-80"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-saffron-400 to-saffron-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
             <FaInfoCircle className="text-white text-4xl" />
          </div>
          <h1 className={`text-4xl font-bold text-indigo-900 mb-4 ${suravaram.className}`}>
            About Swasthik Panchangam
          </h1>
          <p className="text-lg text-indigo-700/80 mb-6 leading-relaxed">
            Your comprehensive digital guide to Hindu Vedic astrology. We bring ancient wisdom to the modern world, helping you align your life with cosmic rhythms.
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-saffron-400 to-indigo-400 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Vision & Mission */}
       <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="glass rounded-2xl p-8 shadow-md border border-white/60 bg-gradient-to-br from-indigo-50/50 to-white/50">
            <h2 className={`text-2xl font-bold text-indigo-800 mb-4 ${mallanna.className}`}>Our Mission</h2>
            <p className="text-indigo-900/70 leading-relaxed">
                To preserve and promote the rich heritage of Vedic astrology by providing accessible, accurate, and easy-to-understand Panchangam data to everyone, everywhere.
            </p>
        </div>
        <div className="glass rounded-2xl p-8 shadow-md border border-white/60 bg-gradient-to-br from-saffron-50/50 to-white/50">
             <h2 className={`text-2xl font-bold text-saffron-800 mb-4 ${mallanna.className}`}>Our Values</h2>
             <p className="text-saffron-900/70 leading-relaxed">
                Authenticity, Accuracy, and Tradition. We strive to deliver calculations that honor the ancient scripts while offering a user-friendly experience for the modern devotee.
             </p>
        </div>
      </div>


      {/* Features Grid */}
      <h2 className={`text-3xl font-bold text-center text-indigo-900 mb-8 ${suravaram.className}`}>
        What We Offer
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div 
              key={index} 
              className="glass rounded-2xl p-6 shadow-sm hover:shadow-xl border border-white/50 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-indigo-700 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Closing / Contact */}
      <div className="mt-12 text-center">
         <p className="text-indigo-400 text-sm">
            © {new Date().getFullYear()} Swasthik Panchangam. All rights reserved.
         </p>
      </div>
    </div>
  );
}
