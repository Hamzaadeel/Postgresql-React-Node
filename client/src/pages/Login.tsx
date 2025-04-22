import { useState } from "react";
import { login } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/slices/authSlice";
import { User } from "../types/User";
import bgImage from "../assets/images/login.jpg";
import Polarbear from "../assets/logos/Polarbear.png";
interface LoginResponse {
  user: User;
  token: string;
}

const Login = () => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(formData);
      const { user, token } = response as LoginResponse;

      dispatch(setCredentials({ user, token }));

      if (!user.role) {
        setError("User role not defined");
        return;
      }

      if (user.role === "moderator") {
        navigate("/moderator/dashboard");
      } else if (user.role === "employee") {
        navigate("/employee/dashboard");
      } else {
        setError("Invalid user role");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Email or password is incorrect!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen dark:bg-white">
      <div
        className="w-1/2 flex items-center shadow-lg justify-center bg-cover p-2 bg-center relative"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "90%",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center">
          <img src={Polarbear} alt="PolarBear Logo" className="w-28 p-2" />
          <h1 className="text-gray-900 text-3xl font-bold font-serif">
            PolarBear
          </h1>
        </div>
        <p className="absolute top-20 text-center mt-6 text-gray-700 text-sm font-bold font-serif">
          Where engagement is the real icebreaker.
        </p>
      </div>
      <div className="w-1/2 min-h-screen flex items-center justify-center bg-gradient-to-b from-green-700 via-teal-500 to-blue-700">
        {loading ? (
          <span>Logging in...</span>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-6">Login</h2>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Login
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-500 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
