import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MovieSearch from "./components/MovieSearch";
import Header from "./components/header";
// import Footer from "./components/Footer";
import MovieDetail from "./components/MovieDetail";
import Register from "./components/Register";
import Login from "./components/Login";
import Profile from "./components/Profile";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);
  return (
    <Router>
      <Header
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />
      <main>
        <h1>Movie Search App</h1>
        <Routes>
          <Route path="/" element={<MovieSearch />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      {/* <Footer /> */}
    </Router>
  );
};

export default App;
