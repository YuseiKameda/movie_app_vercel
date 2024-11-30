import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [likedMovies, setLikeMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);

        // get liked movies list
        const likesResponse = await axios.get("/api/users/likes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLikeMovies(likesResponse.data);

        // get watched movies list
        const watchedResponse = await axios.get("/api/users/watched", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWatchedMovies(watchedResponse.data);
      } catch (err) {
        setError("プロフィール情報の取得に失敗しました");
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>プロフィール</h2>
      <p>ユーザー名: {profile.username}</p>
      <p>メールアドレス: {profile.email}</p>
      <p>登録日: {new Date(profile.created_at).toLocaleDateString()}</p>

      <h3>いいねした映画</h3>
      {likedMovies.length === 0 ? (
        <p>いいねした映画がありません。</p>
      ) : (
        <ul>
          {likedMovies.map((movie) => (
            <li key={movie.id}>
              <Link to={`/movies/${movie.id}`}>
                <h4>{movie.title}</h4>
              </Link>
              <Link to={`/movies/${movie.id}`}>
                <img
                  src={movie.posterurl}
                  alt={movie.title}
                  style={{ width: "100px" }}
                />
              </Link>
              <p>公開年: {movie.year}</p>
            </li>
          ))}
        </ul>
      )}

      <h3>見た映画</h3>
      {watchedMovies.length === 0 ? (
        <p>見た映画がありません</p>
      ) : (
        <ul>
          {watchedMovies.map((movie) => (
            <li key={movie.id}>
              <Link to={`/movies/${movie.id}`}>
                <h4>{movie.title}</h4>
              </Link>
              <img
                src={movie.posterurl}
                alt={movie.title}
                style={{ width: "100px" }}
              />
              <p>公開年: {movie.year}</p>
              <p>評価: {movie.rating} 星</p>
              <p>コメント: {movie.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Profile;
