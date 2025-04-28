import React, { useEffect, useState } from "react";
import { Users, Building2, CircleDot, Trophy, Gauge } from "lucide-react";
import Leaderboards from "../common/Leaderboards";
import Loader from "../common/Loader";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setUsers } from "../../store/slices/userSlice";
import { Circle, Tenant } from "../../services/api";
import { User } from "../../types/User";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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

const StatCard: React.FC<StatCardProps & { onClick: () => void }> = ({
  title,
  value,
  icon,
  color,
  backgroundColor,
  onClick,
}) => (
  <div
    className={` ml-2 rounded-xl shadow-md p-6 flex flex-col hover:scale-105 transition-all duration-300 cursor-pointer ${backgroundColor}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4 ">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
    <h3 className="text-gray-50 text-sm font-semibold">{title}</h3>
    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
      {value}
    </p>
  </div>
);

const ModeratorDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading: usersLoading } = useAppSelector((state) => state.users);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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

        const [tenantsRes, circlesRes, challengesRes, usersRes] =
          await Promise.all([
            axios.get<Tenant[]>("http://13.218.202.231:5000/api/tenants", {
              headers,
            }),
            axios.get<Circle[]>("http://13.218.202.231:5000/api/circles", {
              headers,
            }),
            axios.get<{ challenges: Challenge[]; total: number }>(
              "http://13.218.202.231:5000/api/challenges",
              {
                headers,
              }
            ),
            axios.get<User[]>("http://13.218.202.231:5000/api/users", {
              headers,
            }),
          ]);

        dispatch(setUsers(usersRes.data));

        setStats({
          tenants: tenantsRes.data.length,
          circles: circlesRes.data.length,
          challenges: challengesRes.data.total,
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

  const handleStatCardClick = (statType: string) => {
    navigate(`/moderator/${statType}`);
    console.log(`Navigating to ${statType} tab`);
  };

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
      backgroundColor: "bg-gradient-to-r from-sky-400 to-sky-700 ",
      onClick: () => handleStatCardClick("tenants"),
    },
    {
      title: "Active Circles",
      value: stats.circles,
      icon: <CircleDot size={24} className="text-white" />,
      color: "bg-purple-800",
      backgroundColor: "bg-gradient-to-r from-violet-400 to-violet-700",
      onClick: () => handleStatCardClick("circles"),
    },
    {
      title: "Active Challenges",
      value: stats.challenges,
      icon: <Trophy size={24} className="text-white" />,
      color: "bg-yellow-400",
      backgroundColor: "bg-gradient-to-r from-amber-400 to-amber-700",
      onClick: () => handleStatCardClick("challenges"),
    },
    {
      title: "Total Users",
      value: stats.users,
      icon: <Users size={24} className="text-white" />,
      color: "bg-green-900",
      backgroundColor: "bg-gradient-to-r from-emerald-400 to-emerald-700",
      onClick: () => handleStatCardClick("users"),
    },
  ];

  const dashboardVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: index * 0.1, duration: 0.3, ease: "easeOut" },
    }),
  };

  const leaderboardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut", delay: 0.6 },
    },
  };

  return (
    <motion.div
      className="space-y-8 mt-6 ml-2"
      initial="hidden"
      animate="visible"
      variants={dashboardVariants}
    >
      <motion.h2
        className="text-2xl font-bold p-2 ml-3 flex items-center text-gray-800 dark:text-gray-100"
        variants={dashboardVariants}
      >
        <Gauge className="w-6 h-6 mr-2" />
        Moderator Dashboard
      </motion.h2>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
      >
        {statCards.map((stat, index) => (
          <motion.div key={index} custom={index} variants={cardVariants}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={leaderboardVariants}
        className="mr-2 mb-2"
      >
        <Leaderboards />
      </motion.div>
    </motion.div>
  );
};

export default ModeratorDashboard;
