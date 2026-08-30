/* =========================================================
   M52 — PARTNERSHIP OS (FULL POWERHOUSE SCRIPT)
========================================================= */

const SUPABASE_URL = "https://tjtilixseegqliuosgsc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_PBP6LR26bD28r0bdT7EVFg_cekn47a7";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const state = {
    user: null,
    profile: null,
    companies: [],
    activities: [],
    tasks: [],
    selectedCompany: null,
    companyFilter: "ALL",
    industryFilter: "ALL",
    taskFilter: "ALL"
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function escapeHTML(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatCurrency(val) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val || 0));
}

function formatDate(val) {
    if (!val) return "—";
    const d = new Date(val);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function showToast(msg, type = "normal") {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.className = "toast show";
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
}

document.addEventListener("DOMContentLoaded", async () => {
    bindEvents();
    setCurrentDate();
    await initializeApp();
});

async function initializeApp() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            state.user = session.user;
            await loadProfile();
            showAppShell();
            await loadAllData();
            setupRealtimeSubscriptions();
        } else {
            showLoginScreen();
        }
    } catch (err) {
        console.error("Init Error:", err);
        showLoginScreen();
    } finally {
        setTimeout(() => $("#appLoader")?.classList.add("hidden"), 400);
    }

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session) {
            state.user = session.user;
            await loadProfile();
            showAppShell();
            await loadAllData();
            setupRealtimeSubscriptions();
        } else if (event === "SIGNED_OUT") {
            state.user = null;
            state.profile = null;
            showLoginScreen();
        }
    });
}

function showLoginScreen() {
    $("#loginScreen")?.classList.remove("hidden");
    $("#app")?.classList.add("hidden");
}

function showAppShell() {
    $("#loginScreen")?.classList.add("hidden");
    $("#app")?.classList.remove("hidden");
    updateUIProfile();
}

async function loadProfile() {
    if (!state.user) return;
    try {
        const { data } = await supabaseClient.from("profiles").select("*").eq("id", state.user.id).maybeSingle();
        state.profile = data || { role: "STAFF", full_name: state.user.email.split("@")[0] };
    } catch (err) {
        state.profile = { role: "STAFF" };
    }
}

function updateUIProfile() {
    const email = state.user?.email || "—";
    const name = state.profile?.full_name || email.split("@")[0];
    const role = state.profile?.role || "STAFF";

    if ($("#userName")) $("#userName").textContent = name;
    if ($("#userEmail")) $("#userEmail").textContent = email;
    if ($("#userRole")) $("#userRole").textContent = role;
    if ($("#userAvatar")) $("#userAvatar").textContent = name.charAt(0).toUpperCase();
}

function isAdmin() {
    return String(state.profile?.role || "").toUpperCase() === "ADMIN";
}

/* ================= REAL-TIME LIVE SYNC ================= */
function setupRealtimeSubscriptions() {
    supabaseClient.channel('db-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, async () => {
            await loadAllData();
            renderEverything();
        })
        .subscribe();
}

async function loadAllData() {
    await Promise.all([loadCompanies(), loadActivities(), loadTasks()]);
}

async function loadCompanies() {
    const { data } = await supabaseClient.from("companies").select("*").order("created_at", { ascending: false });
    state.companies = data || [];
}

async function loadActivities() {
    const { data } = await supabaseClient.from("activities").select("*, companies(name)").order("created_at", { ascending: false }).limit(100);
    state.activities = data || [];
}

async function loadTasks() {
    const { data } = await supabaseClient.from("tasks").select("*, companies(name)").order("due_date", { ascending: true });
    state.tasks = data || [];
}

/* ================= WHATSAPP PITCH GENERATOR ================= */
function generateWhatsAppLink(company) {
    if (!company || !company.contact_phone) return "#";
    let phone = company.contact_phone.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "62" + phone.slice(1);

    const picName = company.contact_name || "Bapak/Ibu";
    const compName = company.name || "Perusahaan";
    const objective = company.objective || "brand awareness";

    const text = `Halo selamat siang ${picName},\n\nPerkenalkan saya dari Tim Partnership Mechaniversary 52 HMM Institut Teknologi Nasional (Itenas) Bandung.\n\nKami melihat ${compName} memiliki visi yang luar biasa di bidang korporat Anda, terutama dalam hal penguatan *${objective.toLowerCase()}*. Kami ingin menawarkan ruang kolaborasi strategis eksklusif pada rangkaian acara puncak mekanikal terbesar kami tahun 2026.\n\nBolehkah kami mengirimkan ringkasan proposal kerja sama via WhatsApp ini untuk dipelajari lebih lanjut? Terima kasih banyak sebelumnya.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/* ================= EVENT BINDINGS & ACTIONS ================= */
function bindEvents() {
    $$(".nav-item").forEach(btn => {
        btn.addEventListener("click", () => navigateTo(btn.dataset.page));
    });
    $$("[data-page-link]").forEach(btn => {
        btn.addEventListener("click", () => navigateTo(btn.dataset.pageLink));
    });

    $("#loginForm")?.addEventListener("submit", handleLogin);
    $("#logoutButton")?.addEventListener("click", () => supabaseClient.auth.signOut());
    $("#companyForm")?.addEventListener("submit", saveCompany);
    $("#activityForm")?.addEventListener("submit", saveActivity);
    $("#taskForm")?.addEventListener("submit", saveTask);

    $("#addCompanyButton")?.addEventListener("click", () => openCompanyEditor());
    $("#addTaskButton")?.addEventListener("click", () => {
        populateTaskCompanySelect();
        $("#taskForm")?.reset();
        openModal("#taskModal");
    });
    $("#exportCsvButton")?.addEventListener("click", exportCompaniesCSV);

    bindFilters();
    bindModals();
}

async function handleLogin(e) {
    e.preventDefault();
    const email = $("#loginEmail").value.trim();
    const password = $("#loginPassword").value;
    const errBox = $("#loginError");

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        errBox.textContent = "Login gagal: Email atau password keliru.";
    } else {
        errBox.textContent = "";
        showToast("Login berhasil!", "success");
    }
}

function navigateTo(page) {
    $$(".page").forEach(p => p.classList.remove("active-page"));
    $(`#page-${page}`)?.classList.add("active-page");
    $$(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.page === page));

    if (page === "dashboard") renderDashboard();
    if (page === "crm") renderCRM();
    if (page === "pipeline") renderPipeline();
    if (page === "tasks") renderTasks();
}

/* ================= RENDER FUNCTIONS ================= */
function renderEverything() {
    renderDashboard();
    renderCRM();
    renderPipeline();
    renderTasks();
}

function renderDashboard() {
    const activeStat = state.companies.filter(c => ["PROSPECT", "CONTACTED", "MEETING", "PROPOSAL", "NEGOTIATION"].includes(c.status));
    const pipelineVal = activeStat.reduce((acc, c) => acc + Number(c.potential_value || 0), 0);
    const securedVal = state.companies.filter(c => c.status === "CLOSED").reduce((acc, c) => acc + Number(c.potential_value || 0), 0);
    const openTasks = state.tasks.filter(t => t.status !== "COMPLETED");

    if ($("#statProspects")) $("#statProspects").textContent = activeStat.length;
    if ($("#statPipeline")) $("#statPipeline").textContent = formatCurrency(pipelineVal);
    if ($("#statSecured")) $("#statSecured").textContent = formatCurrency(securedVal);
    if ($("#statTasks")) $("#statTasks").textContent = openTasks.length;

    renderPipelineBars();
    renderRecentActivities();
    renderPriorityTasks();
}

function renderPipelineBars() {
    const container = $("#pipelineBars");
    if (!container) return;
    const statuses = ["PROSPECT", "CONTACTED", "MEETING", "PROPOSAL", "NEGOTIATION", "CLOSED"];
    const counts = statuses.map(s => state.companies.filter(c => c.status === s).length);
    const max = Math.max(...counts, 1);

    container.innerHTML = statuses.map((s, i) => {
        const count = counts[i];
        const pct = Math.max((count / max) * 100, count > 0 ? 8 : 0);
        return `
            <div class="pipeline-row">
                <div class="pipeline-label">${s}</div>
                <div class="pipeline-track"><div class="pipeline-fill" style="width:${pct}%"></div></div>
                <div class="pipeline-count">${count}</div>
            </div>`;
    }).join("");
}

function renderRecentActivities() {
    const container = $("#recentActivities");
    if (!container) return;
    const acts = state.activities.slice(0, 5);
    if (!acts.length) { container.innerHTML = `<div class="kanban-empty">Belum ada aktivitas.</div>`; return; }

    container.innerHTML = acts.map(a => `
        <div class="activity-item">
            <div class="activity-dot"></div>
            <div class="activity-main">
                <strong>${escapeHTML(a.companies?.name || "Sponsor")}</strong>
                <span>${escapeHTML(a.description)}</span>
            </div>
            <time>${formatDate(a.created_at)}</time>
        </div>`).join("");
}

function renderPriorityTasks() {
    const container = $("#priorityTasks");
    if (!container) return;
    const tasks = state.tasks.filter(t => t.status !== "COMPLETED").slice(0, 4);
    if (!tasks.length) { container.innerHTML = `<div class="kanban-empty">Semua tugas beres!</div>`; return; }

    container.innerHTML = tasks.map(t => `
        <div class="priority-task">
            <input type="checkbox" data-toggle-task="${t.id}">
            <div class="priority-task-main">
                <strong>${escapeHTML(t.title)}</strong>
                <span>${escapeHTML(t.companies?.name || "Umum")}</span>
            </div>
            <time>${formatDate(t.due_date)}</time>
        </div>`).join("");

    $$("[data-toggle-task]").forEach(cb => {
        cb.addEventListener("change", async () => {
            await supabaseClient.from("tasks").update({ status: "COMPLETED" }).eq("id", cb.dataset.toggleTask);
            showToast("Tugas selesai!", "success");
            await loadTasks();
            renderEverything();
        });
    });
}

function renderCRM() {
    populateTaskCompanySelect();
    renderCompanyGrid();
}

function getFilteredCompanies() {
    const search = ($("#companySearch")?.value || "").toLowerCase();
    return state.companies.filter(c => {
        const matchSearch = !search || c.name.toLowerCase().includes(search) || (c.contact_name && c.contact_name.toLowerCase().includes(search));
        const matchStatus = state.companyFilter === "ALL" || c.status === state.companyFilter;
        const matchInd = state.industryFilter === "ALL" || c.industry === state.industryFilter;
        return matchSearch && matchStatus && matchInd;
    });
}

function renderCompanyGrid() {
    const container = $("#companyGrid");
    if (!container) return;
    const list = getFilteredCompanies();
    if (!list.length) { container.innerHTML = `<div class="kanban-empty">Tidak ada sponsor yang cocok.</div>`; return; }

    container.innerHTML = list.map(c => `
        <article class="company-card" data-company-id="${c.id}">
            <div class="company-card-top">
                <span class="company-industry">${c.industry || "OTHER"}</span>
                <span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span>
            </div>
            <h3>${escapeHTML(c.name)}</h3>
            <div class="company-value">${formatCurrency(c.potential_value)}</div>
            <div class="company-card-contact">
                <span>PIC: ${escapeHTML(c.contact_name || "Belum ada PIC")}</span>
                <span>PJ: ${escapeHTML(c.internal_pic || "Belum diset")}</span>
            </div>
            <div class="company-card-footer">
                <span>Next: ${escapeHTML(c.next_action || "—")}</span>
                <span>→ Detail</span>
            </div>
        </article>`).join("");

    $$(".company-card").forEach(card => {
        card.addEventListener("click", () => openCompanyDetail(card.dataset.companyId));
    });
}

function openCompanyDetail(id) {
    const comp = state.companies.find(c => String(c.id) === String(id));
    if (!comp) return;
    state.selectedCompany = comp;

    $("#detailIndustry").textContent = comp.industry || "OTHER";
    $("#detailName").textContent = comp.name;
    $("#detailStatus").textContent = comp.status;
    $("#detailValue").textContent = formatCurrency(comp.potential_value);
    $("#detailPIC").textContent = comp.internal_pic || "—";
    $("#detailNotes").textContent = `Objektif: ${comp.objective || "Umum"}\nCatatan: ${comp.notes || "Tidak ada catatan."}`;

    // WhatsApp Direct Link
    const waBtn = $("#whatsappDirectBtn");
    if (comp.contact_phone) {
        waBtn.href = generateWhatsAppLink(comp);
        waBtn.classList.remove("hidden");
    } else {
        waBtn.classList.add("hidden");
    }

    // Role-based delete button restriction
    const delBtn = $("#deleteCompanyBtn");
    if (isAdmin()) {
        delBtn.classList.remove("hidden");
        delBtn.onclick = () => deleteCompany(comp.id);
    } else {
        delBtn.classList.add("hidden");
    }

    $("#editCompanyFromDetail").onclick = () => {
        closeModal("#detailModal");
        openCompanyEditor(comp);
    };

    renderActivityTimeline(comp.id);
    openModal("#detailModal");
}

async function deleteCompany(id) {
    if (!confirm("Hapus perusahaan ini secara permanen?")) return;
    const { error } = await supabaseClient.from("companies").delete().eq("id", id);
    if (error) {
        showToast("Gagal menghapus data.", "error");
    } else {
        showToast("Sponsor dihapus.", "success");
        closeModal("#detailModal");
        await loadAllData();
        renderEverything();
    }
}

function renderActivityTimeline(companyId) {
    const container = $("#activityTimeline");
    if (!container) return;
    const acts = state.activities.filter(a => String(a.company_id) === String(companyId));
    if (!acts.length) { container.innerHTML = `<div class="kanban-empty">Belum ada riwayat aktivitas.</div>`; return; }

    container.innerHTML = acts.map(a => `
        <div style="font-family:var(--font-mono); font-size:9px; margin-bottom:6px; border-bottom:1px solid #ddd; padding-bottom:4px;">
            <strong>[${a.type}]</strong> ${escapeHTML(a.description)} <span style="float:right; color:#777;">${formatDate(a.created_at)}</span>
        </div>`).join("");
}

async function saveActivity(e) {
    e.preventDefault();
    if (!state.selectedCompany) return;
    const type = $("#activityType").value;
    const desc = $("#activityDescription").value.trim();

    await supabaseClient.from("activities").insert({ company_id: state.selectedCompany.id, type, description: desc });
    $("#activityDescription").value = "";
    showToast("Aktivitas dicatat!", "success");
    await loadActivities();
    renderActivityTimeline(state.selectedCompany.id);
}

function renderPipeline() {
    const container = $("#kanban");
    if (!container) return;
    const stages = ["PROSPECT", "CONTACTED", "MEETING", "PROPOSAL", "NEGOTIATION", "CLOSED"];

    container.innerHTML = stages.map(st => {
        const list = state.companies.filter(c => c.status === st);
        return `
            <div class="kanban-column">
                <div class="kanban-header">${st} <span>${list.length}</span></div>
                <div class="kanban-cards">
                    ${list.length ? list.map(c => `
                        <article class="kanban-card" data-company-id="${c.id}">
                            <span style="font-family:var(--font-mono); font-size:7px; background:var(--navy); color:var(--yellow); padding:1px 3px;">${c.industry || "OTHER"}</span>
                            <h3>${escapeHTML(c.name)}</h3>
                            <strong>${formatCurrency(c.potential_value)}</strong>
                            <small>Next: ${escapeHTML(c.next_action || "—")}</small>
                        </article>`).join("") : `<div class="kanban-empty">Kosong</div>`}
                </div>
            </div>`;
    }).join("");

    $$(".kanban-card").forEach(card => {
        card.addEventListener("click", () => openCompanyDetail(card.dataset.companyId));
    });
}

function renderTasks() {
    const container = $("#taskList");
    if (!container) return;
    let tasks = [...state.tasks];
    if (state.taskFilter === "OPEN") tasks = tasks.filter(t => t.status !== "COMPLETED");
    if (state.taskFilter === "COMPLETED") tasks = tasks.filter(t => t.status === "COMPLETED");

    if (!tasks.length) { container.innerHTML = `<div class="kanban-empty">Tidak ada task.</div>`; return; }

    container.innerHTML = tasks.map(t => `
        <article class="task-card ${t.status === 'COMPLETED' ? 'completed' : ''}">
            <input type="checkbox" data-task-id="${t.id}" ${t.status === 'COMPLETED' ? 'checked' : ''}>
            <div>
                <h3>${escapeHTML(t.title)}</h3>
                <p style="font-family:var(--font-mono); font-size:8px; color:#555; margin-top:2px;">${escapeHTML(t.description || "—")} | <strong>${escapeHTML(t.companies?.name || "Umum")}</strong></p>
            </div>
            <div style="text-align:right; font-family:var(--font-mono); font-size:8px;">${formatDate(t.due_date)}</div>
        </article>`).join("");

    $$("[data-task-id]").forEach(cb => {
        cb.addEventListener("change", async () => {
            const newStatus = cb.checked ? "COMPLETED" : "OPEN";
            await supabaseClient.from("tasks").update({ status: newStatus }).eq("id", cb.dataset.taskId);
            await loadTasks();
            renderTasks();
        });
    });
}

async function saveCompany(e) {
    e.preventDefault();
    const id = $("#companyId").value;
    const payload = {
        name: $("#companyName").value.trim(),
        industry: $("#companyIndustry").value,
        status: $("#companyStatus").value,
        objective: $("#companyObjective").value,
        potential_value: Number($("#companyValue").value || 0),
        contact_name: $("#companyContact").value.trim(),
        contact_phone: $("#companyPhone").value.trim(),
        next_action: $("#companyNextAction").value.trim(),
        next_action_date: $("#companyNextDate").value || null,
        internal_pic: $("#companyInternalPic").value.trim(),
        notes: $("#companyNotes").value.trim()
    };

    let res;
    if (id) {
        res = await supabaseClient.from("companies").update(payload).eq("id", id);
    } else {
        res = await supabaseClient.from("companies").insert(payload);
    }

    if (res.error) {
        $("#companyFormError").textContent = "Gagal menyimpan data perusahaan.";
    } else {
        showToast("Data sponsor berhasil disimpan!", "success");
        closeModal("#companyModal");
        await loadAllData();
        renderEverything();
    }
}

async function saveTask(e) {
    e.preventDefault();
    const payload = {
        title: $("#taskTitle").value.trim(),
        company_id: $("#taskCompany").value || null,
        due_date: $("#taskDueDate").value || null,
        description: $("#taskDescription").value.trim(),
        status: "OPEN"
    };

    const { error } = await supabaseClient.from("tasks").insert(payload);
    if (error) {
        $("#taskFormError").textContent = "Gagal membuat task.";
    } else {
        showToast("Task baru dibuat!", "success");
        closeModal("#taskModal");
        await loadAllData();
        renderEverything();
    }
}

function openCompanyEditor(comp = null) {
    $("#companyForm").reset();
    $("#companyModalTitle").textContent = comp ? "EDIT SPONSOR" : "TAMBAH SPONSOR";
    $("#companyId").value = comp?.id || "";
    if (comp) {
        $("#companyName").value = comp.name || "";
        $("#companyIndustry").value = comp.industry || "OTHER";
        $("#companyStatus").value = comp.status || "PROSPECT";
        $("#companyObjective").value = comp.objective || "AWARENESS";
        $("#companyValue").value = comp.potential_value || "";
        $("#companyContact").value = comp.contact_name || "";
        $("#companyPhone").value = comp.contact_phone || "";
        $("#companyNextAction").value = comp.next_action || "";
        $("#companyNextDate").value = comp.next_action_date || "";
        $("#companyInternalPic").value = comp.internal_pic || "";
        $("#companyNotes").value = comp.notes || "";
    }
    openModal("#companyModal");
}

function populateTaskCompanySelect() {
    const sel = $("#taskCompany");
    if (!sel) return;
    sel.innerHTML = `<option value="">-- Pilih Perusahaan --</option>` + state.companies.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
}

function exportCompaniesCSV() {
    let csv = "Nama Perusahaan,Industri,Status,Potensi Nilai,PIC,No HP,PIC Internal\n";
    state.companies.forEach(c => {
        csv += `"${c.name}","${c.industry}","${c.status}",${c.potential_value},"${c.contact_name || ''}","${c.contact_phone || ''}","${c.internal_pic || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `database_sponsor_m52_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    showToast("CSV Berhasil diunduh!", "success");
}

function bindFilters() {
    $("#companySearch")?.addEventListener("input", renderCompanyGrid);
    $("#companyStatusFilter")?.addEventListener("change", (e) => { state.companyFilter = e.target.value; renderCompanyGrid(); });
    $("#companyIndustryFilter")?.addEventListener("change", (e) => { state.industryFilter = e.target.value; renderCompanyGrid(); });
    $$(".task-filter").forEach(b => {
        b.addEventListener("click", () => {
            state.taskFilter = b.dataset.taskFilter;
            $$(".task-filter").forEach(x => x.classList.toggle("active", x === b));
            renderTasks();
        });
    });
}

function bindModals() {
    $$("[data-close-modal]").forEach(btn => {
        btn.addEventListener("click", () => {
            const m = btn.closest(".modal");
            if (m) m.classList.add("hidden");
            document.body.classList.remove("modal-open");
        });
    });
}

function openModal(selector) {
    $(selector)?.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

function closeModal(selector) {
    $(selector)?.classList.add("hidden");
    if ($(".modal:not(.hidden)") === null) document.body.classList.remove("modal-open");
}

function setCurrentDate() {
    if ($("#currentDate")) {
        $("#currentDate").textContent = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).toUpperCase();
    }
}
