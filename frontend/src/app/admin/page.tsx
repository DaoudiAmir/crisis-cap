"use client";

import { useEffect, useState } from "react";
import { FiUsers, FiTruck, FiMapPin, FiAlertTriangle } from "react-icons/fi";

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    vehicles: 0,
    stations: 0,
    activeInterventions: 0,
  });

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const [users, vehicles, stations, interventions] = await Promise.all([
          fetch("/api/users/count").then((res) => res.json()),
          fetch("/api/vehicles/count").then((res) => res.json()),
          fetch("/api/stations/count").then((res) => res.json()),
          fetch("/api/interventions/active/count").then((res) => res.json()),
        ]);

        setStats({
          users: users.count,
          vehicles: vehicles.count,
          stations: stations.count,
          activeInterventions: interventions.count,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statCards: StatCard[] = [
    {
      title: "Total Users",
      value: stats.users,
      icon: <FiUsers className="w-8 h-8" />,
      color: "bg-blue-500",
    },
    {
      title: "Total Vehicles",
      value: stats.vehicles,
      icon: <FiTruck className="w-8 h-8" />,
      color: "bg-green-500",
    },
    {
      title: "Total Stations",
      value: stats.stations,
      icon: <FiMapPin className="w-8 h-8" />,
      color: "bg-yellow-500",
    },
    {
      title: "Active Interventions",
      value: stats.activeInterventions,
      icon: <FiAlertTriangle className="w-8 h-8" />,
      color: "bg-red-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 flex items-center"
          >
            <div className={`${card.color} p-4 rounded-lg text-white mr-4`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
              <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          {/* Add activity feed component here */}
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
          {/* Add system status component here */}
        </div>
      </div>
    </div>
  );
}
