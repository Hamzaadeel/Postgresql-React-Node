import React from "react";
import {
  Users,
  Building2,
  CircleDot,
  Trophy,
  TrendingUp,
  Award,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color,
}) => (
  <div className="bg-white ml-2 rounded-xl shadow-md p-6 flex flex-col hover:scale-105 transition-all duration-300 cursor-pointer">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div
        className={`flex items-center space-x-1 ${
          trend >= 0 ? "text-green-500" : "text-red-500"
        }`}
      >
        <TrendingUp size={16} className={trend < 0 ? "rotate-180" : ""} />
        <span className="text-sm font-medium">{Math.abs(trend)}%</span>
      </div>
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
  </div>
);

const ModeratorDashboard: React.FC = () => {
  // Dummy data for statistics
  const stats = [
    {
      title: "Active Tenants",
      value: 48,
      icon: <Building2 size={24} className="text-white" />,
      trend: 12,
      color: "bg-blue-500",
    },
    {
      title: "Active Circles",
      value: 32,
      icon: <CircleDot size={24} className="text-white" />,
      trend: 8,
      color: "bg-purple-500",
    },
    {
      title: "Active Challenges",
      value: 15,
      icon: <Trophy size={24} className="text-white" />,
      trend: -5,
      color: "bg-yellow-500",
    },
    {
      title: "Total Users",
      value: 156,
      icon: <Users size={24} className="text-white" />,
      trend: 24,
      color: "bg-green-500",
    },
  ];

  // Dummy data for employee leaderboard
  const topEmployees = [
    {
      id: 1,
      name: "Sarah Johnson",
      points: 2840,
      department: "Engineering",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      name: "Michael Chen",
      points: 2560,
      department: "Design",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      points: 2290,
      department: "Product",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    {
      id: 4,
      name: "David Kim",
      points: 2150,
      department: "Engineering",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    {
      id: 5,
      name: "Lisa Wang",
      points: 1980,
      department: "Marketing",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    },
  ];

  return (
    <div className="space-y-8 mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white ml-2 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Employee Leaderboard
          </h2>
          <Award size={24} className="text-amber-500" />
        </div>
        <div className="space-y-4">
          {topEmployees.map((employee, index) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-10 h-10">
                  <img
                    src={employee.avatar}
                    alt={employee.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{employee.name}</p>
                  <p className="text-sm text-gray-500">{employee.department}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    {employee.points.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">points</p>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-600"
                      : index === 1
                      ? "bg-gray-100 text-gray-600"
                      : index === 2
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
