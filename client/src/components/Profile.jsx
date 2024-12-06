import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { Calendar, Film, Bookmark } from "lucide-react";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [bookmarkedMovies, setBookmarkedMovies] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("watched");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);

        // get bookmarked movies list
        const bookmarksResponse = await axios.get(
          `${API_BASE_URL}/api/users/bookmarks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBookmarkedMovies(bookmarksResponse.data || []);

        // get watched movies list
        const watchedResponse = await axios.get(
          `${API_BASE_URL}/api/users/watched`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setWatchedMovies(watchedResponse.data);
      } catch (err) {
        setError("プロフィール情報の取得に失敗しました");
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);
  const movies = activeTab === "watched" ? watchedMovies : bookmarkedMovies;

  if (error) {
    return <div>{error}</div>;
  }

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold">{profile.username}</h1>
          <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-2">
            <Calendar size={16} className="mr-2" />
            Joined on {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex border-b">
        <button
          className={`flex-1 py-2 px-4 text-center ${
            activeTab === "watched"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("watched")}
        >
          <Film size={16} className="inline mr-2" />
          Watched Movies
        </button>
        <button
          className={`flex-1 py-2 px-4 text-center ${
            activeTab === "bookmarked"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("bookmarked")}
        >
          <Bookmark size={16} className="inline mr-2" />
          Bookmarked Movies
        </button>
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

export default Profile;
