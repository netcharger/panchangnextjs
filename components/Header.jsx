"use client";

import { useState, useEffect } from "react";
import { FaBars, FaTimes, FaHome, FaCalendarAlt, FaThList, FaImages, FaMusic, FaUser, FaPalette, FaSearch, FaBell } from "react-icons/fa";
import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { Dhurjati } from "next/font/google";

const dhurjati = Dhurjati({
  subsets: ["telugu"],
  weight: "400",
});

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const menuItems = [
    { icon: FaHome, label: "Home", path: "/" },
    { icon: FaCalendarAlt, label: "Calendar", path: "/calendar" },
    { icon: FaThList, label: "Categories", path: "/categories" },
    { icon: FaImages, label: "Wallpapers", path: "/wallpapers" },
    { icon: FaMusic, label: "Music", path: "/music" },
    { icon: FaUser, label: "Profile & Settings", path: "/settings" },
  ];

  const isActive = (path) => {
    if (path === "/" && pathname === "/") return true;
    return pathname?.startsWith(path) && path !== "/";
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 shadow-md"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          backgroundColor: '#FF9933', // Saffron color
          height: 'calc(3.5rem + env(safe-area-inset-top))'
        }}
      >
        <div className="w-full max-w-[420px] mx-auto h-full">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMenu}
                className="text-white p-2 active:opacity-70 transition-opacity duration-200 flex items-center justify-center"
                aria-label="Toggle menu"
              >
                {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
              <Link href="/" onClick={closeMenu} className="flex items-center">
                <div className="w-8 h-8 rounded-sm flex items-center justify-center">
                  <span className="text-saffron-700 text-xs font-bold"><img src="logo-icon.png" alt="Logo" className="w-full h-full object-contain" /> </span>

                </div>
                <h2 className={`${dhurjati.className} text-saffron-700 ml-2 text-2xl font-bold`}>
                స్వస్తిక్ పంచాంగం
                </h2>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="text-white p-2 active:opacity-70 transition-opacity duration-200 flex items-center justify-center"
                aria-label="Themes"
              >
                <FaPalette size={20} />
              </button>
              <button
                className="text-white p-2 active:opacity-70 transition-opacity duration-200 flex items-center justify-center"
                aria-label="Search"
              >
                <FaSearch size={20} />
              </button>
              <button
                className="text-white p-2 active:opacity-70 transition-opacity duration-200 flex items-center justify-center relative"
                aria-label="Notifications"
              >
                <FaBell size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={closeMenu}
        ></div>
      )}

      <div
        className={clsx(
          "fixed top-0 left-0 h-full w-[280px] bg-gradient-to-br from-saffron-50 to-indigo-50 shadow-2xl z-50 transition-transform duration-300 ease-out transform",
          menuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-saffron-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-saffron-400 to-saffron-500 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">प</span>
              </div>
              <div>
                <h2 className={`${dhurjati.className} text-xl font-bold text-indigo-700`}>
                స్వస్తిక్
                </h2>
                <p className={`${dhurjati.className} text-xs text-indigo-500`}>పంచాంగం</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={closeMenu}
                    prefetch={true}
                    className={clsx(
                      "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                      active
                        ? "bg-gradient-to-r from-saffron-100 to-indigo-100 border border-saffron-300"
                        : "hover:bg-indigo-50 border border-transparent"
                    )}
                  >
                    <div
                      className={clsx(
                        "p-2 rounded-lg transition-all duration-200",
                        active
                          ? "bg-gradient-to-br from-saffron-400 to-saffron-500 text-white shadow-md"
                          : "bg-gradient-to-br from-indigo-50 to-saffron-50 text-indigo-600 group-hover:from-indigo-100 group-hover:to-saffron-100"
                      )}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      className={clsx(
                        "font-medium flex-1",
                        active
                          ? "text-saffron-700 font-semibold"
                          : "text-indigo-700 group-hover:text-indigo-900"
                      )}
                    >
                      {item.label}
                    </span>
                    {active && (
                      <div className="w-2 h-2 rounded-full bg-saffron-500"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-saffron-200">
            <div className="text-center">
              <p className="text-xs text-indigo-500">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


