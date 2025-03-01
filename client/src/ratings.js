import React, { useEffect, useState } from "react";

const API_URL = "http://172.19.144.56:8080"; // Adjust based on backend

const Ratings = () => {
    const [ratings, setRatings] = useState([]);
    const [message, setMessage] = useState("");

    // Fetch user ratings on page load
    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const response = await fetch(`${API_URL}/comments`, {
                    credentials: "include",
                });
                if (!response.ok) throw new Error("Failed to fetch ratings");

                const data = await response.json();
                setRatings(data);
            } catch (error) {
                console.error("Error fetching ratings:", error);
            }
        };

        fetchRatings();
    }, []);

    // Handle rating/comment change
    const handleChange = (id, field, value) => {
        setRatings((prevRatings) =>
            prevRatings.map((rating) =>
                rating.id === id ? { ...rating, [field]: value } : rating
            )
        );
    };

    // Handle delete
    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${API_URL}/comments/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to delete comment");

            setRatings(ratings.filter((rating) => rating.id !== id));
            setMessage("Comment deleted successfully!");
        } catch (error) {
            console.error("Error deleting comment:", error);
            setMessage("Error deleting comment");
        }
    };

    // Handle save
    const handleSave = async () => {
        try {
            const promises = ratings.map((rating) =>
                fetch(`${API_URL}/comments/${rating.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        rating: rating.rating_value,
                        comment: rating.comment,
                    }),
                    credentials: "include",
                })
            );

            const responses = await Promise.all(promises);
            if (responses.some((res) => !res.ok)) throw new Error("Save failed");

            setMessage("Changes saved successfully!");
        } catch (error) {
            console.error("Error saving changes:", error);
            setMessage("Error saving changes");
        }
    };

    return (
        <div>
            <h2>Your reviews:</h2>
            {message && <div>{message}</div>}
            {ratings.length === 0 ? (
                <p>No ratings found</p>
            ) : (
                ratings.map((rating) => (
                    <div key={rating.id}>
                        <p>Movie ID: {rating.movie_id}</p>
                        <input
                            type="number"
                            value={rating.rating_value}
                            onChange={(e) =>
                                handleChange(rating.id, "rating_value", e.target.value)
                            }
                        />
                        <input
                            type="text"
                            value={rating.comment}
                            onChange={(e) =>
                                handleChange(rating.id, "comment", e.target.value)
                            }
                        />
                        <button onClick={() => handleDelete(rating.id)}>Delete</button>
                    </div>
                ))
            )}
            <button onClick={handleSave}>Save Changes</button>
        </div>
    );
};

export default Ratings;
