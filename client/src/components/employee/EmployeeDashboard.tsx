import { Bell, Gauge, Trophy, Users, Clock, ArrowRight } from "lucide-react";

const EmployeeDashboard = () => {
  const availableChallenges = [
    {
      id: 1,
      title: "Code Review Sprint",
      description: "Review and improve code quality across the platform",
      points: 500,
      deadline: "2024-03-25",
      participants: 12,
      difficulty: "Medium",
    },
    {
      id: 2,
      title: "UI Enhancement Challenge",
      description: "Improve user interface components for better accessibility",
      points: 750,
      deadline: "2024-03-30",
      participants: 8,
      difficulty: "Hard",
    },
    {
      id: 3,
      title: "Documentation Drive",
      description:
        "Update and improve project documentation before next quarter",
      points: 300,
      deadline: "2024-03-20",
      participants: 15,
      difficulty: "Easy",
    },
  ];

  // Dummy data for circle leaderboard
  const circleLeaderboard = [
    {
      id: 1,
      name: "Sarah Johnson",
      points: 1840,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      name: "Michael Chen",
      points: 1560,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      points: 1290,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
  ];

  // Dummy data for circle updates
  const circleUpdates = [
    {
      id: 1,
      type: "join",
      user: "Alex Kim",
      circle: "Frontend Circle",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "achievement",
      user: "Maria Garcia",
      circle: "Design Circle",
      achievement: "UI Master Badge",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "challenge",
      user: "John Smith",
      circle: "Backend Circle",
      challenge: "API Performance Sprint",
      time: "1 day ago",
    },
    {
      id: 4,
      type: "join",
      user: "Lisa Chen",
      circle: "DevOps Circle",
      time: "2 days ago",
    },
  ];

  return (
    <div className="space-y-4 bg-gray-100">
      <h2 className="text-2xl font-bold p-2 pt-6 ml-3 flex items-center">
        <Gauge className="w-6 h-6 mr-2" />
        Employee Dashboard
      </h2>
      {/* Available Challenges Section */}
      <div className=" rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white rounded-lg p-5 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-800">
                  {challenge.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    challenge.difficulty === "Easy"
                      ? "bg-green-100 text-green-700"
                      : challenge.difficulty === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {challenge.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {challenge.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  <span>{challenge.participants} participants</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>Due {challenge.deadline}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-primary font-semibold">
                  {challenge.points} points
                </span>
                <button className="flex items-center text-blue-500 hover:text-blue-600 transition-colors">
                  Join Challenge
                  <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Circle Leaderboard */}
        <div className="bg-white rounded-xl shadow-md p-6 ml-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Circle Leaderboard
            </h2>
            <Trophy size={24} className="text-yellow-500" />
          </div>
          <div className="space-y-4">
            {circleLeaderboard.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-600"
                        : index === 1
                        ? "bg-gray-100 text-gray-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="font-medium text-gray-800">
                    {member.name}
                  </span>
                </div>
                <span className="font-semibold text-primary">
                  {member.points.toLocaleString()} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Circle Updates */}
        <div className="bg-white rounded-xl shadow-md p-6 ml-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Circle Updates</h2>
            <Bell size={24} className="text-secondary" />
          </div>
          <div className="space-y-4">
            {circleUpdates.map((update) => (
              <div
                key={update.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`p-2 rounded-lg ${
                    update.type === "join"
                      ? "bg-green-100 text-green-600"
                      : update.type === "achievement"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {update.type === "join" ? (
                    <Users size={20} />
                  ) : update.type === "achievement" ? (
                    <Trophy size={20} />
                  ) : (
                    <Bell size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">{update.user}</span>
                    {update.type === "join" && ` joined ${update.circle}`}
                    {update.type === "achievement" &&
                      ` earned ${update.achievement} in ${update.circle}`}
                    {update.type === "challenge" &&
                      ` started ${update.challenge} in ${update.circle}`}
                  </p>
                  <span className="text-xs text-gray-500">{update.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
