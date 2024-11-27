import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState({});
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axios.get(`/api/movies/${id}`);
        console.log(response.data);
        setMovie(response.data);

        const token = localStorage.getItem("token");
        const likeResponse = await axios.get(`/api/movies/${id}/like`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLiked(likeResponse.data.isLiked);
      } catch (error) {
        console.error("Error fetching movie details", error);
      }
    };
    fetchMovie();
  }, [id]);

  const handleLikClick = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("ログインが必要です");
        return;
      }

      const response = await axios.post(
        `/api/movies/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsLiked(response.data.isLiked);
    } catch (error) {
      console.error("Error liking movie:", error);
      alert("いいねに失敗しました");
    }
  };

  if (!movie) return <p>Loading...</p>;

  return (
    <div>
      <h1>{movie.title}</h1>
      <img src={movie.posterurl} alt={movie.title} />
      <p>{movie.plot}</p>
      <p>Director: {movie.director}</p>
      <p>Year: {movie.year}</p>
      <p>Runtime: {movie.runtime}</p>
      <button onClick={handleLikClick}>
        {isLiked ? "いいねを取り消す" : "いいね"}
      </button>
    </div>
  );
};

export default MovieDetail;
