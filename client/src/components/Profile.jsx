import { useEffect, useState } from "react";
import axios from "axios";
function Profile() {
  const [profile, setProfile] = useState(null);
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
    </div>
  );
}

export default Profile;
