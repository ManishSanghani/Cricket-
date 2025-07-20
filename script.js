// Cricket Statistics Management System - Frontend JavaScript

class CricketStatsUI {
    constructor() {
        this.players = [];
        this.currentTab = 'dashboard';
        this.apiBaseUrl = 'http://localhost:8080/api';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.updateDashboard();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Forms
        document.getElementById('addPlayerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addPlayer();
        });

        document.getElementById('addMatchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMatch();
        });

        // Search
        document.getElementById('playerSearch').addEventListener('input', (e) => {
            this.filterPlayers(e.target.value);
        });

        // Modal
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Match player selection
        document.getElementById('matchPlayer').addEventListener('change', (e) => {
            this.updateScoreHint(e.target.value);
        });
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Load specific data for tab
        switch (tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'players':
                this.loadPlayers();
                break;
            case 'add-match':
                this.loadPlayerOptions();
                break;
            case 'statistics':
                this.loadStatistics();
                break;
        }
    }

    // Data Management
    async loadData() {
        console.log('Loading data from API...');
        try {
            const response = await fetch(`${this.apiBaseUrl}/players`);
            console.log('API Response status:', response.status);
            
            if (response.ok) {
                this.players = await response.json();
                console.log('Loaded players:', this.players);
                console.log('Number of players:', this.players.length);
            } else {
                console.error('Failed to load players from API - Status:', response.status);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                this.showToast('Failed to load data from server', 'error');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.showToast('Cannot connect to server. Please start the C++ backend.', 'error');
        }
    }

    async saveData() {
        // Data is saved automatically when making API calls
        // This method is kept for compatibility but doesn't need to do anything
    }

    // Player Management
    async addPlayer() {
        const form = document.getElementById('addPlayerForm');
        const formData = new FormData(form);
        
        const playerData = {
            name: formData.get('playerName'),
            role: formData.get('playerRole')
        };

        // Validate form data
        if (!playerData.name || !playerData.role) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        console.log('Adding player:', playerData); // Debug log

        try {
            const response = await fetch(`${this.apiBaseUrl}/players`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(playerData)
            });

            console.log('Response status:', response.status); // Debug log

            if (response.ok) {
                const result = await response.json();
                console.log('Success response:', result); // Debug log
                
                form.reset();
                this.showToast('Player added successfully!', 'success');
                await this.loadData();
                this.updateDashboard();
                this.loadPlayerOptions();
            } else {
                const errorText = await response.text();
                console.error('Server error:', response.status, errorText); // Debug log
                this.showToast(`Failed to add player: ${response.status}`, 'error');
            }
        } catch (error) {
            console.error('Error adding player:', error);
            this.showToast('Failed to connect to server. Please ensure the backend is running.', 'error');
        }
    }

    async addMatch() {
        const form = document.getElementById('addMatchForm');
        const formData = new FormData(form);
        
        const playerId = parseInt(formData.get('matchPlayer'));
        const player = this.players.find(p => p.id === playerId);
        
        if (!player) {
            this.showToast('Player not found!', 'error');
            return;
        }

        const matchData = {
            playerName: player.name,
            date: formData.get('matchDate'),
            score: parseInt(formData.get('matchScore')),
            opponent: formData.get('matchOpponent'),
            venue: formData.get('matchVenue'),
            isHome: formData.get('matchType') === 'home'
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/matches`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(matchData)
            });

            if (response.ok) {
                form.reset();
                this.showToast('Match statistics added successfully!', 'success');
                await this.loadData();
                this.updateDashboard();
            } else {
                const error = await response.json();
                this.showToast(error.error || 'Failed to add match statistics', 'error');
            }
        } catch (error) {
            console.error('Error adding match:', error);
            this.showToast('Failed to connect to server', 'error');
        }
    }

    async deletePlayer(playerId, playerName) {
        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to delete "${playerName}"?\n\nThis action cannot be undone and will remove all match statistics for this player.`);
        
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/players/${playerId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                this.showToast(`Player "${playerName}" deleted successfully!`, 'success');
                await this.loadData();
                this.updateDashboard();
                this.loadPlayerOptions();
            } else {
                const errorText = await response.text();
                console.error('Delete error:', response.status, errorText);
                this.showToast(`Failed to delete player: ${response.status}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting player:', error);
            this.showToast('Failed to connect to server', 'error');
        }
    }

    // Dashboard Updates
    async updateDashboard() {
        this.updateHeaderStats();
        await this.updateTopPerformers();
        await this.updatePlayersInForm();
        this.updateRoleDistribution();
        await this.updateRecentMatches();
    }

    updateHeaderStats() {
        const totalPlayers = this.players.length;
        const totalMatches = this.players.reduce((sum, player) => sum + (player.stats ? player.stats.length : 0), 0);
        const teamAverage = this.calculateTeamAverage();

        document.getElementById('totalPlayers').textContent = totalPlayers;
        document.getElementById('totalMatches').textContent = totalMatches;
        document.getElementById('teamAverage').textContent = teamAverage.toFixed(1);
    }

    async updateTopPerformers() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/players/top`);
            if (response.ok) {
                const topPerformers = await response.json();
                const container = document.getElementById('topPerformers');
                
                if (topPerformers.length === 0) {
                    container.innerHTML = '<div class="empty-state"><i class="fas fa-trophy"></i><h3>No Players</h3><p>Add players to see top performers</p></div>';
                    return;
                }

                container.innerHTML = topPerformers.map((player, index) => `
                    <div class="performer-item">
                        <div class="performer-info">
                            <div class="performer-rank">${index + 1}</div>
                            <div class="performer-details">
                                <h4>${player.name}</h4>
                                <span>${player.role}</span>
                            </div>
                        </div>
                        <div class="performer-score">${player.average.toFixed(1)}</div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading top performers:', error);
        }
    }

    async updatePlayersInForm() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/players/form`);
            if (response.ok) {
                const inFormPlayers = await response.json();
                const container = document.getElementById('playersInForm');
                
                if (inFormPlayers.length === 0) {
                    container.innerHTML = '<div class="empty-state"><i class="fas fa-fire"></i><h3>No Players in Form</h3><p>Players need at least 3 matches to be in form</p></div>';
                    return;
                }

                container.innerHTML = inFormPlayers.map(player => `
                    <div class="form-player">
                        <i class="fas fa-fire"></i>
                        <span>${player.name} (${player.role})</span>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading players in form:', error);
        }
    }

    updateRoleDistribution() {
        const batsmen = this.players.filter(p => p.role === 'batsman').length;
        const bowlers = this.players.filter(p => p.role === 'bowler').length;
        
        document.getElementById('batsmenCount').textContent = batsmen;
        document.getElementById('bowlersCount').textContent = bowlers;
    }

    async updateRecentMatches() {
        // For now, we'll use the local data since the API doesn't have a recent matches endpoint
        // You can add this endpoint to your C++ backend if needed
        const recentMatches = this.getRecentMatches(5);
        const container = document.getElementById('recentMatches');
        
        if (recentMatches.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-home"></i><h3>No Recent Matches</h3><p>Add match statistics to see recent matches</p></div>';
            return;
        }

        container.innerHTML = recentMatches.map(match => `
            <div class="match-item">
                <div class="match-date">${this.formatDate(match.date)}</div>
                <div class="match-details">${match.player} vs ${match.opponent} at ${match.venue}</div>
            </div>
        `).join('');
    }

    // Players Tab
    async loadPlayers() {
        await this.loadData(); // Refresh data from server
        this.displayPlayers(this.players);
    }

    displayPlayers(players) {
        const container = document.getElementById('playersGrid');
        
        if (players.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No Players</h3>
                    <p>Add players to get started</p>
                    <button onclick="refreshPlayers()" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-sync-alt"></i> Refresh Data
                    </button>
                </div>`;
            return;
        }

        container.innerHTML = players.map(player => `
            <div class="player-card">
                <div class="player-header">
                    <div class="player-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="player-name">${player.name}</div>
                    <div class="player-role">${player.role}</div>
                </div>
                <div class="player-stats">
                    <div class="stat-row">
                        <span class="stat-label">Matches</span>
                        <span class="stat-value">${player.stats ? player.stats.length : 0}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Average</span>
                        <span class="stat-value">${this.calculatePlayerAverage(player).toFixed(1)}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Best</span>
                        <span class="stat-value">${this.getPlayerBestScore(player)}</span>
                    </div>
                </div>
                <div class="player-actions">
                    <button class="btn btn-primary" onclick="cricketUI.showPlayerDetails(${player.id}); event.stopPropagation();" style="padding: 0.5rem 1rem; font-size: 0.8rem;">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-danger" onclick="cricketUI.deletePlayer(${player.id}, '${player.name}'); event.stopPropagation();" style="padding: 0.5rem 1rem; font-size: 0.8rem;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterPlayers(searchTerm) {
        const filtered = this.players.filter(player => 
            player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.displayPlayers(filtered);
    }

    // Player Details Modal
    showPlayerDetails(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        const modal = document.getElementById('playerModal');
        const content = document.getElementById('playerModalContent');
        
        const average = this.calculatePlayerAverage(player);
        const bestScore = this.getPlayerBestScore(player);
        const homeMatches = player.stats ? player.stats.filter(s => s.isHome).length : 0;
        const awayMatches = player.stats ? player.stats.length - homeMatches : 0;
        const homeAverage = this.calculatePlayerHomeAverage(player);
        const awayAverage = this.calculatePlayerAwayAverage(player);
        const isInForm = this.isPlayerInForm(player);

        content.innerHTML = `
            <div style="padding: 2rem;">
                <h2 style="margin-bottom: 1rem; color: #333;">${player.name}</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                        <h4 style="margin-bottom: 0.5rem;">Basic Info</h4>
                        <p><strong>Role:</strong> ${player.role}</p>
                        <p><strong>Total Matches:</strong> ${player.stats ? player.stats.length : 0}</p>
                        <p><strong>Average:</strong> ${average.toFixed(1)}</p>
                        <p><strong>Best Score:</strong> ${bestScore}</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                        <h4 style="margin-bottom: 0.5rem;">Home/Away</h4>
                        <p><strong>Home Matches:</strong> ${homeMatches} (Avg: ${homeAverage.toFixed(1)})</p>
                        <p><strong>Away Matches:</strong> ${awayMatches} (Avg: ${awayAverage.toFixed(1)})</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                        <h4 style="margin-bottom: 0.5rem;">Form Status</h4>
                        <p><strong>In Form:</strong> ${isInForm ? 'Yes' : 'No'}</p>
                    </div>
                </div>
                <h3 style="margin-bottom: 1rem;">Match History</h3>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${player.stats && player.stats.length > 0 ? `
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8f9fa;">
                                    <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #dee2e6;">Date</th>
                                    <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #dee2e6;">Score</th>
                                    <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #dee2e6;">Opponent</th>
                                    <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #dee2e6;">Venue</th>
                                    <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid #dee2e6;">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${player.stats.map(stat => `
                                    <tr>
                                        <td style="padding: 0.75rem; border-bottom: 1px solid #dee2e6;">${this.formatDate(stat.date)}</td>
                                        <td style="padding: 0.75rem; border-bottom: 1px solid #dee2e6;">${stat.score}</td>
                                        <td style="padding: 0.75rem; border-bottom: 1px solid #dee2e6;">${stat.opponent}</td>
                                        <td style="padding: 0.75rem; border-bottom: 1px solid #dee2e6;">${stat.venue}</td>
                                        <td style="padding: 0.75rem; border-bottom: 1px solid #dee2e6;">${stat.isHome ? 'Home' : 'Away'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p>No match history available.</p>'}
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('playerModal').style.display = 'none';
    }

    // Statistics Tab
    async loadStatistics() {
        await this.updateStatistics();
    }

    async updateStatistics() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/stats`);
            if (response.ok) {
                const stats = await response.json();
                
                document.getElementById('totalPlayersStat').textContent = stats.totalPlayers;
                document.getElementById('totalMatchesStat').textContent = stats.totalMatches || 0;
                document.getElementById('teamAverageStat').textContent = stats.teamAverage.toFixed(1);

                const roleContainer = document.getElementById('roleAverages');
                if (stats.roleAverages) {
                    roleContainer.innerHTML = Object.entries(stats.roleAverages).map(([role, average]) => `
                        <div class="stat-row">
                            <span>${role.charAt(0).toUpperCase() + role.slice(1)}</span>
                            <span>${average.toFixed(1)}</span>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    // Utility Functions
    loadPlayerOptions() {
        const select = document.getElementById('matchPlayer');
        select.innerHTML = '<option value="">Select Player</option>' +
            this.players.map(player => `<option value="${player.id}">${player.name} (${player.role})</option>`).join('');
    }

    updateScoreHint(playerId) {
        const player = this.players.find(p => p.id === parseInt(playerId));
        const hint = document.getElementById('scoreHint');
        if (player) {
            hint.textContent = `Enter ${player.role === 'batsman' ? 'runs' : 'wickets'} for ${player.name}`;
        } else {
            hint.textContent = 'Enter runs for batsmen or wickets for bowlers';
        }
    }

    // Calculations
    calculatePlayerAverage(player) {
        if (!player.stats || player.stats.length === 0) return 0;
        const total = player.stats.reduce((sum, stat) => sum + stat.score, 0);
        return total / player.stats.length;
    }

    getPlayerBestScore(player) {
        if (!player.stats || player.stats.length === 0) return 0;
        return Math.max(...player.stats.map(stat => stat.score));
    }

    calculatePlayerHomeAverage(player) {
        if (!player.stats) return 0;
        const homeStats = player.stats.filter(stat => stat.isHome);
        if (homeStats.length === 0) return 0;
        const total = homeStats.reduce((sum, stat) => sum + stat.score, 0);
        return total / homeStats.length;
    }

    calculatePlayerAwayAverage(player) {
        if (!player.stats) return 0;
        const awayStats = player.stats.filter(stat => !stat.isHome);
        if (awayStats.length === 0) return 0;
        const total = awayStats.reduce((sum, stat) => sum + stat.score, 0);
        return total / awayStats.length;
    }

    isPlayerInForm(player) {
        if (!player.stats || player.stats.length < 3) return false;
        const recentStats = player.stats.slice(-3);
        const recentAverage = recentStats.reduce((sum, stat) => sum + stat.score, 0) / recentStats.length;
        const overallAverage = this.calculatePlayerAverage(player);
        return recentAverage > overallAverage;
    }

    calculateTeamAverage() {
        if (this.players.length === 0) return 0;
        const totalAverage = this.players.reduce((sum, player) => sum + this.calculatePlayerAverage(player), 0);
        return totalAverage / this.players.length;
    }

    getTopPerformers(count = 5) {
        return this.players
            .map(player => ({
                ...player,
                average: this.calculatePlayerAverage(player)
            }))
            .sort((a, b) => b.average - a.average)
            .slice(0, count);
    }

    getPlayersInForm() {
        return this.players.filter(player => this.isPlayerInForm(player));
    }

    getRecentMatches(count = 5) {
        const allMatches = [];
        this.players.forEach(player => {
            if (player.stats) {
                player.stats.forEach(stat => {
                    allMatches.push({
                        ...stat,
                        player: player.name
                    });
                });
            }
        });
        
        return allMatches
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, count);
    }

    getRoleAverages() {
        const roleStats = {};
        const roleCounts = {};
        
        this.players.forEach(player => {
            const average = this.calculatePlayerAverage(player);
            if (!roleStats[player.role]) {
                roleStats[player.role] = 0;
                roleCounts[player.role] = 0;
            }
            roleStats[player.role] += average;
            roleCounts[player.role]++;
        });
        
        const averages = {};
        Object.keys(roleStats).forEach(role => {
            averages[role] = roleStats[role] / roleCounts[role];
        });
        
        return averages;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Test function for debugging
function testAddPlayer() {
    console.log('Testing Add Player functionality...');
    
    // Test server connection
    fetch('http://localhost:8080/api/players')
        .then(response => {
            console.log('Server connection test:', response.status);
            if (response.ok) {
                console.log('✅ Server is running');
                alert('✅ Server is running and responding!');
            } else {
                console.log('❌ Server error:', response.status);
                alert(`❌ Server error: ${response.status}`);
            }
        })
        .catch(error => {
            console.error('❌ Connection failed:', error);
            alert('❌ Cannot connect to server. Please start the backend.');
        });
}

// Refresh players function
function refreshPlayers() {
    console.log('Manual refresh triggered...');
    if (cricketUI) {
        cricketUI.loadPlayers();
    } else {
        console.error('cricketUI not initialized');
    }
}

// Initialize the UI when the page loads
let cricketUI;
document.addEventListener('DOMContentLoaded', () => {
    cricketUI = new CricketStatsUI();
}); 