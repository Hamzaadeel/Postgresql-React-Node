import { useEffect } from "react";
import { Trophy } from "lucide-react";
import Loader from "./Loader";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setLeaderboard,
  setLoading,
  setError,
  LeaderboardEntry,
} from "../../store/slices/pointsSlice";
import axios from "axios";

const Leaderboards = () => {
  const dispatch = useAppDispatch();
  const { leaderboard, loading, error } = useAppSelector(
    (state) => state.points
  );

  useEffect(() => {
    const fetchLeaders = async () => {
      dispatch(setLoading(true));
      try {
        const token = localStorage.getItem("token");
        const userString = localStorage.getItem("user");
        const user = userString ? JSON.parse(userString) : null;

        const response = await axios.get<LeaderboardEntry[]>(
          "http://localhost:5000/api/points/leaderboard/top",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              tenantId: user?.tenantId,
            },
          }
        );
        dispatch(setLeaderboard(response.data));
      } catch (err: any) {
        dispatch(
          setError(err.response?.data?.message || "Error fetching leaderboard")
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchLeaders();
  }, [dispatch]);

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
            <tr className="bg-white">
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
            {leaderboard.map((leader, index) => (
              <tr
                key={leader.id}
                className={
                  index === 0
                    ? "bg-yellow-50"
                    : index === 1
                    ? "bg-slate-50"
                    : index === 2
                    ? "bg-amber-50"
                    : "bg-white"
                }
              >
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
