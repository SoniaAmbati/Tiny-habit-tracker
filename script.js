// Multi-Habit Tracker Application
class MultiHabitTracker {
    constructor() {
        this.newHabitInput = document.getElementById('newHabitInput');
        this.addHabitBtn = document.getElementById('addHabitBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.habitsGrid = document.getElementById('habitsGrid');
        this.newCharCount = document.getElementById('newCharCount');
        this.activeHabitsCount = document.getElementById('activeHabitsCount');
        this.loggedTodayCount = document.getElementById('loggedTodayCount');
        
        // Local storage key
        this.storageKey = 'multiHabitTrackerData';
        
        // Motivational quotes
        this.quotes = [
            'Success is the sum of small efforts repeated day in and day out.',
            'You don\'t have to see the whole staircase, just take the first step.',
            'The only way to do great work is to love what you do.',
            'Believe you can and you\'re halfway there.',
            'Motivation is what gets you started. Habit is what keeps you going.',
            'A journey of a thousand miles begins with a single step.',
            'Progress, not perfection.',
            'Be the change you wish to see in the world.',
        ];
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateUI();
        this.displayRandomQuote();
    }
    
    setupEventListeners() {
        this.addHabitBtn.addEventListener('click', () => this.addNewHabit());
        this.clearBtn.addEventListener('click', () => this.clearAllData());
        this.newHabitInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addNewHabit();
        });
        this.newHabitInput.addEventListener('input', () => {
            this.newCharCount.textContent = this.newHabitInput.value.length;
        });
    }
    
    loadData() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            this.data = {
                habits: []
            };
        }
    }
    
    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }
    
    addNewHabit() {
        const habitName = this.newHabitInput.value.trim();
        
        if (!habitName) {
            this.showToast('Please enter a habit name! 🤔');
            return;
        }
        
        // Check if habit already exists
        if (this.data.habits.some(h => h.name.toLowerCase() === habitName.toLowerCase())) {
            this.showToast('This habit already exists! 📝');
            return;
        }
        
        const newHabit = {
            id: Date.now(),
            name: habitName,
            streak: 0,
            lastLogDate: null,
            totalDays: 0,
            loggedToday: false,
            createdDate: this.getDateString(new Date())
        };
        
        this.data.habits.push(newHabit);
        this.saveData();
        this.updateUI();
        this.newHabitInput.value = '';
        this.newCharCount.textContent = '0';
        
        this.showToast(`🎉 "${habitName}" added! Start logging!`);
    }
    
    deleteHabit(habitId) {
        const habit = this.data.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        const confirmed = confirm(`Delete "${habit.name}" and all its data? This cannot be undone.`);
        if (confirmed) {
            this.data.habits = this.data.habits.filter(h => h.id !== habitId);
            this.saveData();
            this.updateUI();
            this.showToast(`"${habit.name}" deleted 🗑️`);
        }
    }
    
    editHabitName(habitId) {
        const habit = this.data.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        const newName = prompt(`Edit habit name:\n\n(Current: "${habit.name}")`, habit.name);
        
        if (newName === null) return; // User cancelled
        
        const trimmed = newName.trim();
        if (!trimmed) {
            this.showToast('Habit name cannot be empty! 📝');
            return;
        }
        
        // Check if name already exists
        if (this.data.habits.some(h => h.id !== habitId && h.name.toLowerCase() === trimmed.toLowerCase())) {
            this.showToast('This habit name already exists! 📝');
            return;
        }
        
        const oldName = habit.name;
        habit.name = trimmed;
        this.saveData();
        this.updateUI();
        this.showToast(`✏️ "${oldName}" renamed to "${trimmed}"`);
    }
    
    logHabit(habitId) {
        const habit = this.data.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        const today = this.getDateString(new Date());
        
        // Check if already logged today
        if (habit.loggedToday) {
            this.showToast(`Already logged "${habit.name}" today! 💪`);
            return;
        }
        
        // Check if yesterday was logged (for streak continuity)
        const yesterday = this.getDateString(new Date(Date.now() - 86400000));
        
        if (habit.lastLogDate === null) {
            // First log
            habit.streak = 1;
        } else if (habit.lastLogDate === yesterday) {
            // Streak continues
            habit.streak++;
        } else {
            // Streak broken, restart
            habit.streak = 1;
        }
        
        habit.lastLogDate = today;
        habit.totalDays++;
        habit.loggedToday = true;
        
        this.saveData();
        this.updateUI();
        
        this.showToast(`🔥 "${habit.name}" logged! Streak: ${habit.streak} days!`);
    }
    
    resetStreakForHabit(habitId) {
        const habit = this.data.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        if (habit.streak === 0) {
            this.showToast('No streak to reset! 📝');
            return;
        }
        
        const confirmed = confirm(`Reset "${habit.name}" streak from ${habit.streak} days? This cannot be undone.`);
        if (confirmed) {
            habit.streak = 0;
            habit.lastLogDate = null;
            this.saveData();
            this.updateUI();
            this.showToast(`Streak reset for "${habit.name}". Ready to start fresh? 🚀`);
        }
    }
    
    clearAllData() {
        const confirmed = confirm('🗑️ Delete ALL habits and data? This cannot be undone.');
        if (confirmed) {
            localStorage.removeItem(this.storageKey);
            this.data = { habits: [] };
            this.updateUI();
            this.showToast('All data cleared! Starting fresh 🌱');
        }
    }
    
    updateUI() {
        this.updateStats();
        this.renderHabits();
        this.resetDailyCheckmarks();
    }
    
    updateStats() {
        const activeCount = this.data.habits.length;
        const loggedTodayCount = this.data.habits.filter(h => h.loggedToday).length;
        
        this.activeHabitsCount.textContent = activeCount;
        this.loggedTodayCount.textContent = loggedTodayCount;
    }
    
    resetDailyCheckmarks() {
        // Reset daily checkmarks at midnight
        const today = this.getDateString(new Date());
        
        this.data.habits.forEach(habit => {
            if (habit.lastLogDate !== today) {
                habit.loggedToday = false;
            }
        });
        
        this.saveData();
    }
    
    renderHabits() {
        if (this.data.habits.length === 0) {
            this.habitsGrid.innerHTML = '<div class="empty-state"><p>No habits yet. Create your first one above! 🌱</p></div>';
            return;
        }
        
        this.habitsGrid.innerHTML = this.data.habits.map(habit => this.createHabitCard(habit)).join('');
        
        // Attach event listeners to habit card buttons
        this.data.habits.forEach(habit => {
            const logBtn = document.querySelector(`[data-habit-log="${habit.id}"]`);
            const editBtn = document.querySelector(`[data-habit-edit="${habit.id}"]`);
            const deleteBtn = document.querySelector(`[data-habit-delete="${habit.id}"]`);
            const resetBtn = document.querySelector(`[data-habit-reset="${habit.id}"]`);
            
            if (logBtn) logBtn.addEventListener('click', () => this.logHabit(habit.id));
            if (editBtn) editBtn.addEventListener('click', () => this.editHabitName(habit.id));
            if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteHabit(habit.id));
            if (resetBtn) resetBtn.addEventListener('click', () => this.resetStreakForHabit(habit.id));
        });
    }
    
    createHabitCard(habit) {
        const loggedClass = habit.loggedToday ? 'logged' : '';
        const logBtnDisabled = habit.loggedToday ? 'disabled' : '';
        const logBtnText = habit.loggedToday ? '✓ Logged Today' : '✓ Log Today';
        const lastDateText = habit.lastLogDate ? `Last logged: ${this.formatDate(habit.lastLogDate)}` : 'Never logged';
        
        return `
            <div class="habit-card ${loggedClass}">
                <div class="habit-header">
                    <h3 class="habit-name">${this.escapeHtml(habit.name)}</h3>
                    <div class="habit-actions">
                        <button class="habit-edit-btn" data-habit-edit="${habit.id}" title="Edit">✏️</button>
                        <button class="habit-delete-btn" data-habit-delete="${habit.id}" title="Delete">🗑️</button>
                    </div>
                </div>
                
                <div class="habit-content">
                    <div class="habit-stat">
                        <span class="habit-stat-label">🔥 Current Streak</span>
                        <span class="habit-stat-value streak">${habit.streak}</span>
                        <span class="habit-stat-label">days</span>
                    </div>
                    <div class="habit-stat">
                        <span class="habit-stat-label">📊 Total Logged</span>
                        <span class="habit-stat-value total">${habit.totalDays}</span>
                        <span class="habit-stat-label">times</span>
                    </div>
                </div>
                
                <div class="habit-footer">
                    <button class="habit-log-btn" data-habit-log="${habit.id}" ${logBtnDisabled}>${logBtnText}</button>
                    ${habit.streak > 0 ? `<button class="habit-edit-btn" data-habit-reset="${habit.id}" style="padding: 12px 16px; flex: 0;" title="Reset Streak">🔄</button>` : ''}
                </div>
                
                <div class="habit-last-date">${lastDateText}</div>
            </div>
        `;
    }
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    getDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.4s ease-out reverse';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
    
    displayRandomQuote() {
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        document.getElementById('quote').textContent = this.quotes[randomIndex];
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MultiHabitTracker();
});
