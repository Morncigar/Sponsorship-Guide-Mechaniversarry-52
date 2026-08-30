/* =========================================================
   PARTNERSHIP OS — HMM ITENAS (FINAL STABLE SCRIPT)
========================================================= */

const SUPABASE_URL = "https://tjtilixseegqliuosgsc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_PBP6LR26bD28r0bdT7EVFg_cekn47a7";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const state = {
    user: null,
    profile: null,
    companies: [],
    projects: [],
    activities: [],
    tasks: [],
    selectedCompany: null,
    companyFilter: "ALL",
    taskFilter: "ALL"
};

let activeRealtimeChannel = null;

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
            renderEverything();
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
            renderEverything();
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
        state.profile = data || { role: "USER", full_name: state.user.email.split("@")[0] };
    } catch (err) {
        state.profile = { role: "USER" };
    }
}

function updateUIProfile() {
    const email = state.user?.email || "—";
    const name = state.profile?.full_name || email.split("@")[0];
    const role = state.profile?.role || "USER";

    if ($("#userName")) $("#userName").textContent = name;
    if ($("#userEmail")) $("#userEmail").textContent = email;
    if ($("#userRole")) $("#userRole").textContent = role;
    if ($("#userAvatar")) $("#userAvatar").textContent = name.charAt(0).toUpperCase();
}

function isAdmin() {
    return String(state.profile?.role || "").toUpperCase() === "ADMIN";
}

/* ================= REAL-TIME LIVE SYNC (CLEANED) ================= */
function setupRealtimeSubscriptions() {
    if (activeRealtimeChannel) {
        supabaseClient.removeChannel(activeRealtimeChannel);
    }
    activeRealtimeChannel = supabaseClient.channel('db-changes');
    activeRealtimeChannel.on('postgres_changes', { event: '*', schema: 'public' }, async () => {
        await loadAllData();
        renderEverything();
    });
    activeRealtimeChannel.subscribe();
}

/* ================= MULTI-TABLE FETCHING (ISOLATED) ================= */
async function loadAllData() {
    try {
        const [compsRes, projsRes, tsksRes, actsRes] = await Promise.all([
            supabaseClient.from("companies").select("*").order("created_at", { ascending: false }),
            supabaseClient.from("sponsor_projects").select("*").order("created_at", { ascending: false }),
            supabaseClient.from("tasks").select("*").order("due_date", { ascending: true }),
            supabaseClient.from("activities").select("*").order("created_at", { ascending: false }).limit(20)
        ]);

        state.companies = compsRes.data || [];
        state.projects = projsRes.data || [];
        state.tasks = tsksRes.data || [];
        state.activities = actsRes.data || [];

        state.projects = state.projects.map(p => ({
            ...p,
            companies: state.companies.find(c => c.id === p.company_id) || { name: "—" }
        }));

        state.tasks = state.tasks.map(t => {
            const proj = state.projects.find(p => p.id === t.sponsor_project_id) || {};
            const comp = state.companies.find(c => c.id === proj.company_id) || { name: "—" };
            return {
                ...t,
                sponsor_projects: {
                    title: proj.title || "Umum",
                    companies: { name: comp.name }
                }
            };
        });

        state.activities = state.activities.map(a => ({
            ...a,
            companies: state.companies.find(c => c.id === a.company_id) || { name: "Sistem" }
        }));

    } catch (err) {
        console.error("Gagal load data:", err);
    }
}

/* ================= WHATSAPP PITCH GENERATOR ================= */
function generateWhatsAppLink(company) {
    if (!company || !company.contact_phone) return "#";
    let phone = company.contact_phone.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "62" + phone.slice(1);

    const picName = company.contact_name || "Bapak/Ibu";
    const compName = company.name || "Perusahaan";

    const text = `Halo selamat siang ${picName},\n\nPerkenalkan saya dari Tim Partnership HMM Institut Teknologi Nasional (Itenas) Bandung.\n\nKami melihat ${compName} memiliki visi yang luar biasa. Kami ingin menawarkan ruang kolaborasi strategis eksklusif pada rangkaian program kerja kami.\n\nBolehkah kami mengirimkan ringkasan proposal kerja sama via WhatsApp ini untuk dipelajari lebih lanjut? Terima kasih banyak.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/* ================= EXPORT CSV LOGIC ================= */
function exportToCSV() {
    if (state.companies.length === 0) {
        showToast("Tidak ada data untuk diekspor", "normal");
        return;
    }

    const headers = ["NAMA PERUSAHAAN", "KATEGORI", "STATUS", "TARGET NILAI (IDR)", "PROGRESS (%)", "PIC KORPORAT", "NO WHATSAPP", "DESKRIPSI/OBJEKTIF"];
    
    const rows = state.companies.map(c => {
        const proj = state.projects.find(p => p.company_id === c.id);
        const value = proj ? proj.target_value : 0;
        const progress = proj ? proj.progress : 0;
        
        const escapeCSV = (str) => {
            if (!str) return '""';
            const s = String(str).replace(/"/g, '""');
            return `"${s}"`;
        };

        return [
            escapeCSV(c.name),
            escapeCSV(c.category),
            escapeCSV(c.status),
            value,
            progress,
            escapeCSV(c.contact_name),
            escapeCSV(c.contact_phone),
            escapeCSV(c.description)
        ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const dateStr = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Sponsor_HMM_Itenas_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Data berhasil diekspor!", "success");
}

/* ================= EVENT BINDINGS ================= */
function bindEvents() {
    $$(".nav-item").forEach(btn => btn.addEventListener("click", () => navigateTo(btn.dataset.page)));
    $$("[data-page-link]").forEach(btn => btn.addEventListener("click", () => navigateTo(btn.dataset.pageLink)));

    $("#loginForm")?.addEventListener("submit", handleLogin);
    $("#logoutButton")?.addEventListener("click", () => supabaseClient.auth.signOut());
    
    $("#companyForm")?.addEventListener("submit", saveCompany);
    $("#taskForm")?.addEventListener("submit", saveTask);

    $("#addCompanyButton")?.addEventListener("click", () => openCompanyEditor());
    $("#exportCsvButton")?.addEventListener("click", exportToCSV);
    
    $("#addTaskButton")?.addEventListener("click", () => {
        populateTaskProjectSelect();
        $("#taskForm")?.reset();
        openModal("#taskModal");
    });

    bindFilters();
    bindModals();
}

async function handleLogin(e) {
    e.preventDefault();
    const email = $("#loginEmail").value.trim();
    const password = $("#loginPassword").value;
    const errBox = $("#loginError");

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) errBox.textContent = "Login gagal: Kredensial tidak valid.";
    else { errBox.textContent = ""; showToast("Berhasil login!", "success"); }
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
    const activeStat = state.companies.filter(c => ["PROSPECT", "CONTACTED", "NEGOTIATION"].includes(c.status));
    
    const activeCompIds = state.companies.filter(c => ["PROSPECT", "CONTACTED", "NEGOTIATION"].includes(c.status)).map(c => c.id);
    const activeProjects = state.projects.filter(p => activeCompIds.includes(p.company_id));
    const pipelineVal = activeProjects.reduce((acc, p) => acc + Number(p.target_value || 0), 0);
    
    const securedCompIds = state.companies.filter(c => c.status === "DEAL").map(c => c.id);
    const securedProjects = state.projects.filter(p => securedCompIds.includes(p.company_id));
    const securedVal = securedProjects.reduce((acc, p) => acc + Number(p.target_value || 0), 0);
    
    const openTasks = state.tasks.filter(t => t.status !== "DONE");

    if ($("#statProspects")) $("#statProspects").textContent = activeStat.length;
    if ($("#statPipeline")) $("#statPipeline").textContent = formatCurrency(pipelineVal);
    if ($("#statSecured")) $("#statSecured").textContent = formatCurrency(securedVal);
    if ($("#statTasks")) $("#statTasks").textContent = openTasks.length;

    renderPipelineBars();
    renderPriorityTasks();
    renderRecentActivities();
}

function renderPipelineBars() {
    const container = $("#pipelineBars");
    if (!container) return;
    const statuses = ["PROSPECT", "CONTACTED", "NEGOTIATION", "DEAL"];
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
                <strong>${escapeHTML(a.companies?.name || "Sistem")}</strong>
                <span>${escapeHTML(a.description)}</span>
            </div>
            <time>${formatDate(a.created_at)}</time>
        </div>`).join("");
}

function renderPriorityTasks() {
    const container = $("#priorityTasks");
    if (!container) return;
    const tasks = state.tasks.filter(t => t.status !== "DONE").slice(0, 4);
    if (!tasks.length) { container.innerHTML = `<div class="kanban-empty">Semua tugas beres!</div>`; return; }

    container.innerHTML = tasks.map(t => `
        <div class="priority-task">
            <input type="checkbox" data-toggle-task="${t.id}">
            <div class="priority-task-main">
                <strong>${escapeHTML(t.title)}</strong>
                <span>Project: ${escapeHTML(t.sponsor_projects?.title || "Umum")}</span>
            </div>
            <time>${formatDate(t.due_date)}</time>
        </div>`).join("");

    $$("[data-toggle-task]").forEach(cb => {
        cb.addEventListener("change", async () => {
            const taskId = cb.dataset.toggleTask;
            const taskObj = state.tasks.find(t => t.id === taskId);
            
            await supabaseClient.from("tasks").update({ 
                status: "DONE",
                assigned_to: state.user?.id || null
            }).eq("id", taskId);

            let compId = null;
            if (taskObj && taskObj.sponsor_project_id) {
                const proj = state.projects.find(p => p.id === taskObj.sponsor_project_id);
                if (proj) compId = proj.company_id;
            }

            await supabaseClient.from("activities").insert({
                company_id: compId,
                user_id: state.user?.id || null,
                type: "OTHER",
                description: `Menyelesaikan task: "${taskObj?.title || 'Task'}"`
            });

            showToast("Tugas diselesaikan!", "success");
            await loadAllData();
            renderEverything();
        });
    });
}

function renderCRM() {
    populateTaskProjectSelect();
    renderCompanyGrid();
}

function getFilteredCompanies() {
    const search = ($("#companySearch")?.value || "").toLowerCase();
    return state.companies.filter(c => {
        const matchSearch = !search || c.name.toLowerCase().includes(search) || (c.contact_name && c.contact_name.toLowerCase().includes(search));
        const matchStatus = state.companyFilter === "ALL" || c.status === state.companyFilter;
        return matchSearch && matchStatus;
    });
}

function renderCompanyGrid() {
    const container = $("#companyGrid");
    if (!container) return;
    const list = getFilteredCompanies();
    if (!list.length) { container.innerHTML = `<div class="kanban-empty">Tidak ada sponsor yang cocok.</div>`; return; }

    container.innerHTML = list.map(c => {
        const proj = state.projects.find(p => p.company_id === c.id);
        const val = proj ? proj.target_value : 0;
        
        return `
        <article class="company-card" data-company-id="${c.id}">
            <div class="company-card-top">
                <span class="company-industry">${c.category || "OTHER"}</span>
                <span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span>
            </div>
            <h3>${escapeHTML(c.name)}</h3>
            <div class="company-value">${formatCurrency(val)}</div>
            <div class="company-card-contact">
                <span>PIC: ${escapeHTML(c.contact_name || "Belum ada")}</span>
            </div>
            <div class="company-card-footer">
                <span>Progress: ${proj ? proj.progress + '%' : '0%'}</span>
                <span>→ Detail</span>
            </div>
        </article>`;
    }).join("");

    $$(".company-card").forEach(card => card.addEventListener("click", () => openCompanyDetail(card.dataset.companyId)));
}

function openCompanyDetail(id) {
    const comp = state.companies.find(c => String(c.id) === String(id));
    if (!comp) return;
    const proj = state.projects.find(p => String(p.company_id) === String(id));
    
    state.selectedCompany = comp;

    $("#detailIndustry").textContent = comp.category || "OTHER";
    $("#detailName").textContent = comp.name;
    
    // Quick Status Dropdown Sync
    const statusSelect = $("#detailStatusSelect");
    if (statusSelect) {
        statusSelect.value = comp.status;
        statusSelect.onchange = async () => {
            const newStatus = statusSelect.value;
            
            await supabaseClient.from("companies").update({ status: newStatus }).eq("id", comp.id);
            if (proj) {
                await supabaseClient.from("sponsor_projects").update({ status: newStatus }).eq("id", proj.id);
            }

            await supabaseClient.from("activities").insert({
                company_id: comp.id,
                user_id: state.user?.id || null,
                type: "OTHER",
                description: `Mengubah status ${comp.name} menjadi ${newStatus}`
            });

            showToast(`Status diubah ke ${newStatus}!`, "success");
            await loadAllData();
            renderEverything();
        };
    }

    $("#detailValue").textContent = formatCurrency(proj ? proj.target_value : 0);
    $("#detailProgress").textContent = proj ? proj.progress + "%" : "0%";
    $("#detailNotes").textContent = comp.description || "Tidak ada catatan.";

    const waBtn = $("#whatsappDirectBtn");
    if (comp.contact_phone) {
        waBtn.href = generateWhatsAppLink(comp);
        waBtn.classList.remove("hidden");
    } else waBtn.classList.add("hidden");

    const delBtn = $("#deleteCompanyBtn");
    if (isAdmin()) {
        delBtn.classList.remove("hidden");
        delBtn.onclick = () => deleteCompany(comp.id);
    } else delBtn.classList.add("hidden");

    $("#editCompanyFromDetail").onclick = () => {
        closeModal("#detailModal");
        openCompanyEditor(comp, proj);
    };

    openModal("#detailModal");
}

async function deleteCompany(id) {
    if (!confirm("Hapus perusahaan ini? (Akan menghapus project dan task terkait juga)")) return;
    await supabaseClient.from("companies").delete().eq("id", id);
    showToast("Sponsor dihapus.", "success");
    closeModal("#detailModal");
    await loadAllData();
    renderEverything();
}

function renderPipeline() {
    const container = $("#kanban");
    if (!container) return;
    const stages = ["PROSPECT", "CONTACTED", "NEGOTIATION", "DEAL", "REJECTED"];

    container.innerHTML = stages.map(st => {
        const list = state.companies.filter(c => c.status === st);
        return `
            <div class="kanban-column">
                <div class="kanban-header">${st} <span>${list.length}</span></div>
                <div class="kanban-cards">
                    ${list.length ? list.map(c => {
                        const proj = state.projects.find(p => p.company_id === c.id);
                        return `
                        <article class="kanban-card" data-company-id="${c.id}">
                            <span style="font-family:var(--font-mono); font-size:7px; background:var(--navy); color:var(--yellow); padding:1px 3px;">${c.category || "OTHER"}</span>
                            <h3>${escapeHTML(c.name)}</h3>
                            <strong>${formatCurrency(proj ? proj.target_value : 0)}</strong>
                        </article>`
                    }).join("") : `<div class="kanban-empty">Kosong</div>`}
                </div>
            </div>`;
    }).join("");

    $$(".kanban-card").forEach(card => card.addEventListener("click", () => openCompanyDetail(card.dataset.companyId)));
}

function renderTasks() {
    const container = $("#taskList");
    if (!container) return;
    let tasks = [...state.tasks];
    if (state.taskFilter !== "ALL") tasks = tasks.filter(t => t.status === state.taskFilter);

    if (!tasks.length) { container.innerHTML = `<div class="kanban-empty">Tidak ada task.</div>`; return; }

    container.innerHTML = tasks.map(t => `
        <article class="task-card ${t.status === 'DONE' ? 'completed' : ''}">
            <div>
                <h3>${escapeHTML(t.title)}</h3>
                <p style="font-family:var(--font-mono); font-size:8px; color:#555; margin-top:2px;">
                    ${escapeHTML(t.description || "—")} | <strong>Project: ${escapeHTML(t.sponsor_projects?.title || "Umum")}</strong>
                </p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <select class="task-status-dropdown" data-task-id="${t.id}" style="font-family: var(--font-mono); font-size: 9px; padding: 4px; background: var(--bg); border: 2px solid var(--navy); cursor: pointer;">
                    <option value="TODO" ${t.status === 'TODO' ? 'selected' : ''}>TODO</option>
                    <option value="IN_PROGRESS" ${t.status === 'IN_PROGRESS' ? 'selected' : ''}>IN PROGRESS</option>
                    <option value="DONE" ${t.status === 'DONE' ? 'selected' : ''}>DONE</option>
                </select>
                <div style="text-align:right; font-family:var(--font-mono); font-size:8px;">${formatDate(t.due_date)}</div>
            </div>
        </article>`).join("");

    $$("[data-task-id]").forEach(sel => {
        sel.addEventListener("change", async () => {
            const newStatus = sel.value;
            const taskId = sel.dataset.taskId;
            const taskObj = state.tasks.find(t => t.id === taskId);

            const { error } = await supabaseClient.from("tasks").update({ 
                status: newStatus,
                assigned_to: state.user?.id || null 
            }).eq("id", taskId);

            if (error) {
                showToast("Gagal update status!", "normal");
                console.error(error);
                return;
            }

            let compId = null;
            if (taskObj && taskObj.sponsor_project_id) {
                const proj = state.projects.find(p => p.id === taskObj.sponsor_project_id);
                if (proj) compId = proj.company_id;
            }

            await supabaseClient.from("activities").insert({
                company_id: compId,
                user_id: state.user?.id || null,
                type: "OTHER",
                description: `Mengubah status task "${taskObj?.title || 'Task'}" menjadi ${newStatus}`
            });

            showToast(`Status diubah ke ${newStatus}!`, "success");
            await loadAllData();
            renderTasks();
            renderDashboard();
        });
    });
}

async function saveCompany(e) {
    e.preventDefault();
    const id = $("#companyId").value;
    const safeStatus = $("#companyStatus").value || "PROSPECT"; 
    const targetVal = Number($("#companyValue").value || 0);

    const selectedObjs = Array.from($$(`input[name="objectives"]:checked`)).map(cb => cb.value);
    const customObj = $("#companyCustomObjective").value.trim();
    if (customObj) selectedObjs.push(customObj);
    
    const finalObjectives = selectedObjs.join(", ");
    const rawNotes = $("#companyNotes").value.trim();
    const finalDescription = finalObjectives ? `[OBJEKTIF: ${finalObjectives}]\n\n${rawNotes}` : rawNotes;

    const compPayload = {
        name: $("#companyName").value.trim(),
        category: $("#companyIndustry").value,
        status: safeStatus, 
        contact_name: $("#companyContact").value.trim(),
        contact_phone: $("#companyPhone").value.trim(),
        description: finalDescription
    };

    let compId = id;
    if (id) {
        await supabaseClient.from("companies").update(compPayload).eq("id", id);
    } else {
        compPayload.assigned_to = state.user?.id || null; 
        const { data, error } = await supabaseClient.from("companies").insert(compPayload).select().single();
        if(error) { 
            console.error(error);
            $("#companyFormError").textContent = "Gagal simpan: " + error.message; 
            return; 
        }
        compId = data.id;
    }

    const projPayload = {
        company_id: compId,
        title: `Sponsorship - ${compPayload.name}`,
        target_value: targetVal,
        status: safeStatus, 
        owner_id: state.user?.id || null
    };

    const existingProj = state.projects.find(p => String(p.company_id) === String(compId));
    if(existingProj) {
        await supabaseClient.from("sponsor_projects").update(projPayload).eq("id", existingProj.id);
    } else {
        await supabaseClient.from("sponsor_projects").insert(projPayload);
    }

    await supabaseClient.from("activities").insert({
        company_id: compId,
        user_id: state.user?.id || null,
        type: id ? "OTHER" : "PROPOSAL_SENT",
        description: id ? `Memperbarui data sponsor ${compPayload.name}` : `Menambahkan prospek sponsor baru ${compPayload.name}`
    });

    showToast("Data Tersimpan!", "success");
    closeModal("#companyModal");
    await loadAllData();
    renderEverything();
}

async function saveTask(e) {
    e.preventDefault();
    const projId = $("#taskProject").value || null;
    const taskTitle = $("#taskTitle").value.trim();

    const payload = {
        title: taskTitle,
        sponsor_project_id: projId,
        due_date: $("#taskDueDate").value || null,
        description: $("#taskDescription").value.trim(),
        priority: $("#taskPriority").value,
        status: "TODO",
        assigned_to: state.user?.id || null
    };

    const { error } = await supabaseClient.from("tasks").insert(payload);
    if (error) {
        $("#taskFormError").textContent = error.message;
        return;
    }

    let compId = null;
    if (projId) {
        const proj = state.projects.find(p => p.id === projId);
        if (proj) compId = proj.company_id;
    }

    await supabaseClient.from("activities").insert({
        company_id: compId,
        user_id: state.user?.id || null,
        type: "OTHER",
        description: `Membuat task baru: "${taskTitle}"`
    });

    showToast("Task Dibuat!", "success");
    closeModal("#taskModal");
    await loadAllData();
    renderEverything();
}

function openCompanyEditor(comp = null, proj = null) {
    $("#companyForm").reset();
    
    $$(`input[name="objectives"]`).forEach(cb => cb.checked = false);
    $("#companyCustomObjective").value = "";

    $("#companyModalTitle").textContent = comp ? "EDIT SPONSOR" : "TAMBAH SPONSOR";
    $("#companyId").value = comp?.id || "";
    if (comp) {
        $("#companyName").value = comp.name || "";
        $("#companyIndustry").value = comp.category || "";
        $("#companyStatus").value = comp.status || "PROSPECT";
        $("#companyValue").value = proj ? proj.target_value : "";
        $("#companyContact").value = comp.contact_name || "";
        $("#companyPhone").value = comp.contact_phone || "";
        $("#companyNotes").value = comp.description || "";
    }
    openModal("#companyModal");
}

function populateTaskProjectSelect() {
    const sel = $("#taskProject");
    if (!sel) return;
    sel.innerHTML = `<option value="">-- Pilih Proyek --</option>` + 
        state.projects.map(p => `<option value="${p.id}">${p.title} (${p.companies?.name})</option>`).join("");
}

function bindFilters() {
    $("#companySearch")?.addEventListener("input", renderCompanyGrid);
    $("#companyStatusFilter")?.addEventListener("change", (e) => { state.companyFilter = e.target.value; renderCompanyGrid(); });
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
    if ($("#currentDate")) $("#currentDate").textContent = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }).toUpperCase();
}
