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
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <h2>プロフィール</h2>
      <p>ユーザー名: {profile.username}</p>
      <p>メールアドレス: {profile.email}</p>
      <p>登録日: {new Date(profile.created_at).toLocaleDateString()}</p>

      <h3>いいねした映画</h3>
      {likedMovies.length === 0 ? (
        <p>いいねした映画がありません。</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {likedMovies.map((movie) => (
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
      )}

      <h3>見た映画</h3>
      {watchedMovies.length === 0 ? (
        <p>見た映画がありません</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {watchedMovies.map((movie) => (
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
              <p className="text-gray-400">評価: {movie.rating}</p>
              <p className="text-gray-400">コメント: {movie.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
