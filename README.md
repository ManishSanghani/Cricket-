# 🏏 Cricket Statistics Management System

A complete web-based Cricket Statistics Management System with a C++ backend API and modern JavaScript frontend.

## 🎯 Features

- **Player Management**: Add, view, and delete players
- **Match Statistics**: Record match data for players
- **Dashboard**: Real-time statistics and insights
- **Modern UI**: Responsive design with animations
- **REST API**: Complete backend with all CRUD operations

## 📁 Project Structure

### Core Files
- `index.html` - Main frontend application
- `script.js` - Frontend JavaScript logic
- `styles.css` - Modern UI styling
- `simple_windows_server.cpp` - Backend C++ server source
- `cricket_server_final.exe` - Compiled server executable
- `cricket_stats.dat` - Data storage file
- `start_system.bat` - Windows startup script

### Documentation
- `README.md` - This file
- `DSA Assignment-1-22BCE301-22BCE310.pdf` - Assignment requirements
- `DSA INOOVATIVE ASSIGHMENT 2.docx` - Assignment documentation

## 🚀 Quick Start

### Prerequisites
- Windows OS
- C++ compiler (g++ recommended)
- Web browser

### Running the System

1. **Start the Backend Server:**
   ```bash
   .\cricket_server_final.exe
   ```
   Or use the startup script:
   ```bash
   .\start_system.bat
   ```

2. **Open the Frontend:**
   - Open `index.html` in your web browser
   - Or double-click the file

3. **Access the Application:**
   - Server runs on: `http://localhost:8080`
   - Frontend: Open `index.html` in browser

## 🔧 API Endpoints

- `GET /api/players` - Get all players
- `GET /api/players/top` - Get top performers
- `GET /api/players/form` - Get players in form
- `GET /api/stats` - Get team statistics
- `POST /api/players` - Add new player
- `POST /api/matches` - Add match statistics
- `DELETE /api/players/{id}` - Delete player

## 🎨 Features

### Dashboard
- Total players and matches count
- Team average statistics
- Top performers list
- Players in form
- Recent matches

### Player Management
- Add new players with roles
- View player details and statistics
- Delete players with confirmation
- Search and filter players

### Match Statistics
- Record match scores
- Track home/away performance
- Calculate averages and trends
- Form analysis

### Modern UI
- Responsive design
- Smooth animations
- Beautiful gradients
- Interactive elements

## 🛠️ Development

### Compiling the Server
```bash
g++ -std=c++11 -o cricket_server_final.exe simple_windows_server.cpp -lws2_32
```

### File Structure
```
├── index.html              # Main application
├── script.js               # Frontend logic
├── styles.css              # UI styling
├── simple_windows_server.cpp # Backend source
├── cricket_server_final.exe  # Compiled server
├── cricket_stats.dat       # Data storage
├── start_system.bat        # Startup script
└── README.md               # Documentation
```

## 📊 Data Storage

- Data is automatically saved to `cricket_stats.dat`
- File format: Custom delimited format
- Automatic backup and recovery
- Error handling for corrupted data

## 🎯 System Requirements

- **OS**: Windows 10/11
- **Browser**: Chrome, Firefox, Edge (modern browsers)
- **Memory**: 50MB RAM
- **Storage**: 10MB free space

## 🏆 Complete CRUD Operations

- ✅ **Create** - Add new players and matches
- ✅ **Read** - View players, statistics, and details
- ✅ **Update** - Add match statistics to players
- ✅ **Delete** - Remove players with confirmation

## 🎉 Ready to Use!

Your Cricket Statistics Management System is now clean and ready for use or submission!

**Total Files**: 8 core files + documentation
**Size**: ~500KB (excluding documentation)
**Features**: Complete CRUD operations with modern UI

---

**Developed for DSA Assignment - Cricket Statistics Management System** 🏏✨ 