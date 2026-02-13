📺 YouTube-Like Video Streaming Backend

A production-ready RESTful backend API for a YouTube-style video streaming platform built using Node.js and Express.js.
This project implements authentication, video management, subscriptions, comments, likes, playlists, and dashboard analytics.

🚀 Tech Stack
    Node.js
    Express.js
    MongoDB
    Mongoose
    JWT Authentication
    Multer (File Uploads)
    Cloudinary (Media Storage)
    Cookie Parser
    CORS

    📂 Project Structure
    src/
       ├── controllers/
       ├── db/
       ├── middlewares/
       ├── models/
       ├── routes/
       ├── utils/
       ├── app.js
       └── index.js

 🔐 Features

  ✅ JWT-based authentication & authorization
  
  ✅ Secure protected routes
  
  ✅ User registration & login
  
  ✅ Video upload & management
  
  ✅ Like & comment system
  
  ✅ Subscription system
  
  ✅ Playlist management
  
  ✅ Dashboard statistics
  
  ✅ Healthcheck API
  
  ✅ Cloud media storage integration

 🛠 Installation & Setup
1️⃣ Clone the Repository
    git clone https://github.com/siddhant-vars/backendProject.git
    cd backendProject

2️⃣ Install Dependencies
  npm install
  
3️⃣ Create Environment Variables

Create a .env file in root:
PORT=8000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET = your_secret
ACCESS_TOKEN_EXPIRY = day
REFRESH_TOKEN_SECRET = your_secret
REFRESH_TOKEN_EXPIRY = day
CORS_ORIGIN=*

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

4️⃣ Run in Development Mode
npm run dev

5️⃣ Start Production Server
npm start

http://localhost:8000/api/v1
Example endpoints:

POST   /api/v1/users/register
POST   /api/v1/users/login
GET    /api/v1/videos
POST   /api/v1/videos
POST   /api/v1/comments
GET    /api/v1/dashboard


