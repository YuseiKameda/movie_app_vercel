import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState({});
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isRecorded, setIsRecorded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axios.get(`/api/movies/${id}`);
        console.log(response.data);
        setMovie(response.data);

        const token = localStorage.getItem("token");

        const recordResponse = await axios.get(`/api/records/${id}`, {
          headers: { Authorization: ` Bearer ${token}` },
        });
        setIsRecorded(recordResponse.data.isRecorded);
        setRating(recordResponse.data.rating || 0);
        setComment(recordResponse.data.comment || "");

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

  const handleUpdateRecord = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("ログインが必要です");
        return;
      }

      await axios.put(
        "/api/records/update",
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
        "/api/records/add",
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

      {!isRecorded ? (
        <>
          <div>
            <label>評価を選択：</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} 星
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>コメント:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="コメントを記入してください"
              className="p-3 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleRecordMovie}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            見た映画に追加
          </button>
        </>
      ) : (
        <>
          <div>
            <label>評価を編集：</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} 星
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>コメントを編集：</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="コメントを編集してください"
            />
          </div>
          <button
            onClick={handleUpdateRecord}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            記録を更新
          </button>
        </>
      )}

      <button
        onClick={() =>
          window.history.length > 1 ? navigate(-1) : navigate("/")
        }
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        戻る
      </button>

      <button
        onClick={handleLikClick}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {isLiked ? "いいねを取り消す" : "いいね"}
      </button>
    </div>
  );
};

export default MovieDetail;
