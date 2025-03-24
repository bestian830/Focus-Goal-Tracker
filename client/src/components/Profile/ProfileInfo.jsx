import { useEffect, useState } from "react";

export default function ProfileInfo() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    async function fetchUserInfo() {
      // 未来fetch数据的地方
    //   try {
    //     const response = await fetch("/api/userinfo");
    //     if (!response.ok) throw new Error("Failed to fetch");
    //     const data = await response.json();
    //     setUserInfo(data);
    //   } catch (error) {
    //     console.error("Error fetching user info:", error);
    //     setUserInfo({ error: "Failed to fetch user info" });
    //   }

      // 当前使用假数据
      const mockData = {
        username: "john_doe",
        email: "john@example.com",
        createdAt: "2024-01-01",
      };
      setUserInfo(mockData);
    }

    fetchUserInfo();
  }, []);

  if (!userInfo) return <p>Loading...</p>;

  return (
    <div className="profile-info">
      <h3>Personal Information</h3>
      <p>
        <strong>Username: </strong>
        {userInfo.username}
      </p>
      <p>
        <strong>Email: </strong>
        {userInfo.email}
      </p>
      <p>
        <strong>Member since: </strong>
        {userInfo.createdAt}
      </p>
    </div>
  );
}
