/* =========================================================
   MECHANIVERSARY 52 — SPONSOR DATABASE
   script.js
   ========================================================= */

/* =========================================================
   1. SUPABASE CONFIG
   ========================================================= */

const SUPABASE_URL =
    "https://tjtilixseegqliuosgsc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_PBP6LR26bD28r0bdT7EVFg_cekn47a7";

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* =========================================================
   2. GLOBAL STATE
   ========================================================= */

let currentUser = null;
let currentProfile = null;

let sponsors = [];
let selectedSponsor = null;

let isEditing = false;


/* =========================================================
   3. DOM ELEMENTS
   ========================================================= */

// Screens
const loginScreen = document.getElementById("loginScreen");
const mainApp = document.getElementById("mainApp");

// Login
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

// Header
const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const logoutBtn = document.getElementById("logoutBtn");

// Dashboard
const refreshBtn = document.getElementById("refreshBtn");
const addSponsorBtn = document.getElementById("addSponsorBtn");

// Stats
const totalSponsors = document.getElementById("totalSponsors");
const prospectSponsors = document.getElementById("prospectSponsors");
const ongoingSponsors = document.getElementById("ongoingSponsors");
const dealSponsors = document.getElementById("dealSponsors");

// Database
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const sponsorTableBody = document.getElementById(
    "sponsorTableBody"
);

// Activity
const activityList = document.getElementById(
    "activityList"
);

// Sponsor Modal
const sponsorModal = document.getElementById(
    "sponsorModal"
);

const modalTitle = document.getElementById(
    "modalTitle"
);

const closeModalBtn = document.getElementById(
    "closeModalBtn"
);

const cancelModalBtn = document.getElementById(
    "cancelModalBtn"
);

const sponsorForm = document.getElementById(
    "sponsorForm"
);

const sponsorId = document.getElementById(
    "sponsorId"
);

const companyName = document.getElementById(
    "companyName"
);

const contactName = document.getElementById(
    "contactName"
);

const contactEmail = document.getElementById(
    "contactEmail"
);

const contactPhone = document.getElementById(
    "contactPhone"
);

const sponsorStatus = document.getElementById(
    "sponsorStatus"
);

const industry = document.getElementById(
    "industry"
);

const priority = document.getElementById(
    "priority"
);

const notes = document.getElementById(
    "notes"
);

const objectiveError = document.getElementById(
    "objectiveError"
);

const sponsorFormError = document.getElementById(
    "sponsorFormError"
);

const saveSponsorBtn = document.getElementById(
    "saveSponsorBtn"
);


// Detail Modal
const detailModal = document.getElementById(
    "detailModal"
);

const closeDetailBtn = document.getElementById(
    "closeDetailBtn"
);

const detailCompanyName = document.getElementById(
    "detailCompanyName"
);

const detailContact = document.getElementById(
    "detailContact"
);

const detailEmail = document.getElementById(
    "detailEmail"
);

const detailPhone = document.getElementById(
    "detailPhone"
);

const detailIndustry = document.getElementById(
    "detailIndustry"
);

const detailStatus = document.getElementById(
    "detailStatus"
);

const detailObjectives = document.getElementById(
    "detailObjectives"
);

const detailNotes = document.getElementById(
    "detailNotes"
);

const editSponsorBtn = document.getElementById(
    "editSponsorBtn"
);

const deleteSponsorBtn = document.getElementById(
    "deleteSponsorBtn"
);


// Toast
const toast = document.getElementById("toast");
const toastMessage = document.getElementById(
    "toastMessage"
);


// Loading
const loadingOverlay = document.getElementById(
    "loadingOverlay"
);

const loadingText = document.getElementById(
    "loadingText"
);


/* =========================================================
   4. CONSTANTS
   ========================================================= */

const STATUS_LABELS = {
    PROSPECT: "Prospect",
    CONTACTED: "Contacted",
    NEGOTIATION: "Negotiation",
    DEAL: "Deal",
    REJECTED: "Rejected"
};

const OBJECTIVE_LABELS = {
    BRAND_AWARENESS: "Brand Awareness",
    MARKET_ACCESS: "Market Access",
    PRODUCT_TRIAL: "Product Trial",
    CONTENT: "Content & UGC",
    PRODUCT_FEEDBACK: "Product Feedback",
    BRAND_LEGACY: "Brand Legacy"
};

const INDUSTRY_LABELS = {
    AUTOMOTIVE: "Automotive",
    BANKING: "Banking / Finance",
    FMCG: "FMCG",
    FOOD_BEVERAGE: "Food & Beverage",
    TECHNOLOGY: "Technology",
    FASHION: "Fashion",
    EDUCATION: "Education",
    OTHER: "Other"
};


/* =========================================================
   5. INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


async function initializeApp() {

    setLoading(
        true,
        "Menghubungkan ke database..."
    );

    try {

        const {
            data: {
                session
            }
        } = await db.auth.getSession();

        if (session) {

            currentUser = session.user;

            await loadUserProfile();

            await showMainApp();

        } else {

            showLoginScreen();

        }

    } catch (error) {

        console.error(
            "Initialization error:",
            error
        );

        showLoginScreen();

        showToast(
            "Gagal menghubungkan ke database.",
            "error"
        );

    } finally {

        setLoading(false);

    }
}


/* =========================================================
   6. AUTH STATE
   ========================================================= */

db.auth.onAuthStateChange(
    async (event, session) => {

        if (event === "SIGNED_IN" && session) {

            currentUser = session.user;

            await loadUserProfile();

            await showMainApp();

        }

        if (event === "SIGNED_OUT") {

            currentUser = null;
            currentProfile = null;
            sponsors = [];
            selectedSponsor = null;

            showLoginScreen();

        }

    }
);


/* =========================================================
   7. LOGIN
   ========================================================= */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        hideElement(loginError);

        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;

        if (!email || !password) {

            showError(
                loginError,
                "Email dan password wajib diisi."
            );

            return;

        }

        setButtonLoading(
            loginBtn,
            true,
            "Memproses..."
        );

        try {

            const {
                error
            } = await db.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            showError(
                loginError,
                getAuthErrorMessage(error)
            );

        } finally {

            setButtonLoading(
                loginBtn,
                false,
                "Masuk ke Database"
            );

        }

    }
);


/* =========================================================
   8. LOAD PROFILE
   ========================================================= */

async function loadUserProfile() {

    if (!currentUser) {
        return;
    }

    try {

        const {
            data,
            error
        } = await db
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();

        if (error) {
            throw error;
        }

        currentProfile = data;

        updateUserInterface();

    } catch (error) {

        console.error(
            "Profile error:",
            error
        );

        /*
         * Fallback.
         * User tetap bisa masuk tetapi role default USER.
         */

        currentProfile = {
            id: currentUser.id,
            role: "USER",
            name:
                currentUser.user_metadata?.full_name ||
                currentUser.email
        };

        updateUserInterface();

    }

}


/* =========================================================
   9. ROLE
   ========================================================= */

function getUserRole() {

    return (
        currentProfile?.role ||
        "USER"
    ).toUpperCase();

}


function isAdmin() {

    return getUserRole() === "ADMIN";

}


/* =========================================================
   10. UI ROLE
   ========================================================= */

function updateUserInterface() {

    const role = getUserRole();

    const displayName =
        currentProfile?.name ||
        currentProfile?.full_name ||
        currentUser?.user_metadata?.full_name ||
        currentUser?.email ||
        "User";

    userName.textContent = displayName;

    userRole.textContent = role;

    if (isAdmin()) {

        addSponsorBtn.classList.remove(
            "hidden"
        );

        activityList.parentElement?.classList
            .remove("hidden");

    } else {

        /*
         * User biasa tetap dapat melihat
         * database sesuai RLS.
         */

        addSponsorBtn.classList.remove(
            "hidden"
        );

    }

    logoutBtn.classList.remove(
        "hidden"
    );

}


/* =========================================================
   11. SHOW MAIN APP
   ========================================================= */

async function showMainApp() {

    hideElement(loginScreen);

    showElement(mainApp);

    updateUserInterface();

    await loadSponsors();

}


/* =========================================================
   12. SHOW LOGIN
   ========================================================= */

function showLoginScreen() {

    showElement(loginScreen);

    hideElement(mainApp);

    logoutBtn.classList.add(
        "hidden"
    );

}


/* =========================================================
   13. LOGOUT
   ========================================================= */

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            setLoading(
                true,
                "Keluar..."
            );

            const {
                error
            } = await db.auth.signOut();

            if (error) {
                throw error;
            }

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            showToast(
                "Gagal keluar.",
                "error"
            );

        } finally {

            setLoading(false);

        }

    }
);


/* =========================================================
   14. LOAD SPONSORS
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

        renderSponsors();

        updateStatistics();

        await loadActivity();

    } catch (error) {

        console.error(
            "Load sponsors error:",
            error
        );

        showToast(
            "Database sponsor gagal dimuat.",
            "error"
        );

    } finally {

        setLoading(false);

    }

}


/* =========================================================
   15. RENDER SPONSORS
   ========================================================= */

function renderSponsors() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const status =
        statusFilter.value;

    let filtered =
        sponsors.filter(
            sponsor => {

                const matchesSearch =
                    !search ||
                    String(
                        sponsor.company_name || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        sponsor.contact_name || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        sponsor.email || ""
                    )
                        .toLowerCase()
                        .includes(search);

                const matchesStatus =
                    !status ||
                    sponsor.status === status;

                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );

    sponsorTableBody.innerHTML = "";

    if (!filtered.length) {

        sponsorTableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <strong>
                            Tidak ada sponsor ditemukan
                        </strong>

                        <span>
                            Coba ubah kata pencarian
                            atau filter.
                        </span>
                    </div>
                </td>
            </tr>
        `;

        return;

    }

    filtered.forEach(
        sponsor => {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>
                    <button
                        class="company-link"
                        type="button"
                        data-action="detail"
                        data-id="${escapeHTML(
                            sponsor.id
                        )}"
                    >
                        ${escapeHTML(
                            sponsor.company_name ||
                            "—"
                        )}
                    </button>
                </td>

                <td>
                    ${escapeHTML(
                        sponsor.contact_name ||
                        "—"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        sponsor.email ||
                        "—"
                    )}
                </td>

                <td>
                    <div class="table-objectives">
                        ${renderObjectiveTags(
                            normalizeObjectives(
                                sponsor.objectives
                            )
                        )}
                    </div>
                </td>

                <td>
                    <span
                        class="status-badge status-${String(
                            sponsor.status ||
                            "PROSPECT"
                        ).toLowerCase()}"
                    >
                        ${escapeHTML(
                            STATUS_LABELS[
                                sponsor.status
                            ] ||
                            sponsor.status ||
                            "Prospect"
                        )}
                    </span>
                </td>

                <td>
                    ${escapeHTML(
                        sponsor.owner_name ||
                        "—"
                    )}
                </td>

                <td>
                    <button
                        class="table-action"
                        type="button"
                        data-action="detail"
                        data-id="${escapeHTML(
                            sponsor.id
                        )}"
                    >
                        Lihat
                    </button>
                </td>
            `;

            sponsorTableBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   16. TABLE ACTION
   ========================================================= */

sponsorTableBody.addEventListener(
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

        const action =
            button.dataset.action;

        if (action === "detail") {

            openDetailModal(id);

        }

    }
);


/* =========================================================
   17. SEARCH & FILTER
   ========================================================= */

searchInput.addEventListener(
    "input",
    renderSponsors
);

statusFilter.addEventListener(
    "change",
    renderSponsors
);

refreshBtn.addEventListener(
    "click",
    loadSponsors
);


/* =========================================================
   18. STATISTICS
   ========================================================= */

function updateStatistics() {

    const total =
        sponsors.length;

    const prospect =
        sponsors.filter(
            sponsor =>
                sponsor.status === "PROSPECT"
        ).length;

    const ongoing =
        sponsors.filter(
            sponsor =>
                [
                    "CONTACTED",
                    "NEGOTIATION"
                ].includes(
                    sponsor.status
                )
        ).length;

    const deal =
        sponsors.filter(
            sponsor =>
                sponsor.status === "DEAL"
        ).length;

    totalSponsors.textContent =
        total;

    prospectSponsors.textContent =
        prospect;

    ongoingSponsors.textContent =
        ongoing;

    dealSponsors.textContent =
        deal;

}


/* =========================================================
   19. ADD SPONSOR
   ========================================================= */

addSponsorBtn.addEventListener(
    "click",
    () => {

        resetSponsorForm();

        isEditing = false;

        modalTitle.textContent =
            "Tambah Sponsor";

        saveSponsorBtn.textContent =
            "Simpan Sponsor";

        showModal(
            sponsorModal
        );

    }
);


/* =========================================================
   20. SPONSOR FORM SUBMIT
   ========================================================= */

sponsorForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        hideElement(
            sponsorFormError
        );

        hideElement(
            objectiveError
        );

        const objectives =
            getSelectedObjectives();

        if (!objectives.length) {

            showError(
                objectiveError,
                "Pilih minimal satu objective."
            );

            return;

        }

        const payload = {

            company_name:
                companyName.value.trim(),

            contact_name:
                contactName.value.trim(),

            email:
                contactEmail.value.trim(),

            phone:
                contactPhone.value.trim() ||
                null,

            status:
                sponsorStatus.value,

            objectives,

            industry:
                industry.value ||
                null,

            priority:
                priority.value ||
                "MEDIUM",

            notes:
                notes.value.trim() ||
                null

        };


        if (
            !payload.company_name ||
            !payload.contact_name ||
            !payload.email
        ) {

            showError(
                sponsorFormError,
                "Lengkapi data perusahaan, contact, dan email."
            );

            return;

        }


        setButtonLoading(
            saveSponsorBtn,
            true,
            isEditing
                ? "Menyimpan..."
                : "Menambahkan..."
        );


        try {

            if (isEditing) {

                await updateSponsor(
                    sponsorId.value,
                    payload
                );

            } else {

                await createSponsor(
                    payload
                );

            }

        } catch (error) {

            console.error(
                "Sponsor save error:",
                error
            );

            showError(
                sponsorFormError,
                getDatabaseErrorMessage(
                    error
                )
            );

        } finally {

            setButtonLoading(
                saveSponsorBtn,
                false,
                isEditing
                    ? "Simpan Perubahan"
                    : "Simpan Sponsor"
            );

        }

    }
);


/* =========================================================
   21. CREATE SPONSOR
   ========================================================= */

async function createSponsor(
    payload
) {

    const ownerName =
        currentProfile?.name ||
        currentProfile?.full_name ||
        currentUser?.email ||
        "Unknown";

    const finalPayload = {

        ...payload,

        owner_id:
            currentUser?.id ||
            null,

        owner_name:
            ownerName

    };


    const {
        data,
        error
    } = await db
        .from("companies")
        .insert(
            finalPayload
        )
        .select()
        .single();

    if (error) {
        throw error;
    }


    if (data) {

        sponsors.unshift(
            data
        );

    }


    closeSponsorModal();

    renderSponsors();

    updateStatistics();

    await createActivity(
        "CREATE",
        data?.id,
        `Menambahkan sponsor ${
            payload.company_name
        }`
    );

    showToast(
        "Sponsor berhasil ditambahkan.",
        "success"
    );

}


/* =========================================================
   22. UPDATE SPONSOR
   ========================================================= */

async function updateSponsor(
    id,
    payload
) {

    const {
        data,
        error
    } = await db
        .from("companies")
        .update(
            payload
        )
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw error;
    }


    const index =
        sponsors.findIndex(
            sponsor =>
                String(
                    sponsor.id
                ) === String(id)
        );


    if (index !== -1) {

        sponsors[index] =
            data;

    }


    closeSponsorModal();

    closeDetailModal();

    renderSponsors();

    updateStatistics();

    await createActivity(
        "UPDATE",
        id,
        `Memperbarui sponsor ${
            payload.company_name
        }`
    );

    showToast(
        "Sponsor berhasil diperbarui.",
        "success"
    );

}


/* =========================================================
   23. OPEN DETAIL
   ========================================================= */

function openDetailModal(id) {

    const sponsor =
        sponsors.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!sponsor) {

        showToast(
            "Data sponsor tidak ditemukan.",
            "error"
        );

        return;

    }

    selectedSponsor =
        sponsor;


    detailCompanyName.textContent =
        sponsor.company_name ||
        "—";

    detailContact.textContent =
        sponsor.contact_name ||
        "—";

    detailEmail.textContent =
        sponsor.email ||
        "—";

    detailPhone.textContent =
        sponsor.phone ||
        "—";

    detailIndustry.textContent =
        INDUSTRY_LABELS[
            sponsor.industry
        ] ||
        sponsor.industry ||
        "—";

    detailStatus.textContent =
        STATUS_LABELS[
            sponsor.status
        ] ||
        sponsor.status ||
        "—";

    detailObjectives.innerHTML =
        renderObjectiveTags(
            normalizeObjectives(
                sponsor.objectives
            )
        );

    detailNotes.textContent =
        sponsor.notes ||
        "Tidak ada catatan.";

    showModal(
        detailModal
    );

}


/* =========================================================
   24. EDIT SPONSOR
   ========================================================= */

editSponsorBtn.addEventListener(
    "click",
    () => {

        if (!selectedSponsor) {
            return;
        }

        closeDetailModal();

        fillSponsorForm(
            selectedSponsor
        );

        isEditing = true;

        modalTitle.textContent =
            "Edit Sponsor";

        saveSponsorBtn.textContent =
            "Simpan Perubahan";

        showModal(
            sponsorModal
        );

    }
);


/* =========================================================
   25. FILL FORM
   ========================================================= */

function fillSponsorForm(
    sponsor
) {

    sponsorId.value =
        sponsor.id || "";

    companyName.value =
        sponsor.company_name || "";

    contactName.value =
        sponsor.contact_name || "";

    contactEmail.value =
        sponsor.email || "";

    contactPhone.value =
        sponsor.phone || "";

    sponsorStatus.value =
        sponsor.status ||
        "PROSPECT";

    industry.value =
        sponsor.industry ||
        "";

    priority.value =
        sponsor.priority ||
        "MEDIUM";

    notes.value =
        sponsor.notes ||
        "";


    const selectedObjectives =
        normalizeObjectives(
            sponsor.objectives
        );


    document
        .querySelectorAll(
            'input[name="objectives"]'
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    selectedObjectives.includes(
                        checkbox.value
                    );

            }
        );

}


/* =========================================================
   26. DELETE SPONSOR
   ========================================================= */

deleteSponsorBtn.addEventListener(
    "click",
    async () => {

        if (!selectedSponsor) {
            return;
        }

        const confirmed =
            window.confirm(
                `Hapus sponsor "${selectedSponsor.company_name}"?\n\nData yang dihapus tidak dapat dikembalikan.`
            );

        if (!confirmed) {
            return;
        }


        setLoading(
            true,
            "Menghapus sponsor..."
        );


        try {

            const id =
                selectedSponsor.id;

            const name =
                selectedSponsor.company_name;


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


            sponsors =
                sponsors.filter(
                    sponsor =>
                        String(
                            sponsor.id
                        ) !==
                        String(id)
                );


            selectedSponsor =
                null;


            closeDetailModal();

            renderSponsors();

            updateStatistics();


            await createActivity(
                "DELETE",
                id,
                `Menghapus sponsor ${name}`
            );


            showToast(
                "Sponsor berhasil dihapus.",
                "success"
            );

        } catch (error) {

            console.error(
                "Delete sponsor error:",
                error
            );

            showToast(
                getDatabaseErrorMessage(
                    error
                ),
                "error"
            );

        } finally {

            setLoading(false);

        }

    }
);


/* =========================================================
   27. OBJECTIVES
   ========================================================= */

function getSelectedObjectives() {

    return Array.from(
        document.querySelectorAll(
            'input[name="objectives"]:checked'
        )
    ).map(
        checkbox =>
            checkbox.value
    );

}


function normalizeObjectives(
    objectives
) {

    if (!objectives) {
        return [];
    }

    if (Array.isArray(objectives)) {
        return objectives;
    }

    /*
     * Support jika database masih menyimpan
     * format string.
     */

    if (typeof objectives === "string") {

        try {

            const parsed =
                JSON.parse(objectives);

            if (Array.isArray(parsed)) {
                return parsed;
            }

        } catch (_) {

            return objectives
                .split(",")
                .map(
                    value =>
                        value.trim()
                )
                .filter(Boolean);

        }

    }

    return [];

}


function renderObjectiveTags(
    objectives
) {

    if (!objectives.length) {

        return `
            <span class="objective-tag muted">
                —
            </span>
        `;

    }

    return objectives
        .map(
            objective => `
                <span class="objective-tag">
                    ${escapeHTML(
                        OBJECTIVE_LABELS[
                            objective
                        ] ||
                        objective
                    )}
                </span>
            `
        )
        .join("");

}


/* =========================================================
   28. MODAL CONTROLS
   ========================================================= */

closeModalBtn.addEventListener(
    "click",
    closeSponsorModal
);

cancelModalBtn.addEventListener(
    "click",
    closeSponsorModal
);

closeDetailBtn.addEventListener(
    "click",
    closeDetailModal
);


document
    .querySelectorAll(
        ".modal-backdrop"
    )
    .forEach(
        backdrop => {

            backdrop.addEventListener(
                "click",
                () => {

                    const modal =
                        backdrop.closest(
                            ".modal"
                        );

                    if (
                        modal ===
                        sponsorModal
                    ) {

                        closeSponsorModal();

                    }

                    if (
                        modal ===
                        detailModal
                    ) {

                        closeDetailModal();

                    }

                }
            );

        }
    );


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeSponsorModal();

            closeDetailModal();

        }

    }
);


/* =========================================================
   29. MODAL FUNCTIONS
   ========================================================= */

function showModal(
    modal
) {

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


function closeSponsorModal() {

    sponsorModal.classList.add(
        "hidden"
    );

    sponsorModal.setAttribute(
        "aria-hidden",
        "true"
    );

    if (
        detailModal.classList.contains(
            "hidden"
        )
    ) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


function closeDetailModal() {

    detailModal.classList.add(
        "hidden"
    );

    detailModal.setAttribute(
        "aria-hidden",
        "true"
    );

    if (
        sponsorModal.classList.contains(
            "hidden"
        )
    ) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


/* =========================================================
   30. RESET FORM
   ========================================================= */

function resetSponsorForm() {

    sponsorForm.reset();

    sponsorId.value = "";

    sponsorStatus.value =
        "PROSPECT";

    priority.value =
        "MEDIUM";


    document
        .querySelectorAll(
            'input[name="objectives"]'
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    false;

            }
        );


    hideElement(
        objectiveError
    );

    hideElement(
        sponsorFormError
    );

}


/* =========================================================
   31. ACTIVITY
   ========================================================= */

async function createActivity(
    action,
    companyId,
    description
) {

    /*
     * Kalau tabel activities belum dibuat,
     * fungsi ini tidak akan mengganggu proses
     * sponsor utama.
     */

    try {

        await db
            .from("activities")
            .insert({

                user_id:
                    currentUser?.id ||
                    null,

                company_id:
                    companyId ||
                    null,

                action,

                description

            });

    } catch (error) {

        console.warn(
            "Activity logging skipped:",
            error
        );

    }

}


async function loadActivity() {

    if (!activityList) {
        return;
    }

    try {

        const {
            data,
            error
        } = await db
            .from("activities")
            .select(`
                *,
                profiles:user_id (
                    name,
                    email
                )
            `)
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

            activityList.innerHTML = `
                <div class="empty-activity">
                    Belum ada aktivitas.
                </div>
            `;

            return;

        }


        activityList.innerHTML =
            data
                .map(
                    activity => {

                        const actor =
                            activity.profiles?.name ||
                            activity.profiles?.email ||
                            "User";

                        return `
                            <div class="activity-item">

                                <div class="activity-dot"></div>

                                <div class="activity-main">

                                    <strong>
                                        ${escapeHTML(
                                            activity.description ||
                                            "Aktivitas"
                                        )}
                                    </strong>

                                    <span>
                                        ${escapeHTML(
                                            actor
                                        )}
                                        ·
                                        ${formatDate(
                                            activity.created_at
                                        )}
                                    </span>

                                </div>

                            </div>
                        `;

                    }
                )
                .join("");

    } catch (error) {

        console.warn(
            "Activity load skipped:",
            error
        );

        activityList.innerHTML = `
            <div class="empty-activity">
                Aktivitas belum tersedia.
            </div>
        `;

    }

}


/* =========================================================
   32. LOADING
   ========================================================= */

function setLoading(
    loading,
    message = "Memproses..."
) {

    if (loading) {

        loadingText.textContent =
            message;

        loadingOverlay.classList.remove(
            "hidden"
        );

    } else {

        loadingOverlay.classList.add(
            "hidden"
        );

    }

}


function setButtonLoading(
    button,
    loading,
    loadingLabel
) {

    if (!button) {
        return;
    }

    if (loading) {

        button.dataset.originalText =
            button.textContent;

        button.disabled =
            true;

        button.textContent =
            loadingLabel;

    } else {

        button.disabled =
            false;

        button.textContent =
            button.dataset.originalText ||
            button.textContent;

    }

}


/* =========================================================
   33. TOAST
   ========================================================= */

let toastTimer = null;

function showToast(
    message,
    type = "success"
) {

    toastMessage.textContent =
        message;

    toast.dataset.type =
        type;

    toast.classList.remove(
        "hidden"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.add(
                    "hidden"
                );

            },
            3500
        );

}


/* =========================================================
   34. ERROR HELPERS
   ========================================================= */

function showError(
    element,
    message
) {

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.classList.remove(
        "hidden"
    );

}


function getAuthErrorMessage(
    error
) {

    const message =
        String(
            error?.message ||
            ""
        ).toLowerCase();


    if (
        message.includes(
            "invalid login credentials"
        )
    ) {

        return "Email atau password salah.";

    }

    if (
        message.includes(
            "email not confirmed"
        )
    ) {

        return "Email akun belum dikonfirmasi.";

    }

    if (
        message.includes(
            "too many requests"
        )
    ) {

        return "Terlalu banyak percobaan. Coba lagi nanti.";

    }

    return (
        error?.message ||
        "Login gagal. Silakan coba lagi."
    );

}


function getDatabaseErrorMessage(
    error
) {

    const message =
        error?.message ||
        "Terjadi kesalahan pada database.";


    if (
        message.includes(
            "row-level security"
        )
    ) {

        return "Akses database ditolak oleh RLS. Periksa policy Supabase.";

    }

    if (
        message.includes(
            "schema cache"
        )
    ) {

        return "Struktur tabel Supabase belum sesuai dengan aplikasi.";

    }

    if (
        message.includes(
            "duplicate"
        )
    ) {

        return "Data tersebut sudah ada.";

    }

    return message;

}


/* =========================================================
   35. BASIC UI HELPERS
   ========================================================= */

function showElement(
    element
) {

    if (!element) {
        return;
    }

    element.classList.remove(
        "hidden"
    );

}


function hideElement(
    element
) {

    if (!element) {
        return;
    }

    element.classList.add(
        "hidden"
    );

}


/* =========================================================
   36. ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   37. DATE FORMAT
   ========================================================= */

function formatDate(
    value
) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }

    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);

}


/* =========================================================
   38. FINAL CHECK
   ========================================================= */

console.log(
    "MECHANIVERSARY 52 Sponsor Database initialized."
);
