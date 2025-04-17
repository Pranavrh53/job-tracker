🧾 #Job Tracker
A full-stack web application that helps users track their job applications, manage associated documents, and monitor progress throughout the hiring process.

`🔧 Tech Stack`

Frontend: React, Tailwind CSS (or your styling choice)

Backend: Node.js, Express

Database: MySQL

ORM: mysql2/promise

Authentication: JWT-based authentication

File Storage: (e.g. Multer/local or cloud storage - specify if applicable)

`🚀 Features`

✅ User registration and login

📝 Add, update, and delete job applications

📂 Upload and store resumes, cover letters, and other documents

📊 Track application stages (e.g., Applied, Interviewing, Offer)

🔍 Filter and search job applications

`Project Structure`

<pre> <details> <summary><strong>📁 Project Structure</strong></summary> ```bash 
job-tracker/
├── client/                   # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/
│       └── App.jsx
├── server/                   # Node.js backend
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── index.js
├── .env
├── package.json
└── README.md
 ``` </details> </pre>


 ⚙️ Getting Started
Prerequisites
Node.js

MySQL

npm / yarn

Installation
Clone the repo:

bash
Copy
Edit
git clone https://github.com/Pranavrh53/job-tracker.git
cd job-tracker
Set up environment variables:

Create a .env file in the server/ directory with:

ini
Copy
Edit
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=job_tracker_db
JWT_SECRET=your_jwt_secret
Install dependencies:

For both frontend and backend:

bash
Copy
Edit
cd client && npm install
cd ../server && npm install
Run the app:

In one terminal tab (for backend):

bash
Copy
Edit
cd server
npm run dev
In another tab (for frontend):

bash
Copy
Edit
cd client
npm start
🛠️ API Overview

Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Login
GET	/api/jobs	Get all jobs
POST	/api/jobs	Add a new job
PUT	/api/jobs/:id	Update job
DELETE	/api/jobs/:id	Delete job
POST	/api/upload	Upload a document
(Update endpoints to match your actual routes)

💡 Future Improvements
Notifications for application status updates

Calendar/scheduler integration

Analytics dashboard

Dark mode 🌙

