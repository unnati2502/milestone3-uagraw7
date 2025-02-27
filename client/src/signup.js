
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8080/signup", { username });
            alert("Signup successful! Please login.");
            navigate("/login"); // Redirect to login
        } catch (error) {
            alert("Signup failed! " + (error.response?.data?.error || "Something went wrong"));
        }
    };

    return (
        <div>
            <h2>Signup</h2>
            <form onSubmit={handleSignup}>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
                <button type="submit">Signup</button>
            </form>
        </div>
    );
};

export default Signup;