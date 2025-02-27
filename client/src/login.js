import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8080/login", { username }, { withCredentials: true });
            alert("Login successful!");
            onLogin(response.data.user_id);
            navigate("/"); // Redirect to home
        } catch (error) {
            alert("Login failed! " + (error.response?.data?.error || "Something went wrong"));
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;