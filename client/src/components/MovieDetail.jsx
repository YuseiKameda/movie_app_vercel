import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { Star, Send, Bookmark, ArrowLeft } from "lucide-react";
import axios from "axios";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState({});
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isRecorded, setIsRecorded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  const [hover, setHover] = useState(0);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/movies/${id}`);
        console.log(response.data);
        setMovie(response.data);

        const token = localStorage.getItem("token");

        const recordResponse = await axios.get(
          `${API_BASE_URL}/api/records/${id}`,
          {
            headers: { Authorization: ` Bearer ${token}` },
          }
        );
        setIsRecorded(recordResponse.data.isRecorded);
        setRating(recordResponse.data.rating || 0);
        setComment(recordResponse.data.comment || "");

        const likeResponse = await axios.get(
          `${API_BASE_URL}/api/movies/${id}/like`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsLiked(likeResponse.data.isLiked);
      } catch (error) {
        console.error("Error fetching movie details", error);
      }
    };
    fetchMovie();
  }, [id]);

  const handleUpdateRecord = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("ログインが必要です");
        return;
      }

      await axios.put(
        `${API_BASE_URL}/api/records/update`,
        { movieId: id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("記録を更新しました！");
    } catch (error) {
      console.error("error updating record:", error);
      alert("記録の更新に失敗しました");
    }
  };

  const handleRecordMovie = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("ログインが必要です");
        return;
      }

      const watchedAt = new Date().toISOString().split("T")[0];

      await axios.post(
        `${API_BASE_URL}/api/records/add`,
        { movieId: id, watchedAt, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsRecorded(true);
      alert("映画を記録しました！");
    } catch (error) {
      console.error("Error recording movie", error);
      alert("映画の記録に失敗しました");
    }
  };

  const handleLikeClick = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("ログインが必要です");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/movies/${id}/like`,
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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img
              src={movie.posterurl}
              alt={movie.title}
              width={400}
              height={600}
              className="h-auto w-full"
            />
          </div>
          <div className="md:w-2/3 p-6 space-y-4">
            <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
            <div className="flex items-center space-x-4 text-sm">
              <p>Director: {movie.director}</p>
              <p>Year: {movie.year}</p>
              <p>Runtime: {movie.runtime}</p>
            </div>
            <div>
              <p className="text-gray-300">{movie.plot}</p>
              <div className="border-t border-gray-700 my-4"></div>
              {!isRecorded ? (
                <>
                  <div>
                    <div className="flex items-center space-x-2">
                      {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                          <button
                            key={starValue}
                            className={`transition-all duration-300 transform hover:scale-110 focus:outline-none ${
                              (hover || rating) >= starValue
                                ? "text-yellow-400"
                                : "text-gray-400"
                            }`}
                            onClick={() => setRating(starValue)}
                            onMouseEnter={() => setHover(starValue)}
                            onMouseLeave={() => setHover(0)}
                          >
                            <Star
                              size={20}
                              fill={
                                (hover || rating) >= starValue
                                  ? "currentColor"
                                  : "none"
                              }
                              strokeWidth={1.5}
                            />
                          </button>
                        );
                      })}
                      <span>{rating ? rating : "tap"}</span>
                    </div>
                  </div>
                  <div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="comment"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>
                  <button
                    onClick={handleRecordMovie}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!rating}
                  >
                    <Send className="mr-2" size={20} />
                    record
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <div className="flex items-center space-x-2">
                      {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                          <button
                            key={starValue}
                            className={`transition-all duration-300 transform hover:scale-110 focus:outline-none ${
                              (hover || rating) >= starValue
                                ? "text-yellow-400"
                                : "text-gray-400"
                            }`}
                            onClick={() => setRating(starValue)}
                            onMouseEnter={() => setHover(starValue)}
                            onMouseLeave={() => setHover(0)}
                          >
                            <Star
                              size={20}
                              fill={
                                (hover || rating) >= starValue
                                  ? "currentColor"
                                  : "none"
                              }
                              strokeWidth={1.5}
                            />
                          </button>
                        );
                      })}
                      <span>{rating ? rating : "tap"}</span>
                    </div>
                  </div>
                  <div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="edit comment"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>
                  <button
                    onClick={handleUpdateRecord}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                  >
                    update
                  </button>
                </>
              )}

              <button
                onClick={handleLikeClick}
                className={`mt-2 space-x-2 px-4 py-2 rounded transition-colors duration-300 ${
                  isLiked
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-300 text-gray-700"
                } hover:bg-yellow-600 hover:text-white`}
              >
                <Bookmark
                  size={20}
                  fill={isLiked ? "currentColor" : "none"}
                  strokeWidth={1.5}
                  className="transition-transform duration-300 transform hover:scale-110"
                />
              </button>
              <button
                onClick={() =>
                  window.history.length > 1 ? navigate(-1) : navigate("/")
                }
                className="mt-6 flex items-center text-gray-300 hover:text-white transition-colors duration-300"
              >
                <ArrowLeft size={20} className="mr-2" />
                back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
