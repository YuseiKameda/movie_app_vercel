import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const MovieSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("q") || "";
  });

  const [movies, setMovies] = useState([]);

  // 検索機能
  const handleSearch = useCallback(async (searchQuery) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/movies/search?q=${searchQuery}`
      );
      // console.log(response.data);
      setMovies(response.data);
    } catch (error) {
      console.error("Error fetching data", error);
      setMovies([]);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("q");

    if (searchQuery && searchQuery.length >= 3) {
      handleSearch(searchQuery);
    }
  }, [location.search, handleSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.length < 3) {
      alert("Please enter at least 3 characters");
      return;
    }
    navigate(`?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex max-w-3xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a movie"
              className="flex-grow px-4 py-2 rounded-l-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </form>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105"
          >
            <div className="p-4">
              <h3 className="text-gray-500 text-xl font-semibold mb-2">
                <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
              </h3>
            </div>
            <Link to={`/movies/${movie.id}`}>
              <img
                src={movie.posterurl}
                alt={movie.title}
                width={300}
                height={400}
                className="w-full object-cover"
              />
            </Link>
            <p className="text-gray-400">{movie.year}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieSearch;
