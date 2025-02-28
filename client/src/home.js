import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://172.19.144.56:8080";

const Home = ({ currentUser, onLogout }) => {
    const [movie, setMovie] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Set axios defaults
        axios.defaults.withCredentials = true;

        // Fetch movie data
        axios.get(`${API_URL}/`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => {
                if (response.data && response.data.movie) {
                    setMovie(response.data.movie);
                    setRatings(response.data.ratings || []);
                } else {
                    console.error("Invalid response format:", response.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                if (error.response && error.response.status === 401) {
                    // Handle unauthorized error
                    handleLogout();
                }
            });
    }, []);

    const handleLogout = () => {
        axios.post(`${API_URL}/logout`, {}, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(() => {
                if (onLogout) onLogout();
                navigate("/login");
            })
            .catch(err => {
                console.error("Logout error:", err);
                // Force logout even if API call fails
                if (onLogout) onLogout();
                navigate("/login");
            });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!movie) return;

        try {
            await axios.post(`${API_URL}/comments`, {
                movie_id: movie.movie_id,
                rating: rating,
                comment: comment,
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            alert("Rating submitted!");
            setRating("");
            setComment("");

            // Refresh ratings after submission
            axios.get(`${API_URL}/`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then((response) => {
                    if (response.data && response.data.ratings) {
                        setRatings(response.data.ratings);
                    }
                })
                .catch((error) => console.error("Error refreshing data:", error));
        } catch (error) {
            console.error("Error submitting rating:", error);
            alert("Error submitting rating: " + (error.response?.data?.error || error.message || "Unknown error"));
        }
    };

    if (!movie) return <h2>Loading movie details...</h2>;

    return (
        <div className="movie-container">
            <header>
                The Movie Explorer
                {currentUser && (
                    <div className="user-info">
                        Welcome, {currentUser} | <button onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </header>

            <h1>{movie.title}</h1>
            <h2>{movie.tagline}</h2>
            <p className="genre">
                <strong>Genre:</strong> {movie.genre && Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}
            </p>
            <img src={movie.poster_url} alt="Movie Poster" />

            <div className="rating-section">
                <h3>Rate this Movie</h3>
                <form onSubmit={handleSubmit} className="rating-form">
                    <div className="form-group">
                        <label htmlFor="rating">Rating (1-10):</label>
                        <input
                            type="number"
                            id="rating"
                            name="rating"
                            min="1"
                            max="10"
                            required
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="comment">Comment:</label>
                        <textarea
                            id="comment"
                            name="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                    </div>
                    <button type="submit">Submit Rating</button>
                </form>
            </div>

            <div className="ratings-display">
                <h3>User Ratings</h3>
                {ratings.length > 0 ? (
                    ratings.map((rating, index) => (
                        <div className="rating-item" key={index}>
                            <p>
                                <strong>User {rating.user_id}</strong> rated it {rating.rating_value}/10
                            </p>
                            {rating.comment && <p className="comment">{rating.comment}</p>}
                        </div>
                    ))
                ) : (
                    <p>No ratings yet. Start rating!</p>
                )}
            </div>
        </div>
    );
};

export default Home;