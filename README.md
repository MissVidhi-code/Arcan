# 🚀 Archon

**Archon** is an all-in-one productivity web app designed to help students manage their academic and personal life efficiently.

It combines essential student tools into a single platform so you can **plan, track, and execute your goals without switching apps.**

---

# ✨ Features

✅ **AI Chatbot**  
Smart assistant to help with study plans, doubts, and productivity tips.

✅ **Personalized Timetable Generator**  
Automatically creates study schedules tailored for students.

✅ **Notes Manager**  
Store and organize your notes in one place.

✅ **Reminders**  
Never miss deadlines, exams, or tasks.

✅ **Calendar Integration**  
Plan your days, weeks, and months effectively.

---

# 🛠 Tech Stack

### Frontend
- React (Create React App)
- Modern UI with responsive design

### Backend
- Node.js
- Express.js
- AI API integration

### DevOps
- Docker
- Docker Compose

---

# 📦 Project Structure

```
├── frontend/               # React frontend (CRA)
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── .env
│
├── backend/                # Node.js + Express backend
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml      # Run frontend + backend together
└── README.md
```

---

# 🚀 Getting Started

## ✅ Prerequisites

Make sure you have installed:

- Docker
- Docker Compose

---

# ▶️ Run the App

From the project root directory:

```bash
docker compose up --build
```

This will build and start both frontend and backend containers.

- Frontend will be available at: `http://localhost:3000`
- Backend will be available at: `http://localhost:8000`

## 🔑 Environment Variables
Create a .env file inside the backend folder:

```
GROQ_API_KEY=your_api_key_here
```
Replace your_api_key_here with your actual API key.

## 🧑‍💻 Running Without Docker (Optional)

If you want to run locally without Docker:
### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```
This will start the frontend on `http://localhost:3000` and backend on `http://localhost:8000`.


## 🧩 Future Improvements
- User authentication

- Cloud sync across devices

- Mobile app version

- Advanced AI personalization

- Analytics dashboard

---

## 🤝 Contributing

Contributions are welcome and appreciated!

1. Fork the repository  
2. Create a new branch (`feature/your-feature-name`)  
3. Commit your changes  
4. Push to your branch  
5. Open a Pull Request  

---

## 📄 License

This project is licensed under the MIT License.

You are free to use, modify, and distribute this software.

---

## 💡 Vision

Archon aims to become a **complete productivity ecosystem for students**, helping them:

- Stay organized  
- Study smarter  
- Manage time effectively  
- Reduce stress  
- Achieve academic goals faster  

---

## ⭐ Support

If you found this project helpful:

- Give it a ⭐ on GitHub  
- Share it with friends  
- Contribute to improve it  

---

## 🙌 Acknowledgements

Built with ❤️ for students who want to improve their productivity and manage their life better.

Happy Learning 📚
