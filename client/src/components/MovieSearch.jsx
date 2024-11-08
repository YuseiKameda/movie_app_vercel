import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const MovieSearch = () => {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);

  // 検索機能
  const handleSearch = async (e) => {
    e.preventDefault();

    // 入力が3文字以上か確認
    if (query.length < 3) {
      alert("Please enter at least 3 characters");
      return;
    }

    // データがなければから配列を返す
    try {
      const response = await axios.get(`/api/movies/search?q=${query}`);
      console.log(response.data);
      setMovies(response.data);
    } catch (error) {
      console.error("Error fetching data", error);
      setMovies([]);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
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
