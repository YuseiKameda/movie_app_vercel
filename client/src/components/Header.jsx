import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const Header = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <header className="bg-gray-900 text-gray-100 shadow-lg">
      <nav className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-xl font-bold text-blue-500">Movie App</h1>
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="hover:text-red-500 transition-colors">
              Search
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link
                to="/profile"
                className="hover:text-red-500 transition-colors"
              >
                Profile
              </Link>
            </li>
          )}
          {isAuthenticated ? (
            <>
              <button
                onClick={handleLogout}
                className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/register"
                  className="hover:text-red-500 transition-colors"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-red-500 transition-colors"
                >
                  login
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

Header.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
};

export default Header;
