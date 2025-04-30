import { useState } from "react";
import { signUp, UserData } from "../services/api";
import { Link } from "react-router-dom";
import bgImage from "../assets/images/login.jpg";
import Polarbear from "../assets/logos/Polarbear.png";
const SignUp = () => {
  const [formData, setFormData] = useState<UserData>({
    name: "",
    email: "",
    role: "employee", // default role
    password: "", // Add password field
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(formData);
      setSuccess(
        `User created successfully! Go to login page to log into your account.`
      );
      setError("");
      setTimeout(() => {
        setSuccess("");
      }, 5000);
      // Reset form
      setFormData({
        name: "",
        email: "",
        role: "employee",
        password: "",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Email already exists!");
      setSuccess("");
    }
  };

  return (
    <div className="flex h-screen dark:bg-white">
      <div
        className="w-1/2 flex items-center shadow-lg  justify-center bg-cover p-2 bg-center relative"
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
        <p className="absolute top-20 mt-6 text-center text-gray-700  text-sm font-bold font-serif">
          Where engagement is the real icebreaker.
        </p>
      </div>
      <div className="w-1/2 min-h-screen flex items-center justify-center bg-gradient-to-b from-green-700 via-teal-500 to-blue-700">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

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

            <div className="mb-4">
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

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="employee">Employee</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
