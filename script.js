/* =========================================================
   MECHANIVERSARY 52 — SPONSOR DATABASE
   Supabase + Vanilla JS
   ========================================================= */

const SUPABASE_URL = "https://tjtilixseegqliuosgsc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_PBP6LR26bD28r0bdT7EVFg_cekn47a7";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

/* =========================================================
   STATE
   ========================================================= */

let currentUser = null;
let currentProfile = null;
let sponsors = [];
let objectives = [];
let selectedSponsorId = null;

let toastTimer = null;


/* =========================================================
   OBJECTIVE MASTER
   =========================================================
   HARUS SAMA DENGAN slug DI DATABASE objectives
   ========================================================= */

const OBJECTIVE_MASTER = [
    {
        name: "Brand Awareness",
        slug: "brand-awareness",
        description:
            "Meningkatkan exposure dan pengenalan brand."
    },
    {
        name: "Community Engagement",
        slug: "community-engagement",
        description:
            "Membangun hubungan dengan komunitas mahasiswa."
    },
    {
        name: "Content / UGC",
        slug: "content-ugc",
        description:
            "Mendapatkan konten, UGC, dan exposure digital."
    },
    {
        name: "Customer Acquisition",
        slug: "customer-acquisition",
        description:
            "Mendapatkan pelanggan atau konsumen baru."
    },
    {
        name: "Lead Generation",
        slug: "lead-generation",
        description:
            "Mendapatkan leads atau calon pelanggan."
    },
    {
        name: "Product Launch",
        slug: "product-launch",
        description:
            "Memperkenalkan produk baru kepada audience."
    },
    {
        name: "Product Trial",
        slug: "product-trial",
        description:
            "Memberikan kesempatan audience mencoba produk."
    }
];


/* =========================================================
   HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);


function show(element) {
    if (element) {
        element.classList.remove("hidden");
    }
}


function hide(element) {
    if (element) {
        element.classList.add("hidden");
    }
}


function setText(id, value = "") {
    const element = $(id);

    if (element) {
        element.textContent = value ?? "";
    }
}


function escapeHTML(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatDate(date) {
    if (!date) {
        return "-";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(parsed);
}


function formatStatus(status) {
    const map = {
        PROSPECT: "Prospek",
        CONTACTED: "Sudah Dihubungi",
        NEGOTIATION: "Negosiasi",
        DEAL: "Deal",
        REJECTED: "Ditolak"
    };

    return map[status] || status || "-";
}


function statusClass(status) {
    return String(status || "")
        .toLowerCase()
        .replaceAll("_", "-");
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message, type = "success") {
    const toast = $("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.dataset.type = type;

    show(toast);

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        hide(toast);
    }, 3500);
}


/* =========================================================
   LOADING
   ========================================================= */

function setLoading(active, text = "Memuat...") {
    const overlay = $("loadingOverlay");

    if (!overlay) {
        return;
    }

    setText("loadingText", text);

    if (active) {
        show(overlay);
    } else {
        hide(overlay);
    }
}


/* =========================================================
   ERROR
   ========================================================= */

function showLoginError(message) {
    const element = $("loginError");

    if (!element) {
        return;
    }

    element.textContent = message;
    show(element);
}


function hideLoginError() {
    hide($("loginError"));
}


function showSponsorError(message) {
    const element = $("sponsorFormError");

    if (!element) {
        return;
    }

    element.textContent = message;
    show(element);
}


function hideSponsorError() {
    hide($("sponsorFormError"));
}


/* =========================================================
   SUPABASE ERROR FORMATTER
   ========================================================= */

function getSupabaseErrorMessage(error, fallback = "Terjadi kesalahan.") {
    if (!error) {
        return fallback;
    }

    console.error("Supabase error:", error);

    if (error.code === "42501") {
        return "Akses database ditolak. Cek RLS / policy tabel Supabase.";
    }

    if (error.code === "23505") {
        return "Data sudah ada dan tidak boleh duplikat.";
    }

    if (error.code === "23503") {
        return "Data terkait masih digunakan oleh tabel lain.";
    }

    if (error.message) {
        return error.message;
    }

    return fallback;
}


/* =========================================================
   LOGIN
   ========================================================= */

async function login(email, password) {
    hideLoginError();

    setLoading(
        true,
        "Memverifikasi akun..."
    );

    try {
        const {
            data,
            error
        } = await db.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw error;
        }

        currentUser = data.user;

        await loadUserProfile(
            currentUser.id
        );

        await showMainApp();

    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        showLoginError(
            error.message ===
            "Invalid login credentials"
                ? "Email atau password salah."
                : getSupabaseErrorMessage(
                    error,
                    "Gagal login."
                )
        );

    } finally {
        setLoading(false);
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {
    setLoading(
        true,
        "Keluar..."
    );

    try {
        const {
            error
        } = await db.auth.signOut();

        if (error) {
            throw error;
        }

        currentUser = null;
        currentProfile = null;
        sponsors = [];
        objectives = [];
        selectedSponsorId = null;

        hide($("app"));
        show($("loginScreen"));

        $("loginForm")?.reset();

    } catch (error) {
        console.error(
            "Logout error:",
            error
        );

        showToast(
            "Gagal keluar dari akun.",
            "error"
        );

    } finally {
        setLoading(false);
    }
}


/* =========================================================
   PROFILE
   ========================================================= */

async function loadUserProfile(userId) {
    const {
        data,
        error
    } = await db
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        console.error(
            "Profile error:",
            error
        );

        throw new Error(
            "Akun berhasil login, tetapi profil tidak dapat dibaca. Cek RLS tabel profiles."
        );
    }

    if (!data) {
        throw new Error(
            "Profil akun belum tersedia di tabel profiles."
        );
    }

    currentProfile = data;

    setText(
        "currentUserEmail",
        data.email ||
        currentUser?.email ||
        "-"
    );

    setText(
        "currentUserRole",
        data.role ||
        "USER"
    );
}


/* =========================================================
   MAIN APP
   ========================================================= */

async function showMainApp() {
    hide($("loginScreen"));
    show($("app"));

    updateInterfaceByRole();

    await loadObjectives();
    await loadSponsors();
    await loadActivities();
}


function updateInterfaceByRole() {
    const role = String(
        currentProfile?.role ||
        "USER"
    ).toUpperCase();

    setText(
        "currentUserRole",
        role
    );

    const description =
        $("dashboardDescription");

    if (!description) {
        return;
    }

    description.textContent =
        role === "ADMIN"
            ? "Kelola seluruh data prospek sponsor dan monitoring kerja sama."
            : "Lihat dan kelola data sponsor yang tersedia untuk tim.";
}


/* =========================================================
   OBJECTIVES
   ========================================================= */

async function loadObjectives() {
    const {
        data,
        error
    } = await db
        .from("objectives")
        .select("id,name,slug")
        .order("name");

    if (error) {
        console.error(
            "Objectives error:",
            error
        );

        /*
         * Tetap gunakan master objective.
         * Jadi aplikasi tidak berhenti hanya karena
         * query objectives bermasalah.
         */

        objectives = [
            ...OBJECTIVE_MASTER
        ];

        return;
    }

    objectives = data?.length
        ? data
        : [...OBJECTIVE_MASTER];

    console.log(
        "Objectives loaded:",
        objectives
    );
}


/* =========================================================
   OBJECTIVE HELPERS
   ========================================================= */

function getObjectiveBySlug(slug) {
    return objectives.find(
        objective =>
            objective.slug === slug
    ) || OBJECTIVE_MASTER.find(
        objective =>
            objective.slug === slug
    );
}


function getObjectiveName(slug) {
    const objective =
        getObjectiveBySlug(slug);

    return objective
        ? objective.name
        : slug;
}


/* =========================================================
   SPONSORS
   ========================================================= */

async function loadSponsors() {
    setLoading(
        true,
        "Memuat database sponsor..."
    );

    try {
        const {
            data,
            error
        } = await db
            .from("companies")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) {
            throw error;
        }

        sponsors = data || [];

        await loadSponsorObjectives();

        renderSponsors();
        updateStatistics();

    } catch (error) {
        console.error(
            "Load sponsors error:",
            error
        );

        sponsors = [];

        renderSponsors();
        updateStatistics();

        showToast(
            getSupabaseErrorMessage(
                error,
                "Database sponsor tidak dapat dimuat."
            ),
            "error"
        );

    } finally {
        setLoading(false);
    }
}


/* =========================================================
   LOAD OBJECTIVES FOR ALL SPONSORS
   ========================================================= */

async function loadSponsorObjectives() {
    /*
     * Reset objectives dahulu.
     */

    sponsors.forEach(
        sponsor => {
            sponsor.objectives = [];
        }
    );

    if (!sponsors.length) {
        return;
    }

    const companyIds =
        sponsors.map(
            sponsor => sponsor.id
        );

    const {
        data,
        error
    } = await db
        .from("sponsor_projects")
        .select(`
            id,
            company_id,
            status,
            sponsor_project_objectives (
                objective_id,
                objectives (
                    id,
                    name,
                    slug
                )
            )
        `)
        .in(
            "company_id",
            companyIds
        );

    if (error) {
        console.error(
            "Sponsor objectives error:",
            error
        );

        return;
    }

    for (const sponsor of sponsors) {
        const projects =
            (data || []).filter(
                project =>
                    project.company_id ===
                    sponsor.id
            );

        const objectiveMap =
            new Map();

        for (const project of projects) {
            const relations =
                project
                    .sponsor_project_objectives ||
                [];

            for (const relation of relations) {
                const objective =
                    relation.objectives;

                if (!objective) {
                    continue;
                }

                objectiveMap.set(
                    objective.id,
                    objective
                );
            }
        }

        sponsor.objectives =
            [...objectiveMap.values()];
    }
}


/* =========================================================
   RENDER SPONSORS
   ========================================================= */

function renderSponsors() {
    const tbody =
        $("sponsorTableBody");

    if (!tbody) {
        return;
    }

    const search =
        (
            $("searchInput")?.value ||
            ""
        )
            .trim()
            .toLowerCase();

    const status =
        $("statusFilter")?.value ||
        "ALL";

    const filtered =
        sponsors.filter(
            sponsor => {
                const matchesSearch =
                    !search ||
                    String(
                        sponsor.name || ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        sponsor.contact_name ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        sponsor.contact_email ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search);

                const matchesStatus =
                    status === "ALL" ||
                    sponsor.status === status;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );

    if (!filtered.length) {
        tbody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty-state"
                >
                    <strong>
                        Tidak ada data sponsor
                    </strong>

                    <span>
                        Tidak ditemukan sponsor yang sesuai.
                    </span>
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML =
        filtered
            .map(
                sponsor => {

                    const objectiveHTML =
                        sponsor.objectives?.length
                            ? sponsor.objectives
                                .map(
                                    objective =>
                                        `
                                        <span class="objective-tag">
                                            ${escapeHTML(
                                                objective.name
                                            )}
                                        </span>
                                        `
                                )
                                .join("")
                            : `<span>-</span>`;

                    return `
                        <tr
                            data-id="${escapeHTML(
                                sponsor.id
                            )}"
                        >

                            <td>
                                <strong>
                                    ${escapeHTML(
                                        sponsor.name
                                    )}
                                </strong>

                                ${
                                    sponsor.category
                                        ? `
                                            <small>
                                                ${escapeHTML(
                                                    sponsor.category
                                                )}
                                            </small>
                                        `
                                        : ""
                                }
                            </td>

                            <td>
                                ${escapeHTML(
                                    sponsor.contact_name ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${
                                    sponsor.contact_email
                                        ? `
                                            <a
                                                href="mailto:${escapeHTML(
                                                    sponsor.contact_email
                                                )}"
                                            >
                                                ${escapeHTML(
                                                    sponsor.contact_email
                                                )}
                                            </a>
                                        `
                                        : "-"
                                }
                            </td>

                            <td>
                                <span
                                    class="status-badge ${statusClass(
                                        sponsor.status
                                    )}"
                                >
                                    ${escapeHTML(
                                        formatStatus(
                                            sponsor.status
                                        )
                                    )}
                                </span>
                            </td>

                            <td>
                                <div class="objective-tags">
                                    ${objectiveHTML}
                                </div>
                            </td>

                            <td>
                                ${escapeHTML(
                                    sponsor.assigned_to
                                        ? getAssignedName(
                                            sponsor.assigned_to
                                        )
                                        : "-"
                                )}
                            </td>

                            <td>
                                <div cl
