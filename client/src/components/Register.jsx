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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);
      navigate("/");
    } catch (error) {
      setMessage(error.response?.data?.error || "登録に失敗しました");
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-8 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-100">
            ユーザー登録
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-px">
            <label className="text-gray-100">ユーザー名</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border
                  border-gray-700 placeholder-gray-500 text-gray-100 rounded-t-md focus:outline-none
                  focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm bg-gray-800 pl-10"
                placeholder="user name"
              />
            </div>
          </div>
          <div className="rounded-md shadow-sm space-y-px">
            <label className="text-gray-100">メールアドレス</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border
                  border-gray-700 placeholder-gray-500 text-gray-100 rounded-t-md focus:outline-none
                  focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm bg-gray-800 pl-10"
                placeholder="mail"
              />
            </div>
          </div>
          <div className="rounded-md shadow-sm space-y-px">
            <label className="text-gray-100">パスワード</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border
                  border-gray-700 placeholder-gray-500 text-gray-100 rounded-t-md focus:outline-none
                  focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm bg-gray-800 pl-10"
                placeholder="password"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent
              text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none
              focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              登録
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
