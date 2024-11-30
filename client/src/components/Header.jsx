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
    <header className="bg-blue-600 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Movie App</h1>
        <ul className="flex space-x-4">
          <li>
            <Link to="/">Home</Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link to="/profile">プロフィール</Link>
            </li>
          )}
          {isAuthenticated ? (
            <>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/register">Register</Link>
              </li>
              <li>
                <Link to="/login">ログイン</Link>
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
