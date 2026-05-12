// Habit Tracker Application
class HabitTracker {
    constructor() {
        this.habitInput = document.getElementById('habitInput');
        this.logBtn = document.getElementById('logBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.charCount = document.getElementById('charCount');
        
        // Streak display elements
        this.streakCount = document.getElementById('streakCount');
        this.lastHabit = document.getElementById('lastHabit');
        this.lastDate = document.getElementById('lastDate');
        this.daysInRow = document.getElementById('daysInRow');
        this.totalDays = document.getElementById('totalDays');
        this.progressFill = document.getElementById('progressFill');
        
        // Local storage key
        this.storageKey = 'habitTrackerData';
        
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
        this.logBtn.addEventListener('click', () => this.logHabit());
        this.resetBtn.addEventListener('click', () => this.resetStreak());
        this.clearBtn.addEventListener('click', () => this.clearAllData());
        this.habitInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.logHabit();
        });
        this.habitInput.addEventListener('input', () => {
            this.charCount.textContent = this.habitInput.value.length;
        });
    }
    
    loadData() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            this.data = {
                habits: [],
                lastLogDate: null,
                streak: 0,
                totalDays: 0
            };
        }
    }
    
    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }
    
    logHabit() {
        const habitText = this.habitInput.value.trim();
        
        if (!habitText) {
            this.showToast('Please enter a habit! 🤔');
            return;
        }
        
        const today = this.getDateString(new Date());
        
        // Check if habit already logged today
        if (this.data.lastLogDate === today) {
            this.showToast('You\'ve already logged today! 💪');
            return;
        }
        
        // Check if yesterday was logged (for streak continuity)
        const yesterday = this.getDateString(new Date(Date.now() - 86400000));
        
        if (this.data.lastLogDate === null) {
            // First habit
            this.data.streak = 1;
        } else if (this.data.lastLogDate === yesterday) {
            // Streak continues
            this.data.streak++;
        } else {
            // Streak broken, restart
            this.data.streak = 1;
        }
        
        // Add habit to log
        this.data.habits.push({
            habit: habitText,
            date: today,
            timestamp: Date.now()
        });
        
        this.data.lastLogDate = today;
        this.data.totalDays = this.data.habits.length;
        
        this.saveData();
        this.updateUI();
        this.habitInput.value = '';
        this.charCount.textContent = '0';
        
        this.showToast(`🎉 Awesome! Your streak is ${this.data.streak} days!`);
    }
    
    resetStreak() {
        if (this.data.streak === 0) {
            this.showToast('No streak to reset! 📝');
            return;
        }
        
        const confirmed = confirm(`⚠️ Reset your ${this.data.streak}-day streak? This cannot be undone.`);
        if (confirmed) {
            this.data.streak = 0;
            this.data.lastLogDate = null;
            this.saveData();
            this.updateUI();
            this.showToast('Streak reset. Ready to start fresh? 🚀');
        }
    }
    
    clearAllData() {
        const confirmed = confirm('🗑️ Delete all habit data? This cannot be undone.');
        if (confirmed) {
            localStorage.removeItem(this.storageKey);
            this.data = {
                habits: [],
                lastLogDate: null,
                streak: 0,
                totalDays: 0
            };
            this.updateUI();
            this.showToast('All data cleared! Starting fresh 🌱');
        }
    }
    
    updateUI() {
        // Update streak
        this.streakCount.textContent = this.data.streak;
        this.daysInRow.textContent = this.data.streak;
        this.totalDays.textContent = this.data.totalDays;
        
        // Update last logged
        if (this.data.lastLogDate) {
            const lastHabitObj = this.data.habits[this.data.habits.length - 1];
            this.lastHabit.textContent = lastHabitObj.habit;
            this.lastDate.textContent = this.formatDate(this.data.lastLogDate);
        } else {
            this.lastHabit.textContent = 'No habit logged yet';
            this.lastDate.textContent = '—';
        }
        
        // Update progress bar (max 365 days)
        const progress = Math.min((this.data.totalDays / 30) * 100, 100);
        this.progressFill.style.width = progress + '%';
        
        // Add animation class
        this.progressFill.style.transition = 'width 0.5s ease-out';
        
        // Update streak card animation based on streak
        const streakCard = document.querySelector('.streak-card');
        if (this.data.streak > 0 && this.data.streak % 10 === 0) {
            streakCard.style.animation = 'none';
            setTimeout(() => {
                streakCard.style.animation = 'pulse 0.5s ease-out';
            }, 10);
        }
    }
    
    getDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
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
    new HabitTracker();
});
