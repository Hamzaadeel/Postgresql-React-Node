import { useEffect, useState } from "react";
import axios from "axios";
import { Trophy } from "lucide-react";
import Loader from "./Loader";

interface LeaderboardEntry {
  id: number;
  name: string;
  totalPoints: number;
}

const Leaderboards = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get<LeaderboardEntry[]>(
          "http://localhost:5000/api/points/leaderboard/top",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLeaders(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Error fetching leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md mb-4 p-6 ml-4">
      <div className="flex items-center mb-6">
        <Trophy className="w-6 h-6 mr-3 text-yellow-500" />
        <h2 className="text-xl font-bold">Leaderboard</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaders.map((leader, index) => (
              <tr key={leader.id} className={index === 0 ? "bg-yellow-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span
                      className={`
                      ${
                        index === 0
                          ? "text-yellow-500"
                          : index === 1
                          ? "text-gray-500"
                          : index === 2
                          ? "text-amber-600"
                          : "text-gray-900"
                      }
                      font-bold
                    `}
                    >
                      #{index + 1}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {leader.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-semibold">
                    {leader.totalPoints} pts
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboards;
