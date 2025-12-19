"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaCalendarAlt, FaThList, FaImages, FaMusic, FaBell } from "react-icons/fa";
import clsx from "clsx";

export default function Footer() {
  const pathname = usePathname();

  const menuItems = [

    { icon: FaCalendarAlt, label: "Calendar", path: "/calendar" },
    { icon: FaThList, label: "Categories", path: "/categories" },
    { icon: FaImages, label: "Wallpapers", path: "/wallpapers" },
    { icon: FaMusic, label: "Music", path: "/music" },
    { icon: FaBell, label: "Alarms", path: "/my-alarms" },
  ];

  const isActive = (path) => {
    if (path === "/" && pathname === "/") return true;
    return pathname?.startsWith(path) && path !== "/";
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex justify-center z-50 shadow-lg"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundColor: '#3D9970' // Emerald Green
      }}
    >
      <div className="w-full max-w-[420px]">
        <div className="flex items-center justify-around px-2 py-2 h-16">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 px-2 py-1 transition-all duration-200 relative group",
                  "min-w-[60px] z-0",
                  active ? "text-yellow-200" : "text-emerald-100 hover:text-yellow-100"
                )}
              >
                <div className={clsx(
                  "transition-all duration-200",
                  active
                    ? "opacity-100 scale-110"
                    : "opacity-80 group-hover:opacity-100 group-hover:scale-105"
                )}>
                  <Icon size={22} />
                </div>
                <span className={clsx(
                  "text-xs transition-all duration-200",
                  active
                    ? "font-semibold text-yellow-200"
                    : "font-medium text-emerald-50"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}














