```javascript
/* =========================================================
   MECHANIVERSARY 52 — SPONSOR DATABASE
   Supabase Application Logic
   ========================================================= */

/* =========================================================
   1. SUPABASE CONFIG
   ========================================================= */

const SUPABASE_URL = "https://tjtilixseegqliuosgsc.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_PBP6LR26bD28r0bdT7EVFg_cekn47a7";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================================
   2. GLOBAL STATE
   ========================================================= */

let currentUser = null;
let currentProfile = null;

let companies = [];
let objectives = [];

let filteredCompanies = [];

let editingCompanyId = null;
let selectedCompanyId = null;


/* =========================================================
   3. DOM HELPERS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}

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

function setText(id, value) {
    const element = $(id);

    if (element) {
        element.textContent = value ?? "";
    }
}

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


/* =========================================================
   4. LOADING
   ========================================================= */

function showLoading(message = "Memuat...") {
    setText("loadingText", message);
    show($("loadingOverlay"));
}

function hideLoading() {
    hide($("loadingOverlay"));
}


/* =========================================================
   5. TOAST
   ========================================================= */

let toastTimeout = null;

function showToast(message, type = "success") {
    const toast = $("toast");

    if (!toast) {
        console.log(message);
        return;
    }

    toast.textContent = message;

    toast.classList.remove(
        "success",
        "error",
        "warning"
    );

    toast.classList.add(type);

    show(toast);

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        hide(toast);
    }, 3500);
}


/* =========================================================
   6. ERROR HANDLER
   ========================================================= */

function showFormError(id, message) {
    const element = $(id);

    if (!element) {
        console.error(message);
        return;
    }

    element.textContent = message;
    show(element);
}

function clearFormError(id) {
    const element = $(id);

    if (!element) {
        return;
    }

    element.textContent = "";
    hide(element);
}


/* =========================================================
   7. STATUS
   ========================================================= */

function statusLabel(status) {
    const labels = {
        PROSPECT: "Prospek",
        CONTACTED: "Sudah Dihubungi",
        NEGOTIATION: "Negosiasi",
        DEAL: "Deal",
        REJECTED: "Ditolak"
    };

    return labels[status] || status || "-";
}

function statusClass(status) {
    return String(status || "")
        .toLowerCase()
        .replaceAll("_", "-");
}


/* =========================================================
   8. INITIALIZATION
   ========================================================= */

async function initializeApp() {
    console.log("MECHANIVERSARY 52 Sponsor Database initialized.");

    try {
        showLoading("Memeriksa sesi...");

        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        if (session?.user) {
            currentUser = session.user;

            await loadUserProfile();

            showMainApp();
        } else {
            showLoginScreen();
        }

    } catch (error) {
        console.error("Initialization error:", error);

        showLoginScreen();

        showToast(
            "Gagal menghubungkan ke database.",
            "error"
        );
    } finally {
        hideLoading();
    }
}


/* =========================================================
   9. AUTH STATE LISTENER
   ========================================================= */

supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

        console.log("Auth event:", event);

        if (event === "SIGNED_IN" && session?.user) {

            currentUser = session.user;

            try {
                await loadUserProfile();
                showMainApp();
            } catch (error) {
                console.error(
                    "Auth profile loading error:",
                    error
                );
            }

        }

        if (event === "SIGNED_OUT") {

            currentUser = null;
            currentProfile = null;

            showLoginScreen();
        }
    }
);


/* =========================================================
   10. LOGIN
   ========================================================= */

async function login(email, password) {

    clearFormError("loginError");

    const loginButton = $("loginButton");

    if (loginButton) {
        loginButton.disabled = true;
        loginButton.textContent = "MEMPROSES...";
    }

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email: email.trim(),
            password
        });

        if (error) {
            throw error;
        }

        currentUser = data.user;

        await loadUserProfile();

        showMainApp();

        showToast(
            `Selamat datang, ${getDisplayName()}!`,
            "success"
        );

    } catch (error) {

        console.error("Login error:", error);

        let message = "Gagal login.";

        if (
            error.message?.toLowerCase().includes(
                "invalid login credentials"
            )
        ) {
            message =
                "Email atau password salah.";
        } else if (
            error.message?.toLowerCase().includes(
                "email not confirmed"
            )
        ) {
            message =
                "Email akun belum dikonfirmasi.";
        } else if (error.message) {
            message = error.message;
        }

        showFormError(
            "loginError",
            message
        );

    } finally {

        if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = "MASUK";
        }
    }
}


/* =========================================================
   11. LOGOUT
   ========================================================= */

async function logout() {

    try {

        showLoading("Keluar...");

        const {
            error
        } = await supabaseClient.auth.signOut();

        if (error) {
            throw error;
        }

        currentUser = null;
        currentProfile = null;

        companies = [];
        filteredCompanies = [];

        showLoginScreen();

    } catch (error) {

        console.error("Logout error:", error);

        showToast(
            "Gagal keluar dari akun.",
            "error"
        );

    } finally {
        hideLoading();
    }
}


/* =========================================================
   12. LOAD USER PROFILE
   ========================================================= */

async function loadUserProfile() {

    if (!currentUser) {
        throw new Error(
            "Tidak ada user yang sedang login."
        );
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

    if (error) {

        console.error(
            "Profile error:",
            error
        );

        throw error;
    }

    if (!data) {

        throw new Error(
            "Profile user tidak ditemukan."
        );
    }

    currentProfile = data;

    console.log(
        "Current profile:",
        currentProfile
    );
}


/* =========================================================
   13. ROLE
   ========================================================= */

function isAdmin() {
    return (
        currentProfile?.role?.toUpperCase() ===
        "ADMIN"
    );
}

function getDisplayName() {

    if (currentProfile?.full_name) {
        return currentProfile.full_name;
    }

    if (currentUser?.email) {
        return currentUser.email.split("@")[0];
    }

    return "User";
}


/* =========================================================
   14. SHOW LOGIN
   ========================================================= */

function showLoginScreen() {

    hide($("app"));
    show($("loginScreen"));

    clearFormError("loginError");

    const form = $("loginForm");

    if (form) {
        form.reset();
    }
}


/* =========================================================
   15. SHOW MAIN APP
   ========================================================= */

async function showMainApp() {

    hide($("loginScreen"));
    show($("app"));

    setText(
        "currentUserEmail",
        currentUser?.email || "-"
    );

    setText(
        "currentUserRole",
        currentProfile?.role || "USER"
    );

    updateDashboardForRole();

    await Promise.all([
        loadObjectives(),
        loadSponsors()
    ]);
}


/* =========================================================
   16. ROLE-BASED UI
   ========================================================= */

function updateDashboardForRole() {

    const role = currentProfile?.role || "USER";

    const description =
        isAdmin()
            ? "Kelola seluruh database dan monitoring sponsor."
            : "Kelola dan monitor data sponsor yang tersedia.";

    setText(
        "dashboardDescription",
        description
    );

    const roleBadge = $("currentUserRole");

    if (roleBadge) {

        roleBadge.textContent =
            role.toUpperCase();

        roleBadge.classList.remove(
            "admin",
            "user"
        );

        roleBadge.classList.add(
            role.toLowerCase()
        );
    }
}


/* =========================================================
   17. LOAD OBJECTIVES
   ========================================================= */

async function loadObjectives() {

    const {
        data,
        error
    } = await supabaseClient
        .from("objectives")
        .select("*")
        .order("name", {
            ascending: true
        });

    if (error) {

        console.error(
            "Objectives error:",
            error
        );

        /*
         * Form HTML tetap mempunyai objective default.
         * Jadi aplikasi tidak langsung crash jika
         * tabel objectives belum bisa dibaca.
         */
        objectives = [];

        return;
    }

    objectives = data || [];

    syncObjectiveLabels();
}


/* =========================================================
   18. OBJECTIVE LABEL SYNC
   ========================================================= */

function syncObjectiveLabels() {

    if (!objectives.length) {
        return;
    }

    const checkboxes =
        document.querySelectorAll(
            'input[name="objectives"]'
        );

    checkboxes.forEach((checkbox) => {

        const objective =
            objectives.find(
                item =>
                    item.slug === checkbox.value ||
                    item.name === checkbox.value
            );

        if (!objective) {
            return;
        }

        const strong =
            checkbox
                .closest(".objective-option")
                ?.querySelector("strong");

        const small =
            checkbox
                .closest(".objective-option")
                ?.querySelector("small");

        if (strong) {
            strong.textContent =
                objective.name;
        }

        if (
            small &&
            objective.description
        ) {
            small.textContent =
                objective.description;
        }

        checkbox.dataset.objectiveId =
            objective.id;
    });
}


/* =========================================================
   19. LOAD COMPANIES
   ========================================================= */

async function loadSponsors() {

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

        companies = data || [];

        filteredCompanies = [...companies];

        updateStatistics();

        renderCompanies();

    } catch (error) {

        console.error(
            "Load sponsors error:",
            error
        );

        companies = [];
        filteredCompanies = [];

        updateStatistics();
        renderCompanies();

        showToast(
            "Data sponsor tidak dapat dimuat.",
            "error"
        );
    }
}


/* =========================================================
   20. STATISTICS
   ========================================================= */

function updateStatistics() {

    const total = companies.length;

    const prospect =
        companies.filter(
            item => item.status === "PROSPECT"
        ).length;

    const negotiation =
        companies.filter(
            item => item.status === "NEGOTIATION"
        ).length;

    const deal =
        companies.filter(
            item => item.status === "DEAL"
        ).length;

    setText("statTotal", total);
    setText("statProspect", prospect);
    setText("statNegotiation", negotiation);
    setText("statDeal", deal);
}


/* =========================================================
   21. RENDER COMPANIES
   ========================================================= */

function renderCompanies() {

    const tbody =
        $("sponsorTableBody");

    if (!tbody) {
        return;
    }

    if (!filteredCompanies.length) {

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
                        Belum ada sponsor yang sesuai.
                    </span>
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML =
        filteredCompanies
            .map(company => {

                const objectivesText =
                    company.objectives_text ||
                    "-";

                return `
                    <tr data-company-id="${escapeHTML(company.id)}">

                        <td>
                            <div class="company-cell">
                                <strong>
                                    ${escapeHTML(company.name)}
                                </strong>

                                ${
                                    company.category
                                        ? `
                                            <small>
                                                ${escapeHTML(
                                                    company.category
                                                )}
                                            </small>
                                        `
                                        : ""
                                }
                            </div>
                        </td>

                        <td>
                            ${
                                company.contact_name
                                    ? escapeHTML(
                                        company.contact_name
                                    )
                                    : "-"
                            }
                        </td>

                        <td>
                            ${
                                company.contact_email
                                    ? `
                                        <a
                                            href="mailto:${escapeHTML(
                                                company.contact_email
                                            )}"
                                        >
                                            ${escapeHTML(
                                                company.contact_email
                                            )}
                                        </a>
                                      `
                                    : "-"
                            }
                        </td>

                        <td>
                            <span
                                class="status-badge ${statusClass(
                                    company.status
                                )}"
                            >
                                ${escapeHTML(
                                    statusLabel(
                                        company.status
                                    )
                                )}
                            </span>
                        </td>

                        <td>
                            <div class="objective-tags">
                                ${renderObjectiveTags(
                                    company.objectives
                                )}
                            </div>
                        </td>

                        <td>
                            ${
                                company.assigned_to
                                    ? "Assigned"
                                    : "-"
                            }
                        </td>

                        <td>
                            <div class="table-actions">

                                <button
                                    type="button"
                                    class="table-action"
                                    onclick="viewSponsor('${escapeHTML(
                                        company.id
                                    )}')"
                                >
                                    LIHAT
                                </button>

                                <button
                                    type="button"
                                    class="table-action"
                                    onclick="editSponsor('${escapeHTML(
                                        company.id
                                    )}')"
                                >
                                    EDIT
                                </button>

                                ${
                                    isAdmin()
                                        ? `
                                            <button
                                                type="button"
                                                class="table-action danger"
                                                onclick="deleteSponsor('${escapeHTML(
                                                    company.id
                                                )}')"
                                            >
                                                HAPUS
                                            </button>
                                          `
                                        : ""
                                }

                            </div>
                        </td>

                    </tr>
                `;
            })
            .join("");
}


/* =========================================================
   22. OBJECTIVE TAGS
   ========================================================= */

function renderObjectiveTags(companyObjectives) {

    if (!companyObjectives) {
        return "-";
    }

    let list = [];

    if (Array.isArray(companyObjectives)) {
        list = companyObjectives;
    }

    if (typeof companyObjectives === "string") {

        try {
            list = JSON.parse(
                companyObjectives
            );
        } catch {
            list = companyObjectives
                .split(",")
                .map(item => item.trim());
        }
    }

    if (!list.length) {
        return "-";
    }

    return list
        .map(item => {

            const name =
                typeof item === "object"
                    ? item.name || item.slug
                    : item;

            return `
                <span class="objective-tag">
                    ${escapeHTML(name)}
                </span>
            `;
        })
        .join("");
}


/* =========================================================
   23. LOAD COMPANY OBJECTIVES
   ========================================================= */

async function loadCompanyObjectives(
    companyId
) {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("sponsor_projects")
            .select(`
                id,
                title,
                sponsor_project_objectives (
                    objective_id,
                    objectives (
                        id,
                        name,
                        slug,
                        description
                    )
                )
            `)
            .eq("company_id", companyId);

        if (error) {
            throw error;
        }

        const project =
            data?.[0];

        if (!project) {
            return [];
        }

        return (
            project
                .sponsor_project_objectives
                ?.map(
                    relation =>
                        relation.objectives
                )
                .filter(Boolean) || []
        );

    } catch (error) {

        console.error(
            "Load company objectives error:",
            error
        );

        return [];
    }
}


/* =========================================================
   24. ENRICH COMPANIES WITH OBJECTIVES
   ========================================================= */

async function enrichCompaniesWithObjectives() {

    if (!companies.length) {
        return;
    }

    const enriched =
        await Promise.all(
            companies.map(
                async company => {

                    const companyObjectives =
                        await loadCompanyObjectives(
                            company.id
                        );

                    return {
                        ...company,
                        objectives:
                            companyObjectives,
                        objectives_text:
                            companyObjectives
                                .map(
                                    item =>
                                        item.name
                                )
                                .join(", ")
                    };
                }
            )
        );

    companies = enriched;

    applyFilters();
}


/* =========================================================
   25. SEARCH + FILTER
   ========================================================= */

function applyFilters() {

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

    filteredCompanies =
        companies.filter(company => {

            const matchesSearch =
                !search ||
                [
                    company.name,
                    company.category,
                    company.contact_name,
                    company.contact_position,
                    company.contact_email,
                    company.contact_phone
                ]
                    .filter(Boolean)
                    .some(value =>
                        String(value)
                            .toLowerCase()
                            .includes(search)
                    );

            const matchesStatus =
                status === "ALL" ||
                company.status === status;

            return (
                matchesSearch &&
                matchesStatus
            );
        });

    renderCompanies();
}


/* =========================================================
   26. OPEN ADD MODAL
   ========================================================= */

function openAddSponsorModal() {

    editingCompanyId = null;

    setText(
        "sponsorModalTitle",
        "TAMBAH SPONSOR"
    );

    const form =
        $("sponsorForm");

    if (form) {
        form.reset();
    }

    $("sponsorId").value = "";

    clearFormError(
        "sponsorFormError"
    );

    clearObjectives();

    openModal(
        "sponsorModal"
    );
}


/* =========================================================
   27. OPEN EDIT MODAL
   ========================================================= */

async function editSponsor(companyId) {

    const company =
        companies.find(
            item => item.id === companyId
        );

    if (!company) {
        showToast(
            "Data sponsor tidak ditemukan.",
            "error"
        );

        return;
    }

    editingCompanyId =
        companyId;

    setText(
        "sponsorModalTitle",
        "EDIT SPONSOR"
    );

    clearFormError(
        "sponsorFormError"
    );

    setFormValue(
        "sponsorId",
        company.id
    );

    setFormValue(
        "companyName",
        company.name
    );

    setFormValue(
        "contactName",
        company.contact_name
    );

    setFormValue(
        "contactEmail",
        company.contact_email
    );

    setFormValue(
        "contactPhone",
        company.contact_phone
    );

    setFormValue(
        "sponsorStatus",
        company.status || "PROSPECT"
    );

    setFormValue(
        "internalPic",
        ""
    );

    setFormValue(
        "sponsorNotes",
        company.description
    );

    clearObjectives();

    const selectedObjectives =
        await loadCompanyObjectives(
            company.id
        );

    selectedObjectives.forEach(
        objective => {

            const checkbox =
                document.querySelector(
                    `input[name="objectives"][value="${CSS.escape(
                        objective.slug
                    )}"]`
                );

            if (checkbox) {
                checkbox.checked = true;
            }
        }
    );

    openModal(
        "sponsorModal"
    );
}


/* =========================================================
   28. FORM VALUE HELPER
   ========================================================= */

function setFormValue(
    id,
    value
) {

    const element = $(id);

    if (element) {
        element.value =
            value ?? "";
    }
}


/* =========================================================
   29. CLEAR OBJECTIVES
   ========================================================= */

function clearObjectives() {

    document
        .querySelectorAll(
            'input[name="objectives"]'
        )
        .forEach(
            checkbox =>
                checkbox.checked = false
        );
}


/* =========================================================
   30. GET SELECTED OBJECTIVES
   ========================================================= */

function getSelectedObjectives() {

    const selected =
        Array.from(
            document.querySelectorAll(
                'input[name="objectives"]:checked'
            )
        );

    return selected.map(
        checkbox => {

            const objective =
                objectives.find(
                    item =>
                        item.slug ===
                        checkbox.value
                );

            return {
                checkbox,
                id:
                    objective?.id ||
                    checkbox.dataset.objectiveId ||
                    null,
                slug:
                    objective?.slug ||
                    checkbox.value,
                name:
                    objective?.name ||
                    checkbox
                        .closest(
                            ".objective-option"
                        )
                        ?.querySelector(
                            "strong"
                        )
                        ?.textContent ||
                    checkbox.value
            };
        }
    );
}


/* =========================================================
   31. SAVE SPONSOR
   ========================================================= */

async function saveSponsor(
    event
) {

    event.preventDefault();

    clearFormError(
        "sponsorFormError"
    );

    const companyName =
        $("companyName")?.value.trim();

    const contactName =
        $("contactName")?.value.trim();

    const contactEmail =
        $("contactEmail")?.value.trim();

    const contactPhone =
        $("contactPhone")?.value.trim();

    const status =
        $("sponsorStatus")?.value ||
        "PROSPECT";

    const notes =
        $("sponsorNotes")?.value.trim();

    const selectedObjectives =
        getSelectedObjectives();

    if (!companyName) {

        showFormError(
            "sponsorFormError",
            "Nama perusahaan wajib diisi."
        );

        return;
    }

    if (!contactName) {

        showFormError(
            "sponsorFormError",
            "Nama kontak wajib diisi."
        );

        return;
    }

    if (!contactEmail) {

        showFormError(
            "sponsorFormError",
            "Email kontak wajib diisi."
        );

        return;
    }

    if (!selectedObjectives.length) {

        showFormError(
            "sponsorFormError",
            "Pilih minimal satu sponsor objective."
        );

        return;
    }

    const saveButton =
        $("saveSponsorButton");

    if (saveButton) {

        saveButton.disabled = true;

        saveButton.textContent =
            editingCompanyId
                ? "MENYIMPAN..."
                : "MENAMBAHKAN...";
    }

    try {

        showLoading(
            editingCompanyId
                ? "Menyimpan perubahan..."
                : "Menambahkan sponsor..."
        );


        /* =================================================
           A. COMPANY
        ================================================= */

        let companyId =
            editingCompanyId;


        if (editingCompanyId) {

            const {
                error
            } = await supabaseClient
                .from("companies")
                .update({
                    name:
                        companyName,

                    contact_name:
                        contactName,

                    contact_email:
                        contactEmail,

                    contact_phone:
                        contactPhone,

                    status:
                        status,

                    description:
                        notes || null,

                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    "id",
                    editingCompanyId
                );

            if (error) {
                throw error;
            }

        } else {

            const {
                data,
                error
            } = await supabaseClient
                .from("companies")
                .insert({
                    name:
                        companyName,

                    contact_name:
                        contactName,

                    contact_email:
                        contactEmail,

                    contact_phone:
                        contactPhone,

                    status:
                        status,

                    description:
                        notes || null
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            companyId =
                data.id;
        }


        /* =================================================
           B. SPONSOR PROJECT
        ================================================= */

        let projectId = null;


        const {
            data: existingProjects,
            error: existingProjectError
        } = await supabaseClient
            .from("sponsor_projects")
            .select("id")
            .eq(
                "company_id",
                companyId
            )
            .limit(1);

        if (existingProjectError) {

            console.warn(
                "Project lookup warning:",
                existingProjectError
            );

        } else if (
            existingProjects?.length
        ) {

            projectId =
                existingProjects[0].id;
        }


        if (projectId) {

            const {
                error
            } = await supabaseClient
                .from("sponsor_projects")
                .update({
                    status:
                        status,

                    notes:
                        notes || null,

                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    "id",
                    projectId
                );

            if (error) {
                throw error;
            }

        } else {

            const {
                data,
                error
            } = await supabaseClient
                .from("sponsor_projects")
                .insert({
                    company_id:
                        companyId,

                    owner_id:
                        currentUser.id,

                    title:
                        companyName,

                    status:
                        status,

                    progress:
                        status === "DEAL"
                            ? 100
                            : 0,

                    notes:
                        notes || null
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            projectId =
                data.id;
        }


        /* =================================================
           C. OBJECTIVE RELATION
        ================================================= */

        if (projectId) {

            /*
             * Ambil relasi lama
             */

            const {
                error:
                    deleteRelationError
            } = await supabaseClient
                .from(
                    "sponsor_project_objectives"
                )
                .delete()
                .eq(
                    "sponsor_project_id",
                    projectId
                );

            if (deleteRelationError) {
                throw deleteRelationError;
            }


            /*
             * Insert semua objective yang dipilih.
             *
             * Satu sponsor bisa punya:
             *
             * Brand Awareness
             * + Product Promotion
             * + Event Activation
             * + Partnership
             *
             * sekaligus.
             */

            const relations =
                selectedObjectives
                    .filter(
                        item => item.id
                    )
                    .map(
                        item => ({
                            sponsor_project_id:
                                projectId,

                            objective_id:
                                item.id
                        })
                    );

            if (relations.length) {

                const {
                    error
                } = await supabaseClient
                    .from(
                        "sponsor_project_objectives"
                    )
                    .insert(
                        relations
                    );

                if (error) {
                    throw error;
                }
            }
        }


        /* =================================================
           D. ACTIVITY
        ================================================= */

        /*
         * Activity dibuat best-effort.
         * Kalau enum/activity policy belum siap,
         * data sponsor tetap dianggap berhasil.
         */

        try {

            await supabaseClient
                .from("activities")
                .insert({
                    company_id:
                        companyId,

                    user_id:
                        currentUser.id,

                    description:
                        editingCompanyId
                            ? `Memperbarui data sponsor ${companyName}.`
                            : `Menambahkan sponsor ${companyName}.`
                });

        } catch (activityError) {

            console.warn(
                "Activity log skipped:",
                activityError
            );
        }


        /* =================================================
           E. FINISH
        ================================================= */

        closeModal(
            "sponsorModal"
        );

        showToast(
            editingCompanyId
                ? "Data sponsor berhasil diperbarui."
                : "Sponsor berhasil ditambahkan.",
            "success"
        );

        editingCompanyId =
            null;

        await loadSponsors();


    } catch (error) {

        console.error(
            "Save sponsor error:",
            error
        );

        showFormError(
            "sponsorFormError",
            getReadableDatabaseError(
                error
            )
        );

    } finally {

        hideLoading();

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "SIMPAN SPONSOR";
        }
    }
}


/* =========================================================
   32. READABLE DATABASE ERROR
   ========================================================= */

function getReadableDatabaseError(
    error
) {

    if (!error) {
        return "Terjadi kesalahan.";
    }

    if (
        error.code === "42501"
    ) {
        return (
            "Akun ini belum memiliki izin untuk melakukan tindakan tersebut."
        );
    }

    if (
        error.code === "23505"
    ) {
        return (
            "Data tersebut sudah ada di database."
        );
    }

    if (
        error.code === "23503"
    ) {
        return (
            "Data memiliki hubungan yang belum valid."
        );
    }

    return (
        error.message ||
        "Terjadi kesalahan pada database."
    );
}


/* =========================================================
   33. VIEW SPONSOR
   ========================================================= */

async function viewSponsor(
    companyId
) {

    const company =
        companies.find(
            item => item.id === companyId
        );

    if (!company) {
        return;
    }

    selectedCompanyId =
        companyId;

    const detailContent =
        $("detailContent");

    if (!detailContent) {
        return;
    }

    detailContent.innerHTML = `
        <div class="detail-grid">

            <div class="detail-item">
                <span>PERUSAHAAN</span>
                <strong>
                    ${escapeHTML(
                        company.name
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <span>KATEGORI</span>
                <strong>
                    ${escapeHTML(
                        company.category ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <span>NAMA KONTAK</span>
                <strong>
                    ${escapeHTML(
                        company.contact_name ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <span>JABATAN</span>
                <strong>
                    ${escapeHTML(
                        company.contact_position ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <span>EMAIL</span>
                <strong>
                    ${
                        company.contact_email
                            ? `
                                <a
                                    href="mailto:${escapeHTML(
                                        company.contact_email
                                    )}"
                                >
                                    ${escapeHTML(
                                        company.contact_email
                                    )}
                                </a>
                              `
                            : "-"
                    }
                </strong>
            </div>

            <div class="detail-item">
                <span>TELEPON</span>
                <strong>
                    ${escapeHTML(
                        company.contact_phone ||
                        "-"
                    )}
                </strong>
            </div>

            <div class="detail-item">
                <span>STATUS</span>
                <strong>
                    <span
                        class="status-badge ${statusClass(
                            company.status
                        )}"
                    >
                        ${escapeHTML(
                            statusLabel(
                                company.status
                            )
                        )}
                    </span>
                </strong>
            </div>

            <div class="detail-item">
                <span>WEBSITE</span>
                <strong>
                    ${
                        company.website
                            ? `
                                <a
                                    href="${escapeHTML(
                                        normalizeURL(
                                            company.website
                                        )
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Buka Website
                                </a>
                              `
                            : "-"
                    }
                </strong>
            </div>

            <div class="detail-item">
                <span>INSTAGRAM</span>
                <strong>
                    ${
                        company.instagram
                            ? `
                                <a
                                    href="${escapeHTML(
                                        normalizeInstagram(
                                            company.instagram
                                        )
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    ${escapeHTML(
                                        company.instagram
                                    )}
                                </a>
                              `
                            : "-"
                    }
                </strong>
            </div>

            <div class="detail-item detail-full">
                <span>OBJECTIVE</span>

                <div
                    id="detailObjectives"
                    class="objective-tags"
                >
                    Memuat...
                </div>
            </div>

            <div class="detail-item detail-full">
                <span>CATATAN</span>

                <p>
                    ${escapeHTML(
                        company.description ||
                        "Tidak ada catatan."
                    )}
                </p>
            </div>

        </div>
    `;

    openModal(
        "detailModal"
    );

    const detailObjectives =
        $("detailObjectives");

    const companyObjectives =
        await loadCompanyObjectives(
            companyId
        );

    if (detailObjectives) {

        if (!companyObjectives.length) {

            detailObjectives.textContent =
                "Belum ada objective.";

        } else {

            detailObjectives.innerHTML =
                companyObjectives
                    .map(
                        objective => `
                            <span class="objective-tag">
                                ${escapeHTML(
                                    objective.name
                                )}
                            </span>
                        `
                    )
                    .join("");
        }
    }
}


/* =========================================================
   34. URL HELPERS
   ========================================================= */

function normalizeURL(
    url
) {

    if (!url) {
        return "#";
    }

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    return `https://${url}`;
}

function normalizeInstagram(
    value
) {

    if (!value) {
        return "#";
    }

    if (
        value.startsWith("http://") ||
        value.startsWith("https://")
    ) {
        return value;
    }

    const username =
        value
            .replace("@", "")
            .trim();

    return `https://instagram.com/${username}`;
}


/* =========================================================
   35. DELETE SPONSOR
   ========================================================= */

async function deleteSponsor(
    companyId
) {

    if (!isAdmin()) {

        showToast(
            "Hanya admin yang dapat menghapus sponsor.",
            "warning"
        );

        return;
    }

    const company =
        companies.find(
            item => item.id === companyId
        );

    if (!company) {
        return;
    }

    const confirmed =
        window.confirm(
            `Hapus sponsor "${company.name}"?\n\nData sponsor akan dihapus dari database.`
        );

    if (!confirmed) {
        return;
    }

    try {

        showLoading(
            "Menghapus sponsor..."
        );


        /*
         * Ambil project terlebih dahulu
         */

        const {
            data: projects
        } = await supabaseClient
            .from("sponsor_projects")
            .select("id")
            .eq(
                "company_id",
                companyId
            );


        /*
         * Hapus relasi objective
         */

        if (projects?.length) {

            const projectIds =
                projects.map(
                    item => item.id
                );

            await supabaseClient
                .from(
                    "sponsor_project_objectives"
                )
                .delete()
                .in(
                    "sponsor_project_id",
                    projectIds
                );

            await supabaseClient
                .from(
                    "sponsor_projects"
                )
                .delete()
                .in(
                    "id",
                    projectIds
                );
        }


        /*
         * Hapus company
         */

        const {
            error
        } = await supabaseClient
            .from("companies")
            .delete()
            .eq(
                "id",
                companyId
            );

        if (error) {
            throw error;
        }

        showToast(
            "Sponsor berhasil dihapus.",
            "success"
        );

        await loadSponsors();

    } catch (error) {

        console.error(
            "Delete sponsor error:",
            error
        );

        showToast(
            getReadableDatabaseError(
                error
            ),
            "error"
        );

    } finally {

        hideLoading();
    }
}


/* =========================================================
   36. MODAL
   ========================================================= */

function openModal(
    id
) {

    const modal = $(id);

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

function closeModal(
    id
) {

    const modal = $(id);

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

    document.body.classList.remove(
        "modal-open"
    );
}


/* =========================================================
   37. REFRESH
   ========================================================= */

async function refreshData() {

    try {

        showLoading(
            "Memperbarui database..."
        );

        await loadObjectives();
        await loadSponsors();

        showToast(
            "Database diperbarui.",
            "success"
        );

    } catch (error) {

        console.error(
            "Refresh error:",
            error
        );

        showToast(
            "Gagal memperbarui database.",
            "error"
        );

    } finally {

        hideLoading();
    }
}


/* =========================================================
   38. EVENT LISTENERS
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =============================================
           LOGIN
        ============================================== */

        const loginForm =
            $("loginForm");

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                event => {

                    event.preventDefault();

                    const email =
                        $("loginEmail")
                            ?.value
                            .trim();

                    const password =
                        $("loginPassword")
                            ?.value;

                    if (!email || !password) {

                        showFormError(
                            "loginError",
                            "Email dan password wajib diisi."
                        );

                        return;
                    }

                    login(
                        email,
                        password
                    );
                }
            );
        }


        /* =============================================
           LOGOUT
        ============================================== */

        const logoutButton =
            $("logoutButton");

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logout
            );
        }


        /* =============================================
           ADD SPONSOR
        ============================================== */

        const addButton =
            $("addSponsorButton");

        if (addButton) {

            addButton.addEventListener(
                "click",
                openAddSponsorModal
            );
        }


        /* =============================================
           SPONSOR FORM
        ============================================== */

        const sponsorForm =
            $("sponsorForm");

        if (sponsorForm) {

            sponsorForm.addEventListener(
                "submit",
                saveSponsor
            );
        }


        /* =============================================
           SEARCH
        ============================================== */

        const searchInput =
            $("searchInput");

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                applyFilters
            );
        }


        /* =============================================
           STATUS FILTER
        ============================================== */

        const statusFilter =
            $("statusFilter");

        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                applyFilters
            );
        }


        /* =============================================
           REFRESH
        ============================================== */

        const refreshButton =
            $("refreshButton");

        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                refreshData
            );
        }


        /* =============================================
           CLOSE SPONSOR MODAL
        ============================================== */

        document
            .querySelectorAll(
                "[data-close-modal]"
            )
            .forEach(
                element => {

                    element.addEventListener(
                        "click",
                        () =>
                            closeModal(
                                "sponsorModal"
                            )
                    );
                }
            );


        /* =============================================
           CLOSE DETAIL MODAL
        ============================================== */

        document
            .querySelectorAll(
                "[data-close-detail]"
            )
            .forEach(
                element => {

                    element.addEventListener(
                        "click",
                        () =>
                            closeModal(
                                "detailModal"
                            )
                    );
                }
            );


        /* =============================================
           EDIT FROM DETAIL
        ============================================== */

        const editFromDetail =
            $("editSponsorFromDetail");

        if (editFromDetail) {

            editFromDetail.addEventListener(
                "click",
                () => {

                    closeModal(
                        "detailModal"
                    );

                    if (selectedCompanyId) {

                        editSponsor(
                            selectedCompanyId
                        );
                    }
                }
            );
        }


        /* =============================================
           ESCAPE
        ============================================== */

        document.addEventListener(
            "keydown",
            event => {

                if (event.key !== "Escape") {
                    return;
                }

                closeModal(
                    "sponsorModal"
                );

                closeModal(
                    "detailModal"
                );
            }
        );


        /* =============================================
           START APP
        ============================================== */

        initializeApp();
    }
);


/* =========================================================
   39. GLOBAL FUNCTIONS
   =========================================================
   
   Dibutuhkan karena tombol di tabel menggunakan
   onclick="..."
   ========================================================= */

window.viewSponsor =
    viewSponsor;

window.editSponsor =
    editSponsor;

window.deleteSponsor =
    deleteSponsor;

window.openAddSponsorModal =
    openAddSponsorModal;


/* =========================================================
   40. EXTRA GLOBAL ERROR HANDLING
   ========================================================= */

window.addEventListener(
    "error",
    event => {

        console.error(
            "Global JavaScript error:",
            event.error || event.message
        );
    }
);

window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Unhandled promise rejection:",
            event.reason
        );
    }
);
```
