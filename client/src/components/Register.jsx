import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { API_BASE_URL } from "../config";

const Register = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);
      setMessage("");
      navigate("/");
    } catch (error) {
      setMessage(error.response?.data?.error || "registration failed");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-8 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-100">
            Registration
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-px">
            <label className="text-gray-100">User name</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border
                  border-gray-700 placeholder-gray-500 text-gray-100 rounded-t-md focus:outline-none
                  focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-800 pl-10"
                placeholder="user name"
              />
            </div>
          </div>
          <div className="rounded-md shadow-sm space-y-px">
            <label className="text-gray-100">email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border
                  border-gray-700 placeholder-gray-500 text-gray-100 rounded-t-md focus:outline-none
                  focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-800 pl-10"
                placeholder="mail"
              />
            </div>
          </div>
          <div className="rounded-md shadow-sm space-y-px">
            <label className="text-gray-100">password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border
                  border-gray-700 placeholder-gray-500 text-gray-100 rounded-t-md focus:outline-none
                  focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-800 pl-10"
                placeholder="password"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>
        <div className="mt-4 text-red-500 text-center font-semibold">
          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
};

Register.propTypes = {
  setIsAuthenticated: PropTypes.func.isRequired,
};

export default Register;
