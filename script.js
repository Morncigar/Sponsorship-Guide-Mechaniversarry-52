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
    if (el) el.textContent = value ?? "";
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

/* =========================================================
   TOAST
   ========================================================= */

let toastTimer;

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
   ERROR
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
        const { data, error } = await db.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        currentUser = data.user;

        await loadUserProfile(currentUser.id);
        await showMainApp();

    } catch (error) {
        console.error("Login error:", error);

        showLoginError(
            error.message === "Invalid login credentials"
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
        await db.auth.signOut();

        currentUser = null;
        currentProfile = null;
        sponsors = [];

        hide($("app"));
        show($("loginScreen"));

        $("loginForm")?.reset();

    } catch (error) {
        console.error("Logout error:", error);
        showToast("Gagal keluar dari akun.", "error");
    } finally {
        setLoading(false);
    }
}

/* =========================================================
   PROFILE
   ========================================================= */

async function loadUserProfile(userId) {
    const { data, error } = await db
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        console.error("Profile error:", error);
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
        data.email || currentUser.email || "-"
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
    const role = String(currentProfile?.role || "USER").toUpperCase();

    setText("currentUserRole", role);

    const description = $("dashboardDescription");

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
    const { data, error } = await db
        .from("objectives")
        .select("*")
        .order("name");

    if (error) {
        console.error("Objectives error:", error);

        /*
         * HTML sudah menyediakan objective checkbox,
         * jadi aplikasi tetap bisa bekerja meskipun
         * tabel objectives belum terisi.
         */
        objectives = [];
        return;
    }

    objectives = data || [];
}

/* =========================================================
   SPONSORS
   ========================================================= */

async function loadSponsors() {
    setLoading(true, "Memuat database sponsor...");

    try {
        const { data, error } = await db
            .from("companies")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        if (error) throw error;

        sponsors = data || [];

        await loadSponsorObjectives();

        renderSponsors();
        updateStatistics();

    } catch (error) {
        console.error("Load sponsors error:", error);

        sponsors = [];

        renderSponsors();

        showToast(
            "Database sponsor tidak dapat dimuat. Cek RLS tabel companies.",
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
    if (!sponsors.length) return;

    const companyIds = sponsors.map((sponsor) => sponsor.id);

    const { data, error } = await db
        .from("sponsor_projects")
        .select(`
            id,
            company_id,
            sponsor_project_objectives (
                objective_id,
                objectives (
                    id,
                    name,
                    slug
                )
            )
        `)
        .in("company_id", companyIds);

    if (error) {
        console.error("Sponsor objectives error:", error);
        return;
    }

    for (const sponsor of sponsors) {
        sponsor.objectives = [];

        const projects = (data || []).filter(
            project => project.company_id === sponsor.id
        );

        for (const project of projects) {
            for (const relation of project.sponsor_project_objectives || []) {
                if (relation.objectives) {
                    sponsor.objectives.push(relation.objectives);
                }
            }
        }

        const unique = new Map();

        sponsor.objectives.forEach(objective => {
            unique.set(objective.id, objective);
        });

        sponsor.objectives = [...unique.values()];
    }
}

/* =========================================================
   RENDER SPONSORS
   ========================================================= */

function renderSponsors() {
    const tbody = $("sponsorTableBody");

    if (!tbody) return;

    const search =
        ($("searchInput")?.value || "")
            .trim()
            .toLowerCase();

    const status =
        $("statusFilter")?.value || "ALL";

    let filtered = sponsors.filter(sponsor => {
        const matchesSearch =
            !search ||
            String(sponsor.name || "")
                .toLowerCase()
                .includes(search) ||
            String(sponsor.contact_name || "")
                .toLowerCase()
                .includes(search);

        const matchesStatus =
            status === "ALL" ||
            sponsor.status === status;

        return matchesSearch && matchesStatus;
    });

    if (!filtered.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <strong>Tidak ada data sponsor</strong>
                    <span>
                        Tidak ditemukan sponsor yang sesuai.
                    </span>
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = filtered
        .map(sponsor => {
            const objectiveHTML =
                sponsor.objectives?.length
                    ? sponsor.objectives
                        .map(objective =>
                            `<span class="objective-tag">
                                ${escapeHTML(objective.name)}
                            </span>`
                        )
                        .join("")
                    : `<span>-</span>`;

            return `
                <tr data-id="${escapeHTML(sponsor.id)}">

                    <td>
                        <strong>
                            ${escapeHTML(sponsor.name)}
                        </strong>

                        ${
                            sponsor.category
                                ? `<small>
                                    ${escapeHTML(sponsor.category)}
                                   </small>`
                                : ""
                        }
                    </td>

                    <td>
                        ${escapeHTML(
                            sponsor.contact_name || "-"
                        )}
                    </td>

                    <td>
                        ${
                            sponsor.contact_email
                                ? `<a href="mailto:${escapeHTML(
                                    sponsor.contact_email
                                )}">
                                    ${escapeHTML(
                                        sponsor.contact_email
                                    )}
                                   </a>`
                                : "-"
                        }
                    </td>

                    <td>
                        <span class="status-badge ${statusClass(
                            sponsor.status
                        )}">
                            ${escapeHTML(
                                formatStatus(sponsor.status)
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
                        <div class="table-actions">

                            <button
                                type="button"
                                class="btn btn-small btn-outline"
                                data-action="view"
                                data-id="${escapeHTML(sponsor.id)}"
                            >
                                LIHAT
                            </button>

                            <button
                                type="button"
                                class="btn btn-small btn-outline"
                                data-action="edit"
                                data-id="${escapeHTML(sponsor.id)}"
                            >
                                EDIT
                            </button>

                            <button
                                type="button"
                                class="btn btn-small btn-danger"
                                data-action="delete"
                                data-id="${escapeHTML(sponsor.id)}"
                            >
                                HAPUS
                            </button>

                        </div>
                    </td>

                </tr>
            `;
        })
        .join("");
}

/* =========================================================
   ASSIGNED NAME
   ========================================================= */

function getAssignedName(userId) {
    if (!userId) return "-";

    if (
        currentProfile &&
        currentProfile.id === userId
    ) {
        return currentProfile.full_name ||
            currentProfile.email ||
            "Saya";
    }

    return "Tim";
}

/* =========================================================
   STATISTICS
   ========================================================= */

function updateStatistics() {
    setText("statTotal", sponsors.length);

    setText(
        "statProspect",
        sponsors.filter(
            sponsor => sponsor.status === "PROSPECT"
        ).length
    );

    setText(
        "statNegotiation",
        sponsors.filter(
            sponsor => sponsor.status === "NEGOTIATION"
        ).length
    );

    setText(
        "statDeal",
        sponsors.filter(
            sponsor => sponsor.status === "DEAL"
        ).length
    );
}

/* =========================================================
   MODAL
   ========================================================= */

function openSponsorModal(sponsor = null) {
    const modal = $("sponsorModal");

    if (!modal) return;

    hideSponsorError();

    $("sponsorForm")?.reset();

    if (sponsor) {
        setText(
            "sponsorModalTitle",
            "EDIT SPONSOR"
        );

        $("sponsorId").value =
            sponsor.id || "";

        $("companyName").value =
            sponsor.name || "";

        $("contactName").value =
            sponsor.contact_name || "";

        $("contactEmail").value =
            sponsor.contact_email || "";

        $("contactPhone").value =
            sponsor.contact_phone || "";

        $("sponsorStatus").value =
            sponsor.status || "PROSPECT";

        $("internalPic").value =
            sponsor.contact_position || "";

        $("sponsorNotes").value =
            sponsor.description || "";

        const selectedSlugs =
            (sponsor.objectives || [])
                .map(objective =>
                    objective.slug
                );

        document
            .querySelectorAll(
                'input[name="objectives"]'
            )
            .forEach(input => {
                input.checked =
                    selectedSlugs.includes(
                        input.value
                    );
            });

    } else {
        setText(
            "sponsorModalTitle",
            "TAMBAH SPONSOR"
        );

        $("sponsorId").value = "";

        $("sponsorStatus").value =
            "PROSPECT";

        document
            .querySelectorAll(
                'input[name="objectives"]'
            )
            .forEach(input => {
                input.checked = false;
            });
    }

    modal.setAttribute("aria-hidden", "false");
    show(modal);
}

function closeSponsorModal() {
    const modal = $("sponsorModal");

    if (!modal) return;

    modal.setAttribute("aria-hidden", "true");
    hide(modal);
}

/* =========================================================
   DETAIL MODAL
   ========================================================= */

function openDetailModal(sponsor) {
    const modal = $("detailModal");
    const content = $("detailContent");

    if (!modal || !content || !sponsor) return;

    selectedSponsorId = sponsor.id;

    const objectivesHTML =
        sponsor.objectives?.length
            ? sponsor.objectives
                .map(objective =>
                    `<span class="objective-tag">
                        ${escapeHTML(objective.name)}
                    </span>`
                )
                .join("")
            : "-";

    content.innerHTML = `
        <div class="detail-grid">

            <div class="detail-item">
                <span>PERUSAHAAN</span>
                <strong>
                    ${escapeHTML(sponsor.name)}
                </strong>
            </div>

            <div class="detail-item">
                <span>KATEGORI</span>
                <strong>
                    ${escapeHTML(
                        sponsor.category || "-"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <span>NAMA KONTAK</span>
                <strong>
                    ${escapeHTML(
                        sponsor.contact_name || "-"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <span>POSISI</span>
                <strong>
                    ${escapeHTML(
                        sponsor.contact_position || "-"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <span>EMAIL</span>
                <strong>
                    ${
                        sponsor.contact_email
                            ? `<a href="mailto:${escapeHTML(
                                sponsor.contact_email
                            )}">
                                ${escapeHTML(
                                    sponsor.contact_email
                                )}
                               </a>`
                            : "-"
                    }
                </strong>
            </div>

            <div class="detail-item">
                <span>TELEPON</span>
                <strong>
                    ${escapeHTML(
                        sponsor.contact_phone || "-"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <span>STATUS</span>
                <strong>
                    ${escapeHTML(
                        formatStatus(sponsor.status)
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <span>DIBUAT</span>
                <strong>
                    ${formatDate(
                        sponsor.created_at
                    )}
                </strong>
            </div>

            <div class="detail-item detail-full">
                <span>OBJECTIVE SPONSOR</span>

                <div class="objective-tags">
                    ${objectivesHTML}
                </div>
            </div>

            <div class="detail-item detail-full">
                <span>WEBSITE</span>

                <strong>
                    ${
                        sponsor.website
                            ? `<a
                                href="${escapeHTML(
                                    sponsor.website
                                )}"
                                target="_blank"
                                rel="noopener noreferrer"
                               >
                                ${escapeHTML(
                                    sponsor.website
                                )}
                               </a>`
                            : "-"
                    }
                </strong>
            </div>

            <div class="detail-item detail-full">
                <span>INSTAGRAM</span>

                <strong>
                    ${escapeHTML(
                        sponsor.instagram || "-"
                    )}
                </strong>
            </div>

            <div class="detail-item detail-full">
                <span>CATATAN</span>

                <p>
                    ${escapeHTML(
                        sponsor.description || "-"
                    )}
                </p>
            </div>

        </div>
    `;

    show(modal);
}

/* =========================================================
   CLOSE DETAIL
   ========================================================= */

function closeDetailModal() {
    const modal = $("detailModal");

    if (!modal) return;

    hide(modal);
    selectedSponsorId = null;
}

/* =========================================================
   FORM DATA
   ========================================================= */

function getSelectedObjectives() {
    return [...document.querySelectorAll(
        'input[name="objectives"]:checked'
    )].map(input => input.value);
}

/* =========================================================
   SAVE SPONSOR
   ========================================================= */

async function saveSponsor(event) {
    event.preventDefault();

    hideSponsorError();

    const id =
        $("sponsorId")?.value?.trim();

    const name =
        $("companyName")?.value?.trim();

    const contactName =
        $("contactName")?.value?.trim();

    const contactEmail =
        $("contactEmail")?.value?.trim();

    const contactPhone =
        $("contactPhone")?.value?.trim();

    const status =
        $("sponsorStatus")?.value || "PROSPECT";

    const internalPic =
        $("internalPic")?.value?.trim();

    const notes =
        $("sponsorNotes")?.value?.trim();

    const selectedObjectives =
        getSelectedObjectives();

    if (!name) {
        showSponsorError(
            "Nama perusahaan wajib diisi."
        );
        return;
    }

    if (!contactName) {
        showSponsorError(
            "Nama kontak wajib diisi."
        );
        return;
    }

    if (!contactEmail) {
        showSponsorError(
            "Email wajib diisi."
        );
        return;
    }

    if (!selectedObjectives.length) {
        showSponsorError(
            "Pilih minimal satu sponsor objective."
        );
        return;
    }

    setLoading(
        true,
        id
            ? "Menyimpan perubahan..."
            : "Menyimpan sponsor..."
    );

    try {
        const companyPayload = {
            name,
            contact_name: contactName,
            contact_email: contactEmail,
            contact_phone: contactPhone,
            contact_position: internalPic,
            status,
            description: notes,
            assigned_to: currentUser?.id || null,
            updated_at: new Date().toISOString()
        };

        let company;

        /* =================================================
           UPDATE
           ================================================= */

        if (id) {
            const { data, error } = await db
                .from("companies")
                .update(companyPayload)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            company = data;

        }

        /* =================================================
           INSERT
           ================================================= */

        else {
            const { data, error } = await db
                .from("companies")
                .insert({
                    ...companyPayload,
                    created_at:
                        new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            company = data;
        }

        /* =================================================
           SPONSOR PROJECT
           ================================================= */

        let project;

        if (id) {
            const { data, error } = await db
                .from("sponsor_projects")
                .select("*")
                .eq("company_id", company.id)
                .limit(1)
                .maybeSingle();

            if (error) throw error;

            project = data;

            if (project) {
                const { error: projectError } =
                    await db
                        .from("sponsor_projects")
                        .update({
                            owner_id:
                                currentUser?.id || null,
                            status,
                            notes,
                            updated_at:
                                new Date().toISOString()
                        })
                        .eq("id", project.id);

                if (projectError)
                    throw projectError;
            }
        }

        if (!project) {
            const { data, error } =
                await db
                    .from("sponsor_projects")
                    .insert({
                        company_id: company.id,
                        owner_id:
                            currentUser?.id || null,
                        title:
                            `Sponsor — ${name}`,
                        status,
                        progress: 0,
                        notes,
                        created_at:
                            new Date().toISOString(),
                        updated_at:
                            new Date().toISOString()
                    })
                    .select()
                    .single();

            if (error) throw error;

            project = data;
        }

        /* =================================================
           OBJECTIVES
           ================================================= */

        await saveProjectObjectives(
            project.id,
            selectedObjectives
        );

        /* =================================================
           ACTIVITY
           ================================================= */

        await logActivity(
            company.id,
            id
                ? "UPDATE_SPONSOR"
                : "CREATE_SPONSOR",
            id
                ? `Memperbarui data sponsor ${name}`
                : `Menambahkan sponsor ${name}`
        );

        closeSponsorModal();

        showToast(
            id
                ? "Sponsor berhasil diperbarui."
                : "Sponsor berhasil ditambahkan."
        );

        await loadSponsors();
        await loadActivities();

    } catch (error) {
        console.error("Save sponsor error:", error);

        showSponsorError(
            error.message ||
            "Gagal menyimpan data sponsor."
        );

    } finally {
        setLoading(false);
    }
}

/* =========================================================
   SAVE PROJECT OBJECTIVES
   ========================================================= */

async function saveProjectObjectives(
    projectId,
    selectedSlugs
) {
    const { error: deleteError } =
        await db
            .from("sponsor_project_objectives")
            .delete()
            .eq("sponsor_project_id", projectId);

    if (deleteError)
        throw deleteError;

    const { data: objectiveRows, error } =
        await db
            .from("objectives")
            .select("id, slug")
            .in("slug", selectedSlugs);

    if (error)
        throw error;

    if (!objectiveRows?.length) {
        throw new Error(
            "Objective belum tersedia di tabel objectives."
        );
    }

    const rows = objectiveRows.map(objective => ({
        sponsor_project_id: projectId,
        objective_id: objective.id
    }));

    const { error: insertError } =
        await db
            .from("sponsor_project_objectives")
            .insert(rows);

    if (insertError)
        throw insertError;
}

/* =========================================================
   DELETE SPONSOR
   ========================================================= */

async function deleteSponsor(id) {
    const sponsor =
        sponsors.find(item => item.id === id);

    if (!sponsor) return;

    const confirmed = confirm(
        `Hapus sponsor "${sponsor.name}"?\n\nData sponsor akan dihapus dari database.`
    );

    if (!confirmed) return;

    setLoading(true, "Menghapus sponsor...");

    try {
        /*
         * Cari project terlebih dahulu
         */

        const { data: projects, error: projectError } =
            await db
                .from("sponsor_projects")
                .select("id")
                .eq("company_id", id);

        if (projectError)
            throw projectError;

        const projectIds =
            (projects || []).map(
                project => project.id
            );

        if (projectIds.length) {
            const { error: objectiveError } =
                await db
                    .from("sponsor_project_objectives")
                    .delete()
                    .in(
                        "sponsor_project_id",
                        projectIds
                    );

            if (objectiveError)
                throw objectiveError;

            const { error: projectDeleteError } =
                await db
                    .from("sponsor_projects")
                    .delete()
                    .in("id", projectIds);

            if (projectDeleteError)
                throw projectDeleteError;
        }

        const { error } =
            await db
                .from("companies")
                .delete()
                .eq("id", id);

        if (error)
            throw error;

        await logActivity(
            null,
            "DELETE_SPONSOR",
            `Menghapus sponsor ${sponsor.name}`
        );

        showToast(
            "Sponsor berhasil dihapus."
        );

        await loadSponsors();
        await loadActivities();

    } catch (error) {
        console.error(
            "Delete sponsor error:",
            error
        );

        showToast(
            error.message ||
            "Gagal menghapus sponsor.",
            "error"
        );

    } finally {
        setLoading(false);
    }
}

/* =========================================================
   ACTIVITY
   ========================================================= */

async function logActivity(
    companyId,
    type,
    description
) {
    if (!currentUser) return;

    const { error } = await db
        .from("activities")
        .insert({
            company_id: companyId,
            user_id: currentUser.id,
            type,
            description,
            created_at:
                new Date().toISOString()
        });

    if (error) {
        console.error(
            "Activity log error:",
            error
        );
    }
}

async function loadActivities() {
    const container = $("activityList");

    if (!container) return;

    const { data, error } = await db
        .from("activities")
        .select(`
            *,
            companies (
                name
            )
        `)
        .order("created_at", {
            ascending: false
        })
        .limit(10);

    if (error) {
        console.error(
            "Activity error:",
            error
        );

        container.innerHTML = `
            <div class="empty-activity">
                Belum ada aktivitas.
            </div>
        `;

        return;
    }

    if (!data?.length) {
        container.innerHTML = `
            <div class="empty-activity">
                Belum ada aktivitas.
            </div>
        `;

        return;
    }

    container.innerHTML = data
        .map(activity => `
            <div class="activity-item">

                <div class="activity-dot"></div>

                <div class="activity-content">

                    <strong>
                        ${escapeHTML(
                            activity.description ||
                            "Aktivitas"
                        )}
                    </strong>

                    <span>
                        ${formatDate(
                            activity.created_at
                        )}
                    </span>

                </div>

            </div>
        `)
        .join("");
}

/* =========================================================
   EVENT HANDLERS
   ========================================================= */

function setupEvents() {

    /* LOGIN */

    $("loginForm")?.addEventListener(
        "submit",
        async event => {
            event.preventDefault();

            const email =
                $("loginEmail")?.value?.trim();

            const password =
                $("loginPassword")?.value || "";

            if (!email || !password) {
                showLoginError(
                    "Email dan password wajib diisi."
                );
                return;
            }

            await login(
                email,
                password
            );
        }
    );

    /* LOGOUT */

    $("logoutButton")?.addEventListener(
        "click",
        logout
    );

    /* REFRESH */

    $("refreshButton")?.addEventListener(
        "click",
        async () => {
            await loadSponsors();
            await loadActivities();

            showToast(
                "Database diperbarui."
            );
        }
    );

    /* ADD */

    $("addSponsorButton")?.addEventListener(
        "click",
        () => openSponsorModal()
    );

    /* FORM */

    $("sponsorForm")?.addEventListener(
        "submit",
        saveSponsor
    );

    /* SEARCH */

    $("searchInput")?.addEventListener(
        "input",
        renderSponsors
    );

    /* FILTER */

    $("statusFilter")?.addEventListener(
        "change",
        renderSponsors
    );

    /* TABLE ACTIONS */

    $("sponsorTableBody")?.addEventListener(
        "click",
        event => {
            const button =
                event.target.closest(
                    "[data-action]"
                );

            if (!button) return;

            const id =
                button.dataset.id;

            const sponsor =
                sponsors.find(
                    item => item.id === id
                );

            if (!sponsor) return;

            const action =
                button.dataset.action;

            if (action === "view") {
                openDetailModal(sponsor);
            }

            if (action === "edit") {
                openSponsorModal(sponsor);
            }

            if (action === "delete") {
                deleteSponsor(id);
            }
        }
    );

    /* CLOSE SPONSOR MODAL */

    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(element => {
            element.addEventListener(
                "click",
                closeSponsorModal
            );
        });

    /* CLOSE DETAIL */

    document
        .querySelectorAll(
            "[data-close-detail]"
        )
        .forEach(element => {
            element.addEventListener(
                "click",
                closeDetailModal
            );
        });

    /* EDIT FROM DETAIL */

    $("editSponsorFromDetail")
        ?.addEventListener(
            "click",
            () => {
                const sponsor =
                    sponsors.find(
                        item =>
                            item.id ===
                            selectedSponsorId
                    );

                if (!sponsor) return;

                closeDetailModal();
                openSponsorModal(sponsor);
            }
        );

    /* ESCAPE */

    document.addEventListener(
        "keydown",
        event => {
            if (event.key !== "Escape")
                return;

            closeSponsorModal();
            closeDetailModal();
        }
    );
}

/* =========================================================
   AUTH STATE
   ========================================================= */

async function initializeApp() {
    console.log(
        "MECHANIVERSARY 52 Sponsor Database initialized."
    );

    setupEvents();

    const {
        data: {
            session
        }
    } = await db.auth.getSession();

    if (!session) {
        show($("loginScreen"));
        hide($("app"));
        return;
    }

    currentUser = session.user;

    try {
        setLoading(
            true,
            "Memuat akun..."
        );

        await loadUserProfile(
            currentUser.id
        );

        await showMainApp();

    } catch (error) {
        console.error(
            "Initialize error:",
            error
        );

        await db.auth.signOut();

        show($("loginScreen"));
        hide($("app"));

        showLoginError(
            error.message ||
            "Gagal memuat akun."
        );

    } finally {
        setLoading(false);
    }
}

/* =========================================================
   AUTH LISTENER
   ========================================================= */

db.auth.onAuthStateChange(
    async (event, session) => {

        if (event === "SIGNED_OUT") {
            currentUser = null;
            currentProfile = null;

            hide($("app"));
            show($("loginScreen"));

            return;
        }

        if (
            event === "SIGNED_IN" &&
            session?.user
        ) {
            currentUser = session.user;
        }
    }
);

/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
