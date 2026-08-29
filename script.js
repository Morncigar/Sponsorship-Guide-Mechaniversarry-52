/* =========================================================
   M52 — PARTNERSHIP OPERATING SYSTEM
   Supabase-connected frontend
========================================================= */

/* =========================================================
   01 — SUPABASE CONFIG
========================================================= */

const SUPABASE_URL = "https://tjtilixseegqliuosgsc.supabase.co";

// Paste ONLY your Supabase Publishable Key here.
// NEVER paste sb_secret_... or service_role here.
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_PBP6LR26bD28r0bdT7EVFg_cekn47a7";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* =========================================================
   02 — GLOBAL STATE
========================================================= */

const state = {
    user: null,
    profile: null,

    companies: [],
    activities: [],
    tasks: [],

    selectedCompany: null,

    companyFilter: "ALL",
    industryFilter: "ALL",
    taskFilter: "ALL",

    currentPage: "dashboard"
};


/* =========================================================
   03 — DOM HELPERS
========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatCurrency(value) {

    const number = Number(value || 0);

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);
}


function formatDate(dateValue) {

    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function formatDateTime(dateValue) {

    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


function capitalize(value) {

    if (!value) {
        return "";
    }

    return String(value)
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}


function showToast(message, type = "normal") {

    const toast = $("#toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.className = "toast";

    if (type === "success") {
        toast.classList.add("toast-success");
    }

    if (type === "error") {
        toast.classList.add("toast-error");
    }

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


/* =========================================================
   04 — INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    bindNavigation();
    bindModals();
    bindForms();
    bindFilters();
    bindMobileMenu();

    setCurrentDate();

    await initializeApplication();
});


async function initializeApplication() {

    try {

        const {
            data: {
                session
            }
        } = await supabaseClient.auth.getSession();

        if (session) {

            state.user = session.user;

            await loadProfile();

            await showApplication();

        } else {

            showLogin();

        }

    } catch (error) {

        console.error("Initialization error:", error);

        showLogin();

    } finally {

        setTimeout(() => {

            const loader = $("#appLoader");

            if (loader) {
                loader.classList.add("hidden");
            }

        }, 500);

    }


    supabaseClient.auth.onAuthStateChange(
        async (event, session) => {

            if (event === "SIGNED_IN" && session) {

                state.user = session.user;

                await loadProfile();

                await showApplication();

            }


            if (event === "SIGNED_OUT") {

                state.user = null;
                state.profile = null;

                showLogin();

            }

        }
    );
}


/* =========================================================
   05 — AUTHENTICATION
========================================================= */

function showLogin() {

    const loginScreen = $("#loginScreen");
    const app = $("#app");

    if (loginScreen) {
        loginScreen.classList.remove("hidden");
    }

    if (app) {
        app.classList.add("hidden");
    }
}


async function showApplication() {

    const loginScreen = $("#loginScreen");
    const app = $("#app");

    if (loginScreen) {
        loginScreen.classList.add("hidden");
    }

    if (app) {
        app.classList.remove("hidden");
    }

    updateUserInterface();

    await loadAllData();

    navigateTo("dashboard");
}


async function handleLogin(event) {

    event.preventDefault();

    const email = $("#loginEmail")?.value.trim();
    const password = $("#loginPassword")?.value;

    const errorBox = $("#loginError");
    const button = $("#loginButton");

    if (!email || !password) {
        showLoginError("Email dan password wajib diisi.");
        return;
    }

    if (button) {
        button.disabled = true;
        button.classList.add("loading");
    }

    if (errorBox) {
        errorBox.textContent = "";
    }

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw error;
        }

        state.user = data.user;

        await loadProfile();

        await showApplication();

    } catch (error) {

        console.error(error);

        showLoginError(
            translateAuthError(error.message)
        );

    } finally {

        if (button) {
            button.disabled = false;
            button.classList.remove("loading");
        }

    }
}


async function logout() {

    try {

        const {
            error
        } = await supabaseClient.auth.signOut();

        if (error) {
            throw error;
        }

        showToast("Logged out.", "success");

    } catch (error) {

        console.error(error);

        showToast(
            "Gagal logout.",
            "error"
        );

    }
}


function showLoginError(message) {

    const errorBox = $("#loginError");

    if (errorBox) {
        errorBox.textContent = message;
    }
}


function translateAuthError(message) {

    if (!message) {
        return "Login gagal.";
    }

    if (
        message.toLowerCase().includes("invalid login")
    ) {
        return "Email atau password salah.";
    }

    if (
        message.toLowerCase().includes("email not confirmed")
    ) {
        return "Email belum dikonfirmasi.";
    }

    return message;
}


/* =========================================================
   06 — PROFILE
========================================================= */

async function loadProfile() {

    if (!state.user) {
        return;
    }

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", state.user.id)
            .maybeSingle();

        if (error) {
            throw error;
        }

        state.profile = data;

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        state.profile = null;
    }
}


function updateUserInterface() {

    const email = state.user?.email || "—";

    const name =
        state.profile?.full_name ||
        state.profile?.name ||
        email.split("@")[0] ||
        "User";

    const role =
        state.profile?.role ||
        "VIEWER";


    const nameElement = $("#userName");
    const emailElement = $("#userEmail");
    const roleElement = $("#userRole");
    const avatarElement = $("#userAvatar");


    if (nameElement) {
        nameElement.textContent = name;
    }

    if (emailElement) {
        emailElement.textContent = email;
    }

    if (roleElement) {
        roleElement.textContent = String(role).toUpperCase();
    }

    if (avatarElement) {

        avatarElement.textContent =
            name.charAt(0).toUpperCase();

    }
}


function isAdmin() {

    return String(
        state.profile?.role || ""
    ).toUpperCase() === "ADMIN";

}


/* =========================================================
   07 — DATA LOADING
========================================================= */

async function loadAllData() {

    await Promise.all([
        loadCompanies(),
        loadActivities(),
        loadTasks()
    ]);

    renderEverything();
}


/* =========================================================
   08 — COMPANIES
========================================================= */

async function loadCompanies() {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("companies")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {
            throw error;
        }

        state.companies = data || [];

    } catch (error) {

        console.error(
            "Companies loading error:",
            error
        );

        state.companies = [];

        showToast(
            "Database sponsor gagal dimuat.",
            "error"
        );
    }
}


async function saveCompany(event) {

    event.preventDefault();

    const id = $("#companyId")?.value;

    const payload = {

        name:
            $("#companyName")?.value.trim(),

        industry:
            $("#companyIndustry")?.value || null,

        status:
            $("#companyStatus")?.value || "PROSPECT",

        objective:
            $("#companyObjective")?.value || null,

        potential_value:
            Number(
                $("#companyValue")?.value || 0
            ),

        contact_name:
            $("#companyContact")?.value.trim() || null,

        contact_phone:
            $("#companyPhone")?.value.trim() || null,

        contact_email:
            $("#companyEmail")?.value.trim() || null,

        next_action:
            $("#companyNextAction")?.value.trim() || null,

        next_action_date:
            $("#companyNextDate")?.value || null,

        internal_pic:
            $("#companyInternalPic")?.value.trim() || null,

        notes:
            $("#companyNotes")?.value.trim() || null

    };


    if (!payload.name) {

        showFormError(
            "#companyFormError",
            "Nama perusahaan wajib diisi."
        );

        return;
    }


    try {

        let response;


        if (id) {

            response = await supabaseClient
                .from("companies")
                .update(payload)
                .eq("id", id)
                .select()
                .single();

        } else {

            response = await supabaseClient
                .from("companies")
                .insert(payload)
                .select()
                .single();

        }


        if (response.error) {
            throw response.error;
        }


        showToast(
            id
                ? "Company berhasil diperbarui."
                : "Company berhasil ditambahkan.",
            "success"
        );


        closeModal("#companyModal");

        await loadCompanies();

        await loadActivities();

        renderEverything();


    } catch (error) {

        console.error(error);

        showFormError(
            "#companyFormError",
            error.message || "Gagal menyimpan company."
        );

    }
}


async function deleteCompany(companyId) {

    if (!isAdmin()) {

        showToast(
            "Hanya ADMIN yang dapat menghapus company.",
            "error"
        );

        return;
    }


    const company =
        state.companies.find(
            item => item.id === companyId
        );


    if (!company) {
        return;
    }


    const confirmed = confirm(
        `Hapus ${company.name}? Data yang terkait dapat ikut terdampak.`
    );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("companies")
            .delete()
            .eq("id", companyId);


        if (error) {
            throw error;
        }


        showToast(
            "Company berhasil dihapus.",
            "success"
        );


        closeModal("#detailModal");

        await loadCompanies();

        await loadActivities();

        await loadTasks();

        renderEverything();


    } catch (error) {

        console.error(error);

        showToast(
            "Gagal menghapus company.",
            "error"
        );

    }
}


/* =========================================================
   09 — ACTIVITIES
========================================================= */

async function loadActivities() {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("activities")
            .select(`
                *,
                companies (
                    id,
                    name
                )
            `)
            .order("created_at", {
                ascending: false
            })
            .limit(200);


        if (error) {
            throw error;
        }


        state.activities = data || [];


    } catch (error) {

        console.error(
            "Activities loading error:",
            error
        );

        state.activities = [];

    }
}


async function saveActivity(event) {

    event.preventDefault();


    const companyId =
        state.selectedCompany?.id;


    if (!companyId) {

        showToast(
            "Company tidak ditemukan.",
            "error"
        );

        return;
    }


    const type =
        $("#activityType")?.value;


    const description =
        $("#activityDescription")?.value.trim();


    if (!description) {

        showToast(
            "Isi aktivitas terlebih dahulu.",
            "error"
        );

        return;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("activities")
            .insert({

                company_id: companyId,

                type,

                description,

                created_by:
                    state.user?.id || null

            });


        if (error) {
            throw error;
        }


        $("#activityDescription").value = "";


        showToast(
            "Activity ditambahkan.",
            "success"
        );


        await loadActivities();

        renderActivityTimeline(
            companyId
        );

        renderRecentActivities();


    } catch (error) {

        console.error(error);

        showToast(
            "Gagal menambahkan activity.",
            "error"
        );

    }
}


/* =========================================================
   10 — TASKS
========================================================= */

async function loadTasks() {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("tasks")
            .select(`
                *,
                companies (
                    id,
                    name
                )
            `)
            .order("due_date", {
                ascending: true
            });


        if (error) {
            throw error;
        }


        state.tasks = data || [];


    } catch (error) {

        console.error(
            "Tasks loading error:",
            error
        );

        state.tasks = [];

    }
}


async function saveTask(event) {

    event.preventDefault();


    const title =
        $("#taskTitle")?.value.trim();


    if (!title) {

        showFormError(
            "#taskFormError",
            "Task title wajib diisi."
        );

        return;
    }


    const payload = {

        title,

        company_id:
            $("#taskCompany")?.value || null,

        due_date:
            $("#taskDueDate")?.value || null,

        description:
            $("#taskDescription")?.value.trim() || null,

        status:
            "OPEN",

        assigned_to:
            state.user?.id || null

    };


    try {

        const {
            error
        } = await supabaseClient
            .from("tasks")
            .insert(payload);


        if (error) {
            throw error;
        }


        showToast(
            "Task dibuat.",
            "success"
        );


        closeModal("#taskModal");

        $("#taskForm").reset();


        await loadTasks();

        renderTasks();

        renderDashboardStats();

        renderPriorityTasks();


    } catch (error) {

        console.error(error);

        showFormError(
            "#taskFormError",
            error.message || "Gagal membuat task."
        );

    }
}


async function toggleTask(taskId, completed) {

    try {

        const {
            error
        } = await supabaseClient
            .from("tasks")
            .update({
                status:
                    completed
                        ? "COMPLETED"
                        : "OPEN"
            })
            .eq("id", taskId);


        if (error) {
            throw error;
        }


        await loadTasks();

        renderTasks();

        renderDashboardStats();

        renderPriorityTasks();


    } catch (error) {

        console.error(error);

        showToast(
            "Gagal mengubah task.",
            "error"
        );

    }
}


/* =========================================================
   11 — NAVIGATION
========================================================= */

function bindNavigation() {

    $$(".nav-item").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.page;

                navigateTo(page);

            }
        );

    });


    $$("[data-page-link]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                navigateTo(
                    button.dataset.pageLink
                );

            }
        );

    });

}


function navigateTo(page) {

    state.currentPage = page;


    $$(".page").forEach(section => {

        section.classList.remove(
            "active-page"
        );

    });


    const target =
        $(`#page-${page}`);


    if (target) {

        target.classList.add(
            "active-page"
        );

    }


    $$(".nav-item").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === page
        );

    });


    closeSidebarMobile();


    if (page === "dashboard") {

        renderDashboard();

    }


    if (page === "crm") {

        renderCRM();

    }


    if (page === "pipeline") {

        renderPipeline();

    }


    if (page === "tasks") {

        renderTasks();

    }


    if (page === "playbook") {

        renderPlaybook();

    }

}


/* =========================================================
   12 — DASHBOARD
========================================================= */

function renderDashboard() {

    renderDashboardStats();

    renderPipelineBars();

    renderRecentActivities();

    renderPriorityTasks();

}


function renderDashboardStats() {

    const activeStatuses = [
        "PROSPECT",
        "CONTACTED",
        "MEETING",
        "PROPOSAL",
        "NEGOTIATION"
    ];


    const activeCompanies =
        state.companies.filter(
            company =>
                activeStatuses.includes(
                    company.status
                )
        );


    const pipelineValue =
        activeCompanies.reduce(
            (total, company) =>
                total +
                Number(
                    company.potential_value || 0
                ),
            0
        );


    const securedValue =
        state.companies
            .filter(
                company =>
                    company.status === "CLOSED"
            )
            .reduce(
                (total, company) =>
                    total +
                    Number(
                        company.potential_value || 0
                    ),
                0
            );


    const openTasks =
        state.tasks.filter(
            task =>
                task.status !== "COMPLETED"
        );


    setText(
        "#statProspects",
        activeCompanies.length
    );


    setText(
        "#statPipeline",
        formatCurrency(pipelineValue)
    );


    setText(
        "#statSecured",
        formatCurrency(securedValue)
    );


    setText(
        "#statTasks",
        openTasks.length
    );

}


function renderPipelineBars() {

    const container =
        $("#pipelineBars");


    if (!container) {
        return;
    }


    const statuses = [
        "PROSPECT",
        "CONTACTED",
        "MEETING",
        "PROPOSAL",
        "NEGOTIATION",
        "CLOSED"
    ];


    const counts = statuses.map(
        status =>
            state.companies.filter(
                company =>
                    company.status === status
            ).length
    );


    const max =
        Math.max(
            ...counts,
            1
        );


    container.innerHTML =
        statuses.map(
            (status, index) => {

                const count =
                    counts[index];

                const width =
                    `${Math.max(
                        (count / max) * 100,
                        count > 0 ? 8 : 0
                    )}%`;


                return `

                    <div class="pipeline-row">

                        <div class="pipeline-label">
                            ${escapeHTML(
                                capitalize(status)
                            )}
                        </div>

                        <div class="pipeline-track">

                            <div
                                class="pipeline-fill"
                                style="width:${width}"
                            ></div>

                        </div>

                        <div class="pipeline-count">
                            ${count}
                        </div>

                    </div>

                `;

            }
        ).join("");

}


function renderRecentActivities() {

    const container =
        $("#recentActivities");


    if (!container) {
        return;
    }


    const activities =
        state.activities.slice(
            0,
            6
        );


    if (!activities.length) {

        container.innerHTML = `
            <div class="empty-state">
                Belum ada activity.
            </div>
        `;

        return;
    }


    container.innerHTML =
        activities.map(
            activity => `

                <div class="activity-item">

                    <div class="activity-dot"></div>

                    <div class="activity-main">

                        <strong>
                            ${escapeHTML(
                                activity.companies?.name ||
                                "Unknown company"
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                activity.description
                            )}
                        </span>

                    </div>

                    <time>
                        ${formatDateTime(
                            activity.created_at
                        )}
                    </time>

                </div>

            `
        ).join("");

}


function renderPriorityTasks() {

    const container =
        $("#priorityTasks");


    if (!container) {
        return;
    }


    const tasks =
        state.tasks
            .filter(
                task =>
                    task.status !== "COMPLETED"
            )
            .sort(
                (a, b) =>
                    new Date(
                        a.due_date || "9999-12-31"
                    ) -
                    new Date(
                        b.due_date || "9999-12-31"
                    )
            )
            .slice(
                0,
                5
            );


    if (!tasks.length) {

        container.innerHTML = `
            <div class="empty-state">
                Tidak ada task prioritas.
            </div>
        `;

        return;
    }


    container.innerHTML =
        tasks.map(
            task => `

                <div class="priority-task">

                    <div class="task-check">
                        <input
                            type="checkbox"
                            data-task-toggle="${task.id}"
                        >
                    </div>

                    <div class="priority-task-main">

                        <strong>
                            ${escapeHTML(
                                task.title
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                task.companies?.name ||
                                "No company"
                            )}
                        </span>

                    </div>

                    <time>
                        ${formatDate(
                            task.due_date
                        )}
                    </time>

                </div>

            `
        ).join("");


    bindTaskToggleButtons();

}


/* =========================================================
   13 — CRM
========================================================= */

function renderCRM() {

    populateTaskCompanySelect();

    renderCompanyGrid();

}


function getFilteredCompanies() {

    const search =
        ($("#companySearch")?.value || "")
            .trim()
            .toLowerCase();


    return state.companies.filter(
        company => {

            const matchesSearch =
                !search ||
                String(
                    company.name || ""
                ).toLowerCase().includes(search) ||
                String(
                    company.contact_name || ""
                ).toLowerCase().includes(search) ||
                String(
                    company.industry || ""
                ).toLowerCase().includes(search);


            const matchesStatus =
                state.companyFilter === "ALL" ||
                company.status ===
                    state.companyFilter;


            const matchesIndustry =
                state.industryFilter === "ALL" ||
                company.industry ===
                    state.industryFilter;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesIndustry
            );

        }
    );

}


function renderCompanyGrid() {

    const container =
        $("#companyGrid");


    if (!container) {
        return;
    }


    const companies =
        getFilteredCompanies();


    if (!companies.length) {

        container.innerHTML = `
            <div class="empty-state">
                Tidak ada sponsor yang sesuai filter.
            </div>
        `;

        return;
    }


    container.innerHTML =
        companies.map(
            company => `

                <article
                    class="company-card"
                    data-company-id="${company.id}"
                >

                    <div class="company-card-top">

                        <span class="company-industry">
                            ${escapeHTML(
                                capitalize(
                                    company.industry
                                ) || "OTHER"
                            )}
                        </span>

                        <span
                            class="status-badge status-${String(
                                company.status || ""
                            ).toLowerCase()}"
                        >
                            ${escapeHTML(
                                capitalize(
                                    company.status
                                )
                            )}
                        </span>

                    </div>


                    <h3>
                        ${escapeHTML(
                            company.name
                        )}
                    </h3>


                    <div class="company-value">
                        ${formatCurrency(
                            company.potential_value
                        )}
                    </div>


                    <div class="company-card-contact">

                        <span>
                            ${escapeHTML(
                                company.contact_name ||
                                "No PIC"
                            )}
                        </span>

                        <span>
                            ${escapeHTML(
                                company.internal_pic ||
                                "Unassigned"
                            )}
                        </span>

                    </div>


                    <div class="company-card-footer">

                        <span>
                            Next:
                            ${escapeHTML(
                                company.next_action ||
                                "—"
                            )}
                        </span>

                        <span>
                            →
                        </span>

                    </div>

                </article>

            `
        ).join("");


    $$(".company-card").forEach(card => {

        card.addEventListener(
            "click",
            () => {

                openCompanyDetail(
                    card.dataset.companyId
                );

            }
        );

    });

}


/* =========================================================
   14 — COMPANY DETAIL
========================================================= */

function openCompanyDetail(companyId) {

    const company =
        state.companies.find(
            item =>
                String(item.id) ===
                String(companyId)
        );


    if (!company) {
        return;
    }


    state.selectedCompany =
        company;


    setText(
        "#detailIndustry",
        `${capitalize(company.industry || "OTHER")} / SPONSOR`
    );


    setText(
        "#detailName",
        company.name || "—"
    );


    setText(
        "#detailStatus",
        capitalize(
            company.status || "—"
        )
    );


    setText(
        "#detailValue",
        formatCurrency(
            company.potential_value
        )
    );


    setText(
        "#detailPIC",
        company.internal_pic || "—"
    );


    setText(
        "#detailContact",
        [
            company.contact_name,
            company.contact_phone,
            company.contact_email
        ]
            .filter(Boolean)
            .join(" • ") || "—"
    );


    setText(
        "#detailNextAction",
        [
            company.next_action,
            company.next_action_date
                ? formatDate(
                    company.next_action_date
                )
                : null
        ]
            .filter(Boolean)
            .join(" • ") || "—"
    );


    setText(
        "#detailNotes",
        company.notes || "No notes."
    );


    renderActivityTimeline(
        company.id
    );


    const editButton =
        $("#editCompanyFromDetail");


    if (editButton) {

        editButton.onclick = () => {

            closeModal(
                "#detailModal"
            );

            openCompanyEditor(
                company
            );

        };

    }


    openModal(
        "#detailModal"
    );

}


function renderActivityTimeline(companyId) {

    const container =
        $("#activityTimeline");


    if (!container) {
        return;
    }


    const activities =
        state.activities
            .filter(
                activity =>
                    String(
                        activity.company_id
                    ) === String(companyId)
            )
            .sort(
                (a, b) =>
                    new Date(b.created_at) -
                    new Date(a.created_at)
            );


    if (!activities.length) {

        container.innerHTML = `
            <div class="empty-state">
                No activity yet.
            </div>
        `;

        return;
    }


    container.innerHTML =
        activities.map(
            activity => `

                <div class="timeline-item">

                    <div class="timeline-marker"></div>

                    <div class="timeline-content">

                        <div class="timeline-top">

                            <strong>
                                ${escapeHTML(
                                    capitalize(
                                        activity.type
                                    )
                                )}
                            </strong>

                            <time>
                                ${formatDateTime(
                                    activity.created_at
                                )}
                            </time>

                        </div>

                        <p>
                            ${escapeHTML(
                                activity.description
                            )}
                        </p>

                    </div>

                </div>

            `
        ).join("");

}


/* =========================================================
   15 — COMPANY EDITOR
========================================================= */

function openCompanyEditor(company = null) {

    const form =
        $("#companyForm");


    if (!form) {
        return;
    }


    form.reset();


    setText(
        "#companyModalTitle",
        company
            ? "EDIT COMPANY"
            : "ADD COMPANY"
    );


    $("#companyId").value =
        company?.id || "";


    $("#companyName").value =
        company?.name || "";


    $("#companyIndustry").value =
        company?.industry || "OTHER";


    $("#companyStatus").value =
        company?.status || "PROSPECT";


    $("#companyObjective").value =
        company?.objective || "";


    $("#companyValue").value =
        company?.potential_value || "";


    $("#companyContact").value =
        company?.contact_name || "";


    $("#companyPhone").value =
        company?.contact_phone || "";


    $("#companyEmail").value =
        company?.contact_email || "";


    $("#companyNextAction").value =
        company?.next_action || "";


    $("#companyNextDate").value =
        company?.next_action_date || "";


    $("#companyInternalPic").value =
        company?.internal_pic || "";


    $("#companyNotes").value =
        company?.notes || "";


    const error =
        $("#companyFormError");


    if (error) {
        error.textContent = "";
    }


    openModal(
        "#companyModal"
    );

}


/* =========================================================
   16 — PIPELINE
========================================================= */

function renderPipeline() {

    const container =
        $("#kanban");


    if (!container) {
        return;
    }


    const columns = [
        "PROSPECT",
        "CONTACTED",
        "MEETING",
        "PROPOSAL",
        "NEGOTIATION",
        "CLOSED"
    ];


    container.innerHTML =
        columns.map(
            status => {

                const companies =
                    state.companies.filter(
                        company =>
                            company.status ===
                            status
                    );


                return `

                    <div class="kanban-column">

                        <header class="kanban-header">

                            <div>
                                ${escapeHTML(
                                    capitalize(
                                        status
                                    )
                                )}
                            </div>

                            <span>
                                ${companies.length}
                            </span>

                        </header>


                        <div class="kanban-cards">

                            ${
                                companies.length
                                    ? companies.map(
                                        company => `

                                            <article
                                                class="kanban-card"
                                                data-company-id="${company.id}"
                                            >

                                                <span class="company-industry">
                                                    ${escapeHTML(
                                                        capitalize(
                                                            company.industry
                                                        )
                                                    )}
                                                </span>

                                                <h3>
                                                    ${escapeHTML(
                                                        company.name
                                                    )}
                                                </h3>

                                                <strong>
                                                    ${formatCurrency(
                                                        company.potential_value
                                                    )}
                                                </strong>

                                                <small>
                                                    ${escapeHTML(
                                                        company.next_action ||
                                                        "No next action"
                                                    )}
                                                </small>

                                            </article>

                                        `
                                    ).join("")
                                    : `
                                        <div class="kanban-empty">
                                            Empty
                                        </div>
                                    `
                            }

                        </div>

                    </div>

                `;

            }
        ).join("");


    $$(".kanban-card").forEach(card => {

        card.addEventListener(
            "click",
            () => {

                openCompanyDetail(
                    card.dataset.companyId
                );

            }
        );

    });

}


/* =========================================================
   17 — TASKS PAGE
========================================================= */

function renderTasks() {

    const container =
        $("#taskList");


    if (!container) {
        return;
    }


    let tasks =
        [...state.tasks];


    if (state.taskFilter === "OPEN") {

        tasks =
            tasks.filter(
                task =>
                    task.status !== "COMPLETED"
            );

    }


    if (state.taskFilter === "COMPLETED") {

        tasks =
            tasks.filter(
                task =>
                    task.status === "COMPLETED"
            );

    }


    if (state.taskFilter === "OVERDUE") {

        const today =
            new Date();

        today.setHours(
            23,
            59,
            59,
            999
        );


        tasks =
            tasks.filter(
                task =>
                    task.status !== "COMPLETED" &&
                    task.due_date &&
                    new Date(
                        task.due_date
                    ) < today
            );

    }


    if (!tasks.length) {

        container.innerHTML = `
            <div class="empty-state">
                Tidak ada task.
            </div>
        `;

        return;
    }


    container.innerHTML =
        tasks.map(
            task => {

                const completed =
                    task.status === "COMPLETED";


                const overdue =
                    !completed &&
                    task.due_date &&
                    new Date(
                        task.due_date
                    ) < new Date();


                return `

                    <article
                        class="task-card
                        ${completed ? "completed" : ""}
                        ${overdue ? "overdue" : ""}"
                    >

                        <label class="task-checkbox">

                            <input
                                type="checkbox"
                                data-task-toggle="${task.id}"
                                ${completed ? "checked" : ""}
                            >

                            <span></span>

                        </label>


                        <div class="task-card-main">

                            <h3>
                                ${escapeHTML(
                                    task.title
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    task.description ||
                                    "No description"
                                )}
                            </p>

                            <small>
                                ${escapeHTML(
                                    task.companies?.name ||
                                    "No company"
                                )}
                            </small>

                        </div>


                        <div class="task-card-date">

                            ${
                                overdue
                                    ? `<span class="overdue-label">OVERDUE</span>`
                                    : ""
                            }

                            <strong>
                                ${formatDate(
                                    task.due_date
                                )}
                            </strong>

                        </div>

                    </article>

                `;

            }
        ).join("");


    bindTaskToggleButtons();

}


function bindTaskToggleButtons() {

    $$("[data-task-toggle]").forEach(
        checkbox => {

            checkbox.addEventListener(
                "change",
                () => {

                    toggleTask(
                        checkbox.dataset.taskToggle,
                        checkbox.checked
                    );

                }
            );

        }
    );

}


/* =========================================================
   18 — PLAYBOOK
========================================================= */

function renderPlaybook() {

    // Static page.
    // Reserved for future dynamic playbook data.

}


/* =========================================================
   19 — FILTERS
========================================================= */

function bindFilters() {

    $("#companySearch")
        ?.addEventListener(
            "input",
            renderCompanyGrid
        );


    $("#companyStatusFilter")
        ?.addEventListener(
            "change",
            event => {

                state.companyFilter =
                    event.target.value;

                renderCompanyGrid();

            }
        );


    $("#companyIndustryFilter")
        ?.addEventListener(
            "change",
            event => {

                state.industryFilter =
                    event.target.value;

                renderCompanyGrid();

            }
        );


    $$(".task-filter").forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    state.taskFilter =
                        button.dataset.taskFilter;


                    $$(".task-filter")
                        .forEach(
                            item =>
                                item.classList.toggle(
                                    "active",
                                    item === button
                                )
                        );


                    renderTasks();

                }
            );

        }
    );

}


/* =========================================================
   20 — MODALS
========================================================= */

function bindModals() {

    $$("[data-close-modal]").forEach(
        element => {

            element.addEventListener(
                "click",
                () => {

                    const modal =
                        element.closest(
                            ".modal"
                        );

                    if (modal) {
                        closeModal(
                            `#${modal.id}`
                        );
                    }

                }
            );

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }


            $$(".modal:not(.hidden)")
                .forEach(
                    modal =>
                        closeModal(
                            `#${modal.id}`
                        )
                );

        }
    );

}


function openModal(selector) {

    const modal =
        $(selector);


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "hidden"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(selector) {

    const modal =
        $(selector);


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    if (
        document.querySelectorAll(
            ".modal:not(.hidden)"
        ).length === 0
    ) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


/* =========================================================
   21 — FORMS
========================================================= */

function bindForms() {

    $("#loginForm")
        ?.addEventListener(
            "submit",
            handleLogin
        );


    $("#companyForm")
        ?.addEventListener(
            "submit",
            saveCompany
        );


    $("#activityForm")
        ?.addEventListener(
            "submit",
            saveActivity
        );


    $("#taskForm")
        ?.addEventListener(
            "submit",
            saveTask
        );


    $("#addCompanyButton")
        ?.addEventListener(
            "click",
            () =>
                openCompanyEditor()
        );


    $("#addTaskButton")
        ?.addEventListener(
            "click",
            () => {

                populateTaskCompanySelect();

                $("#taskForm")?.reset();

                openModal(
                    "#taskModal"
                );

            }
        );


    $("#logoutButton")
        ?.addEventListener(
            "click",
            logout
        );


    $("#mobileLogoutButton")
        ?.addEventListener(
            "click",
            logout
        );

}


/* =========================================================
   22 — TASK COMPANY SELECT
========================================================= */

function populateTaskCompanySelect() {

    const select =
        $("#taskCompany");


    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            SELECT COMPANY
        </option>
    `;


    state.companies.forEach(
        company => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                company.id;


            option.textContent =
                company.name;


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   23 — MOBILE NAVIGATION
========================================================= */

function bindMobileMenu() {

    $("#mobileMenuButton")
        ?.addEventListener(
            "click",
            () => {

                $("#sidebar")
                    ?.classList.toggle(
                        "mobile-open"
                    );

            }
        );

}


function closeSidebarMobile() {

    $("#sidebar")
        ?.classList.remove(
            "mobile-open"
        );

}


/* =========================================================
   24 — UI HELPERS
========================================================= */

function setText(selector, value) {

    const element =
        $(selector);


    if (element) {
        element.textContent =
            value ?? "—";
    }

}


function showFormError(
    selector,
    message
) {

    const element =
        $(selector);


    if (element) {
        element.textContent =
            message || "";
    }

}


function setCurrentDate() {

    const element =
        $("#currentDate");


    if (!element) {
        return;
    }


    const now =
        new Date();


    element.textContent =
        now.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        ).toUpperCase();

}


/* =========================================================
   25 — RENDER EVERYTHING
========================================================= */

function renderEverything() {

    renderDashboard();

    renderCRM();

    renderPipeline();

    renderTasks();

    renderPlaybook();

}


/* =========================================================
   26 — GLOBAL REFRESH
========================================================= */

window.refreshM52Data = async function () {

    showToast(
        "Refreshing database..."
    );


    await loadAllData();


    showToast(
        "Database updated.",
        "success"
    );

};


/* =========================================================
   27 — DEBUG ACCESS
========================================================= */

window.M52 = {

    state,

    refresh: window.refreshM52Data,

    navigate: navigateTo,

    openCompany: openCompanyDetail,

    isAdmin

};
