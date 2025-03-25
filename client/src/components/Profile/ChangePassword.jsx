import { useState } from "react";

export default function ChangePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    // 实际逻辑(后期启用)
    // fetch('/api/change-password', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     }
    //     body: JSON.stringify({password}),
    // })
    // .then((res) => res.json())
    // .then(data => setMessage(data.message))
    // .catch((err => setMessage('Error changing password')));

    // 当前假数据模拟逻辑
    setMessage("Password changed successfully (simulation)");
  };

  return (
    <form className="change-password" onSubmit={handleSubmit}>
      <h3>Change Password</h3>
      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />
      <button type="submit">Update Password</button>
      {message && <p className="message">{message}</p>}
    </form>
  );
}
