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

let toastTimer;


/* =========================================================
   HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);


function show(el) {
    if (el) el.classList.remove("hidden");
}


function hide(el) {
    if (el) el.classList.add("hidden");
}


function setText(id, value = "") {
    const el = $(id);

    if (el) {
        el.textContent = value ?? "";
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

    if (!date) return "-";

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(new Date(date));
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


/*
 * HTML checkbox menggunakan:
 *
 * BRAND_AWARENESS
 * PRODUCT_TRIAL
 *
 * Database menggunakan:
 *
 * brand-awareness
 * product-trial
 *
 * Fungsi ini menjembatani keduanya.
 */

function normalizeObjectiveSlug(value) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replaceAll("_", "-");
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message, type = "success") {

    const toast = $("toast");

    if (!toast) return;

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

    if (!overlay) return;

    setText("loadingText", text);

    if (active) {
        show(overlay);
    } else {
        hide(overlay);
    }
}


/* =========================================================
   LOGIN ERROR
   ========================================================= */

function showLoginError(message) {

    const el = $("loginError");

    if (!el) return;

    el.textContent = message;

    show(el);
}


function hideLoginError() {

    hide($("loginError"));
}


/* =========================================================
   SPONSOR ERROR
   ========================================================= */

function showSponsorError(message) {

    const el = $("sponsorFormError");

    if (!el) return;

    el.textContent = message;

    show(el);
}


function hideSponsorError() {

    hide($("sponsorFormError"));
}


/* =========================================================
   LOGIN
   ========================================================= */

async function login(email, password) {

    hideLoginError();

    setLoading(true, "Memverifikasi akun...");

    try {

        const { data, error } =
            await db.auth.signInWithPassword({
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
                : error.message
        );

    } finally {

        setLoading(false);
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {

    setLoading(true, "Keluar...");

    try {

        const { error } =
            await db.auth.signOut();

        if (error) {
            throw error;
        }

        currentUser = null;

        currentProfile = null;

        sponsors = [];

        objectives = [];

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

    const { data, error } =
        await db
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
        data.role || "USER"
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

    const role =
        String(
            currentProfile?.role ||
            "USER"
        ).toUpperCase();

    setText(
        "currentUserRole",
        role
    );

    const description =
        $("dashboardDescription");

    if (description) {

        description.textContent =
            role === "ADMIN"
                ? "Kelola seluruh data prospek sponsor dan monitoring kerja sama."
                : "Lihat dan kelola data sponsor yang tersedia untuk tim.";
    }
}


/* =========================================================
   OBJECTIVES
   ========================================================= */

async function loadObjectives() {

    const { data, error } =
        await db
            .from("objectives")
            .select("id,name,slug")
            .order("name");

    if (error) {

        console.error(
            "Objectives error:",
            error
        );

        objectives = [];

        return;
    }

    objectives = data || [];

    console.log(
        "Objectives loaded:",
        objectives
    );
}


/* =========================================================
   LOAD SPONSORS
   ========================================================= */

async function loadSponsors() {

    setLoading(
        true,
        "Memuat database sponsor..."
    );

    try {

        const { data, error } =
            await db
                .from("companies")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

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

        showToast(
            "Database sponsor tidak dapat dimuat.",
            "error"
        );

    } finally {

        setLoading(false);
    }
}


/* =========================================================
   LOAD OBJECTIVES FOR SPONSORS
   ========================================================= */

async function loadSponsorObjectives() {

    if (!sponsors.length) {
        return;
    }

    const companyIds =
        sponsors.map(
            sponsor => sponsor.id
        );


    const { data, error } =
        await db
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

        sponsors.forEach(
            sponsor => {
                sponsor.objectives = [];
            }
        );

        return;
    }


    for (const sponsor of sponsors) {

        sponsor.objectives = [];


        const projects =
            (data || []).filter(
                project =>
                    project.company_id ===
                    sponsor.id
            );


        for (const project of projects) {

            const relations =
                project.sponsor_project_objectives ||
                [];


            for (const relation of relations) {

                if (relation.objectives) {

                    sponsor.objectives.push(
                        relation.objectives
                    );
                }
            }
        }


        /*
         * Hilangkan objective duplikat
         */

        const unique =
            new Map();


        sponsor.objectives.forEach(
            objective => {

                unique.set(
                    objective.id,
                    objective
                );
            }
        );


        sponsor.objectives =
            [...unique.values()];
    }


    console.log(
        "Sponsors with objectives:",
        sponsors
    );
}


/* =========================================================
   RENDER SPONSORS
   ========================================================= */

function renderSponsors() {

    const tbody =
        $("sponsorTableBody");

    if (!tbody) return;


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
                                    objective => `
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
                                        : sponsor.contact_position ||
                                          "-"
                                )}

                            </td>


                            <td>

                                <div class="table-actions">

                                    <button
                                        type="button"
                                        class="btn btn-small btn-outline"
                                        data-action="view"
                                        data-id="${escapeHTML(
                                            sponsor.id
                                        )}"
                                    >
                                        LIHAT
                                    </button>


                                    <button
                                        type="button"
                                        class="btn btn-small btn-outline"
                                        data-action="edit"
                                        data-id="${escapeHTML(
                                            sponsor.id
                                        )}"
                                    >
                                        EDIT
                                    </button>


                                    <button
                                        type="button"
                                        class="btn btn-small btn-danger"
                                        data-action="delete"
                                        data-id="${escapeHTML(
                                            sponsor.id
                                        )}"
                                    >
                                        HAPUS
                                    </button>

                                </div>

                            </td>

                        </tr>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   ASSIGNED NAME
   ========================================================= */

function getAssignedName(userId) {

    if (!userId) {
        return "-";
    }


    if (
        currentProfile &&
        currentProfile.id === userId
    ) {

        return (
            currentProfile.full_name ||
            currentProfile.email ||
            "Saya"
        );
    }


    return "Tim";
}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics() {

    setText(
        "statTotal",
        sponsors.length
    );


    setText(
        "statProspect",
        sponsors.filter(
            sponsor =>
                sponsor.status ===
                "PROSPECT"
        ).length
    );


    setText(
        "statNegotiation",
        sponsors.filter(
            sponsor =>
                sponsor.status ===
  
