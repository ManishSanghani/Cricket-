#include <iostream>
#include <string>
#include <sstream>
#include <map>
#include <vector>
#include <fstream>
#include <cstring>
#include <algorithm>
#include <iomanip>
#include <numeric>
#include <winsock2.h>
#include <ws2tcpip.h>

#pragma comment(lib, "ws2_32.lib")

using namespace std;

// Constants
const int MAX_NAME_LENGTH = 50;
const int MAX_DATE_LENGTH = 20;
const int MIN_SCORE = 0;
const int MAX_SCORE = 1000;
const string DATA_FILE = "cricket_stats.dat";

// MatchStats structure
struct MatchStats {
    string date;
    int score;
    string opponent;
    string venue;
    bool isHome;
    
    MatchStats(string d = "", int s = 0, string opp = "", string v = "", bool home = true) 
        : date(d), score(s), opponent(opp), venue(v), isHome(home) {}
    
    // For file I/O
    void serialize(ofstream& file) const {
        file << date << "|" << score << "|" << opponent << "|" << venue << "|" << isHome << endl;
    }
    
    void deserialize(ifstream& file) {
        string line;
        if (getline(file, line)) {
            stringstream ss(line);
            getline(ss, date, '|');
            string scoreStr;
            getline(ss, scoreStr, '|');
            score = stoi(scoreStr);
            getline(ss, opponent, '|');
            getline(ss, venue, '|');
            string homeStr;
            getline(ss, homeStr, '|');
            isHome = (homeStr == "1");
        }
    }
};

// Player class
class Player {
private:
    string name;
    string role;
    vector<MatchStats> stats;
    Player* next;
    int playerId;
    static int nextId;
    
public:
    Player(string n = "", string r = "") : name(n), role(r), next(nullptr) {
        playerId = ++nextId;
    }
    
    ~Player() {
        if (next != nullptr) {
            delete next;
        }
    }
    
    // Getters
    string getName() const { return name; }
    string getRole() const { return role; }
    const vector<MatchStats>& getStats() const { return stats; }
    Player* getNext() const { return next; }
    int getId() const { return playerId; }
    
    // Setters
    void setNext(Player* next) { this->next = next; }
    void setName(string n) { name = n; }
    void setRole(string r) { role = r; }
    
    // Add match statistics
    void addMatch(const MatchStats& match) {
        stats.push_back(match);
    }
    
    // Advanced statistics methods
    int getBestScore() const {
        if (stats.empty()) return 0;
        return max_element(stats.begin(), stats.end(), 
            [](const MatchStats& a, const MatchStats& b) {
                return a.score < b.score;
            })->score;
    }
    
    double getAverageScore() const {
        if (stats.empty()) return 0.0;
        int total = 0;
        for (const auto& stat : stats) {
            total += stat.score;
        }
        return static_cast<double>(total) / stats.size();
    }
    
    int getTotalMatches() const {
        return stats.size();
    }
    
    int getHomeMatches() const {
        return count_if(stats.begin(), stats.end(), 
            [](const MatchStats& s) { return s.isHome; });
    }
    
    int getAwayMatches() const {
        return getTotalMatches() - getHomeMatches();
    }
    
    double getHomeAverage() const {
        int total = 0, count = 0;
        for (const auto& stat : stats) {
            if (stat.isHome) {
                total += stat.score;
                count++;
            }
        }
        return count > 0 ? static_cast<double>(total) / count : 0.0;
    }
    
    double getAwayAverage() const {
        int total = 0, count = 0;
        for (const auto& stat : stats) {
            if (!stat.isHome) {
                total += stat.score;
                count++;
            }
        }
        return count > 0 ? static_cast<double>(total) / count : 0.0;
    }
    
    // Check if player is in form (average of last 3 matches > overall average)
    bool isInForm() const {
        if (stats.size() < 3) return false;
        auto recent = getRecentPerformance(3);
        double recentAvg = accumulate(recent.begin(), recent.end(), 0.0) / recent.size();
        return recentAvg > getAverageScore();
    }
    
    // Get performance trend (last 5 matches)
    vector<int> getRecentPerformance(int count = 5) const {
        vector<int> recent;
        int start = max(0, (int)stats.size() - count);
        for (int i = start; i < stats.size(); i++) {
            recent.push_back(stats[i].score);
        }
        return recent;
    }
    
    // File I/O methods
    void saveToFile(ofstream& file) const {
        file << playerId << "|" << name << "|" << role << "|" << stats.size() << endl;
        for (const auto& stat : stats) {
            stat.serialize(file);
        }
    }
    
    void loadFromFile(ifstream& file) {
        string line;
        if (getline(file, line)) {
            stringstream ss(line);
            string idStr;
            getline(ss, idStr, '|');
            playerId = stoi(idStr);
            getline(ss, name, '|');
            getline(ss, role, '|');
            string statsCountStr;
            getline(ss, statsCountStr, '|');
            int statsCount = stoi(statsCountStr);
            
            stats.clear();
            for (int i = 0; i < statsCount; i++) {
                MatchStats stat;
                stat.deserialize(file);
                stats.push_back(stat);
            }
        }
    }
};

int Player::nextId = 0;

// PlayerList class
class PlayerList {
private:
    Player* head;
    Player* tail;
    int size;
    
public:
    PlayerList() : head(nullptr), tail(nullptr), size(0) {}
    
    ~PlayerList() {
        clear();
    }
    
    // Basic operations
    void addPlayer(const string& name, const string& role) {
        Player* newPlayer = new Player(name, role);
        
        if (head == nullptr) {
            head = tail = newPlayer;
        } else {
            tail->setNext(newPlayer);
            tail = newPlayer;
        }
        size++;
    }
    
    void addPlayerStats(const string& playerName, const MatchStats& match) {
        Player* current = head;
        while (current != nullptr) {
            if (current->getName() == playerName) {
                current->addMatch(match);
                return;
            }
            current = current->getNext();
        }
        cout << "Player '" << playerName << "' not found!" << endl;
    }
    
    // Advanced search and filter methods
    Player* findPlayer(const string& name) const {
        Player* current = head;
        while (current != nullptr) {
            if (current->getName() == name) {
                return current;
            }
            current = current->getNext();
        }
        return nullptr;
    }
    
    Player* findPlayerById(int id) const {
        Player* current = head;
        while (current != nullptr) {
            if (current->getId() == id) {
                return current;
            }
            current = current->getNext();
        }
        return nullptr;
    }
    
    vector<Player*> getPlayersByRole(const string& role) const {
        vector<Player*> result;
        Player* current = head;
        while (current != nullptr) {
            if (current->getRole() == role) {
                result.push_back(current);
            }
            current = current->getNext();
        }
        return result;
    }
    
    vector<Player*> getTopPerformers(int count = 5) const {
        vector<Player*> allPlayers;
        Player* current = head;
        while (current != nullptr) {
            allPlayers.push_back(current);
            current = current->getNext();
        }
        
        sort(allPlayers.begin(), allPlayers.end(), 
            [](const Player* a, const Player* b) {
                return a->getAverageScore() > b->getAverageScore();
            });
        
        if (allPlayers.size() > count) {
            allPlayers.resize(count);
        }
        return allPlayers;
    }
    
    vector<Player*> getPlayersInForm() const {
        vector<Player*> result;
        Player* current = head;
        while (current != nullptr) {
            if (current->isInForm()) {
                result.push_back(current);
            }
            current = current->getNext();
        }
        return result;
    }
    
    // Statistics methods
    double getTeamAverage() const {
        if (size == 0) return 0.0;
        double total = 0.0;
        int count = 0;
        Player* current = head;
        while (current != nullptr) {
            total += current->getAverageScore();
            count++;
            current = current->getNext();
        }
        return total / count;
    }
    
    map<string, double> getRoleAverages() const {
        map<string, double> averages;
        map<string, int> counts;
        
        Player* current = head;
        while (current != nullptr) {
            string role = current->getRole();
            averages[role] += current->getAverageScore();
            counts[role]++;
            current = current->getNext();
        }
        
        for (auto& pair : averages) {
            if (counts[pair.first] > 0) {
                pair.second /= counts[pair.first];
            }
        }
        
        return averages;
    }
    
    // File I/O methods
    void saveToFile(const string& filename = DATA_FILE) const {
        ofstream file(filename);
        if (!file.is_open()) {
            cout << "Error: Could not open file for writing!" << endl;
            return;
        }
        
        file << size << endl;
        Player* current = head;
        while (current != nullptr) {
            current->saveToFile(file);
            current = current->getNext();
        }
        
        file.close();
        cout << "Data saved successfully to " << filename << endl;
    }
    
    void loadFromFile(const string& filename = DATA_FILE) {
        ifstream file(filename);
        if (!file.is_open()) {
            cout << "No existing data file found. Starting fresh." << endl;
            return;
        }
        
        clear();
        int playerCount;
        file >> playerCount;
        file.ignore();
        
        for (int i = 0; i < playerCount; i++) {
            Player* newPlayer = new Player();
            newPlayer->loadFromFile(file);
            
            if (head == nullptr) {
                head = tail = newPlayer;
            } else {
                tail->setNext(newPlayer);
                tail = newPlayer;
            }
            size++;
        }
        
        file.close();
        cout << "Data loaded successfully from " << filename << endl;
    }
    
    int getSize() const { return size; }
    
    Player* getHead() const { return head; }
    
    bool deletePlayer(int playerId) {
        Player* current = head;
        Player* prev = nullptr;
        
        while (current != nullptr) {
            if (current->getId() == playerId) {
                if (prev == nullptr) {
                    head = current->getNext();
                    if (head == nullptr) {
                        tail = nullptr;
                    }
                } else {
                    prev->setNext(current->getNext());
                    if (current->getNext() == nullptr) {
                        tail = prev;
                    }
                }
                delete current;
                size--;
                return true;
            }
            prev = current;
            current = current->getNext();
        }
        return false;
    }
    
    void clear() {
        Player* current = head;
        while (current != nullptr) {
            Player* next = current->getNext();
            delete current;
            current = next;
        }
        head = tail = nullptr;
        size = 0;
    }
};

// Simple JSON-like string builder
class JsonBuilder {
private:
    stringstream ss;
    bool first = true;
    
public:
    JsonBuilder() {
        ss << "{";
    }
    
    void addString(const string& key, const string& value) {
        if (!first) ss << ",";
        ss << "\"" << key << "\":\"" << value << "\"";
        first = false;
    }
    
    void addNumber(const string& key, int value) {
        if (!first) ss << ",";
        ss << "\"" << key << "\":" << value;
        first = false;
    }
    
    void addDouble(const string& key, double value) {
        if (!first) ss << ",";
        ss << "\"" << key << "\":" << fixed << setprecision(2) << value;
        first = false;
    }
    
    void addBool(const string& key, bool value) {
        if (!first) ss << ",";
        ss << "\"" << key << "\":" << (value ? "true" : "false");
        first = false;
    }
    
    void addArray(const string& key, const vector<string>& values) {
        if (!first) ss << ",";
        ss << "\"" << key << "\":[";
        for (size_t i = 0; i < values.size(); i++) {
            if (i > 0) ss << ",";
            ss << values[i];
        }
        ss << "]";
        first = false;
    }
    
    string build() {
        ss << "}";
        return ss.str();
    }
};

// Cricket API Server
class CricketAPI {
private:
    PlayerList playerList;
    SOCKET serverSocket;
    bool running;
    
public:
    CricketAPI() : running(false) {
        // Initialize Winsock
        WSADATA wsaData;
        int result = WSAStartup(MAKEWORD(2, 2), &wsaData);
        if (result != 0) {
            cerr << "WSAStartup failed: " << result << endl;
            return;
        }
        
        // Load existing data
        try {
            playerList.loadFromFile();
            cout << "Data loaded successfully from " << DATA_FILE << endl;
        } catch (const exception& e) {
            cout << "Warning: Could not load data from " << DATA_FILE << ": " << e.what() << endl;
            cout << "Starting with empty player list." << endl;
        }
    }
    
    ~CricketAPI() {
        if (running) {
            stop();
        }
        WSACleanup();
    }
    
    void start(int port = 8080) {
        serverSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (serverSocket == INVALID_SOCKET) {
            cerr << "Failed to create socket: " << WSAGetLastError() << endl;
            return;
        }
        
        // Set socket options
        int opt = 1;
        setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, (char*)&opt, sizeof(opt));
        
        sockaddr_in address;
        address.sin_family = AF_INET;
        address.sin_addr.s_addr = INADDR_ANY;
        address.sin_port = htons(port);
        
        if (bind(serverSocket, (sockaddr*)&address, sizeof(address)) == SOCKET_ERROR) {
            cerr << "Failed to bind socket: " << WSAGetLastError() << endl;
            closesocket(serverSocket);
            return;
        }
        
        if (listen(serverSocket, 10) == SOCKET_ERROR) {
            cerr << "Failed to listen: " << WSAGetLastError() << endl;
            closesocket(serverSocket);
            return;
        }
        
        running = true;
        cout << "Cricket API Server running on port " << port << endl;
        cout << "Available endpoints:" << endl;
        cout << "  GET  /api/players     - Get all players" << endl;
        cout << "  GET  /api/players/top - Get top performers" << endl;
        cout << "  GET  /api/players/form - Get players in form" << endl;
        cout << "  GET  /api/stats       - Get team statistics" << endl;
        cout << "  POST /api/players     - Add new player" << endl;
        cout << "  POST /api/matches     - Add match statistics" << endl;
        cout << "  DELETE /api/players/{id} - Delete player" << endl;
        
        while (running) {
            sockaddr_in clientAddr;
            int clientLen = sizeof(clientAddr);
            SOCKET clientSocket = accept(serverSocket, (sockaddr*)&clientAddr, &clientLen);
            
            if (clientSocket == INVALID_SOCKET) {
                continue;
            }
            
            // Handle client in the same thread (simplified)
            handleClient(clientSocket);
        }
    }
    
    void stop() {
        running = false;
        closesocket(serverSocket);
    }
    
private:
    void handleClient(SOCKET clientSocket) {
        char buffer[4096];
        int bytesRead = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
        
        if (bytesRead > 0) {
            buffer[bytesRead] = '\0';
            string request(buffer);
            
            string response = processRequest(request);
            send(clientSocket, response.c_str(), response.length(), 0);
        }
        
        closesocket(clientSocket);
    }
    
    string processRequest(const string& request) {
        istringstream iss(request);
        string method, path, version;
        iss >> method >> path >> version;
        
        // Parse headers
        string line;
        map<string, string> headers;
        while (getline(iss, line) && line != "\r") {
            if (line.find(": ") != string::npos) {
                size_t pos = line.find(": ");
                string key = line.substr(0, pos);
                string value = line.substr(pos + 2);
                if (!value.empty() && value.back() == '\r') {
                    value.pop_back();
                }
                headers[key] = value;
            }
        }
        
        // Get body
        string body;
        while (getline(iss, line)) {
            body += line + "\n";
        }
        
        // Handle CORS
        string response = "HTTP/1.1 200 OK\r\n";
        response += "Access-Control-Allow-Origin: *\r\n";
        response += "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\r\n";
        response += "Access-Control-Allow-Headers: Content-Type\r\n";
        response += "Content-Type: application/json\r\n";
        response += "\r\n";
        
        if (method == "OPTIONS") {
            return response;
        }
        
        try {
            if (method == "GET") {
                response += handleGET(path);
            } else if (method == "POST") {
                response += handlePOST(path, body);
            } else if (method == "DELETE") {
                response += handleDELETE(path);
            } else {
                response = "HTTP/1.1 405 Method Not Allowed\r\n";
                response += "Access-Control-Allow-Origin: *\r\n";
                response += "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\r\n";
                response += "Access-Control-Allow-Headers: Content-Type\r\n";
                response += "Content-Type: application/json\r\n\r\n";
                response += "{\"error\": \"Method not allowed\"}";
            }
        } catch (const exception& e) {
            JsonBuilder error;
            error.addString("error", e.what());
            response = "HTTP/1.1 500 Internal Server Error\r\n";
            response += "Access-Control-Allow-Origin: *\r\n";
            response += "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\r\n";
            response += "Access-Control-Allow-Headers: Content-Type\r\n";
            response += "Content-Type: application/json\r\n\r\n";
            response += error.build();
        }
        
        return response;
    }
    
    string handleGET(const string& path) {
        if (path == "/api/players") {
            return getAllPlayers();
        } else if (path == "/api/players/top") {
            return getTopPerformers();
        } else if (path == "/api/players/form") {
            return getPlayersInForm();
        } else if (path == "/api/stats") {
            return getTeamStats();
        } else {
            throw runtime_error("Endpoint not found");
        }
    }
    
    string handlePOST(const string& path, const string& body) {
        if (path == "/api/players") {
            return addPlayer(body);
        } else if (path == "/api/matches") {
            return addMatch(body);
        } else {
            throw runtime_error("Endpoint not found");
        }
    }
    
    string handleDELETE(const string& path) {
        if (path.find("/api/players/") == 0) {
            string playerIdStr = path.substr(13); // Remove "/api/players/"
            try {
                int playerId = stoi(playerIdStr);
                return deletePlayer(playerId);
            } catch (const exception& e) {
                throw runtime_error("Invalid player ID");
            }
        } else {
            throw runtime_error("Endpoint not found");
        }
    }
    
    string getAllPlayers() {
        string result = "[";
        bool first = true;
        
        Player* current = playerList.getHead();
        while (current != nullptr) {
            if (!first) result += ",";
            
            JsonBuilder player;
            player.addNumber("id", current->getId());
            player.addString("name", current->getName());
            player.addString("role", current->getRole());
            player.addNumber("matches", current->getTotalMatches());
            player.addDouble("average", current->getAverageScore());
            player.addNumber("bestScore", current->getBestScore());
            player.addBool("inForm", current->isInForm());
            
            result += player.build();
            first = false;
            current = current->getNext();
        }
        
        result += "]";
        return result;
    }
    
    string getTopPerformers() {
        auto topPlayers = playerList.getTopPerformers(5);
        string result = "[";
        
        for (size_t i = 0; i < topPlayers.size(); i++) {
            if (i > 0) result += ",";
            
            JsonBuilder player;
            player.addString("name", topPlayers[i]->getName());
            player.addString("role", topPlayers[i]->getRole());
            player.addDouble("average", topPlayers[i]->getAverageScore());
            
            result += player.build();
        }
        
        result += "]";
        return result;
    }
    
    string getPlayersInForm() {
        auto formPlayers = playerList.getPlayersInForm();
        string result = "[";
        
        for (size_t i = 0; i < formPlayers.size(); i++) {
            if (i > 0) result += ",";
            
            JsonBuilder player;
            player.addString("name", formPlayers[i]->getName());
            player.addString("role", formPlayers[i]->getRole());
            player.addDouble("average", formPlayers[i]->getAverageScore());
            
            result += player.build();
        }
        
        result += "]";
        return result;
    }
    
    string getTeamStats() {
        JsonBuilder stats;
        stats.addNumber("totalPlayers", playerList.getSize());
        stats.addDouble("teamAverage", playerList.getTeamAverage());
        
        auto roleAverages = playerList.getRoleAverages();
        string roles = "{";
        bool first = true;
        for (const auto& pair : roleAverages) {
            if (!first) roles += ",";
            roles += "\"" + pair.first + "\":" + to_string(pair.second);
            first = false;
        }
        roles += "}";
        
        stats.addString("roleAverages", roles);
        return stats.build();
    }
    
    string addPlayer(const string& body) {
        // Simple parsing - in production, use proper JSON parser
        string name = extractValue(body, "name");
        string role = extractValue(body, "role");
        
        if (name.empty() || role.empty()) {
            throw runtime_error("Name and role are required");
        }
        
        playerList.addPlayer(name, role);
        playerList.saveToFile();
        
        JsonBuilder response;
        response.addString("message", "Player added successfully");
        return response.build();
    }
    
    string addMatch(const string& body) {
        string playerName = extractValue(body, "playerName");
        string date = extractValue(body, "date");
        string scoreStr = extractValue(body, "score");
        string opponent = extractValue(body, "opponent");
        string venue = extractValue(body, "venue");
        string isHomeStr = extractValue(body, "isHome");
        
        if (playerName.empty() || date.empty() || scoreStr.empty()) {
            throw runtime_error("Player name, date, and score are required");
        }
        
        int score = stoi(scoreStr);
        bool isHome = (isHomeStr == "true");
        
        MatchStats match(date, score, opponent, venue, isHome);
        playerList.addPlayerStats(playerName, match);
        playerList.saveToFile();
        
        JsonBuilder response;
        response.addString("message", "Match statistics added successfully");
        return response.build();
    }

    string deletePlayer(int playerId) {
        if (playerList.deletePlayer(playerId)) {
            playerList.saveToFile();
            JsonBuilder response;
            response.addString("message", "Player deleted successfully");
            return response.build();
        } else {
            throw runtime_error("Player with ID " + to_string(playerId) + " not found.");
        }
    }
    
    string extractValue(const string& json, const string& key) {
        string searchKey = "\"" + key + "\":\"";
        size_t pos = json.find(searchKey);
        if (pos == string::npos) {
            return "";
        }
        
        pos += searchKey.length();
        size_t endPos = json.find("\"", pos);
        if (endPos == string::npos) {
            return "";
        }
        
        return json.substr(pos, endPos - pos);
    }
};

int main() {
    CricketAPI api;
    api.start(8080);
    return 0;
} 