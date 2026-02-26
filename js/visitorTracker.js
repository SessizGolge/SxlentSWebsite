// Visitor Counter - Tracks unique visitors with 2-minute cooldown
class VisitorTracker {
  constructor() {
    this.localStorageKey = 'visitorData';
    this.visitorIdKey = 'visitorId';
    this.cooldownTime = 2 * 60 * 1000; // 2 minutes in milliseconds
    this.db = null;
    this.init();
  }

  init() {
    // Initialize Firestore
    if (firebase.apps.length > 0) {
      this.db = firebase.firestore();
      this.trackVisitor();
    }
  }

  generateVisitorId() {
    // Generate a unique ID for this visitor
    return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getOrCreateVisitorId() {
    let visitorId = localStorage.getItem(this.visitorIdKey);
    if (!visitorId) {
      visitorId = this.generateVisitorId();
      localStorage.setItem(this.visitorIdKey, visitorId);
    }
    return visitorId;
  }

  shouldCountVisit() {
    const data = localStorage.getItem(this.localStorageKey);
    
    if (!data) {
      // First visit
      return true;
    }

    const lastVisit = JSON.parse(data);
    const timeSinceLastVisit = Date.now() - lastVisit.timestamp;

    // Only count if more than 2 minutes have passed
    return timeSinceLastVisit > this.cooldownTime;
  }

  recordVisitTime() {
    const visitorId = this.getOrCreateVisitorId();
    const visitData = {
      visitorId: visitorId,
      timestamp: Date.now()
    };
    localStorage.setItem(this.localStorageKey, JSON.stringify(visitData));
  }

  async trackVisitor() {
    try {
      if (this.shouldCountVisit()) {
        const visitorId = this.getOrCreateVisitorId();

        // Add visitor to Firestore
        await this.db.collection('visitors').doc(visitorId).set({
          visitorId: visitorId,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          userAgent: navigator.userAgent
        }, { merge: true });

        // Update the counter display
        this.recordVisitTime();
        this.updateCounterDisplay();

        console.log('✅ Visitor counted:', visitorId);
      } else {
        // Still within cooldown - just display the current count
        this.updateCounterDisplay();
        console.log('⏱️ Within cooldown period - visitor not recounted');
      }
    } catch (error) {
      console.error('Error tracking visitor:', error);
      // Still try to display counter even if tracking failed
      this.updateCounterDisplay();
    }
  }

  async updateCounterDisplay() {
    try {
      const counterElement = document.getElementById('visitorCount');
      if (!counterElement) return;

      // Get the count of unique visitors from Firestore
      const snapshot = await this.db.collection('visitors').get();
      const count = snapshot.size;

      counterElement.textContent = count.toLocaleString();
    } catch (error) {
      console.error('Error updating counter display:', error);
      // Show a fallback message
      const counterElement = document.getElementById('visitorCount');
      if (counterElement) {
        counterElement.textContent = 'Many';
      }
    }
  }
}

// Initialize tracker when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.visitorTracker = new VisitorTracker();
  });
} else {
  window.visitorTracker = new VisitorTracker();
}
