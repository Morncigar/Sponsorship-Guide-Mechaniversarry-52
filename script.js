/* =========================================================
   MECHANIVERSARY 52 — SPONSOR DATABASE
   SUPABASE + VANILLA JS
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
        console.log(message);
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
   LOGIN ERROR
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


/* =========================================================
   SPONSOR FORM ERROR
   ========================================================= */

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
   LOGIN
   ========================================================= */

async function login(email, password) {
    hideLoginError();

    setLoading(true, "Memverifikasi akun...");

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

        await loadUserProfile(currentUser.id);

        await showMainApp();

    } catch (error) {
        console.error("Login error:", error);

        let message = error?.message || "Login gagal.";

        if (
            error?.message === "Invalid login credentials"
        ) {
            message = "Email atau password salah.";
        }

        showLoginError(message);

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

        hide($("app"));
        show($("loginScreen"));

        $("loginForm")?.reset();

    } catch (error) {
        console.error("Logout error:", error);

        showToast(
            error?.message ||
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
        data.email ||
        currentUser?.email ||
        "-"
    );

    setText(
        "currentUserRole",
        String(data.role || "USER").toUpperCase()
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


/* =========================================================
   ROLE INTERFACE
   ========================================================= */

function updateInterfaceByRole() {
    const role = String(
        currentProfile?.role || "USER"
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

    if (role === "ADMIN") {
        description.textContent =
            "Kelola seluruh data prospek sponsor dan monitoring kerja sama.";
    } else {
        description.textContent =
            "Lihat dan kelola data sponsor yang tersedia untuk tim.";
    }
}


/* =========================================================
   OBJECTIVES
   ========================================================= */

async function loadObjectives() {
    try {
        const {
            data,
            error
        } = await db
            .from("objectives")
            .select("id,name,slug")
            .order("name", {
                ascending: true
            });

        if (error) {
            throw error;
        }

        objectives = data || [];

        console.log(
            "Objectives loaded:",
            objectives
        );

        /*
         * Kalau HTML punya checkbox objective,
         * isi checkbox berdasarkan database.
         */
        renderObjectiveCheckboxes();

    } catch (error) {
        console.error(
            "Objectives error:",
            error
        );

        objectives = [];

        /*
         * Jangan langsung menganggap database kosong.
         * Bisa jadi masalah RLS.
         */
        showToast(
            "Objective gagal dimuat. Cek permission/RLS tabel objectives.",
            "error"
        );
    }
}


/* =========================================================
   RENDER OBJECTIVE CHECKBOXES
   ========================================================= */

function renderObjectiveCheckboxes() {
    const container =
        document.querySelector(
            ".objective-grid"
        );

    if (!container) {
        return;
    }

    /*
     * Kalau database berhasil dibaca,
     * gunakan data database.
     */
    if (objectives.length) {
        container.innerHTML =
            objectives
                .map(objective => `
                    <label class="objective-option">

                        <input
                            type="checkbox"
                            name="objectives"
                            value="${escapeHTML(
                                objective.slug
                            )}"
                        >

                        <span>

                            <strong>
                                ${escapeHTML(
                                    objective.name
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    objectiveDescription(
                                        objective.slug
                                    )
                                )}
                            </small>

                        </span>

                    </label>
                `)
                .join("");

        return;
    }

    /*
     * Kalau gagal mengambil objective,
     * jangan menghapus checkbox HTML.
     */
}


/* =========================================================
   OBJECTIVE DESCRIPTION
   ========================================================= */

function objectiveDescription(slug) {
    const descriptions = {
        "brand-awareness":
            "Meningkatkan exposure dan pengenalan brand.",

        "community-engagement":
            "Membangun interaksi dengan komunitas.",

        "content-ugc":
            "Mendapatkan konten dan user generated content.",

        "customer-acquisition":
            "Mendapatkan pelanggan baru.",

        "lead-generation":
            "Mendapatkan calon customer atau leads.",

        "product-launch":
            "Memperkenalkan atau meluncurkan produk.",

        "product-trial":
            "Memberikan kesempatan audience mencoba produk."
    };

    return (
        descriptions[slug] ||
        "Tujuan kerja sama sponsor."
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

        showToast(
            error?.message ||
            "Database sponsor tidak dapat dimuat.",
            "error"
        );

    } finally {
        setLoading(false);
    }
}


/* =========================================================
   LOAD SPONSOR OBJECTIVES
   ========================================================= */

async function loadSponsorObjectives() {
    if (!sponsors.length) {
        return;
    }

    sponsors.forEach(sponsor => {
        sponsor.objectives = [];
    });

    const companyIds =
        sponsors.map(
            sponsor => sponsor.id
        );

    try {
        const {
            data,
            error
        } = await db
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
            .in(
                "company_id",
                companyIds
            );

        if (error) {
            throw error;
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
                    project.sponsor_project_objectives ||
                    [];

                for (const relation of relations) {
                    const objective =
                        relation.objectives;

                    if (objective) {
                        objectiveMap.set(
                            objective.id,
                            objective
                        );
                    }
                }
            }

            sponsor.objectives =
                [...objectiveMap.values()];
        }

    } catch (error) {
        console.error(
            "Sponsor objectives error:",
            error
        );
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
                const companyName =
                    String(
                        sponsor.name || ""
                    ).toLowerCase();

                const contactName =
                    String(
                        sponsor.contact_name ||
                        ""
                    ).toLowerCase();

                const matchesSearch =
                    !search ||
                    companyName.includes(
                        search
                    ) ||
                    contactName.includes(
                        search
                    );

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
                                        : "-"
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
                "NEGOTIATION"
        ).length
    );

    setText(
        "statDeal",
        sponsors.filter(
            sponsor =>
                sponsor.status ===
                "DEAL"
        ).length
    );
}


/* =========================================================
   OPEN SPONSOR MODAL
   ========================================================= */

function openSponsorModal(
    sponsor = null
) {
    const modal =
        $("sponsorModal");

    if (!modal) {
        return;
    }

    hideSponsorError();

    $("sponsorForm")?.reset();

    /*
     * Pastikan objective terbaru
     * dari database sudah dirender.
     */
    renderObjectiveCheckboxes();

    if (sponsor) {
        setText(
            "sponsorModalTitle",
            "EDIT SPONSOR"
        );

        if ($("sponsorId")) {
            $("sponsorId").value =
                sponsor.id || "";
        }

        if ($("companyName")) {
            $("companyName").value =
                sponsor.name || "";
        }

        if ($("contactName")) {
            $("contactName").value =
                sponsor.contact_name || "";
        }

        if ($("contactEmail")) {
            $("contactEmail").value =
                sponsor.contact_email || "";
        }

        if ($("contactPhone")) {
            $("contactPhone").value =
                sponsor.contact_phone || "";
        }

        if ($("sponsorStatus")) {
            $("sponsorStatus").value =
                sponsor.status ||
                "PROSPECT";
        }

        /*
         * IMPORTANT:
         * internalPic pada HTML adalah
         * PIC INTERNAL.
         *
         * Supabase companies punya:
         * contact_position
         *
         * Jadi tetap mengikuti struktur
         * tabel yang sudah ada.
         */
        if ($("internalPic")) {
            $("internalPic").value =
                sponsor.contact_position || "";
        }

        if ($("sponsorNotes")) {
            $("sponsorNotes").value =
                sponsor.description || "";
        }

        const selectedSlugs =
            (sponsor.objectives || [])
                .map(
                    objective =>
                        objective.slug
                );

        document
            .querySelectorAll(
                'input[name="objectives"]'
            )
            .forEach(
                input => {
                    input.checked =
                        selectedSlugs.includes(
                            input.value
                        );
                }
            );

    } else {
        setText(
            "sponsorModalTitle",
            "TAMBAH SPONSOR"
        );

        if ($("sponsorId")) {
            $("sponsorId").value = "";
        }

        if ($("sponsorStatus")) {
            $("sponsorStatus").value =
                "PROSPECT";
        }

        document
            .querySelectorAll(
                'input[name="objectives"]'
            )
            .forEach(
                input => {
                    input.checked = false;
                }
            );
    }

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    show(modal);
}


/* =========================================================
   CLOSE SPONSOR MODAL
   ========================================================= */

function closeSponsorModal() {
    const modal =
        $("sponsorModal");

    if (!modal) {
        return;
    }

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    hide(modal);
}


/* =========================================================
   DETAIL MODAL
   ========================================================= */

function openDetailModal(
    sponsor
) {
    const modal =
        $("detailModal");

    const content =
        $("detailContent");

    if (
        !modal ||
        !content ||
        !sponsor
    ) {
        return;
    }

    selectedSponsorId =
        sponsor.id;

    const objectivesHTML =
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
            : "-";

    content.innerHTML = `
        <div class="detail-grid">

            <div class="detail-item">

                <span>
                    PERUSAHAAN
                </span>

                <strong>
                    ${escapeHTML(
                        sponsor.name
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    KATEGORI
                </span>

                <strong>
                    ${escapeHTML(
                        sponsor.category ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    NAMA KONTAK
                </span>

                <strong>
                    ${escapeHTML(
                        sponsor.contact_name ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    POSISI
                </span>

                <strong>
                    ${escapeHTML(
                        sponsor.contact_position ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    EMAIL
                </span>

                <strong>

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

                </strong>

            </div>


            <div class="detail-item">

                <span>
                    TELEPON
                </span>

                <strong>
                    ${escapeHTML(
                        sponsor.contact_phone ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    STATUS
                </span>

                <strong>
                    ${escapeHTML(
                        formatStatus(
                            sponsor.status
                        )
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    DIBUAT
                </span>

                <strong>
                    ${formatDate(
                        sponsor.created_at
                    )}
                </strong>

            </div>


            <div class="detail-item detail-full">

                <span>
                    OBJECTIVE SPONSOR
                </span>

                <div class="objective-tags">
                    ${objectivesHTML}
                </div>

            </div>


            <div class="detail-item detail-full">

                <span>
                    WEBSITE
                </span>

                <strong>

                    ${
                        sponsor.website
                            ? `
                                <a
                                    href="${escapeHTML(
                                        sponsor.website
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    ${escapeHTML(
                                        sponsor.website
                                    )}
                                </a>
                            `
                            : "-"
                    }

                </strong>

            </div>


            <div class="detail-item detail-full">

                <span>
                    INSTAGRAM
                </span>

                <strong>
                    ${escapeHTML(
                        sponsor.instagram ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="detail-item detail-full">

                <span>
                    CATATAN
                </span>

                <p>
                    ${escapeHTML(
                        sponsor.description ||
                        "-"
                    )}
                </p>

            </div>

        </div>
    `;

    show(modal);
}


/* =========================================================
   CLOSE DETAIL MODAL
   ========================================================= */

function closeDetailModal() {
    const modal =
        $("detailModal");

    if (!modal) {
        return;
    }

    hide(modal);

    selectedSponsorId =
        null;
}


/* =========================================================
   SELECTED OBJECTIVES
   ========================================================= */

function getSelectedObjectives() {
    return [
        ...document.querySelectorAll(
            'input[name="objectives"]:checked'
        )
    ].map(
        input => input.value
    );
}


/* =========================================================
   SAVE SPONSOR
   ========================================================= */

async function saveSponsor(event) {
    event.preventDefault();

    hideSponsorError();

    const id =
        $("sponsorId")?.value?.trim() ||
        "";

    const name =
        $("companyName")?.value?.trim() ||
        "";

    const contactName =
        $("contactName")?.value?.trim() ||
        "";

    const contactEmail =
        $("contactEmail")?.value?.trim() ||
        "";

    const contactPhone =
        $("contactPhone")?.value?.trim() ||
        "";

    const status =
        $("sponsorStatus")?.value ||
        "PROSPECT";

    const internalPic =
        $("internalPic")?.value?.trim() ||
        "";

    const notes =
        $("sponsorNotes")?.value?.trim() ||
        "";

    const selectedObjectives =
        getSelectedObjectives();


    /* =====================================================
       VALIDATION
       ===================================================== */

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


    /*
     * Pastikan status hanya salah satu
     * dari CHECK constraint Supabase.
     */

    const validStatuses = [
        "PROSPECT",
        "CONTACTED",
        "NEGOTIATION",
        "DEAL",
        "REJECTED"
    ];

    if (
        !validStatuses.includes(status)
    ) {
        showSponsorError(
            "Status sponsor tidak valid."
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

        /* =================================================
           COMPANY PAYLOAD
           ================================================= */

        const companyPayload = {
            name,
            contact_name: contactName,
            contact_email: contactEmail,
            contact_phone: contactPhone,
            contact_position: internalPic,
            status,
            description: notes,
            assigned_to:
                currentUser?.id || null,
            updated_at:
                new Date().toISOString()
        };


        /* =================================================
           SAVE COMPANY
           ================================================= */

        let company = null;

        if (id) {

            const {
                data,
                error
            } = await db
                .from("companies")
                .update(companyPayload)
                .eq("id", id)
                .select("*")
                .single();

            if (error) {
                throw error;
            }

            company = data;

        } else {

            const {
                data,
                error
            } = await db
                .from("companies")
                .insert({
                    ...companyPayload,
                    created_at:
                        new Date().toISOString()
                })
                .select("*")
                .single();

            if (error) {
                throw error;
            }

            company = data;
        }


        /* =================================================
           FIND EXISTING PROJECT
           ================================================= */

        let project = null;

        const {
            data: existingProject,
            error: projectFindError
        } = await db
            .from("sponsor_projects")
            .select("*")
            .eq(
                "company_id",
                company.id
            )
            .limit(1)
            .maybeSingle();

        if (projectFindError) {
            throw projectFindError;
        }

        project = existingProject;


        /* =================================================
           UPDATE PROJECT
           ================================================= */

        if (project) {

            const {
                error
            } = await db
                .from("sponsor_projects")
                .update({
                    owner_id:
                        currentUser?.id ||
                        null,

                    status,

                    notes,

                    title:
                        `Sponsor — ${name}`,

                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    "id",
                    project.id
                );

            if (error) {
                throw error;
            }

        }


        /* =================================================
           CREATE PROJECT
           ================================================= */

        else {

            const {
                data,
                error
            } = await db
                .from("sponsor_projects")
                .insert({
                    company_id:
                        company.id,

                    owner_id:
                        currentUser?.id ||
                        null,

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
                .select("*")
                .single();

            if (error) {
                throw error;
            }

            project = data;
        }


        /* =================================================
           SAVE OBJECTIVES
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


        /* =================================================
           CLOSE + REFRESH
           ================================================= */

        closeSponsorModal();

        showToast(
            id
                ? "Sponsor berhasil diperbarui."
                : "Sponsor berhasil ditambahkan."
        );

        await loadSponsors();

        await loadActivities();

    } catch (error) {

        console.error(
            "Save sponsor error:",
            error
        );

        showSponsorError(
            error?.message ||
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
    if (!projectId) {
        throw new Error(
            "Project sponsor tidak ditemukan."
        );
    }

    if (!selectedSlugs?.length) {
        throw new Error(
            "Pilih minimal satu sponsor objective."
        );
    }


    /* =====================================================
       DELETE OLD RELATIONS
       ===================================================== */

    const {
        error: deleteError
    } = await db
        .from(
            "sponsor_project_objectives"
        )
        .delete()
        .eq(
            "sponsor_project_id",
            projectId
        );

    if (deleteError) {
        throw deleteError;
    }


    /* =====================================================
       FIND OBJECTIVE IDs USING SLUG
       ===================================================== */

    const {
        data: objectiveRows,
        error
    } = await db
        .from("objectives")
        .select(
            "id, name, slug"
        )
        .in(
            "slug",
            selectedSlugs
        );

    if (error) {
        throw error;
    }


    /*
     * Ini penting:
     *
     * HTML checkbox menggunakan slug:
     *
     * brand-awareness
     * community-engagement
     * content-ugc
     * customer-acquisition
     * lead-generation
     * product-launch
     * product-trial
     *
     * Supabase juga dicari berdasarkan slug.
     */

    if (
        !objectiveRows ||
        !objectiveRows.length
    ) {
        throw new Error(
            "Objective belum tersedia di tabel objectives."
        );
    }


    /* =====================================================
       CHECK WHETHER EVERYTHING MATCHED
       ===================================================== */

    const foundSlugs =
        objectiveRows.map(
            objective =>
                objective.slug
        );

    const missingSlugs =
        selectedSlugs.filter(
            slug =>
                !foundSlugs.includes(
                    slug
                )
        );

    if (missingSlugs.length) {
        throw new Error(
            `Objective tidak ditemukan: ${missingSlugs.join(", ")}`
        );
    }


    /* =====================================================
       INSERT RELATIONS
       ===================================================== */

    const rows =
        objectiveRows.map(
            objective => ({
                sponsor_project_id:
                    projectId,

                objective_id:
                    objective.id
            })
        );

    const {
        error: insertError
    } = await db
        .from(
            "sponsor_project_objectives"
        )
        .insert(rows);

    if (insertError) {
        throw insertError;
    }
}


/* =========================================================
   DELETE SPONSOR
   ========================================================= */

async function deleteSponsor(
    id
) {
    const sponsor =
        sponsors.find(
            item =>
                item.id === id
        );

    if (!sponsor) {
        return;
    }

    const confirmed =
        window.confirm(
            `Hapus sponsor "${sponsor.name}"?\n\nData sponsor dan relasi project akan dihapus dari database.`
        );

    if (!confirmed) {
        return;
    }

    setLoading(
        true,
        "Menghapus sponsor..."
    );

    try {

        /* =================================================
           FIND PROJECTS
           ================================================= */

        const {
            data: projects,
            error: projectError
        } = await db
            .from(
                "sponsor_projects"
            )
            .select("id")
            .eq(
                "company_id",
                id
            );

        if (projectError) {
            throw projectError;
        }

        const projectIds =
            (projects || [])
                .map(
                    project =>
                        project.id
                );


        /* =================================================
           DELETE OBJECTIVE RELATIONS
           ================================================= */

        if (projectIds.length) {

            const {
                error:
                    objectiveError
            } = await db
                .from(
                    "sponsor_project_objectives"
                )
                .delete()
                .in(
                    "sponsor_project_id",
                    projectIds
                );

            if (objectiveError) {
                throw objectiveError;
            }


            /* =============================================
               DELETE PROJECTS
               ============================================= */

            const {
                error:
                    projectDeleteError
            } = await db
                .from(
                    "sponsor_projects"
                )
                .delete()
                .in(
                    "id",
                    projectIds
                );

            if (projectDeleteError) {
                throw projectDeleteError;
            }
        }


        /* =================================================
           DELETE COMPANY
           ================================================= */

        const {
            error
        } = await db
            .from("companies")
            .delete()
            .eq(
                "id",
                id
            );

        if (error) {
            throw error;
        }


        /* =================================================
           ACTIVITY
           ================================================= */

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
            error?.message ||
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
    if (!currentUser) {
        return;
    }

    try {

        const {
            error
        } = await db
            .from("activities")
            .insert({
                company_id:
                    companyId,

                user_id:
                    currentUser.id,

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

    } catch (error) {
        console.error(
            "Activity exception:",
            error
        );
    }
}


/* =========================================================
   LOAD ACTIVITIES
   ========================================================= */

async function loadActivities() {
    const container =
        $("activityList");

    if (!container) {
        return;
    }

    try {

        /*
         * JANGAN menggunakan:
         *
         * companies(name)
         *
         * karena database lu sebelumnya
         * tidak punya FK relationship yang
         * dikenali PostgREST.
         *
         * Kita hanya mengambil activities.
         */

        const {
            data,
            error
        } = await db
            .from("activities")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(10);

        if (error) {
            throw error;
        }

        if (!data?.length) {

            container.innerHTML = `
                <div class="empty-activity">
                    Belum ada aktivitas.
                </div>
            `;

            return;
        }

        container.innerHTML =
            data
                .map(
                    activity => `
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
                    `
                )
                .join("");

    } catch (error) {

        console.error(
            "Activity error:",
            error
        );

        container.innerHTML = `
            <div class="empty-activity">
                Belum ada aktivitas.
            </div>
        `;
    }
}


/* =========================================================
   EVENT HANDLERS
   ========================================================= */

function setupEvents() {

    /* =====================================================
       LOGIN
       ===================================================== */

    $("loginForm")
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const email =
                    $("loginEmail")
                        ?.value
                        ?.trim() ||
                    "";

                const password =
                    $("loginPassword")
                        ?.value ||
                    "";

                if (
                    !email ||
                    !password
                ) {
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


    /* =====================================================
       LOGOUT
       ===================================================== */

    $("logoutButton")
        ?.addEventListener(
            "click",
            logout
        );


    /* =====================================================
       REFRESH
       ===================================================== */

    $("refreshButton")
        ?.addEventListener(
            "click",
            async () => {

                await loadObjectives();

                await loadSponsors();

                await loadActivities();

                showToast(
                    "Database diperbarui."
                );
            }
        );


    /* =====================================================
       ADD SPONSOR
       ===================================================== */

    $("addSponsorButton")
        ?.addEventListener(
            "click",
            () => {
                openSponsorModal();
            }
        );


    /* =====================================================
       SPONSOR FORM
       ===================================================== */

    $("sponsorForm")
        ?.addEventListener(
            "submit",
            saveSponsor
        );


    /* =====================================================
       SEARCH
       ===================================================== */

    $("searchInput")
        ?.addEventListener(
            "input",
            renderSponsors
        );


    /* =====================================================
       FILTER
       ===================================================== */

    $("statusFilter")
        ?.addEventListener(
            "change",
            renderSponsors
        );


    /* =====================================================
       TABLE ACTIONS
       ===================================================== */

    $("sponsorTableBody")
        ?.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );

                if (!button) {
                    return;
                }

                const id =
                    button.dataset.id;

                const sponsor =
                    sponsors.find(
                        item =>
                            item.id === id
                    );

                if (!sponsor) {
                    return;
                }

                const action =
                    button.dataset.action;


                if (
                    action === "view"
                ) {
                    openDetailModal(
                        sponsor
                    );
                }


                if (
                    action === "edit"
                ) {
                    openSponsorModal(
                        sponsor
                    );
                }


                if (
                    action === "delete"
                ) {
                    deleteSponsor(
                        id
                    );
                }
            }
        );


    /* =====================================================
       CLOSE SPONSOR MODAL
       ===================================================== */

    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    closeSponsorModal
                );
            }
        );


    /* =====================================================
       CLOSE DETAIL MODAL
       ===================================================== */

    document
        .querySelectorAll(
            "[data-close-detail]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    closeDetailModal
                );
            }
        );


    /* =====================================================
       EDIT FROM DETAIL
       ===================================================== */

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

                if (!sponsor) {
                    return;
                }

                closeDetailModal();

                openSponsorModal(
                    sponsor
                );
            }
        );


    /* =====================================================
       ESCAPE
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

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


    try {

        const {
            data,
            error
        } = await db.auth.getSession();

        if (error) {
            throw error;
        }

        const session =
            data?.session;


        /* =================================================
           BELUM LOGIN
           ================================================= */

        if (!session) {

            show($("loginScreen"));

            hide($("app"));

            return;
        }


        /* =================================================
           SUDAH LOGIN
           ================================================= */

        currentUser =
            session.user;


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

        try {
            await db.auth.signOut();
        } catch (signOutError) {
            console.error(
                "Sign out error:",
                signOutError
            );
        }

        currentUser = null;
        currentProfile = null;

        show($("loginScreen"));

        hide($("app"));

        showLoginError(
            error?.message ||
            "Gagal memuat akun."
        );

    } finally {

        setLoading(
            false
        );
    }
}


/* =========================================================
   AUTH LISTENER
   ========================================================= */

db.auth.onAuthStateChange(
    async (
        event,
        session
    ) => {

        console.log(
            "Auth event:",
            event
        );


        if (
            event ===
            "SIGNED_OUT"
        ) {

            currentUser = null;

            currentProfile = null;

            sponsors = [];

            objectives = [];

            hide($("app"));

            show($("loginScreen"));

            return;
        }


        if (
            event ===
                "SIGNED_IN" &&
            session?.user
        ) {

            currentUser =
                session.user;

            /*
             * initializeApp()
             * sudah menangani
             * initial session.
             *
             * Jangan reload seluruh app
             * di sini supaya tidak terjadi
             * duplicate request.
             */

            return;
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
