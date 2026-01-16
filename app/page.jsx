"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaThList, FaImages, FaHandsHelping, FaSun, FaMoon, FaStar } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { fetchCarouselImages, fetchCategories, fetchLatestWallpapers } from "../lib/api.js";
import ImageCarousel from "../components/ImageCarousel";
import CategoriesGrid from "../components/CategoriesGrid";
import WallpaperGrid from "../components/WallpaperGrid";
import NextJsSplashImageModal from "../components/NextJsSplashImageModal";
import PopupModal from "../components/PopupModal"; // Added PopupModal import

import getBaseURL    from "../lib/getBaseURL.js";
import { getCurrentGreeting, getCurrentTimeInterval } from "../lib/greetings.js";
import { gowriData } from "../data/gauriPanchangamData";
import { gowriValuesInfo } from "../data/gauriPanchangInfo";
import AshtaSiddhantaWidget from "../components/AshtaSiddhantaWidget";
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

  // Fix hydration error by using client-side state for time-dependent content
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState({ text: "శుభోదయం", key: "good_morning" });
  const [timeInterval, setTimeInterval] = useState({ label: "ఉదయం సమయం", key: "morning" });
  const [timeStr, setTimeStr] = useState("");

  const [today, setToday] = useState(null);
  const [dayName, setDayName] = useState("");
  const [monthName, setMonthName] = useState("");
  const [currentGowriStatus, setCurrentGowriStatus] = useState(null);

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
            const response = await fetch(`${getBaseURL()}/api/mobile-settings/site-settings/splash1/`);
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
            const popupResponse = await fetch(`${getBaseURL()}/api/mobile-settings/site-settings/popup/`);
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

  // Handle back button for modals
  useEffect(() => {
    const handlePopState = () => {
      if (isSplashModalVisible) setIsSplashModalVisible(false);
      if (isPopupModalVisible) setIsPopupModalVisible(false);
    };

    if (isSplashModalVisible || isPopupModalVisible) {
      window.history.pushState({ modalOpen: true }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isSplashModalVisible, isPopupModalVisible]);

  // Calculate Gauri Panchangam Status
  useEffect(() => {
    if (!mounted) return;
    
    const checkGowriStatus = () => {
       const now = new Date();
       const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
       const dayKey = days[now.getDay()];
       const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
       
       const slot = gowriData.find(s => {
          if (s.end === "00:00") return timeStr >= s.start;
          if (s.start === "00:00") return timeStr >= s.start && timeStr < s.end;
          return timeStr >= s.start && timeStr < s.end;
       });

       if (slot) {
           const status = slot[dayKey];
           const info = gowriValuesInfo[status];
           setCurrentGowriStatus({ name: status, ...info });
       }
    };

    checkGowriStatus();
    const timer = setInterval(checkGowriStatus, 60000);
    return () => clearInterval(timer);
  }, [mounted]);

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
      icon: FaHandsHelping,
      title: "Services",
      description: "Muhurthaalu services",
      href: "/online-muhurthalu",
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
      <div className="mb-6">
        {carouselLoading ? (
          <div className="glass p-8 shadow-soft border border-white/50 flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin"></div>
              <p className="text-sm text-indigo-500">Loading carousel...</p>
            </div>
          </div>
        ) : carouselError ? (
          <div className="glass rounded-2xl p-4 shadow-soft border border-red-200 bg-red-50">
            <p className="text-sm text-red-600">Error loading carousel: {carouselError.message}</p>
          </div>
        ) : carouselImages.length > 0 ? (
          <ImageCarousel images={carouselImages} autoPlay={true} interval={5000} />
        ) : (
          <div className="glass rounded-2xl p-4 shadow-soft border border-yellow-200 bg-yellow-50">
            <p className="text-sm text-yellow-600">No carousel images found</p>
          </div>
        )}
      </div>

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
                <p className="text-white/80 text-sm font-medium mb-1">{mounted && teluguDay ? teluguDay : "\u00A0"}</p>
                <h1 className="text-3xl font-bold text-white mb-1">{mounted && today ? today.getDate() : "--"}</h1>
                <p className="text-white/90 text-sm">{mounted && teluguMonth && today ? `${teluguMonth} ${today.getFullYear()}` : "\u00A0"}</p>
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
      {/* Gauri Panchangam Widget */}
      {mounted && currentGowriStatus && (
        <div className="mb-6">
           <Link href="/gauri-panchangam">
            <div className="glass rounded-2xl p-6 shadow-soft border border-white/50 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-orange-100 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-between">
                <img src={"/images/gowri-devi.png"} alt="Gauri Panchangam" className="w-16 h-16 object-cover rounded-full shadow-md border-2 border-white" />
                    <div>
                        <h3 className="text-lg font-bold text-orange-900 mb-1">గౌరీ పంచాంగం ప్రకారం</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-orange-700"> ఇప్పుడు నడుస్తున్న కాలం</span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase border bg-white"
                                  style={{ 
                                      color: currentGowriStatus.color || '#ea580c',
                                      borderColor: currentGowriStatus.color || '#ea580c'
                                  }}>
                                {currentGowriStatus.name}
                            </span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-orange-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>
            </div>
           </Link>
      </div>
      )}

      {/* Ashta Siddhanta Widget */}
      <div className="mb-6">
        <AshtaSiddhantaWidget />
      </div>


      {/* Categories Section */}
      <div className="mb-6" suppressHydrationWarning>
        {categoriesLoading ? (
          <>
            <h3 className="text-lg font-bold text-indigo-700 mb-4 px-1">Categories</h3>
            <div className="glass rounded-2xl p-8 shadow-soft flex items-center justify-center min-h-[200px]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin"></div>
                <p className="text-sm text-indigo-500">Loading categories...</p>
              </div>
            </div>
          </>
        ) : mounted && categories.length > 0 ? (
          <>
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
          </>
        ) : null}
      </div>

      {/* Latest Wallpapers Section */}
      <div className="mb-6" suppressHydrationWarning>
        {wallpapersLoading ? (
          <>
            <h3 className="text-lg font-bold text-indigo-700 mb-4 px-1">Latest Wallpapers</h3>
            <div className="glass rounded-2xl p-8 shadow-soft flex items-center justify-center min-h-[200px]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin"></div>
                <p className="text-sm text-indigo-500">Loading wallpapers...</p>
              </div>
            </div>
          </>
        ) : mounted && latestWallpapers.length > 0 ? (
          <>
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
          </>
        ) : null}
      </div>



    </div>
  );
}
