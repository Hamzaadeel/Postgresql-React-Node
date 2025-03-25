import { useState, useEffect } from "react";

interface ClockProps {
  userRole: "Employee" | "Moderator";
}

const Clock: React.FC<ClockProps> = ({ userRole }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    return time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = () => {
    return time.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className={` text-center mx-1 mb-2 p-2 rounded-lg relative w-auto text-black dark:text-white hover:shadow-lg ${
        userRole === "Employee"
          ? "bg-gradient-to-br from-cyan-300 to-cyan-500 dark:bg-gradient-to-br dark:from-blue-900 dark:to-blue-950"
          : "bg-gradient-to-br from-emerald-300 to-emerald-500 dark:bg-gradient-to-br dark:from-emerald-900 dark:to-emerald-950"
      }`}
    >
      <p className="text-lg font-bold dark:text-gray-100">{formatTime()}</p>
      <p className="text-xs opacity-80 mt-1 dark:text-gray-200">
        {formatDate()}
      </p>
    </div>
  );
};

export default Clock;
