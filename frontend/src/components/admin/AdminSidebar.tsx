"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";
import {
  FiUsers,
  FiTruck,
  FiMapPin,
  FiAlertTriangle,
  FiHome,
  FiBox,
  FiUsers as FiTeam,
  FiSettings,
} from "react-icons/fi";

interface NavItem {
  name: string;
  href: string;
  icon: IconType;
}

const navItems: NavItem[] = [
  { name: "Overview", href: "/admin", icon: FiHome },
  { name: "Users", href: "/admin/users", icon: FiUsers },
  { name: "Teams", href: "/admin/teams", icon: FiTeam },
  { name: "Vehicles", href: "/admin/vehicles", icon: FiTruck },
  { name: "Stations", href: "/admin/stations", icon: FiMapPin },
  { name: "Equipment", href: "/admin/equipment", icon: FiBox },
  { name: "Interventions", href: "/admin/interventions", icon: FiAlertTriangle },
  { name: "Settings", href: "/admin/settings", icon: FiSettings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-center h-16 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
