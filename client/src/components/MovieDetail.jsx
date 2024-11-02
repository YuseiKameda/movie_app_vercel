import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState({});

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axios.get(`/api/movies/${id}`);
        console.log(response.data);
        setMovie(response.data);
      } catch (error) {
        console.error("Error fetching movie details", error);
      }
    };
    fetchMovie();
  }, [id]);

  if (!movie) return <p>Loading...</p>;

  return (
    <div>
      <h1>{movie.title}</h1>
      <img src={movie.posterurl} alt={movie.title} />
      <p>{movie.plot}</p>
      <p>Director: {movie.director}</p>
      <p>Year: {movie.year}</p>
      <p>Runtime: {movie.runtime}</p>
    </div>
  );
};

export default MovieDetail;
