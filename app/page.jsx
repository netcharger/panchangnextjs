"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaThList, FaImages, FaMusic, FaSun, FaMoon, FaStar } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { fetchCarouselImages, fetchCategories, fetchLatestWallpapers } from "../lib/api";
import ImageCarousel from "../components/ImageCarousel";
import CategoriesGrid from "../components/CategoriesGrid";
import WallpaperGrid from "../components/WallpaperGrid";
import NextJsSplashImageModal from "../components/NextJsSplashImageModal";
import PopupModal from "../components/PopupModal"; // Added PopupModal import

import { getCurrentGreeting, getCurrentTimeInterval } from "../lib/greetings";
import { Suravaram } from "next/font/google";

const suravaram = Suravaram({
  subsets: ["telugu"],
  weight: "400",
});

import { Noto_Sans_Telugu } from "next/font/google";
const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "500", "700"],
});


import { Mallanna } from "next/font/google";
const mallanna = Mallanna({
  subsets: ["telugu"],
  weight: "400",
});

export default function Home() {
  const [splashImageUrl, setSplashImageUrl] = useState(null);
  const [isSplashModalVisible, setIsSplashModalVisible] = useState(false);
  const [popupImageUrl, setPopupImageUrl] = useState(null);
  const [popupRedirectUrl, setPopupRedirectUrl] = useState(null);
  const [isPopupModalVisible, setIsPopupModalVisible] = useState(false);

  useEffect(() => {
    const fetchSplashImage = async () => {
      try {
        if (typeof window !== 'undefined') { // Ensure localStorage is available
          const lastSplashShownTimestamp = localStorage.getItem('lastSplashShownTimestamp');
          const currentTime = Date.now();
          const threeHoursInMillis = 3 * 60 * 60 * 1000; // Default to 3 hours
          const popupTimeFromEnv = process.env.NEXT_PUBLIC_POPUP_TIME ? parseInt(process.env.NEXT_PUBLIC_POPUP_TIME) : NaN;
          const popupIntervalInMillis = !isNaN(popupTimeFromEnv) ? popupTimeFromEnv * 60 * 60 * 1000 : threeHoursInMillis;

          // Fetch splash image logic
          if (!lastSplashShownTimestamp || (currentTime - parseInt(lastSplashShownTimestamp) > threeHoursInMillis)) {
            const response = await fetch('http://192.168.1.2:8000/api/mobile-settings/site-settings/splash1/');
            const data = await response.json();
            if (data.is_active && data.value && data.value.image_value) {
              setSplashImageUrl(data.value.image_value);
              setIsSplashModalVisible(true);
              localStorage.setItem('lastSplashShownTimestamp', currentTime.toString());
            }
          }

          // Fetch popup image logic
          const lastPopupShownTimestamp = localStorage.getItem('lastPopupShownTimestamp');
          if (!lastPopupShownTimestamp || (currentTime - parseInt(lastPopupShownTimestamp) > popupIntervalInMillis)) {
            const popupResponse = await fetch('http://192.168.1.2:8000/api/mobile-settings/site-settings/popup/');
            const popupData = await popupResponse.json();

            if (popupData.is_active && popupData.value && popupData.value.image_value && popupData.value.url_value) {
              setPopupImageUrl(popupData.value.image_value);
              setPopupRedirectUrl(popupData.value.url_value);
              setIsPopupModalVisible(true);
              localStorage.setItem('lastPopupShownTimestamp', currentTime.toString());
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data or manage timestamp:', error);
      }
    };

    fetchSplashImage();

    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setToday(now);
      setDayName(now.toLocaleDateString('en-US', { weekday: 'long' }));
      setMonthName(now.toLocaleDateString('en-US', { month: 'long' }));
      setGreeting(getCurrentGreeting('te')); // Use Telugu
      setTimeInterval(getCurrentTimeInterval('te')); // Use Telugu
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };

    updateTime();
    // Update every minute to refresh greeting if needed
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch carousel images from Django API
  const { data: carouselImages = [], isLoading: carouselLoading, error: carouselError } = useQuery({
    queryKey: ["carousel"],
    queryFn: fetchCarouselImages,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch categories from Django API
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch latest wallpapers from Django API
  const { data: latestWallpapers = [], isLoading: wallpapersLoading } = useQuery({
    queryKey: ["latest-wallpapers"],
    queryFn: () => fetchLatestWallpapers(10), // Fetch 10 latest wallpapers
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });


  // Fix hydration error by using client-side state for time-dependent content
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState({ text: "శుభోదయం", key: "good_morning" });
  const [timeInterval, setTimeInterval] = useState({ label: "ఉదయం సమయం", key: "morning" });
  const [timeStr, setTimeStr] = useState("");

  const [today, setToday] = useState(new Date());
  const [dayName, setDayName] = useState("");
  const [monthName, setMonthName] = useState("");

  // Telugu day and month names
  const teluguDays = {
    "Sunday": "ఆదివారము",
    "Monday": "సోమవారము",
    "Tuesday": "మంగళవారము",
    "Wednesday": "బుధవారము",
    "Thursday": "గురువారము",
    "Friday": "శుక్రవారము",
    "Saturday": "శనివారము"
  };

  const teluguMonths = {
    "January": "జనవరి",
    "February": "ఫిబ్రవరి",
    "March": "మార్చి",
    "April": "ఏప్రిల్",
    "May": "మే",
    "June": "జూన్",
    "July": "జూలై",
    "August": "ఆగస్టు",
    "September": "సెప్టెంబర్",
    "October": "అక్టోబర్",
    "November": "నవంబర్",
    "December": "డిసెంబర్"
  };

  const teluguDay = dayName ? (teluguDays[dayName] || dayName) : "";
  const teluguMonth = monthName ? (teluguMonths[monthName] || monthName) : "";

  // Get today's date string for panchangam
  const todayDateStr = mounted && today ? today.toISOString().split('T')[0] : "";

  // Router for navigation
  const router = useRouter();

  // Function to navigate to today's panchangam
  const handleViewTodayPanchangam = () => {
    router.push(`/day/${todayDateStr}`);
  };

  const quickLinks = [
    {
      icon: FaCalendarAlt,
      title: "Calendar",
      description: "View monthly calendar",
      href: "/calendar",
      gradient: "from-blue-400 to-blue-600"
    },
    {
      icon: FaThList,
      title: "Categories",
      description: "Explore categories",
      href: "/categories",
      gradient: "from-purple-400 to-purple-600"
    },
    {
      icon: FaImages,
      title: "Wallpapers",
      description: "Beautiful wallpapers",
      href: "/wallpapers",
      gradient: "from-pink-400 to-pink-600"
    },
    {
      icon: FaMusic,
      title: "Music",
      description: "Devotional music",
      href: "/music",
      gradient: "from-orange-400 to-orange-600"
    }
  ];

  return (
    <div className="animate-fade-in pb-8">
      {splashImageUrl && (
        <NextJsSplashImageModal
          imageUrl={splashImageUrl}
          isVisible={isSplashModalVisible}
          onClose={() => setIsSplashModalVisible(false)}
        />
      )}

      {popupImageUrl && (
        <PopupModal
          imageUrl={popupImageUrl}
          redirectUrl={popupRedirectUrl}
          isVisible={isPopupModalVisible}
          onClose={() => setIsPopupModalVisible(false)}
        />
      )}

      {/* Image Carousel - At the top */}
      {carouselLoading ? (
        <div className="glass   p-8 mb-6 shadow-soft border border-white/50 flex items-center justify-center min-h-[200px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin"></div>
            <p className="text-sm text-indigo-500">Loading carousel...</p>
          </div>
        </div>
      ) : carouselError ? (
        <div className="glass rounded-2xl p-4 mb-6 shadow-soft border border-red-200 bg-red-50">
          <p className="text-sm text-red-600">Error loading carousel: {carouselError.message}</p>
        </div>
      ) : carouselImages.length > 0 ? (
        <ImageCarousel images={carouselImages} autoPlay={true} interval={5000} />
      ) : (
        <div className="glass rounded-2xl p-4 mb-6 shadow-soft border border-yellow-200 bg-yellow-50">
          <p className="text-sm text-yellow-600">No carousel images found</p>
        </div>
      )}

      {/* Hero Section - Today's Date */}
      <div className={`${notoSansTelugu.className} glass rounded-3xl p-8 mb-6 shadow-soft border border-white/50 relative overflow-hidden`}>

        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-saffron-400/20 via-indigo-400/20 to-purple-400/20 opacity-50"></div>

        <div className="relative z-10">
          {/* Greeting */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-saffron-400 to-saffron-500 flex items-center justify-center shadow-lg">
              <FaSun className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-indigo-700">
                {mounted ? greeting.text : "శుభోదయం"}
              </h2>
              <p className="text-sm text-indigo-500">
                {mounted ? `పంచాంగంలోకి స్వాగతం • ${timeInterval.label}` : "పంచాంగంలోకి స్వాగతం"}
              </p>
            </div>
          </div>
          {/* Today's Date Card */}
          <div className="bg-gradient-to-br from-saffron-400 to-saffron-500 rounded-2xl p-6 shadow-lg mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">{mounted ? teluguDay : ""}</p>
                <h1 className="text-3xl font-bold text-white mb-1">{mounted && today ? today.getDate() : "--"}</h1>
                <p className="text-white/90 text-sm">{mounted ? `${teluguMonth} ${today ? today.getFullYear() : ""}` : ""}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <FaMoon className="text-white/80" size={16} />
                  <span className="text-white/80 text-sm">{mounted ? timeStr : "--:--"}</span>
                </div>
                <div className="flex gap-1">
                  <FaStar className="text-yellow-300" size={14} />
                  <FaStar className="text-yellow-300" size={14} />
                  <FaStar className="text-yellow-300" size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Today's Panchangam Button */}
          <button
            onClick={handleViewTodayPanchangam}
            className="w-full bg-white/90 hover:bg-white text-indigo-700 font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 mb-4"
          >

            <span className="text-lg">🕉️ </span>
            <span className={`${mallanna.className} font-bold text-xl`}>
  ఈరోజు పూర్తి పంచాంగం
</span>

          </button>

          {/* Calendar Link Button */}
          <Link href="/calendar">
            <button className="w-full bg-white/90 hover:bg-white text-indigo-700 font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg active:scale-98 transition-all duration-200 flex items-center justify-center gap-2">
            <span className="text-lg">📅 </span>
            <span className={`${mallanna.className} font-bold text-xl`}>
  మాస పంచాంగం </span>
            </button>
          </Link>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-indigo-700 mb-4 px-1">Quick Access</h3>
        <div className="grid grid-cols-2 gap-4">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={index}
                href={link.href}
                className="glass rounded-2xl p-5 shadow-soft border border-white/50 hover:shadow-lg active:scale-95 transition-all duration-200 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="text-white" size={20} />
                </div>
                <h4 className="text-base font-semibold text-indigo-700 mb-1">{link.title}</h4>
                <p className="text-xs text-indigo-500">{link.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Categories Section */}
      {categoriesLoading ? (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-indigo-700 mb-4 px-1">Categories</h3>
          <div className="glass rounded-2xl p-8 shadow-soft flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin"></div>
              <p className="text-sm text-indigo-500">Loading categories...</p>
            </div>
          </div>
        </div>
      ) : mounted && categories.length > 0 ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-indigo-700">Categories</h3>
            <Link
              href="/categories"
              className="text-sm text-saffron-600 hover:text-saffron-700 font-medium"
            >
              View All
            </Link>
          </div>
          <CategoriesGrid categories={categories} limit={5} />
        </div>
      ) : null}

      {/* Latest Wallpapers Section */}
      {wallpapersLoading ? (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-indigo-700 mb-4 px-1">Latest Wallpapers</h3>
          <div className="glass rounded-2xl p-8 shadow-soft flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin"></div>
              <p className="text-sm text-indigo-500">Loading wallpapers...</p>
            </div>
          </div>
        </div>
      ) : mounted && latestWallpapers.length > 0 ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-indigo-700">Latest Wallpapers</h3>
            <Link
              href="/wallpapers"
              className="text-sm text-saffron-600 hover:text-saffron-700 font-medium"
            >
              View All
            </Link>
          </div>
          <WallpaperGrid wallpapers={latestWallpapers} masonry={true} />


        </div>
      ) : null}

      {/* Today's Highlights */}
      <div className="glass rounded-2xl p-6 shadow-soft border border-white/50">
        <h3 className="text-lg font-bold text-indigo-700 mb-4">Today's Highlights</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-saffron-50 to-indigo-50 border border-saffron-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron-400 to-saffron-500 flex items-center justify-center flex-shrink-0">
              <FaStar className="text-white" size={14} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-indigo-700">Auspicious Day</p>
              <p className="text-xs text-indigo-500 mt-0.5">Today is a blessed day</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <FaMoon className="text-white" size={14} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-indigo-700">Panchangam</p>
              <p className="text-xs text-indigo-500 mt-0.5">Check today's details</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

