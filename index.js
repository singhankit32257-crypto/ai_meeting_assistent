/* ==========================================
   MEETMIND AI - APPLICATION ENGINE
========================================== */

"use strict";

const DB = {
    meetings: "meetmind_v2_meetings",
    tasks: "meetmind_v2_tasks",
    decisions: "meetmind_v2_decisions",
    settings: "meetmind_v2_settings"
};

const initialMeetings = [
    {
        id: 1,
        title: "Product Strategy & Planning",
        date: "2026-11-05",
        duration: "45 min",
        people: 5,
        status: "Completed",
        summary: "Discussed product roadmap, feature priorities and launch planning.",
        decisions: ["Prioritize dashboard improvements"],
        color: "purple"
    },
    {
        id: 2,
        title: "Weekly Team Standup",
        date: "2026-11-04",
        duration: "30 min",
        people: 4,
        status: "Completed",
        summary: "Team progress updates, blockers and upcoming deliverables.",
        decisions: ["Complete pending development tasks"],
        color: "blue"
    },
    {
        id: 3,
        title: "Marketing Campaign Review",
        date: "2026-11-03",
        duration: "52 min",
        people: 6,
        status: "Processing",
        summary: "Campaign performance and next steps are awaiting review.",
        decisions: [],
        color: "orange"
    }
];

const initialTasks = [
    {
        id: 1,
        title: "Complete homepage redesign",
        person: "ankit singh",
        date: "2026-11-06",
        priority: "High",
        done: false
    },
    {
        id: 2,
        title: "Prepare database documentation",
        person: "Priyanshu",
        date: "2026-11-07",
        priority: "Medium",
        done: false
    },
    {
        id: 3,
        title: "Review project presentation",
        person: "Rishi Sharma",
        date: "2026-11-08",
        priority: "Low",
        done: true
    }
];

const initialDecisions = [
    {
        id: 1,
        title: "Prioritize dashboard improvements",
        meeting: "Product Strategy & Planning",
        date: "2026-11-05"
    },
    {
        id: 2,
        title: "Complete pending development tasks",
        meeting: "Weekly Team Standup",
        date: "2026-11-04"
    }
];

function load(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : structuredClone(fallback);
    } catch (error) {
        console.error("Storage read error:", error);
        return structuredClone(fallback);
    }
}

let meetings = load(DB.meetings, initialMeetings);
let tasks = load(DB.tasks, initialTasks);
let decisions = load(DB.decisions, initialDecisions);

let settings = load(DB.settings, {
    name: "ankit singh",
    email: "singhankiy32257@example.com",
    notifications: true
});

let currentPage = "overview";
let uploadedFile = null;
let assistantMessages = [
    {
        role: "assistant",
        text: "Hello! Welcome to MeetMind AI. I can help organize your meeting workspace. Real AI meeting analysis requires backend integration."
    }
];

const $ = selector => document.querySelector(selector);

const pageContent = $("#pageContent");
const modalOverlay = $("#modalOverlay");
const modalContent = $("#modalContent");
const toastElement = $("#toast");

function saveAll() {
    try {
        localStorage.setItem(DB.meetings, JSON.stringify(meetings));
        localStorage.setItem(DB.tasks, JSON.stringify(tasks));
        localStorage.setItem(DB.decisions, JSON.stringify(decisions));
        localStorage.setItem(DB.settings, JSON.stringify(settings));
    } catch (error) {
        console.error("Storage save error:", error);
        toast("Unable to save data. Browser storage may be full.");
    }
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function formatDate(date) {
    if (!date) return "No deadline";

    const parsed = new Date(date + "T00:00:00");

    if (Number.isNaN(parsed.getTime())) return "No deadline";

    return parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function toast(message) {
    toastElement.textContent = message;
    toastElement.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
        toastElement.classList.remove("show");
    }, 3000);
}

function openModal(html) {
    modalContent.innerHTML = html;
    modalOverlay.classList.add("show");
}

function closeModal() {
    modalOverlay.classList.remove("show");
    modalContent.innerHTML = "";
}

modalOverlay.addEventListener("click", event => {
    if (event.target === modalOverlay) closeModal();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
});

/* ==========================================
   NAVIGATION
========================================== */

const pageNames = {
    overview: "Overview",
    meetings: "My Meetings",
    upload: "Upload Meeting",
    tasks: "Tasks & Actions",
    decisions: "Decisions",
    assistant: "AI Assistant",
    reports: "Reports",
    settings: "Settings"
};

function navigate(page) {
    if (!pageNames[page]) return;

    currentPage = page;

    document.querySelectorAll(".nav-item[data-page]").forEach(button => {
        button.classList.toggle("active", button.dataset.page === page);
    });

    $("#breadcrumb").textContent = pageNames[page];

    $("#sidebar").classList.remove("open");
    $("#sidebarOverlay").classList.remove("show");

    render();
}

document.querySelectorAll(".nav-item[data-page]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.page));
});

$("#menuButton").addEventListener("click", () => {
    $("#sidebar").classList.add("open");
    $("#sidebarOverlay").classList.add("show");
});

$("#closeSidebar").addEventListener("click", () => {
    $("#sidebar").classList.remove("open");
    $("#sidebarOverlay").classList.remove("show");
});

$("#sidebarOverlay").addEventListener("click", () => {
    $("#sidebar").classList.remove("open");
    $("#sidebarOverlay").classList.remove("show");
});

$("#notificationButton").addEventListener("click", () => {
    toast("You're all caught up!");
});

/* ==========================================
   STATISTICS
========================================== */

function statistics() {
    const completedTasks = tasks.filter(task => task.done).length;

    return {
        totalMeetings: meetings.length,
        completedMeetings: meetings.filter(meeting => meeting.status === "Completed").length,
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks: tasks.length - completedTasks,
        decisions: decisions.length
    };
}

function statCard(icon, title, value, color) {
    return `
        <div class="stat-card">
            <div class="stat-top">
                <div class="stat-icon ${color}">${icon}</div>
                <span class="stat-change">● Live</span>
            </div>
            <p>${title}</p>
            <h2>${value}</h2>
            <span class="stat-caption">Workspace data</span>
        </div>
    `;
}

function panelHeader(title, subtitle, action = "") {
    return `
        <div class="panel-header">
            <div>
                <h2>${title}</h2>
                <p>${subtitle}</p>
            </div>
            ${action}
        </div>
    `;
}

/* ==========================================
   MEETING COMPONENTS
========================================== */

function meetingRow(meeting) {
    return `
        <div class="meeting-item">
            <div class="meeting-icon ${escapeHTML(meeting.color)}">♬</div>

            <div class="meeting-info">
                <h3>${escapeHTML(meeting.title)}</h3>

                <div class="meeting-meta">
                    <span>▣ ${formatDate(meeting.date)}</span>
                    <span>◷ ${escapeHTML(meeting.duration)}</span>
                    <span>♙ ${Number(meeting.people) || 0}</span>
                </div>
            </div>

            <span class="status ${meeting.status === "Completed" ? "success" : "warning"}">
                ${escapeHTML(meeting.status)}
            </span>

            <button class="icon-btn" data-action="view-meeting" data-id="${meeting.id}">↗</button>
        </div>
    `;
}

function renderMeetings() {
    const query = $("#globalSearch").value.trim().toLowerCase();

    const filtered = meetings.filter(meeting =>
        `${meeting.title} ${meeting.summary} ${meeting.status}`
            .toLowerCase()
            .includes(query)
    );

    return `
        <div class="page-heading">
            <h1>Your Meetings</h1>
            <p>Manage and organize all your meeting recordings.</p>
        </div>

        <div class="panel">
            ${panelHeader(
                "All Meetings",
                `${filtered.length} meeting(s) found`,
                `<button class="primary-btn" data-action="navigate-upload">＋ Upload Meeting</button>`
            )}

            <div>
                ${filtered.map(meetingRow).join("")}
                ${filtered.length ? "" : "<p>No matching meetings found.</p>"}
            </div>
        </div>
    `;
}

/* ==========================================
   TASK COMPONENTS
========================================== */

function taskRow(task) {
    return `
        <div class="task-item">

            <button class="task-check ${task.done ? "checked" : ""}"
                data-action="toggle-task" data-id="${task.id}">
                ${task.done ? "✓" : ""}
            </button>

            <div class="task-info">
                <h3 class="${task.done ? "completed-text" : ""}">
                    ${escapeHTML(task.title)}
                </h3>

                <p>${escapeHTML(task.person || "Unassigned")} · ${formatDate(task.date)}</p>
            </div>

            <span class="priority ${escapeHTML(task.priority.toLowerCase())}">
                ${task.done ? "Completed" : escapeHTML(task.priority)}
            </span>

            <button class="icon-btn" data-action="delete-task" data-id="${task.id}">✕</button>
        </div>
    `;
}

function addTask() {
    openModal(`
        <div class="modal-header">
            <h2>Add New Task</h2>
            <button class="icon-btn" data-action="close-modal">✕</button>
        </div>

        <form id="taskForm">

            <div class="form-group">
                <label>Task Title</label>
                <input class="form-input" name="title" required maxlength="150" placeholder="Enter task title">
            </div>

            <div class="form-group">
                <label>Assigned To</label>
                <input class="form-input" name="person" maxlength="80" placeholder="Person responsible">
            </div>

            <div class="form-group">
                <label>Deadline</label>
                <input class="form-input" type="date" name="date">
            </div>

            <div class="form-group">
                <label>Priority</label>
                <select name="priority" class="form-input">
                    <option>High</option>
                    <option selected>Medium</option>
                    <option>Low</option>
                </select>
            </div>

            <button class="primary-btn" type="submit">Save Task</button>
        </form>
    `);
}

function renderTasks() {
    const stats = statistics();

    return `
        <div class="page-heading">
            <h1>Tasks & Actions</h1>
            <p>Manage responsibilities and track your progress.</p>
        </div>

        <div class="panel">

            ${panelHeader(
                "All Action Items",
                `${stats.pendingTasks} pending · ${stats.completedTasks} completed`,
                `<button class="primary-btn" data-action="add-task">＋ Add Task</button>`
            )}

            ${tasks.map(taskRow).join("")}
            ${tasks.length ? "" : "<p>No tasks available. Add your first task.</p>"}

        </div>
    `;
}

/* ==========================================
   DECISIONS
========================================== */

function addDecision() {
    openModal(`
        <div class="modal-header">
            <h2>Add Decision</h2>
            <button class="icon-btn" data-action="close-modal">✕</button>
        </div>

        <form id="decisionForm">

            <div class="form-group">
                <label>Decision</label>
                <input class="form-input" name="title" required maxlength="200" placeholder="Enter an important decision">
            </div>

            <div class="form-group">
                <label>Meeting</label>
                <select class="form-input" name="meeting">
                    <option value="">General</option>
                    ${meetings.map(meeting => `<option value="${escapeHTML(meeting.title)}">${escapeHTML(meeting.title)}</option>`).join("")}
                </select>
            </div>

            <button class="primary-btn" type="submit">Save Decision</button>
        </form>
    `);
}

function renderDecisions() {
    return `
        <div class="page-heading">
            <h1>Meeting Decisions</h1>
            <p>Important decisions saved in your workspace.</p>
        </div>

        <div class="panel">

            ${panelHeader(
                "All Decisions",
                `${decisions.length} decision(s) recorded`,
                `<button class="primary-btn" data-action="add-decision">＋ Add Decision</button>`
            )}

            ${decisions.map(decision => `
                <div class="task-item">
                    <div class="stat-icon orange">✧</div>

                    <div class="task-info">
                        <h3>${escapeHTML(decision.title)}</h3>
                        <p>${escapeHTML(decision.meeting || "General")} · ${formatDate(decision.date)}</p>
                    </div>

                    <button class="icon-btn" data-action="delete-decision" data-id="${decision.id}">✕</button>
                </div>
            `).join("")}

            ${decisions.length ? "" : "<p>No decisions saved yet.</p>"}

        </div>
    `;
}

/* ==========================================
   UPLOAD MEETING
========================================== */

function renderUpload() {
    return `
        <div class="page-heading">
            <h1>Upload a Meeting</h1>
            <p>Add your audio recording to the MeetMind workspace.</p>
        </div>

        <div class="panel upload-panel">

            <div class="upload-heading">
                <div class="upload-icon">♫</div>
                <h2>Upload your meeting recording</h2>
                <p>Choose an audio recording from your device.</p>
            </div>

            <div class="drop-zone" id="dropZone">

                <input
                    type="file"
                    id="audioFile"
                    accept=".mp3,.wav,.m4a,.ogg,.webm,audio/*"
                    hidden
                >

                <div class="upload-cloud">⇧</div>

                <h3 id="uploadFileName">
                    ${uploadedFile ? escapeHTML(uploadedFile.name) : "Drop your audio file here"}
                </h3>

                <p>or click to browse files</p>

                <small>MP3, WAV, M4A, OGG · Maximum 100 MB</small>

            </div>

            <div class="selected-file" id="selectedFile" style="display:${uploadedFile ? "flex" : "none"}">
                <span>♫ ${uploadedFile ? escapeHTML(uploadedFile.name) : ""}</span>
                <button class="icon-btn" data-action="remove-file">✕</button>
            </div>

            <button class="primary-btn upload-submit"
                data-action="save-meeting"
                ${uploadedFile ? "" : "disabled"}>
                ⇧ Save Meeting
            </button>

            <p class="upload-note">
                Demo note: Meeting information is saved locally. Actual transcription and AI analysis require backend integration.
            </p>

        </div>
    `;
}

function validateAudio(file) {
    if (!file) return;

    const allowed = ["mp3", "wav", "m4a", "ogg", "webm"];
    const extension = file.name.split(".").pop().toLowerCase();

    if (!allowed.includes(extension)) {
        toast("Invalid file. Please select an audio file.");
        return;
    }

    if (file.size > 100 * 1024 * 1024) {
        toast("File must be smaller than 100 MB.");
        return;
    }

    uploadedFile = file;

    render();
    toast("Audio selected successfully.");
}

function saveMeeting() {
    if (!uploadedFile) {
        toast("Please select an audio file.");
        return;
    }

    const title = uploadedFile.name.replace(/\.[^.]+$/, "");

    meetings.unshift({
        id: Date.now(),
        title,
        date: new Date().toLocaleDateString("en-CA"),
        duration: "Pending analysis",
        people: 0,
        status: "Uploaded",
        summary: "Audio saved. Connect backend for AI analysis.",
        decisions: [],
        color: "purple"
    });

    uploadedFile = null;
    saveAll();

    navigate("meetings");
    toast("Meeting saved successfully.");
}

/* ==========================================
   AI ASSISTANT
========================================== */

function renderAssistant() {
    return `
        <div class="page-heading">
            <h1>AI Meeting Assistant</h1>
            <p>Your workspace conversation interface.</p>
        </div>

        <div class="panel">

            ${panelHeader("MeetMind Assistant", "Ask questions about your workspace.")}

            <div class="assistant-messages" id="assistantMessages">

                ${assistantMessages.map(message => `
                    <div class="assistant-message ${message.role}">
                        <strong>${message.role === "user" ? "You" : "MeetMind AI"}</strong>
                        ${escapeHTML(message.text)}
                    </div>
                `).join("")}

            </div>

            <form class="assistant-form" id="assistantForm">

                <input
                    type="text"
                    id="assistantInput"
                    placeholder="Ask something about your meetings..."
                    required
                    maxlength="500"
                >

                <button class="primary-btn">Send ➤</button>

            </form>

            <p class="upload-note">
                Demo assistant. Real AI answers require backend/API integration.
            </p>

        </div>
    `;
}

function sendAssistant(question) {
    assistantMessages.push({
        role: "user",
        text: question
    });

    const q = question.toLowerCase();

    let answer = "I can help you manage your workspace. Connect an AI API for intelligent answers based on meeting transcripts.";

    if (q.includes("meeting")) {
        answer = `You currently have ${meetings.length} meetings in your workspace.`;
    } else if (q.includes("task")) {
        const stats = statistics();
        answer = `You have ${stats.totalTasks} tasks: ${stats.completedTasks} completed and ${stats.pendingTasks} pending.`;
    } else if (q.includes("decision")) {
        answer = `You have recorded ${decisions.length} decisions in your workspace.`;
    } else if (q.includes("hello") || q.includes("hi")) {
        answer = "Hello! Welcome to MeetMind AI. How can I help you today?";
    } else if (q.includes("report")) {
        answer = "You can visit the Reports page and download your workspace report.";
    }

    assistantMessages.push({
        role: "assistant",
        text: answer
    });

    render();
}
/* ==========================================
   REPORTS
========================================== */

function exportReport() {
    const report = {
        product: "MeetMind AI",
        generatedAt: new Date().toISOString(),
        meetings,
        tasks,
        decisions,
        statistics: statistics()
    };

    const blob = new Blob(
        [JSON.stringify(report, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "meetmind-ai-report.json";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    toast("Report downloaded successfully.");
}

function renderReports() {
    const s = statistics();

    return `
        <div class="page-heading">
            <h1>Meeting Reports</h1>
            <p>Workspace performance and productivity insights.</p>
        </div>

        <div class="stats-grid">

            ${statCard("▣", "Total Meetings", s.totalMeetings, "purple")}
            ${statCard("◷", "Completed Meetings", s.completedMeetings, "blue")}
            ${statCard("☑", "Tasks Completed", s.completedTasks, "green")}
            ${statCard("✧", "Pending Tasks", s.pendingTasks, "orange")}

        </div>

        <div class="panel">

            ${panelHeader(
                "Workspace Report",
                "Export your saved workspace information."
            )}

            <p class="upload-note">
                Download includes meetings, decisions, tasks and statistics.
            </p>

            <button class="primary-btn" data-action="export-report">
                ⇩ Download JSON Report
            </button>

        </div>
    `;
}

/* ==========================================
   SETTINGS
========================================== */

function renderSettings() {
    return `
        <div class="page-heading">
            <h1>Workspace Settings</h1>
            <p>Manage your profile and preferences.</p>
        </div>

        <div class="panel">

            ${panelHeader("Profile Settings", "Personal workspace information.")}

            <form id="settingsForm">

                <div class="settings-grid">

                    <div class="form-group">
                        <label>Full Name</label>
                        <input class="form-input" name="name" value="${escapeHTML(settings.name)}" required maxlength="80">
                    </div>

                    <div class="form-group">
                        <label>Email Address</label>
                        <input class="form-input" name="email" type="email" value="${escapeHTML(settings.email)}" required>
                    </div>

                </div>

                <label class="settings-checkbox">
                    <input type="checkbox" name="notifications" ${settings.notifications ? "checked" : ""}>
                    Enable workspace notifications
                </label>

                <button class="primary-btn">Save Settings</button>

            </form>

            <div class="reset-section">
                <h3>Demo Workspace Data</h3>
                <p>Restore original sample meetings, tasks and decisions.</p>
                <button class="secondary-btn" data-action="reset-data">Restore Demo Data</button>
            </div>

        </div>
    `;
}

/* ==========================================
   OVERVIEW
========================================== */

function renderOverview() {
    const s = statistics();

    return `
        <section class="welcome">

            <div>
                <div class="welcome-label">✦ YOUR AI WORKSPACE</div>

                <h1>Welcome back, ${escapeHTML(settings.name)} 👋</h1>

                <p>
                    Here's what's happening with your meetings today.
                    Let's turn conversations into action.
                </p>
            </div>

            <button class="primary-btn" data-action="navigate-upload">
                ＋ New Meeting
            </button>

        </section>

        <section class="stats-grid">

            ${statCard("▣", "Total Meetings", s.totalMeetings, "purple")}
            ${statCard("◷", "Completed Meetings", s.completedMeetings, "blue")}
            ${statCard("✧", "Decisions Made", s.decisions, "orange")}
            ${statCard("☑", "Tasks Completed", `${s.completedTasks}/${s.totalTasks}`, "green")}

        </section>

        <section class="main-grid">

            <div class="panel">

                ${panelHeader(
                    "Recent Meetings",
                    "Your latest meeting activity",
                    `<button class="text-btn" data-action="navigate-meetings">View all →</button>`
                )}

                ${meetings.slice(0,4).map(meetingRow).join("")}

                ${meetings.length ? "" : "<p>No meetings available.</p>"}

            </div>

            <div class="panel">

                ${panelHeader("Meeting Activity", "Workspace overview")}

                <div class="chart-area">

                    <div class="chart-y">
                        <span>10</span>
                        <span>8</span>
                        <span>6</span>
                        <span>4</span>
                        <span>2</span>
                        <span>0</span>
                    </div>

                    <div class="chart-content">
                        ${[35,55,45,78,58,90,68].map((height,index) => `
                            <div class="chart-bar ${index === 5 ? "active" : ""}" style="height:${height}%"></div>
                        `).join("")}
                    </div>

                </div>

                <div class="chart-days">
                    <span>Mon</span><span>Tue</span><span>Wed</span>
                    <span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>

            </div>

        </section>

        <section class="bottom-grid">

            <div class="panel">

                ${panelHeader(
                    "Pending Action Items",
                    "Stay on top of your responsibilities",
                    `<button class="text-btn" data-action="navigate-tasks">View all →</button>`
                )}

                ${tasks.slice(0,4).map(taskRow).join("")}

                ${tasks.length ? "" : "<p>No tasks available.</p>"}

            </div>

            <div class="ai-card">

                <div class="ai-card-icon">✦</div>

                <div class="ai-badge">MEETMIND INTELLIGENCE</div>

                <h2>Your meetings, made smarter.</h2>

                <p>
                    Organize discussions, track decisions and
                    manage your team's next steps.
                </p>

                <button class="text-btn" data-action="navigate-assistant">
                    Explore AI Assistant →
                </button>

            </div>

        </section>
    `;
}

/* ==========================================
   MAIN RENDERER
========================================== */

function render() {
    const pageRenderers = {
        overview: renderOverview,
        meetings: renderMeetings,
        upload: renderUpload,
        tasks: renderTasks,
        decisions: renderDecisions,
        assistant: renderAssistant,
        reports: renderReports,
        settings: renderSettings
    };

    pageContent.innerHTML = pageRenderers[currentPage]();

    $("#taskCount").textContent = statistics().pendingTasks;

    $("#sidebarName").textContent = settings.name;
    $("#sidebarEmail").textContent = settings.email;
}

/* ==========================================
   EVENT HANDLER
========================================== */

document.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const action = button.dataset.action;
    const id = Number(button.dataset.id);

    switch (action) {

        case "navigate-upload":
            navigate("upload");
            break;

        case "navigate-meetings":
            navigate("meetings");
            break;

        case "navigate-tasks":
            navigate("tasks");
            break;

        case "navigate-assistant":
            navigate("assistant");
            break;

        case "close-modal":
            closeModal();
            break;

        case "add-task":
            addTask();
            break;

        case "add-decision":
            addDecision();
            break;

        case "toggle-task":
            tasks = tasks.map(task =>
                task.id === id ? { ...task, done: !task.done } : task
            );
            saveAll();
            render();
            toast("Task updated.");
            break;

        case "delete-task":
            tasks = tasks.filter(task => task.id !== id);
            saveAll();
            render();
            toast("Task deleted.");
            break;

        case "delete-decision":
            decisions = decisions.filter(item => item.id !== id);
            saveAll();
            render();
            toast("Decision deleted.");
            break;

        case "view-meeting": {
            const meeting = meetings.find(item => item.id === id);

            if (!meeting) break;

            openModal(`
                <div class="modal-header">
                    <h2>Meeting Details</h2>
                    <button class="icon-btn" data-action="close-modal">✕</button>
                </div>

                <h3>${escapeHTML(meeting.title)}</h3>

                <p class="upload-note">
                    ${formatDate(meeting.date)} · ${escapeHTML(meeting.duration)}
                </p>

                <h3 style="margin-top:20px;font-size:12px">Summary</h3>
                <p style="margin-top:10px;color:#aeb7d0;font-size:11px;line-height:1.7">
                    ${escapeHTML(meeting.summary)}
                </p>

                <h3 style="margin-top:20px;font-size:12px">Decisions</h3>

                ${meeting.decisions.map(item => `
                    <p style="margin-top:9px;font-size:11px">• ${escapeHTML(item)}</p>
                `).join("") || "<p class='upload-note'>No decisions recorded.</p>"}

                <div class="modal-actions">
                    <button class="secondary-btn" data-action="delete-meeting" data-id="${meeting.id}">
                        Delete Meeting
                    </button>
                </div>
            `);
            break;
        }

        case "delete-meeting":
            meetings = meetings.filter(item => item.id !== id);
            saveAll();
            closeModal();
            render();
            toast("Meeting deleted.");
            break;

        case "remove-file":
            uploadedFile = null;
            render();
            break;

        case "save-meeting":
            saveMeeting();
            break;

        case "export-report":
            exportReport();
            break;

        case "reset-data":
            if (confirm("Restore demo data? Your current demo data will be replaced.")) {
                meetings = structuredClone(initialMeetings);
                tasks = structuredClone(initialTasks);
                decisions = structuredClone(initialDecisions);
                saveAll();
                render();
                toast("Demo data restored.");
            }
            break;
    }
});
/* ==========================================
   FORM HANDLERS
========================================== */

document.addEventListener("submit", event => {

    if (event.target.id === "taskForm") {
        event.preventDefault();

        const data = new FormData(event.target);

        tasks.unshift({
            id: Date.now(),
            title: data.get("title").trim(),
            person: data.get("person").trim(),
            date: data.get("date"),
            priority: data.get("priority"),
            done: false
        });

        saveAll();
        closeModal();
        render();
        toast("Task added successfully.");
    }

    if (event.target.id === "decisionForm") {
        event.preventDefault();

        const data = new FormData(event.target);

        decisions.unshift({
            id: Date.now(),
            title: data.get("title").trim(),
            meeting: data.get("meeting"),
            date: new Date().toLocaleDateString("en-CA")
        });

        saveAll();
        closeModal();
        render();
        toast("Decision saved successfully.");
    }

    if (event.target.id === "settingsForm") {
        event.preventDefault();

        const data = new FormData(event.target);

        settings = {
            name: data.get("name").trim(),
            email: data.get("email").trim(),
            notifications: data.has("notifications")
        };

        saveAll();
        render();
        toast("Settings saved successfully.");
    }

    if (event.target.id === "assistantForm") {
        event.preventDefault();

        const input = $("#assistantInput");
        const question = input.value.trim();

        if (question) sendAssistant(question);
    }
});

/* ==========================================
   UPLOAD EVENTS
========================================== */

document.addEventListener("click", event => {
    const zone = event.target.closest("#dropZone");

    if (zone) {
        $("#audioFile").click();
    }
});

document.addEventListener("change", event => {
    if (event.target.id === "audioFile") {
        validateAudio(event.target.files[0]);
    }

    if (event.target.id === "globalSearch" && currentPage === "meetings") {
        render();
        $("#globalSearch").focus();
    }
});

document.addEventListener("dragover", event => {
    const zone = event.target.closest("#dropZone");
    if (zone) {
        event.preventDefault();
        zone.classList.add("dragging");
    }
});

document.addEventListener("dragleave", event => {
    const zone = event.target.closest("#dropZone");
    if (zone) zone.classList.remove("dragging");
});

document.addEventListener("drop", event => {
    const zone = event.target.closest("#dropZone");

    if (zone) {
        event.preventDefault();
        zone.classList.remove("dragging");
        validateAudio(event.dataTransfer.files[0]);
    }
});

$("#globalSearch").addEventListener("input", () => {
    if (currentPage === "meetings") render();
});

/* ==========================================
   INITIALIZE APP
========================================== */

render();

console.log("MeetMind AI initialized successfully.");