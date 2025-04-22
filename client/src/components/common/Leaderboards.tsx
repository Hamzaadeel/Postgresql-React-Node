import { useEffect } from "react";
import { Trophy } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setLeaderboard,
  setLoading,
  setError,
  LeaderboardEntry,
} from "../../store/slices/pointsSlice";
import axios from "axios";
import SkeletonTable from "./SkeletonTable";

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
        <SkeletonTable />
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
    <div className="bg-white dark:bg-gray-800 dark:border-gray-500 dark:shadow-gray-950 rounded-lg shadow-md mb-4 p-6 ml-4">
      <div className="flex items-center mb-6">
        <Trophy className="w-6 h-6 mr-3 text-yellow-300" />
        <h2 className="text-xl font-bold dark:text-gray-100">Leaderboard</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-white dark:bg-gray-800">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-50 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-50 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-50 uppercase tracking-wider">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
            {leaderboard.map((leader, index) => (
              <tr
                key={leader.id}
                className={
                  index === 0
                    ? "bg-gradient-to-r from-yellow-50 to-yellow-100"
                    : index === 1
                    ? "bg-gradient-to-r from-slate-50 to-slate-100"
                    : index === 2
                    ? "bg-gradient-to-r from-red-50 to-red-100"
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
