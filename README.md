# 🏏 Cricket Statistics Management System

A full-stack web application for managing cricket player statistics, built with a C++ backend (REST API) and a modern JavaScript frontend.

---

## 🚀 Features

- **Add, View, and Remove Players**
- **Add and View Match Statistics**
- **Dashboard with Team and Player Analytics**
- **Top Performers & Players in Form**
- **Responsive, Modern UI**
- **Persistent Data Storage**
- **Error Handling and User Feedback**

---

## 🛠️ Tech Stack

- **Backend:** C++ (Winsock, File I/O, REST API)
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Data Storage:** Local file (`cricket_stats.dat`)

---

## 📂 Project Structure

```
assingment/
├── cricket_stats.dat         # Data file (auto-generated)
├── cricket_server_final.exe  # C++ backend server executable
├── index.html                # Main frontend page
├── script.js                 # Frontend JavaScript logic
├── styles.css                # Frontend CSS styles
├── README.md                 # Project documentation
```

---

## ⚡ Getting Started

### 1. **Run the Backend Server**

- Open a terminal in the project directory.
- Run the backend server:
  ```
  ./cricket_server_final.exe
  ```
- You should see:
  ```
  Cricket API Server running on port 8080
  Available endpoints:
    GET  /api/players
    POST /api/players
    DELETE /api/players/{id}
    ...
  ```

### 2. **Open the Frontend**

- Open `index.html` in your web browser.
- The app will connect to the backend at `http://localhost:8080/api`.

---

## 🖥️ Usage

- **Dashboard:** View team stats, top performers, and recent matches.
- **Players Tab:** View, search, and delete players.
- **Add Player:** Add new players to the system.
- **Add Match:** Add match statistics for players.
- **Statistics:** View advanced team and role-based analytics.

---

## 📝 API Endpoints

- `GET    /api/players`         — List all players
- `POST   /api/players`         — Add a new player
- `DELETE /api/players/{id}`    — Remove a player
- `POST   /api/matches`         — Add match statistics
- `GET    /api/players/top`     — Top performers
- `GET    /api/players/form`    — Players in form
- `GET    /api/stats`           — Team statistics

---

## ❓ Troubleshooting

- **"Failed to connect to server"**  
  Make sure `cricket_server_final.exe` is running and not blocked by firewall/antivirus.
- **CORS or Network Errors**  
  Ensure the backend is running on `localhost:8080` and no other process is using the port.
- **Data Not Saving**  
  The backend writes to `cricket_stats.dat` in the project directory.

---

## 📢 Credits

- Developed by Sanghani Manish
- For academic use (DSA Assignment, Nirma University)

---
