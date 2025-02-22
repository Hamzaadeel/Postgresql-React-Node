import React, { useEffect, useState } from "react";
import { Users, Building2, CircleDot, Trophy, Gauge } from "lucide-react";
import Leaderboards from "../common/Leaderboards";
import Loader from "../common/Loader";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setUsers } from "../../store/slices/userSlice";
import { Circle, Tenant } from "../../services/api";
import { User } from "../../types/User";
import axios from "axios";

interface Challenge {
  id: number;
  title: string;
  description: string;
  circleId: number;
  points: number;
  createdBy: number;
  createdAt: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  backgroundColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  backgroundColor,
}) => (
  <div
    className={` ml-2 rounded-xl shadow-md p-6 flex flex-col hover:scale-105 transition-all duration-300 cursor-pointer ${backgroundColor}`}
  >
    <div className="flex items-center justify-between mb-4 ">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
  </div>
);

const ModeratorDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading: usersLoading } = useAppSelector((state) => state.users);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    tenants: 0,
    circles: 0,
    challenges: 0,
    users: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch all required data in parallel
        const [tenantsRes, circlesRes, challengesRes, usersRes] =
          await Promise.all([
            axios.get<Tenant[]>("http://localhost:5000/api/tenants", {
              headers,
            }),
            axios.get<Circle[]>("http://localhost:5000/api/circles", {
              headers,
            }),
            axios.get<Challenge[]>("http://localhost:5000/api/challenges", {
              headers,
            }),
            axios.get<User[]>("http://localhost:5000/api/users", { headers }),
          ]);

        // Update Redux store with users
        dispatch(setUsers(usersRes.data));

        setStats({
          tenants: tenantsRes.data.length,
          circles: circlesRes.data.length,
          challenges: challengesRes.data.length,
          users: usersRes.data.length,
        });
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Error fetching dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dispatch]);

  if (loading || usersLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Tenants",
      value: stats.tenants,
      icon: <Building2 size={24} className="text-white" />,
      color: "bg-blue-500",
      backgroundColor: "bg-sky-200",
    },
    {
      title: "Active Circles",
      value: stats.circles,
      icon: <CircleDot size={24} className="text-white" />,
      color: "bg-purple-500",
      backgroundColor: "bg-violet-200",
    },
    {
      title: "Active Challenges",
      value: stats.challenges,
      icon: <Trophy size={24} className="text-white" />,
      color: "bg-yellow-500",
      backgroundColor: "bg-amber-200",
    },
    {
      title: "Total Users",
      value: stats.users,
      icon: <Users size={24} className="text-white" />,
      color: "bg-green-500",
      backgroundColor: "bg-green-100",
    },
  ];

  return (
    <div className="space-y-8 mt-6 ml-2">
      <h2 className="text-2xl font-bold p-2 ml-3 flex items-center">
        <Gauge className="w-6 h-6 mr-2" />
        Moderator Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      <Leaderboards />
    </div>
  );
};

export default ModeratorDashboard;
