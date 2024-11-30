import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

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
      const response = await axios.get(`/api/movies/search?q=${searchQuery}`);
      console.log(response.data);
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
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie"
        />
        <button type="submit">Search</button>
      </form>
      <div>
        {movies.map((movie) => (
          <div key={movie.id}>
            <h3>
              <Link to={`/movies/${movie.id}`}>{movie.title}</Link>
            </h3>
            <Link to={`/movies/${movie.id}`}>
              <img src={movie.posterurl} alt={movie.title} />
            </Link>
            <p>{movie.year}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieSearch;
