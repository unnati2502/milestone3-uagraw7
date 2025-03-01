Project Overview
 
Movie Explorer is a full-stack web application that allows users to:

View random movie details fetched from the TMDB API 🎬
Rate and review movies (submit, edit, and delete ratings/comments) ⭐
View and manage their ratings via a dedicated "My Ratings" page
Interact with the app in real-time without page reloads using React
This milestone completes the client-server architecture using React + Flask:

The Flask backend serves as a RESTful API
The React frontend dynamically updates UI without excessive server requests

🛠 Technologies & Tools
Stack	Tools/Libraries
Frontend	React, Fetch API
Backend	Flask, Flask-Login, Flask-CORS, Flask-SQLAlchemy
Database	PostgreSQL
External APIs	TMDB API (for movie data)
Linting	ESLint (Airbnb rules), Black (Python formatting)


📌 Features & Functionality

✅ Home Page
✔ Fetches random movie data from the TMDB API
✔ Displays movie title, genre, tagline, poster
✔ Allows users to submit, edit, and delete their ratings
✔ Shows user ratings dynamically


✅ My Ratings Page
✔ Fetches only the logged-in user’s ratings
✔ Displays movie names instead of movie IDs
✔ Allows editing/deleting ratings before saving
✔ Saves changes only when "Save" is clicked

✅ Authentication
✔ Users must log in before rating movies
✔ Flask session persists across page refreshes
✔ Secure authentication via Flask-Login + React Fetch API

📖 Installation & Setup

1️⃣ Clone the Repository
git clone https://github.com/unnati2502/milestone3-uagraw7.git
cd milestone3-uagraw7
2️⃣ Backend Setup (Flask)
📌 Install dependencies

cd backend
pip install -r requirements.txt

📌 Set up environment variables

Create a .env file in the backend/ folder:
API_KEY=your_tmdb_api_key
DATABASE_URL=postgresql://username:password@localhost:5432/moviedb

📌 Run the Flask server

flask run --host=0.0.0.0 --port=8080

3️⃣ Frontend Setup (React)

📌 Install dependencies
cd frontend
npm install

📌 Start the React App

npm start

📌 Linting & Code Quality

✔ Format Python files using Black
black .
✔ Run ESLint for JavaScript
npx eslint src --fix
✔ Ensure Airbnb style guide is followed
