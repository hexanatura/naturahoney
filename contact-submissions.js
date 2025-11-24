 class ContactSubmissionsManager {
    constructor() {
        this.currentSubmissions = [];
        this.filteredSubmissions = [];
        this.currentSubmissionId = null;
        this.db = null;
        this.initialize();
    }

    initialize() {
        console.log('Contact manager initializing...');
        
        // Wait for Firebase to be available
        const checkFirebase = () => {
            if (typeof firebase !== 'undefined' && window.db) {
                this.db = window.db;
                console.log('Firebase connected successfully');
                this.startApplication();
            } else {
                console.log('Waiting for Firebase...');
                setTimeout(checkFirebase, 100);
            }
        };
        
        checkFirebase();
    }

    startApplication() {
        console.log('Starting contact application...');
        this.setupEventListeners();
        this.loadSubmissions();
    }

    setupEventListeners() {
        const testBtn = document.getElementById('testDataBtn');
        if (testBtn) testBtn.addEventListener('click', () => this.addTestData());

        const closeModalBtn = document.getElementById('close-modal');
        const closeModalBtn2 = document.getElementById('close-modal-2');
        const gmailReplyBtn = document.getElementById('gmail-reply-btn');

        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeModal());
        if (closeModalBtn2) closeModalBtn2.addEventListener('click', () => this.closeModal());
        if (gmailReplyBtn) gmailReplyBtn.addEventListener('click', () => this.replyEmail());

        const modal = document.getElementById('submission-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal();
            });
        }

        const statusFilter = document.getElementById('status-filter');
        const dateFilter = document.getElementById('date-filter');

        if (statusFilter) statusFilter.addEventListener('change', () => this.applyFilters());
        if (dateFilter) dateFilter.addEventListener('change', () => this.applyFilters());

        const tableBody = document.getElementById('submissions-table-body');
        const mobileCards = document.getElementById('mobile-cards');

        if (tableBody) tableBody.addEventListener('click', (e) => this.handleAction(e));
        if (mobileCards) mobileCards.addEventListener('click', (e) => this.handleAction(e));
    }

    handleAction(e) {
        const viewBtn = e.target.closest('.view-btn');
        const replyBtn = e.target.closest('.reply-btn');
        const deleteBtn = e.target.closest('.delete-btn');

        if (viewBtn) this.openModal(viewBtn.dataset.id);
        if (replyBtn) this.replyEmailDirect(replyBtn.dataset.id);
        if (deleteBtn) this.deleteSubmission(deleteBtn.dataset.id);
    }

    showLoadingState() {
        const tableBody = document.getElementById('submissions-table-body');
        const mobileCards = document.getElementById('mobile-cards');

        if (tableBody) {
            tableBody.innerHTML = `
                <tr><td colspan="5" style="text-align:center;padding:40px;color:#666;">
                    <i class="fas fa-spinner fa-spin" style="font-size:24px;margin-bottom:10px;"></i>
                    <p>Loading messages...</p>
                </td></tr>`;
        }

        if (mobileCards) {
            mobileCards.innerHTML = `
                <div class="card" style="text-align:center;padding:30px;">
                    <i class="fas fa-spinner fa-spin" style="font-size:24px;margin-bottom:10px;"></i>
                    <p>Loading messages...</p>
                </div>`;
        }
    }

    showError(message) {
        const tableBody = document.getElementById('submissions-table-body');
        const mobileCards = document.getElementById('mobile-cards');

        if (tableBody) {
            tableBody.innerHTML = `
                <tr><td colspan="5" style="text-align:center;padding:40px;color:red;">
                    <i class="fas fa-exclamation-triangle" style="font-size:24px;margin-bottom:10px;"></i>
                    <p>${message}</p>
                    <button onclick="contactManager.loadSubmissions()" style="margin-top:10px;padding:8px 16px;background:#000;color:white;border:none;border-radius:5px;cursor:pointer;">
                        Retry
                    </button>
                </td></tr>`;
        }

        if (mobileCards) {
            mobileCards.innerHTML = `
                <div class="card" style="text-align:center;padding:30px;color:red;">
                    <i class="fas fa-exclamation-triangle" style="font-size:24px;margin-bottom:10px;"></i>
                    <p>${message}</p>
                    <button onclick="contactManager.loadSubmissions()" style="margin-top:10px;padding:8px 16px;background:#000;color:white;border:none;border-radius:5px;cursor:pointer;">
                        Retry
                    </button>
                </div>`;
        }
    }

    loadSubmissions() {
        if (!this.db) {
            this.showError("Database not ready. Please wait...");
            setTimeout(() => this.loadSubmissions(), 1000);
            return;
        }

        this.showLoadingState();

        this.db.collection("contactSubmissions")
            .orderBy("timestamp", "desc")
            .get()
            .then((snapshot) => {
                this.currentSubmissions = [];

                if (snapshot.empty) {
                    this.showNoDataMessage();
                    return;
                }

                snapshot.forEach((doc) => {
                    const item = doc.data();
                    item.id = doc.id;

                    if (item.timestamp && item.timestamp.toDate) {
                        item.date = item.timestamp.toDate().toISOString();
                    } else {
                        item.date = new Date().toISOString();
                    }

                    if (!item.status) item.status = "new";
                    if (!item.name) item.name = "Unknown";
                    if (!item.email) item.email = "No email provided";
                    if (!item.subject) item.subject = "No subject";
                    if (!item.message) item.message = "No message content";

                    this.currentSubmissions.push(item);
                });

                this.filteredSubmissions = [...this.currentSubmissions];
                this.renderTable();
                this.renderMobileCards();
            })
            .catch((error) => {
                console.error('Firebase error:', error);
                this.showError("Failed to load messages: " + error.message);
            });
    }

    showNoDataMessage() {
        const tableBody = document.getElementById('submissions-table-body');
        const mobileCards = document.getElementById('mobile-cards');

        if (tableBody) {
            tableBody.innerHTML = `
                <tr><td colspan="5" style="text-align:center;padding:60px 40px;color:#666;">
                    <i class="fas fa-inbox" style="font-size:48px;color:#ddd;margin-bottom:15px;"></i>
                    <h3 style="margin-bottom:10px;font-weight:500;">No messages yet</h3>
                    <p style="color:#888;max-width:400px;margin:0 auto;">
                        No contact form submissions found.
                    </p>
                    <button onclick="contactManager.addTestData()" style="margin-top:15px;padding:8px 16px;background:#000;color:white;border:none;border-radius:5px;cursor:pointer;">
                        Add Test Message
                    </button>
                </td></tr>`;
        }

        if (mobileCards) {
            mobileCards.innerHTML = `
                <div class="card" style="text-align:center;padding:40px 20px;">
                    <i class="fas fa-inbox" style="font-size:48px;color:#ddd;margin-bottom:15px;"></i>
                    <h3 style="margin-bottom:10px;font-weight:500;">No messages yet</h3>
                    <p style="color:#888;">Customer messages will appear here.</p>
                    <button onclick="contactManager.addTestData()" style="margin-top:15px;padding:8px 16px;background:#000;color:white;border:none;border-radius:5px;cursor:pointer;">
                        Add Test Message
                    </button>
                </div>`;
        }
    }

    // ... keep all your other methods the same (renderTable, renderMobileCards, openModal, etc.)
    // Just make sure they're included in the class

    renderTable() {
        const tableBody = document.getElementById('submissions-table-body');
        if (!tableBody) return;

        if (this.filteredSubmissions.length === 0) {
            this.showNoDataMessage();
            return;
        }

        tableBody.innerHTML = this.filteredSubmissions.map((s) => {
            const initials = s.name.split(" ").map(n => n[0] || '').join("").toUpperCase();
            const shortSubject = s.subject.length > 50 ? s.subject.substring(0, 50) + '...' : s.subject;

            return `
            <tr>
                <td>
                    <div class="user-info">
                        <div class="avatar">${initials}</div>
                        <div>
                            <div style="font-weight:600;">${s.name}</div>
                            <div style="font-size:.8rem;color:#666">${s.email}</div>
                        </div>
                    </div>
                </td>
                <td>${shortSubject}</td>
                <td style="white-space:nowrap;">${this.formatDate(s.date)}</td>
                <td><span class="status status-${s.status}">${this.formatStatus(s.status)}</span></td>
                <td>
                    <div class="actions">
                        <button class="action-btn view-btn" data-id="${s.id}"><i class="fas fa-eye"></i></button>
                        <button class="action-btn reply-btn" data-id="${s.id}"><i class="fas fa-reply"></i></button>
                        <button class="action-btn delete-btn" data-id="${s.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
        }).join("");
    }

    renderMobileCards() {
        const mobileCards = document.getElementById('mobile-cards');
        if (!mobileCards) return;

        if (this.filteredSubmissions.length === 0) {
            this.showNoDataMessage();
            return;
        }

        mobileCards.innerHTML = this.filteredSubmissions.map((s) => {
            const initials = s.name.split(" ").map(n => n[0] || '').join("").toUpperCase();

            return `
            <div class="card">
                <div class="card-row">
                    <div class="user-info">
                        <div class="avatar">${initials}</div>
                        <div>
                            <div style="font-weight:600;">${s.name}</div>
                            <div style="font-size:.8rem;color:#666">${s.email}</div>
                        </div>
                    </div>
                    <span class="status status-${s.status}">${this.formatStatus(s.status)}</span>
                </div>
                <div style="font-weight:500;margin:8px 0;">${s.subject}</div>
                <div style="font-size:.8rem;color:#666">${this.formatDate(s.date)}</div>
                <div class="card-row" style="justify-content:flex-end;margin-top:8px;">
                    <button class="action-btn view-btn" data-id="${s.id}"><i class="fas fa-eye"></i></button>
                    <button class="action-btn reply-btn" data-id="${s.id}"><i class="fas fa-reply"></i></button>
                    <button class="action-btn delete-btn" data-id="${s.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join("");
    }

    openModal(id) {
        const s = this.currentSubmissions.find(x => x.id === id);
        if (!s) return;

        this.currentSubmissionId = id;

        const message = s.message || '';
        const displayMessage = message.length > 1000 ? message.substring(0, 1000) + '...' : message;

        document.getElementById("detail-name").textContent = s.name;
        document.getElementById("detail-email").textContent = s.email;
        document.getElementById("detail-phone").textContent = s.phone || "Not provided";
        document.getElementById("detail-subject").textContent = s.subject;
        document.getElementById("detail-status").textContent = this.formatStatus(s.status);
        document.getElementById("detail-message").textContent = displayMessage;

        document.getElementById("submission-modal").style.display = "flex";

        if (s.status === "new") this.updateStatus(id, "read");
    }

    closeModal() {
        document.getElementById("submission-modal").style.display = "none";
        this.currentSubmissionId = null;
    }

    replyEmail() {
        if (!this.currentSubmissionId) return;
        this.replyEmailDirect(this.currentSubmissionId);
    }

    replyEmailDirect(id) {
        const s = this.currentSubmissions.find(x => x.id === id);
        if (!s) return;

        this.updateStatus(id, "replied");

        const sub = encodeURIComponent("Re: " + s.subject);
        const body = encodeURIComponent(
            "Hello " + s.name + ",\n\n" +
            "Thank you for your message.\n\n" +
            "--- Original Message ---\n" +
            s.message
        );

        const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(s.email)}&su=${sub}&body=${body}`;
        window.open(url, "_blank");
    }

    deleteSubmission(id) {
        if (!confirm("Are you sure you want to delete this message?")) return;

        this.db.collection("contactSubmissions").doc(id).delete()
            .then(() => {
                this.currentSubmissions = this.currentSubmissions.filter(s => s.id !== id);
                this.filteredSubmissions = this.filteredSubmissions.filter(s => s.id !== id);
                this.renderTable();
                this.renderMobileCards();
                this.showToast("Message deleted successfully.");
            })
            .catch((error) => {
                this.showToast("Error deleting message: " + error.message);
            });
    }

    applyFilters() {
        let list = [...this.currentSubmissions];

        const statusFilter = document.getElementById('status-filter');
        const dateFilter = document.getElementById('date-filter');

        if (statusFilter && statusFilter.value !== "all") {
            list = list.filter(s => s.status === statusFilter.value);
        }

        if (dateFilter && dateFilter.value !== "all") {
            const now = new Date();
            let start;

            if (dateFilter.value === "today") {
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            } else if (dateFilter.value === "week") {
                start = new Date(now - 7 * 86400000);
            } else if (dateFilter.value === "month") {
                start = new Date(now - 30 * 86400000);
            }

            list = list.filter(s => new Date(s.date) >= start);
        }

        this.filteredSubmissions = list;
        this.renderTable();
        this.renderMobileCards();
    }

    updateStatus(id, status) {
        this.db.collection("contactSubmissions").doc(id).update({
            status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            const idx = this.currentSubmissions.findIndex(s => s.id === id);
            if (idx !== -1) this.currentSubmissions[idx].status = status;

            const idx2 = this.filteredSubmissions.findIndex(s => s.id === id);
            if (idx2 !== -1) this.filteredSubmissions[idx2].status = status;

            this.renderTable();
            this.renderMobileCards();
        });
    }

    addTestData() {
        if (!this.db) {
            this.showToast("Database not ready yet. Please wait...");
            return;
        }

        const testData = {
            name: "Test Customer",
            email: "test@example.com",
            phone: "+1234567890",
            subject: "Test Inquiry About Honey Products",
            message: "Hello, I'm interested in your honey products. Can you tell me more about the different varieties you offer?",
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: "new"
        };

        this.db.collection("contactSubmissions").add(testData)
            .then(() => {
                this.showToast("Test message added successfully.");
                this.loadSubmissions();
            })
            .catch((error) => {
                this.showToast("Error adding test message: " + error.message);
            });
    }

    formatDate(d) {
        try {
            return new Date(d).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return "Invalid date";
        }
    }

    formatStatus(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    showToast(msg) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');

        if (toast && toastMessage) {
            toastMessage.textContent = msg;
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 3000);
        }
    }
}

// Initialize the contact manager
const contactManager = new ContactSubmissionsManager();
window.contactManager = contactManager;
