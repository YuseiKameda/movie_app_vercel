import React, { useState } from "react";
import axios from "axios";

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

    //　データがなければから配列を返す
    try {
      const response = await axios.get(`/api/movies/search?q=${query}`);
      console.log(response.data);
      setMovies(
        Array.isArray(response.data.Search) ? response.data.Search : []
      );
    } catch (error) {
      console.error("Error fetching data", error);
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
          <div key={movie.imdbID}>
            <h3>{movie.Title}</h3>
            <img src={movie.Poster} alt={movie.Title} />
            <p>{movie.Year}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieSearch;
