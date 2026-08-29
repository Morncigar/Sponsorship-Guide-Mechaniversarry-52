/* =========================================================
   MECHANNIVERSARY 52
   SPONSORSHIP OPERATING SYSTEM
   VERSION: DEWA
   ========================================================= */


/* =========================================================
   01 — CONFIGURATION
   ========================================================= */

const APP_CONFIG = {
    eventName: "MECHANNIVERSARY 52",
    eventTagline: "MECHANICAL ENGINEERING ITENAS",
    storageKey: "mechanniversary52_sponsorship_os",

    colors: {
        navy: "#041E41",
        orange: "#FF4D00",
        red: "#8B0101",
        white: "#FFFFFF",
        black: "#000000"
    }
};


/* =========================================================
   02 — SPONSORSHIP PIPELINE
   ========================================================= */

const PIPELINE = [
    {
        id: "prospect",
        number: "01",
        title: "PROSPECT",
        description: "Perusahaan sudah ditemukan."
    },
    {
        id: "research",
        number: "02",
        title: "RESEARCH",
        description: "Perusahaan sudah dipelajari."
    },
    {
        id: "matched",
        number: "03",
        title: "MATCHED",
        description: "Kebutuhan sponsor sudah dicocokkan."
    },
    {
        id: "contacted",
        number: "04",
        title: "CONTACTED",
        description: "PIC sudah dihubungi."
    },
    {
        id: "discussion",
        number: "05",
        title: "DISCUSSION",
        description: "Komunikasi sedang berjalan."
    },
    {
        id: "negotiation",
        number: "06",
        title: "NEGOTIATION",
        description: "Benefit dan value sedang dibahas."
    },
    {
        id: "deal",
        number: "07",
        title: "DEAL",
        description: "Kerja sama sudah disepakati."
    },
    {
        id: "activation",
        number: "08",
        title: "ACTIVATION",
        description: "Benefit sedang dijalankan."
    },
    {
        id: "report",
        number: "09",
        title: "REPORT",
        description: "Laporan sponsorship sedang disiapkan."
    },
    {
        id: "retention",
        number: "10",
        title: "RETENTION",
        description: "Hubungan dengan partner dipertahankan."
    }
];


/* =========================================================
   03 — STEP SYSTEM
   ========================================================= */

const STEPS = {

    1: {
        number: "01",
        title: "CARI SPONSOR",
        subtitle: "BUILD THE PROSPECT LIST",

        objective:
            "Temukan perusahaan yang memiliki kemungkinan dan alasan kuat untuk bekerja sama dengan Mechanniversary 52.",

        mindset:
            "Jangan mulai dari pertanyaan 'siapa yang mau kasih uang?', tetapi 'siapa yang punya kebutuhan yang bisa kita bantu?'.",

        checklist: [
            "Tentukan kategori perusahaan.",
            "Cari perusahaan yang relevan.",
            "Cari kontak atau PIC.",
            "Masukkan perusahaan ke database.",
            "Berikan penilaian awal."
        ],

        output:
            "Database calon sponsor yang sudah memiliki prioritas."
    },

    2: {
        number: "02",
        title: "KENALI SPONSOR",
        subtitle: "UNDERSTAND THE BUSINESS",

        objective:
            "Pahami bisnis, target audience, produk, campaign, dan kebutuhan perusahaan.",

        mindset:
            "Proposal yang bagus bukan proposal yang banyak benefit-nya. Proposal yang bagus adalah proposal yang terasa dibuat khusus untuk perusahaan tersebut.",

        checklist: [
            "Pelajari produk atau jasa.",
            "Identifikasi target audience.",
            "Cari campaign terbaru.",
            "Cari bentuk sponsorship sebelumnya.",
            "Identifikasi kebutuhan perusahaan."
        ],

        output:
            "Sponsor profile yang cukup untuk membuat penawaran personal."
    },

    3: {
        number: "03",
        title: "COCOKKAN",
        subtitle: "FIND THE MUTUAL VALUE",

        objective:
            "Hubungkan kebutuhan perusahaan dengan audience, aktivitas, dan aset yang dimiliki event.",

        mindset:
            "Sponsor bukan membeli logo. Sponsor membeli akses, exposure, experience, leads, trial, content, atau hubungan dengan audience.",

        checklist: [
            "Tentukan kebutuhan sponsor.",
            "Tentukan aset yang kita miliki.",
            "Cari titik temu.",
            "Pilih activation yang relevan.",
            "Tentukan value yang dapat diukur."
        ],

        output:
            "Satu alasan yang jelas mengapa perusahaan tersebut harus bekerja sama."
    },

    4: {
        number: "04",
        title: "TAWARKAN",
        subtitle: "BUILD THE PROPOSAL",

        objective:
            "Buat penawaran yang menjawab kebutuhan perusahaan.",

        mindset:
            "Jangan menjual paket. Jual solusi.",

        checklist: [
            "Pilih bentuk kerja sama.",
            "Tentukan deliverables.",
            "Tentukan value.",
            "Tentukan kebutuhan sponsor.",
            "Sesuaikan proposal."
        ],

        output:
            "Proposal atau partnership offer yang siap dikirim."
    },

    5: {
        number: "05",
        title: "HUBUNGI",
        subtitle: "OPEN THE CONVERSATION",

        objective:
            "Mendapatkan akses komunikasi dengan decision maker atau PIC perusahaan.",

        mindset:
            "Tujuan first contact bukan langsung closing. Tujuan first contact adalah mendapatkan kesempatan berdiskusi.",

        checklist: [
            "Temukan PIC.",
            "Gunakan opening yang relevan.",
            "Perkenalkan event.",
            "Jelaskan alasan menghubungi.",
            "Ajukan conversation."
        ],

        output:
            "Conversation terbuka dengan PIC."
    },

    6: {
        number: "06",
        title: "BICARAKAN",
        subtitle: "DISCOVER THE NEED",

        objective:
            "Memahami kebutuhan aktual perusahaan dan menyesuaikan penawaran.",

        mindset:
            "Lebih banyak bertanya daripada menjelaskan.",

        checklist: [
            "Tanyakan objective perusahaan.",
            "Tanyakan target audience.",
            "Tanyakan activation yang diinginkan.",
            "Bahas budget atau value.",
            "Catat semua requirement."
        ],

        output:
            "Kesepahaman mengenai bentuk kerja sama."
    },

    7: {
        number: "07",
        title: "SEPAKATI",
        subtitle: "CLOSE THE PARTNERSHIP",

        objective:
            "Mengubah diskusi menjadi kerja sama yang jelas dan terdokumentasi.",

        mindset:
            "Semua yang disepakati harus dapat diterjemahkan menjadi deliverables yang jelas.",

        checklist: [
            "Finalisasi benefit.",
            "Finalisasi value.",
            "Finalisasi timeline.",
            "Tentukan PIC.",
            "Pastikan dokumen kerja sama."
        ],

        output:
            "Partnership yang siap dieksekusi."
    },

    8: {
        number: "08",
        title: "JALANKAN",
        subtitle: "DELIVER THE PROMISE",

        objective:
            "Memastikan semua benefit sponsor dijalankan sesuai kesepakatan.",

        mindset:
            "Sponsor experience sama pentingnya dengan sponsor acquisition.",

        checklist: [
            "Buat deliverables checklist.",
            "Koordinasi antar divisi.",
            "Pastikan branding.",
            "Pastikan activation.",
            "Dokumentasikan pelaksanaan."
        ],

        output:
            "Seluruh deliverables terpenuhi."
    },

    9: {
        number: "09",
        title: "LAPORKAN",
        subtitle: "PROVE THE VALUE",

        objective:
            "Menunjukkan hasil kerja sama kepada sponsor.",

        mindset:
            "Jangan hanya menunjukkan bahwa sponsor tampil. Tunjukkan apa yang sponsor dapatkan.",

        checklist: [
            "Kumpulkan dokumentasi.",
            "Hitung audience.",
            "Kumpulkan social media metrics.",
            "Dokumentasikan activation.",
            "Susun sponsorship report."
        ],

        output:
            "Laporan hasil kerja sama."
    },

    10: {
        number: "10",
        title: "JAGA HUBUNGAN",
        subtitle: "BUILD THE NEXT PARTNERSHIP",

        objective:
            "Mengubah sponsor satu kali menjadi partner jangka panjang.",

        mindset:
            "Closing bukan akhir sponsorship. Closing adalah awal relationship.",

        checklist: [
            "Kirim ucapan terima kasih.",
            "Kirim report.",
            "Minta feedback.",
            "Simpan PIC.",
            "Identifikasi peluang berikutnya."
        ],

        output:
            "Partner relationship yang siap dilanjutkan."
    }
};


/* =========================================================
   04 — DEFAULT DATA
   ========================================================= */

const DEFAULT_DATA = {
    sponsors: [],
    tasks: {},
    notes: {},
    activity: [],
    settings: {
        initialized: true
    }
};


/* =========================================================
   05 — LOAD DATA
   ========================================================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(
                APP_CONFIG.storageKey
            );

        if (!saved) {

            return structuredClone(DEFAULT_DATA);

        }

        return {
            ...structuredClone(DEFAULT_DATA),
            ...JSON.parse(saved)
        };

    } catch (error) {

        console.error(
            "Failed to load sponsorship data:",
            error
        );

        return structuredClone(DEFAULT_DATA);

    }

}


let APP_DATA = loadData();


/* =========================================================
   06 — SAVE DATA
   ========================================================= */

function saveData() {

    localStorage.setItem(
        APP_CONFIG.storageKey,
        JSON.stringify(APP_DATA)
    );

}


/* =========================================================
   07 — ACTIVITY LOG
   ========================================================= */

function logActivity(
    type,
    message,
    sponsorId = null
) {

    APP_DATA.activity.unshift({

        id:
            Date.now(),

        type,

        message,

        sponsorId,

        timestamp:
            new Date().toISOString()

    });


    APP_DATA.activity =
        APP_DATA.activity.slice(0, 100);


    saveData();

}


/* =========================================================
   08 — SPONSOR CATEGORIES
   ========================================================= */

const SPONSOR_CATEGORIES = [

    "Perbankan",
    "Otomotif",
    "Modification",
    "Spare Part",
    "Oli & Lubricant",
    "Tools",
    "Engineering",
    "Robotik",
    "Technology",
    "Lifestyle",
    "Food & Beverage",
    "Media",
    "Education",
    "Other"

];


/* =========================================================
   09 — SPONSOR STATUS
   ========================================================= */

const SPONSOR_STATUS = [

    {
        id: "prospect",
        label: "PROSPECT"
    },

    {
        id: "research",
        label: "RESEARCH"
    },

    {
        id: "contacted",
        label: "CONTACTED"
    },

    {
        id: "discussion",
        label: "DISCUSSION"
    },

    {
        id: "negotiation",
        label: "NEGOTIATION"
    },

    {
        id: "deal",
        label: "DEAL"
    },

    {
        id: "activation",
        label: "ACTIVATION"
    },

    {
        id: "completed",
        label: "COMPLETED"
    }

];


/* =========================================================
   10 — SPONSOR SCORING
   ========================================================= */

function calculateScore(sponsor) {

    let score = 0;


    score += Number(
        sponsor.relevance || 0
    );


    score += Number(
        sponsor.audience || 0
    );


    score += Number(
        sponsor.activation || 0
    );


    score += Number(
        sponsor.access || 0
    );


    score += Number(
        sponsor.value || 0
    );


    return score;

}


function getPriority(score) {

    if (score >= 22) {

        return {
            level: "A",
            label: "HIGH PRIORITY"
        };

    }


    if (score >= 16) {

        return {
            level: "B",
            label: "MEDIUM PRIORITY"
        };

    }


    return {
        level: "C",
        label: "LOW PRIORITY"
    };

}


/* =========================================================
   11 — GENERATE ID
   ========================================================= */

function generateSponsorId() {

    return (
        "SP-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase()
    );

}


/* =========================================================
   12 — ADD SPONSOR
   ========================================================= */

function addSponsor(data) {

    const sponsor = {

        id:
            generateSponsorId(),

        name:
            data.name || "",

        category:
            data.category || "Other",

        contact:
            data.contact || "",

        phone:
            data.phone || "",

        email:
            data.email || "",

        website:
            data.website || "",

        instagram:
            data.instagram || "",

        notes:
            data.notes || "",

        relevance:
            Number(data.relevance || 0),

        audience:
            Number(data.audience || 0),

        activation:
            Number(data.activation || 0),

        access:
            Number(data.access || 0),

        value:
            Number(data.value || 0),

        status:
            "prospect",

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };


    APP_DATA.sponsors.push(sponsor);

    saveData();


    logActivity(
        "sponsor_added",
        `Prospect baru ditambahkan: ${sponsor.name}`,
        sponsor.id
    );


    return sponsor;

}


/* =========================================================
   13 — UPDATE SPONSOR
   ========================================================= */

function updateSponsor(id, updates) {

    const sponsor =
        APP_DATA.sponsors.find(
            item => item.id === id
        );


    if (!sponsor) return null;


    Object.assign(
        sponsor,
        updates,
        {
            updatedAt:
                new Date().toISOString()
        }
    );


    saveData();


    return sponsor;

}


/* =========================================================
   14 — DELETE SPONSOR
   ========================================================= */

function deleteSponsor(id) {

    const sponsor =
        APP_DATA.sponsors.find(
            item => item.id === id
        );


    if (!sponsor) return;


    APP_DATA.sponsors =
        APP_DATA.sponsors.filter(
            item => item.id !== id
        );


    saveData();


    logActivity(
        "sponsor_deleted",
        `Prospect dihapus: ${sponsor.name}`
    );

}


/* =========================================================
   15 — CHANGE STATUS
   ========================================================= */

function changeSponsorStatus(
    id,
    status
) {

    const sponsor =
        APP_DATA.sponsors.find(
            item => item.id === id
        );


    if (!sponsor) return;


    sponsor.status =
        status;


    sponsor.updatedAt =
        new Date().toISOString();


    saveData();


    logActivity(
        "status_changed",
        `${sponsor.name} → ${status.toUpperCase()}`,
        sponsor.id
    );

}


/* =========================================================
   16 — OPEN SPONSOR DATABASE
   ========================================================= */

function openSponsorDatabase() {

    closeAllModals();


    const modal =
        document.createElement("div");


    modal.className =
        "sos-modal";


    modal.id =
        "sponsor-database-modal";


    modal.innerHTML = `

        <div class="sos-overlay"></div>

        <div class="sos-window database-window">

            <button class="sos-close">
                ×
            </button>


            <div class="sos-header">

                <div>

                    <span class="eyebrow">
                        MECHANNIVERSARY 52 /
                        SPONSORSHIP OS
                    </span>

                    <h1>
                        SPONSOR<br>
                        DATABASE
                    </h1>

                </div>


                <div class="database-stat">

                    <strong>
                        ${APP_DATA.sponsors.length}
                    </strong>

                    <span>
                        TOTAL PROSPECT
                    </span>

                </div>

            </div>


            <div class="database-actions">

                <button
                    class="sos-primary"
                    id="new-sponsor">

                    + ADD PROSPECT

                </button>


                <button
                    class="sos-secondary"
                    id="export-database">

                    EXPORT CSV

                </button>

            </div>


            <div class="database-toolbar">

                <input
                    id="sponsor-search"
                    type="search"
                    placeholder="Search company, PIC, category..."
                >


                <select id="sponsor-filter">

                    <option value="all">
                        ALL STATUS
                    </option>

                    ${SPONSOR_STATUS.map(status => `
                        <option value="${status.id}">
                            ${status.label}
                        </option>
                    `).join("")}

                </select>

            </div>


            <div
                class="sponsor-table"
                id="sponsor-table">

                ${renderSponsorTable()}

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    injectSOSStyles();


    bindDatabaseEvents();

}


/* =========================================================
   17 — RENDER SPONSOR TABLE
   ========================================================= */

function renderSponsorTable(
    search = "",
    filter = "all"
) {

    let sponsors =
        [...APP_DATA.sponsors];


    if (search) {

        const query =
            search.toLowerCase();


        sponsors =
            sponsors.filter(
                sponsor =>
                    sponsor.name
                        .toLowerCase()
                        .includes(query) ||

                    sponsor.category
                        .toLowerCase()
                        .includes(query) ||

                    sponsor.contact
                        .toLowerCase()
                        .includes(query)
            );

    }


    if (filter !== "all") {

        sponsors =
            sponsors.filter(
                sponsor =>
                    sponsor.status === filter
            );

    }


    sponsors.sort(
        (a, b) =>
            calculateScore(b) -
            calculateScore(a)
    );


    if (sponsors.length === 0) {

        return `

            <div class="empty-state">

                <div class="empty-icon">
                    +
                </div>

                <strong>
                    NO PROSPECT FOUND
                </strong>

                <span>
                    Tambahkan calon sponsor pertama.
                </span>

            </div>

        `;

    }


    return `

        <div class="sponsor-table-head">

            <span>COMPANY</span>
            <span>CATEGORY</span>
            <span>SCORE</span>
            <span>PRIORITY</span>
            <span>STATUS</span>
            <span></span>

        </div>


        ${sponsors.map(sponsor => {

            const score =
                calculateScore(sponsor);

            const priority =
                getPriority(score);


            return `

                <div
                    class="sponsor-table-row"
                    data-sponsor-id="${sponsor.id}"
                >

                    <div class="company-cell">

                        <strong>
                            ${escapeHTML(
                                sponsor.name
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                sponsor.contact ||
                                "NO PIC"
                            )}
                        </small>

                    </div>


                    <div>
                        ${escapeHTML(
                            sponsor.category
                        )}
                    </div>


                    <div class="score-cell">
                        ${score}/25
                    </div>


                    <div>

                        <span
                            class="
                                priority-badge
                                priority-${priority.level.toLowerCase()}
                            "
                        >
                            ${priority.level}
                        </span>

                    </div>


                    <div>

                        <span
                            class="status-badge"
                        >
                            ${sponsor.status.toUpperCase()}
                        </span>

                    </div>


                    <button
                        class="row-open"
                        data-open-sponsor="${sponsor.id}"
                    >
                        →
                    </button>

                </div>

            `;

        }).join("")}

    `;

}


/* =========================================================
   18 — DATABASE EVENTS
   ========================================================= */

function bindDatabaseEvents() {

    const modal =
        document.querySelector(
            "#sponsor-database-modal"
        );


    if (!modal) return;


    modal.querySelector(".sos-close").onclick =
        closeAllModals;


    modal.querySelector(".sos-overlay").onclick =
        closeAllModals;


    modal.querySelector("#new-sponsor").onclick =
        () => openSponsorForm();


    modal.querySelector("#export-database").onclick =
        exportCSV;


    const search =
        modal.querySelector(
            "#sponsor-search"
        );


    const filter =
        modal.querySelector(
            "#sponsor-filter"
        );


    function refresh() {

        modal.querySelector(
            "#sponsor-table"
        ).innerHTML =
            renderSponsorTable(
                search.value,
                filter.value
            );


        bindRowButtons();

    }


    search.addEventListener(
        "input",
        refresh
    );


    filter.addEventListener(
        "change",
        refresh
    );


    bindRowButtons();

}


/* =========================================================
   19 — ROW BUTTONS
   ========================================================= */

function bindRowButtons() {

    document
        .querySelectorAll(
            "[data-open-sponsor]"
        )
        .forEach(button => {

            button.onclick = () => {

                openSponsorDetail(
                    button.dataset.openSponsor
                );

            };

        });

}


/* =========================================================
   20 — SPONSOR FORM
   ========================================================= */

function openSponsorForm(
    sponsorId = null
) {

    const existing =
        sponsorId
        ?
        APP_DATA.sponsors.find(
            sponsor =>
                sponsor.id === sponsorId
        )
        :
        null;


    const modal =
        document.createElement("div");


    modal.className =
        "sos-modal";


    modal.id =
        "sponsor-form-modal";


    modal.innerHTML = `

        <div class="sos-overlay"></div>

        <div class="sos-window form-window">

            <button class="sos-close">
                ×
            </button>


            <span class="eyebrow">
                ${existing ? "EDIT PROSPECT" : "NEW PROSPECT"}
            </span>


            <h2>
                ${existing ? "UPDATE" : "ADD"} SPONSOR
            </h2>


            <div class="form-section">

                <span class="form-section-title">
                    COMPANY INFORMATION
                </span>


                <div class="form-grid">

                    <input
                        id="form-name"
                        placeholder="Nama perusahaan *"
                        value="${escapeAttribute(
                            existing?.name || ""
                        )}"
                    >


                    <select id="form-category">

                        <option value="">
                            Pilih kategori
                        </option>

                        ${SPONSOR_CATEGORIES.map(category => `

                            <option
                                value="${escapeAttribute(category)}"
                                ${
                                    existing?.category === category
                                    ? "selected"
                                    : ""
                                }
                            >
                                ${category}
                            </option>

                        `).join("")}

                    </select>


                    <input
                        id="form-contact"
                        placeholder="Nama PIC"
                        value="${escapeAttribute(
                            existing?.contact || ""
                        )}"
                    >


                    <input
                        id="form-phone"
                        placeholder="Nomor WhatsApp / Phone"
                        value="${escapeAttribute(
                            existing?.phone || ""
                        )}"
                    >


                    <input
                        id="form-email"
                        placeholder="Email"
                        value="${escapeAttribute(
                            existing?.email || ""
                        )}"
                    >


                    <input
                        id="form-website"
                        placeholder="Website"
                        value="${escapeAttribute(
                            existing?.website || ""
                        )}"
                    >


                    <input
                        id="form-instagram"
                        placeholder="Instagram"
                        value="${escapeAttribute(
                            existing?.instagram || ""
                        )}"
                    >

                </div>


                <textarea
                    id="form-notes"
                    placeholder="Catatan / hasil riset awal..."
                >${escapeHTML(
                    existing?.notes || ""
                )}</textarea>

            </div>


            <div class="form-section">

                <span class="form-section-title">
                    POTENTIAL SCORE / 5
                </span>


                <div class="score-grid">

                    ${renderScoreInput(
                        "relevance",
                        "RELEVANCE",
                        existing?.relevance
                    )}

                    ${renderScoreInput(
                        "audience",
                        "AUDIENCE FIT",
                        existing?.audience
                    )}

                    ${renderScoreInput(
                        "activation",
                        "ACTIVATION",
                        existing?.activation
                    )}

                    ${renderScoreInput(
                        "access",
                        "ACCESS",
                        existing?.access
                    )}

                    ${renderScoreInput(
                        "value",
                        "VALUE",
                        existing?.value
                    )}

                </div>

            </div>


            <div class="form-footer">

                <button
                    class="sos-secondary"
                    id="cancel-form">

                    CANCEL

                </button>


                <button
                    class="sos-primary"
                    id="save-form">

                    ${existing ? "UPDATE PROSPECT" : "SAVE PROSPECT"}

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    injectSOSStyles();


    modal.querySelector(".sos-close").onclick =
        closeAllModals;


    modal.querySelector(".sos-overlay").onclick =
        closeAllModals;


    modal.querySelector("#cancel-form").onclick =
        closeAllModals;


    modal.querySelector("#save-form").onclick =
        () => {

            const data = {

                name:
                    document.querySelector(
                        "#form-name"
                    ).value.trim(),

                category:
                    document.querySelector(
                        "#form-category"
                    ).value,

                contact:
                    document.querySelector(
                        "#form-contact"
                    ).value.trim(),

                phone:
                    document.querySelector(
                        "#form-phone"
                    ).value.trim(),

                email:
                    document.querySelector(
                        "#form-email"
                    ).value.trim(),

                website:
                    document.querySelector(
                        "#form-website"
                    ).value.trim(),

                instagram:
                    document.querySelector(
                        "#form-instagram"
                    ).value.trim(),

                notes:
                    document.querySelector(
                        "#form-notes"
                    ).value.trim(),

                relevance:
                    getScoreValue("relevance"),

                audience:
                    getScoreValue("audience"),

                activation:
                    getScoreValue("activation"),

                access:
                    getScoreValue("access"),

                value:
                    getScoreValue("value")

            };


            if (!data.name) {

                alert(
                    "Nama perusahaan wajib diisi."
                );

                return;

            }


            if (existing) {

                updateSponsor(
                    sponsorId,
                    data
                );


                logActivity(
                    "sponsor_updated",
                    `Prospect diperbarui: ${data.name}`,
                    sponsorId
                );

            } else {

                addSponsor(data);

            }


            closeAllModals();


            setTimeout(
                () => openSponsorDatabase(),
                100
            );

        };

}


/* =========================================================
   21 — SCORE INPUT
   ========================================================= */

function renderScoreInput(
    id,
    label,
    value = 0
) {

    return `

        <div class="score-input">

            <label>
                ${label}
            </label>


            <div class="score-buttons">

                ${[1, 2, 3, 4, 5].map(number => `

                    <button
                        type="button"
                        class="
                            score-button
                            ${
                                Number(value) === number
                                ? "selected"
                                : ""
                            }
                        "
                        data-score="${id}"
                        data-value="${number}"
                    >
                        ${number}
                    </button>

                `).join("")}

            </div>

        </div>

    `;

}


function getScoreValue(id) {

    const selected =
        document.querySelector(
            `.score-button[data-score="${id}"].selected`
        );


    return selected
        ? Number(selected.dataset.value)
        : 0;

}


/* =========================================================
   22 — SCORE BUTTON EVENTS
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".score-button"
            );


        if (!button) return;


        const group =
            button.dataset.score;


        document
            .querySelectorAll(
                `.score-button[data-score="${group}"]`
            )
            .forEach(
                item =>
                    item.classList.remove(
                        "selected"
                    )
            );


        button.classList.add(
            "selected"
        );

    }
);


/* =========================================================
   23 — SPONSOR DETAIL
   ========================================================= */

function openSponsorDetail(id) {

    const sponsor =
        APP_DATA.sponsors.find(
            item => item.id === id
        );


    if (!sponsor) return;


    const score =
        calculateScore(sponsor);


    const priority =
        getPriority(score);


    const modal =
        document.createElement("div");


    modal.className =
        "sos-modal";


    modal.innerHTML = `

        <div class="sos-overlay"></div>

        <div class="sos-window detail-window">

            <button class="sos-close">
                ×
            </button>


            <div class="detail-top">

                <div>

                    <span class="eyebrow">
                        ${sponsor.id}
                    </span>

                    <h2>
                        ${escapeHTML(
                            sponsor.name
                        )}
                    </h2>

                    <span class="detail-category">
                        ${escapeHTML(
                            sponsor.category
                        )}
                    </span>

                </div>


                <div class="detail-score">

                    <strong>
                        ${score}
                    </strong>

                    <span>
                        /25
                    </span>

                    <small>
                        PRIORITY ${priority.level}
                    </small>

                </div>

            </div>


            <div class="detail-status">

                ${renderStatusButtons(
                    sponsor
                )}

            </div>


            <div class="detail-grid">

                <div>

                    <span class="form-section-title">
                        CONTACT
                    </span>


                    <div class="info-list">

                        <div>
                            <small>PIC</small>
                            <strong>
                                ${escapeHTML(
                                    sponsor.contact ||
                                    "—"
                                )}
                            </strong>
                        </div>


                        <div>
                            <small>PHONE</small>
                            <strong>
                                ${escapeHTML(
                                    sponsor.phone ||
                                    "—"
                                )}
                            </strong>
                        </div>


                        <div>
                            <small>EMAIL</small>
                            <strong>
                                ${escapeHTML(
                                    sponsor.email ||
                                    "—"
                                )}
                            </strong>
                        </div>


                        <div>
                            <small>WEBSITE</small>
                            <strong>
                                ${escapeHTML(
                                    sponsor.website ||
                                    "—"
                                )}
                            </strong>
                        </div>

                    </div>

                </div>


                <div>

                    <span class="form-section-title">
                        RESEARCH NOTES
                    </span>

                    <div class="notes-panel">

                        ${escapeHTML(
                            sponsor.notes ||
                            "Belum ada catatan."
                        )}

                    </div>

                </div>

            </div>


            <div class="detail-actions">

                <button
                    class="sos-secondary"
                    data-edit-sponsor="${sponsor.id}"
                >
                    EDIT
                </button>


                <button
                    class="sos-primary"
                    data-next-action="${sponsor.id}"
                >
                    NEXT ACTION →
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    injectSOSStyles();


    modal.querySelector(".sos-close").onclick =
        closeAllModals;


    modal.querySelector(".sos-overlay").onclick =
        closeAllModals;


    modal.querySelector(
        "[data-edit-sponsor]"
    ).onclick = () => {

        closeAllModals();

        setTimeout(
            () =>
                openSponsorForm(
                    sponsor.id
                ),
            100
        );

    };


    modal.querySelector(
        "[data-next-action]"
    ).onclick = () => {

        openNextAction(
            sponsor.id
        );

    };


    modal.querySelectorAll(
        "[data-status]"
    ).forEach(button => {

        button.onclick = () => {

            changeSponsorStatus(
                sponsor.id,
                button.dataset.status
            );


            closeAllModals();


            setTimeout(
                () =>
                    openSponsorDetail(
                        sponsor.id
                    ),
                100
            );

        };

    });

}


/* =========================================================
   24 — STATUS BUTTONS
   ========================================================= */

function renderStatusButtons(sponsor) {

    return SPONSOR_STATUS.map(
        status => `

            <button
                class="
                    status-control
                    ${
                        sponsor.status === status.id
                        ? "active"
                        : ""
                    }
                "
                data-status="${status.id}"
            >
                ${status.label}
            </button>

        `
    ).join("");

}


/* =========================================================
   25 — NEXT ACTION
   ========================================================= */

function openNextAction(id) {

    const sponsor =
        APP_DATA.sponsors.find(
            item => item.id === id
        );


    if (!sponsor) return;


    const actions = {

        prospect: {
            title: "RESEARCH SPONSOR",
            description:
                "Pelajari perusahaan ini sebelum menghubungi mereka.",
            action:
                "Cari produk, target audience, campaign, dan kemungkinan kebutuhan."
        },

        research: {
            title: "BUILD THE MATCH",
            description:
                "Tentukan alasan mengapa sponsor ini cocok.",
            action:
                "Hubungkan kebutuhan perusahaan dengan aset Mechanniversary 52."
        },

        contacted: {
            title: "FOLLOW UP",
            description:
                "PIC sudah dihubungi.",
            action:
                "Pastikan komunikasi tidak berhenti di first contact."
        },

        discussion: {
            title: "PREPARE THE OFFER",
            description:
                "Pembicaraan sedang berjalan.",
            action:
                "Siapkan proposal berdasarkan kebutuhan aktual sponsor."
        },

        negotiation: {
            title: "CLOSE THE DEAL",
            description:
                "Benefit dan value sedang dinegosiasikan.",
            action:
                "Finalisasi deliverables, value, timeline, dan PIC."
        },

        deal: {
            title: "ACTIVATE",
            description:
                "Kerja sama sudah disepakati.",
            action:
                "Pastikan seluruh deliverables siap dieksekusi."
        },

        activation: {
            title: "DOCUMENT",
            description:
                "Activation sedang berjalan.",
            action:
                "Dokumentasikan seluruh aktivitas dan branding."
        },

        completed: {
            title: "RETAIN",
            description:
                "Kerja sama telah selesai.",
            action:
                "Kirim report dan buka peluang kerja sama berikutnya."
        }

    };


    const action =
        actions[sponsor.status] ||
        actions.prospect;


    alert(
        `${action.title}\n\n${action.description}\n\nNEXT ACTION:\n${action.action}`
    );

}


/* =========================================================
   26 — FLOWCHART MODAL
   ========================================================= */

function openStep(stepNumber) {

    const step =
        STEPS[stepNumber];


    if (!step) return;


    closeAllModals();


    const modal =
        document.createElement("div");


    modal.className =
        "sos-modal";


    modal.innerHTML = `

        <div class="sos-overlay"></div>

        <div class="sos-window step-window">

            <button class="sos-close">
                ×
            </button>


            <div class="step-heading">

                <span class="step-number">
                    ${step.number}
                </span>

                <div>

                    <span class="eyebrow">
                        SPONSORSHIP PLAYBOOK
                    </span>

                    <h2>
                        ${step.title}
                    </h2>

                    <span class="step-subtitle">
                        ${step.subtitle}
                    </span>

                </div>

            </div>


            <div class="step-objective">

                <span class="form-section-title">
                    OBJECTIVE
                </span>

                <p>
                    ${step.objective}
                </p>

            </div>


            <div class="step-grid">

                <div>

                    <span class="form-section-title">
                        MINDSET
                    </span>

                    <div class="mindset-box">
                        ${step.mindset}
                    </div>

                </div>


                <div>

                    <span class="form-section-title">
                        CHECKLIST
                    </span>

                    <div class="step-checklist">

                        ${step.checklist.map(
                            (item, index) => `

                                <label>

                                    <input
                                        type="checkbox"
                                        class="step-check"
                                        data-step="${stepNumber}"
                                        data-index="${index}"
                                    >

                                    <span>
                                        ${item}
                                    </span>

                                </label>

                            `
                        ).join("")}

                    </div>

                </div>

            </div>


            <div class="step-output">

                <span class="form-section-title">
                    EXPECTED OUTPUT
                </span>

                <strong>
                    ${step.output}
                </strong>

            </div>


            <div class="step-footer">

                <span>
                    CHECKLIST
                    <strong id="step-progress">
                        0/${step.checklist.length}
                    </strong>
                </span>


                <button
                    class="sos-primary"
                    id="step-complete"
                    disabled
                >
                    ${stepNumber < 10
                        ? "COMPLETE & CONTINUE →"
                        : "COMPLETE ✓"
                    }
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    injectSOSStyles();


    modal.querySelector(".sos-close").onclick =
        closeAllModals;


    modal.querySelector(".sos-overlay").onclick =
        closeAllModals;


    setupStepChecklist(
        modal,
        stepNumber,
        step
    );

}


/* =========================================================
   27 — STEP CHECKLIST
   ========================================================= */

function setupStepChecklist(
    modal,
    stepNumber,
    step
) {

    const checks =
        modal.querySelectorAll(
            ".step-check"
        );


    const progress =
        modal.querySelector(
            "#step-progress"
        );


    const button =
        modal.querySelector(
            "#step-complete"
        );


    function update() {

        const completed =
            [...checks]
                .filter(
                    checkbox =>
                        checkbox.checked
                )
                .length;


        progress.textContent =
            `${completed}/${checks.length}`;


        button.disabled =
            completed !== checks.length;

    }


    checks.forEach(
        checkbox => {

            checkbox.addEventListener(
                "change",
                update
            );

        }
    );


    button.onclick = () => {

        APP_DATA.tasks[
            `step-${stepNumber}`
        ] = true;


        saveData();


        logActivity(
            "step_completed",
            `Step ${stepNumber} selesai: ${step.title}`
        );


        closeAllModals();


        if (stepNumber === 1) {

            setTimeout(
                () =>
                    openSponsorDatabase(),
                150
            );

        }
        else if (stepNumber < 10) {

            setTimeout(
                () =>
                    openStep(
                        stepNumber + 1
                    ),
                150
            );

        }
        else {

            setTimeout(
                () =>
                    showCompletion(),
                150
            );

        }

    };

}


/* =========================================================
   28 — COMPLETION
   ========================================================= */

function showCompletion() {

    closeAllModals();


    const modal =
        document.createElement("div");


    modal.className =
        "sos-modal";


    modal.innerHTML = `

        <div class="sos-overlay"></div>

        <div class="sos-window completion-window">

            <span class="eyebrow">
                SPONSORSHIP PLAYBOOK
            </span>


            <div class="completion-mark">
                ✓
            </div>


            <h2>
                PROCESS<br>
                COMPLETE.
            </h2>


            <p>
                Seluruh alur sponsorship
                telah kamu selesaikan.
            </p>


            <button
                class="sos-primary"
                id="completion-close">

                BACK TO DASHBOARD

            </button>

        </div>

    `;


    document.body.appendChild(modal);


    injectSOSStyles();


    modal.querySelector(
        "#completion-close"
    ).onclick =
        closeAllModals;

}


/* =========================================================
   29 — DASHBOARD
   ========================================================= */

function openDashboard() {

    closeAllModals();


    const total =
        APP_DATA.sponsors.length;


    const highPriority =
        APP_DATA.sponsors.filter(
            sponsor =>
                getPriority(
                    calculateScore(
                        sponsor
                    )
                ).level === "A"
        ).length;


    const deals =
        APP_DATA.sponsors.filter(
            sponsor =>
                sponsor.status === "deal" ||
                sponsor.status === "activation" ||
                sponsor.status === "completed"
        ).length;


    const contacted =
        APP_DATA.sponsors.filter(
            sponsor =>
                [
                    "contacted",
                    "discussion",
                    "negotiation",
                    "deal",
                    "activation",
                    "completed"
                ].includes(
                    sponsor.status
                )
        ).length;


    const modal =
        document.createElement("div");


    modal.className =
        "sos-modal";


    modal.innerHTML = `

        <div class="sos-overlay"></div>

        <div class="sos-window dashboard-window">

            <button class="sos-close">
                ×
            </button>


            <div class="sos-header">

                <div>

                    <span class="eyebrow">
                        MECHANNIVERSARY 52 /
                        CONTROL CENTER
                    </span>

                    <h1>
                        SPONSORSHIP<br>
                        DASHBOARD
                    </h1>

                </div>

            </div>


            <div class="dashboard-stats">

                <div>
                    <strong>${total}</strong>
                    <span>TOTAL PROSPECT</span>
                </div>

                <div>
                    <strong>${highPriority}</strong>
                    <span>HIGH PRIORITY</span>
                </div>

                <div>
                    <strong>${contacted}</strong>
                    <span>IN PIPELINE</span>
                </div>

                <div>
                    <strong>${deals}</strong>
                    <span>DEAL / ACTIVE</span>
                </div>

            </div>


            <div class="dashboard-grid">

                <button
                    class="dashboard-card"
                    id="dashboard-database">

                    <span>01</span>

                    <strong>
                        SPONSOR DATABASE
                    </strong>

                    <small>
                        Manage all prospects
                    </small>

                </button>


                <button
                    class="dashboard-card"
                    id="dashboard-pipeline">

                    <span>02</span>

                    <strong>
                        PIPELINE
                    </strong>

                    <small>
                        Track partnership progress
                    </small>

                </button>


                <button
                    class="dashboard-card"
                    id="dashboard-playbook">

                    <span>03</span>

                    <strong>
                        PLAYBOOK
                    </strong>

                    <small>
                        Learn the sponsorship process
                    </small>

                </button>


                <button
                    class="dashboard-card"
                    id="dashboard-activity">

                    <span>04</span>

                    <strong>
                        ACTIVITY
                    </strong>

                    <small>
                        See recent actions
                    </small>

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    injectSOSStyles();


    modal.querySelector(
        ".sos-close"
    ).onclick =
        closeAllModals;


    modal.querySelector(
        ".sos-overlay"
    ).onclick =
        closeAllModals;


    modal.querySelector(
        "#dashboard-database"
    ).onclick = () => {

        closeAllModals();

        setTimeout(
            openSponsorDatabase,
            100
        );

    };


    modal.querySelector(
        "#dashboard-pipeline"
    ).onclick = () => {

        closeAllModals();

        setTimeout(
            openPipeline,
            100
        );

    };


    modal.querySelector(
        "#dashboard-playbook"
    ).onclick = () => {

        closeAllModals();

        setTimeout(
            openPlaybook,
            100
        );

    };


    modal.querySelector(
        "#dashboard-activity"
    ).onclick = () => {

        closeAllModals();

        setTimeout(
            openActivity,
            100
        );

    };

}


/* =========================================================
   30 — PIPELINE
   ========================================================= */

function openPipeline() {

    closeAllModals();


    const modal =
        document.createElement("div");


    modal.className =
        "sos-modal";


    modal.innerHTML = `

        <div class="sos-overlay"></div>

        <div class="sos-window pipeline-window">

            <button class="sos-close">
                ×
            </button>


            <span class="eyebrow">
                SPONSORSHIP OS /
                PIPELINE
            </span>


            <h2>
                PARTNERSHIP<br>
                PIPELINE
            </h2>


            <div class="pipeline">

                ${SPONSOR_STATUS.map(
                    status => {

                        const count =
                            APP_DATA.sponsors.filter(
                                sponsor =>
                                    sponsor.status ===
                                    status.id
                            ).length;


                        return `

                            <div class="pipeline-column">

                                <div class="pipeline-column-head">

                                    <span>
                                        ${String(
                                            SPONSOR_STATUS
                                                .indexOf(
                                                    status
                                                ) + 1
                                        ).padStart(
                                            2,
                                            "0"
                                        )}
                                    </span>

                                    <strong>
                                        ${status.label}
                                    </strong>

                                    <em>
                                        ${count}
                                    </em>

                                </div>


                                <div class="pipeline-cards">

                                    ${renderPipelineCards(
                                        status.id
                                    )}

                                </div>

                            </div>

                        `;

                    }
                ).join("")}

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    injectSOSStyles();


    modal.querySelector(".sos-close").onclick =
        closeAllModals;


    modal.querySelector(".sos-overlay").onclick =
        closeAllModals;


    modal.querySelectorAll(
        "[data-pipeline-sponsor]"
    ).forEach(card => {

        card.onclick = () => {

            closeAllModals();

            setTimeout(
                () =>
                    openSponsorDetail(
                        card.dataset.pipelineSponsor
                    ),
                100
            );

        };

    });

}


/* =========================================================
   31 — PIPELINE CARDS
   ========================================================= */

function renderPipelineCards(
    status
) {

    const sponsors =
        APP_DATA.sponsors.filter(
            sponsor =>
                sponsor.status === status
        );


    if (sponsors.length === 0) {

        return `
            <div class="pipeline-empty">
                —
            </div>
        `;

    }


    return sponsors.map(
        sponsor => `

            <button
                class="pipeline-card"
                data-pipeline-sponsor="${sponsor.id}"
            >

                <strong>
                    ${escapeHTML(
                        sponsor.name
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        sponsor.category
                    )}
                </span>

            </button>

        `
    ).join("");

}


/* =========================================================
   32 — PLAYBOOK
   ========================================================= */

function openPlaybook() {

    closeAllModals();


    const modal =
        document.createElement("div");


    modal.className =
        "sos-modal";


    modal.innerHTML = `

        <div class="sos-overlay"></div>

        <div class="sos-window playbook-window">

            <button class="sos-close">
                ×
            </button>


            <span class="eyebrow">
                MECHANNIVERSARY 52 /
                SPONSORSHIP PLAYBOOK
            </span>


            <h2>
                HOW TO<br>
                ACHIEVE THE SPONSOR
            </h2>


            <div class="playbook-list">

                ${Object.entries(
                    STEPS
                ).map(
                    ([number, step]) => `

                        <button
                            class="
                                playbook-row
                                ${
                                    APP_DATA.tasks[
                                        `step-${number}`
                                    ]
                                    ? "completed"
                                    : ""
                                }
                            "
                            data-playbook-step="${number}"
                        >

                            <span>
                                ${step.number}
                            </span>

                            <div>

                                <strong>
                                    ${step.title}
                                </strong>

                                <small>
                                    ${step.subtitle}
                                </small>

                            </div>

                            <em>
                                ${
                                    APP_DATA.tasks[
                                        `step-${number}`
                                    ]
                                    ? "✓"
                                    : "→"
                                }
                            </em>

                        </button>

                    `
                ).join("")}

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    injectSOSStyles();


    modal.querySelector(
        ".sos-close"
    ).onclick =
        closeAllModals;


    modal.querySelector(
        ".sos-overlay"
    ).onclick =
        closeAllModals;


    modal.querySelectorAll(
        "[data-playbook-step]"
    ).forEach(button => {

        button.onclick = () => {

            const step =
                Number(
                    button.dataset.playbookStep
                );


            closeAllModals();


            setTimeout(
                () =>
                    openStep(step),
                100
            );

        };

    });

}


/* =========================================================
   33 — ACTIVITY
   ========================================================= */

function openActivity() {

    closeAllModals();


    const modal =
        document.createElement("div");


    modal.className =
        "sos-modal";


    modal.innerHTML = `

        <div class="sos-overlay"></div>

        <div class="sos-window activity-window">

            <button class="sos-close">
                ×
            </button>


            <span class="eyebrow">
                SPONSORSHIP OS /
                ACTIVITY LOG
            </span>


            <h2>
                RECENT<br>
                ACTIVITY
            </h2>


            <div class="activity-list">

                ${
                    APP_DATA.activity.length
                    ?
                    APP_DATA.activity
                        .slice(0, 30)
                        .map(activity => `

                            <div class="activity-row">

                                <span>
                                    ${formatTime(
                                        activity.timestamp
                                    )}
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        activity.message
                                    )}
                                </strong>

                            </div>

                        `)
                        .join("")
                    :
                    `
                        <div class="empty-state">
                            <strong>
                                NO ACTIVITY YET
                            </strong>
                        </div>
                    `
                }

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    injectSOSStyles();


    modal.querySelector(
        ".sos-close"
    ).onclick =
        closeAllModals;


    modal.querySelector(
        ".sos-overlay"
    ).onclick =
        closeAllModals;

}


/* =========================================================
   34 — EXPORT CSV
   ========================================================= */

function exportCSV() {

    if (
        APP_DATA.sponsors.length === 0
    ) {

        alert(
            "Belum ada data sponsor."
        );

        return;

    }


    const headers = [

        "ID",
        "Company",
        "Category",
        "PIC",
        "Phone",
        "Email",
        "Website",
        "Instagram",
        "Relevance",
        "Audience Fit",
        "Activation",
        "Access",
        "Value",
        "Total Score",
        "Priority",
        "Status",
        "Notes"

    ];


    const rows =
        APP_DATA.sponsors.map(
            sponsor => {

                const score =
                    calculateScore(
                        sponsor
                    );


                return [

                    sponsor.id,
                    sponsor.name,
                    sponsor.category,
                    sponsor.contact,
                    sponsor.phone,
                    sponsor.email,
                    sponsor.website,
                    sponsor.instagram,
                    sponsor.relevance,
                    sponsor.audience,
                    sponsor.activation,
                    sponsor.access,
                    sponsor.value,
                    score,
                    getPriority(score).level,
                    sponsor.status,
                    sponsor.notes

                ];

            }
        );


    const csv = [

        headers,

        ...rows

    ]
    .map(
        row =>
            row
                .map(
                    value =>
                        `"${String(value ?? "")
                            .replace(
                                /"/g,
                                '""'
                            )}"`
                )
                .join(",")
    )
    .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");


    link.href =
        url;


    link.download =
        "mechanniversary52-sponsor-database.csv";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   35 — CLOSE MODALS
   ========================================================= */

function closeAllModals() {

    document
        .querySelectorAll(
            ".sos-modal"
        )
        .forEach(
            modal =>
                modal.remove()
        );

}


/* =========================================================
   36 — ESCAPE
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeAllModals();

        }

    }
);


/* =========================================================
   37 — HTML SAFETY
   ========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


function escapeAttribute(value) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    );

}


/* =========================================================
   38 — TIME FORMAT
   ========================================================= */

function formatTime(timestamp) {

    const date =
        new Date(
            timestamp
        );


    return date.toLocaleString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   39 — GLOBAL STYLE ENGINE
   ========================================================= */

function injectSOSStyles() {

    if (
        document.querySelector(
            "#sos-master-style"
        )
    ) return;


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "sos-master-style";


    style.innerHTML = `

/* =====================================================
   CORE
   ===================================================== */

.sos-modal {

    position: fixed;

    inset: 0;

    z-index: 999999;

}


.sos-overlay {

    position: absolute;

    inset: 0;

    background:
        rgba(0,0,0,.88);

    backdrop-filter:
        blur(10px);

}


.sos-window {

    position: absolute;

    left: 50%;

    top: 50%;

    transform:
        translate(-50%,-50%);

    width:
        min(1100px,94vw);

    max-height:
        90vh;

    overflow-y:
        auto;

    background:
        #041E41;

    border:
        1px solid
        rgba(255,255,255,.15);

    padding:
        45px;

    color:
        white;

    box-shadow:
        0 30px 100px
        rgba(0,0,0,.5);

}


.sos-close {

    position:
        absolute;

    top:
        18px;

    right:
        22px;

    width:
        40px;

    height:
        40px;

    border:
        1px solid
        rgba(255,255,255,.15);

    background:
        transparent;

    color:
        white;

    font-size:
        24px;

    cursor:
        pointer;

}


.sos-close:hover {

    background:
        #FF4D00;

    border-color:
        #FF4D00;

}


.eyebrow {

    display:
        block;

    font-family:
        "DM Mono",
        monospace;

    font-size:
        9px;

    letter-spacing:
        2px;

    color:
        #FF4D00;

}


.sos-window h1 {

    margin:
        20px 0 0;

    font-size:
        clamp(45px,7vw,82px);

    line-height:
        .82;

    letter-spacing:
        -4px;

}


.sos-window h2 {

    margin:
        20px 0 30px;

    font-size:
        clamp(38px,6vw,68px);

    line-height:
        .85;

    letter-spacing:
        -3px;

}


.sos-primary,
.sos-secondary {

    border:
        none;

    padding:
        14px 20px;

    font-family:
        "DM Mono",
        monospace;

    font-size:
        9px;

    letter-spacing:
        1px;

    cursor:
        pointer;

}


.sos-primary {

    background:
        #FF4D00;

    color:
        white;

}


.sos-primary:hover {

    background:
        #FFFFFF;

    color:
        #041E41;

}


.sos-secondary {

    background:
        transparent;

    border:
        1px solid
        rgba(255,255,255,.25);

    color:
        rgba(255,255,255,.7);

}


.sos-secondary:hover {

    border-color:
        #FF4D00;

    color:
        #FF4D00;

}


/* =====================================================
   DATABASE
   ===================================================== */

.database-window {

    width:
        min(1200px,95vw);

}


.sos-header {

    display:
        flex;

    justify-content:
        space-between;

    align-items:
        flex-end;

    margin-bottom:
        35px;

}


.database-stat {

    text-align:
        right;

}


.database-stat strong {

    display:
        block;

    font-size:
        55px;

    line-height:
        .8;

    color:
        #FF4D00;

}


.database-stat span {

    display:
        block;

    margin-top:
        10px;

    font-family:
        monospace;

    font-size:
        8px;

    color:
        rgba(255,255,255,.4);

}


.database-actions {

    display:
        flex;

    gap:
        10px;

    margin-bottom:
        20px;

}


.database-toolbar {

    display:
        grid;

    grid-template-columns:
        1fr 200px;

    gap:
        10px;

    margin-bottom:
        25px;

}


.database-toolbar input,
.database-toolbar select {

    width:
        100%;

    box-sizing:
        border-box;

    padding:
        14px;

    background:
        rgba(255,255,255,.04);

    border:
        1px solid
        rgba(255,255,255,.15);

    color:
        white;

    outline:
        none;

}


.database-toolbar input:focus {

    border-color:
        #FF4D00;

}


.database-toolbar option {

    background:
        #041E41;

}


.sponsor-table {

    overflow-x:
        auto;

}


.sponsor-table-head,
.sponsor-table-row {

    display:
        grid;

    grid-template-columns:
        2fr 1fr 100px 110px 130px 35px;

    gap:
        15px;

    align-items:
        center;

    min-width:
        800px;

}


.sponsor-table-head {

    padding:
        12px 15px;

    font-family:
        monospace;

    font-size:
        8px;

    color:
        rgba(255,255,255,.35);

    border-bottom:
        1px solid
        rgba(255,255,255,.12);

}


.sponsor-table-row {

    padding:
        18px 15px;

    border-bottom:
        1px solid
        rgba(255,255,255,.08);

    font-size:
        11px;

    color:
        rgba(255,255,255,.6);

}


.sponsor-table-row:hover {

    background:
        rgba(255,255,255,.035);

}


.company-cell strong {

    display:
        block;

    color:
        white;

    margin-bottom:
        5px;

}


.company-cell small {

    color:
        rgba(255,255,255,.35);

    font-size:
        9px;

}


.score-cell {

    color:
        #FF4D00;

    font-family:
        monospace;

}


.priority-badge,
.status-badge {

    display:
        inline-block;

    padding:
        5px 8px;

    font-family:
        monospace;

    font-size:
        8px;

    border:
        1px solid;

}


.priority-a {

    color:
        #FF4D00;

    border-color:
        #FF4D00;

}


.priority-b {

    color:
        white;

    border-color:
        rgba(255,255,255,.35);

}


.priority-c {

    color:
        rgba(255,255,255,.35);

    border-color:
        rgba(255,255,255,.15);

}


.status-badge {

    color:
        rgba(255,255,255,.55);

    border-color:
        rgba(255,255,255,.2);

}


.row-open {

    border:
        none;

    background:
        transparent;

    color:
        #FF4D00;

    font-size:
        18px;

    cursor:
        pointer;

}


.empty-state {

    padding:
        80px 20px;

    text-align:
        center;

    border:
        1px dashed
        rgba(255,255,255,.15);

}


.empty-state strong {

    display:
        block;

    font-family:
        monospace;

    font-size:
        10px;

    color:
        rgba(255,255,255,.5);

}


.empty-state span {

    display:
        block;

    margin-top:
        10px;

    font-size:
        11px;

    color:
        rgba(255,255,255,.3);

}


/* =====================================================
   FORM
   ===================================================== */

.form-window {

    width:
        min(850px,94vw);

}


.form-section {

    margin:
        30px 0;

}


.form-section-title {

    display:
        block;

    margin-bottom:
        15px;

    font-family:
        monospace;

    font-size:
        9px;

    letter-spacing:
        1.5px;

    color:
        #FF4D00;

}


.form-grid {

    display:
        grid;

    grid-template-columns:
        1fr 1fr;

    gap:
        10px;

}


.form-grid input,
.form-grid select,
.form-section textarea {

    width:
        100%;

    box-sizing:
        border-box;

    padding:
        14px;

    background:
        rgba(255,255,255,.04);

    border:
        1px solid
        rgba(255,255,255,.15);

    color:
        white;

    outline:
        none;

}


.form-section textarea {

    min-height:
        100px;

    margin-top:
        10px;

    resize:
        vertical;

}


.form-grid input:focus,
.form-grid select:focus,
.form-section textarea:focus {

    border-color:
        #FF4D00;

}


.form-grid select option {

    background:
        #041E41;

}


.score-grid {

    display:
        grid;

    grid-template-columns:
        repeat(5,1fr);

    gap:
        10px;

}


.score-input label {

    display:
        block;

    margin-bottom:
        8px;

    font-family:
        monospace;

    font-size:
        8px;

    color:
        rgba(255,255,255,.45);

}


.score-buttons {

    display:
        flex;

    gap:
        4px;

}


.score-button {

    flex:
        1;

    aspect-ratio:
        1;

    border:
        1px solid
        rgba(255,255,255,.18);

    background:
        transparent;

    color:
        rgba(255,255,255,.5);

    cursor:
        pointer;

}


.score-button:hover,
.score-button.selected {

    background:
        #FF4D00;

    border-color:
        #FF4D00;

    color:
        white;

}


.form-footer {

    display:
        flex;

    justify-content:
        flex-end;

    gap:
        10px;

    padding-top:
        25px;

    border-top:
        1px solid
        rgba(255,255,255,.12);

}


/* =====================================================
   DETAIL
   ===================================================== */

.detail-top {

    display:
        flex;

    justify-content:
        space-between;

    align-items:
        flex-start;

}


.detail-top h2 {

    margin-bottom:
        10px;

}


.detail-category {

    font-family:
        monospace;

    font-size:
        9px;

    color:
        rgba(255,255,255,.4);

}


.detail-score {

    text-align:
        right;

}


.detail-score strong {

    font-size:
        70px;

    line-height:
        .8;

    color:
        #FF4D00;

}


.detail-score span {

    font-family:
        monospace;

    color:
        rgba(255,255,255,.4);

}


.detail-score small {

    display:
        block;

    margin-top:
        10px;

    font-family:
        monospace;

    font-size:
        8px;

    color:
        rgba(255,255,255,.45);

}


.detail-status {

    display:
        flex;

    flex-wrap:
        wrap;

    gap:
        5px;

    padding:
        20px 0;

    margin:
        30px 0;

    border-top:
        1px solid
        rgba(255,255,255,.1);

    border-bottom:
        1px solid
        rgba(255,255,255,.1);

}


.status-control {

    padding:
        8px 10px;

    border:
        1px solid
        rgba(255,255,255,.15);

    background:
        transparent;

    color:
        rgba(255,255,255,.45);

    font-family:
        monospace;

    font-size:
        8px;

    cursor:
        pointer;

}


.status-control:hover,
.status-control.active {

    background:
        #FF4D00;

    color:
        white;

    border-color:
        #FF4D00;

}


.detail-grid {

    display:
        grid;

    grid-template-columns:
        1fr 1fr;

    gap:
        30px;

}


.info-list {

    display:
        grid;

    gap:
        15px;

}


.info-list div {

    padding:
        12px 0;

    border-bottom:
        1px solid
        rgba(255,255,255,.08);

}


.info-list small {

    display:
        block;

    font-family:
        monospace;

    font-size:
        8px;

    color:
        rgba(255,255,255,.35);

    margin-bottom:
        5px;

}


.info-list strong {

    font-size:
        12px;

}


.notes-panel {

    padding:
        20px;

    background:
        rgba(255,255,255,.04);

    color:
        rgba(255,255,255,.65);

    line-height:
        1.6;

    min-height:
        100px;

}


.detail-actions {

    display:
        flex;

    justify-content:
        flex-end;

    gap:
        10px;

    margin-top:
        35px;

}


/* =====================================================
   STEP
   ===================================================== */

.step-window {

    width:
        min(950px,94vw);

}


.step-heading {

    display:
        flex;

    gap:
        25px;

    align-items:
        flex-start;

}


.step-number {

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    width:
        65px;

    height:
        65px;

    flex:
        0 0 65px;

    background:
        #FF4D00;

    font-family:
        monospace;

    font-size:
        16px;

}


.step-subtitle {

    font-family:
        monospace;

    font-size:
        9px;

    letter-spacing:
        1.5px;

    color:
        rgba(255,255,255,.4);

}


.step-objective {

    padding:
        25px;

    margin:
        35px 0;

    background:
        rgba(255,255,255,.04);

    border-left:
        3px solid
        #FF4D00;

}


.step-objective p {

    margin:
        0;

    color:
        rgba(255,255,255,.7);

    line-height:
        1.6;

}


.step-grid {

    display:
        grid;

    grid-template-columns:
        1fr 1fr;

    gap:
        30px;

}


.mindset-box {

    padding:
        25px;

    background:
        #8B0101;

    color:
        rgba(255,255,255,.85);

    line-height:
        1.6;

}


.step-checklist {

    display:
        grid;

    gap:
        2px;

}


.step-checklist label {

    display:
        flex;

    gap:
        12px;

    align-items:
        flex-start;

    padding:
        14px;

    background:
        rgba(255,255,255,.03);

    color:
        rgba(255,255,255,.7);

    font-size:
        12px;

    cursor:
        pointer;

}


.step-checklist label:hover {

    background:
        rgba(255,77,0,.08);

}


.step-check {

    appearance:
        none;

    width:
        17px;

    height:
        17px;

    flex:
        0 0 17px;

    margin:
        0;

    border:
        1px solid
        rgba(255,255,255,.3);

}


.step-check:checked {

    background:
        #FF4D00;

    border-color:
        #FF4D00;

}


.step-check:checked::after {

    content:
        "✓";

    display:
        block;

    text-align:
        center;

    color:
        white;

    font-size:
        12px;

}


.step-check:checked + span {

    text-decoration:
        line-through;

    opacity:
        .4;

}


.step-output {

    margin-top:
        30px;

    padding:
        20px;

    border:
        1px solid
        rgba(255,255,255,.12);

}


.step-output strong {

    color:
        rgba(255,255,255,.7);

    font-size:
        12px;

}


.step-footer {

    display:
        flex;

    justify-content:
        space-between;

    align-items:
        center;

    margin-top:
        35px;

    padding-top:
        25px;

    border-top:
        1px solid
        rgba(255,255,255,.12);

    font-family:
        monospace;

    font-size:
        8px;

    color:
        rgba(255,255,255,.35);

}


.step-footer strong {

    color:
        white;

}


/* =====================================================
   DASHBOARD
   ===================================================== */

.dashboard-window {

    width:
        min(1000px,94vw);

}


.dashboard-stats {

    display:
        grid;

    grid-template-columns:
        repeat(4,1fr);

    border:
        1px solid
        rgba(255,255,255,.12);

    margin:
        35px 0;

}


.dashboard-stats div {

    padding:
        25px;

    border-right:
        1px solid
        rgba(255,255,255,.12);

}


.dashboard-stats div:last-child {

    border:
        none;

}


.dashboard-stats strong {

    display:
        block;

    font-size:
        40px;

    color:
        #FF4D00;

}


.dashboard-stats span {

    display:
        block;

    margin-top:
        8px;

    font-family:
        monospace;

    font-size:
        8px;

    color:
        rgba(255,255,255,.35);

}


.dashboard-grid {

    display:
        grid;

    grid-template-columns:
        1fr 1fr;

    gap:
        10px;

}


.dashboard-card {

    text-align:
        left;

    padding:
        30px;

    background:
        rgba(255,255,255,.035);

    border:
        1px solid
        rgba(255,255,255,.1);

    color:
        white;

    cursor:
        pointer;

}


.dashboard-card:hover {

    border-color:
        #FF4D00;

    background:
        rgba(255,77,0,.08);

}


.dashboard-card span {

    display:
        block;

    font-family:
        monospace;

    font-size:
        9px;

    color:
        #FF4D00;

    margin-bottom:
        30px;

}


.dashboard-card strong {

    display:
        block;

    font-size:
        20px;

}


.dashboard-card small {

    display:
        block;

    margin-top:
        8px;

    color:
        rgba(255,255,255,.4);

}


/* =====================================================
   PIPELINE
   ===================================================== */

.pipeline-window {

    width:
        min(1400px,96vw);

}


.pipeline {

    display:
        flex;

    gap:
        10px;

    overflow-x:
        auto;

    padding-bottom:
        15px;

}


.pipeline-column {

    min-width:
        180px;

    flex:
        1;

    background:
        rgba(255,255,255,.025);

    border:
        1px solid
        rgba(255,255,255,.08);

}


.pipeline-column-head {

    padding:
        15px;

    border-bottom:
        1px solid
        rgba(255,255,255,.1);

}


.pipeline-column-head span {

    font-family:
        monospace;

    font-size:
        8px;

    color:
        #FF4D00;

}


.pipeline-column-head strong {

    display:
        block;

    margin:
        10px 0;

    font-size:
        11px;

}


.pipeline-column-head em {

    font-style:
        normal;

    font-family:
        monospace;

    font-size:
        9px;

    color:
        rgba(255,255,255,.35);

}


.pipeline-cards {

    padding:
        8px;

    min-height:
        150px;

}


.pipeline-card {

    width:
        100%;

    text-align:
        left;

    padding:
        14px;

    margin-bottom:
        6px;

    background:
        #041E41;

    border:
        1px solid
        rgba(255,255,255,.12);

    color:
        white;

    cursor:
        pointer;

}


.pipeline-card:hover {

    border-color:
        #FF4D00;

}


.pipeline-card strong {

    display:
        block;

    font-size:
        11px;

    margin-bottom:
        5px;

}


.pipeline-card span {

    font-family:
        monospace;

    font-size:
        8px;

    color:
        rgba(255,255,255,.35);

}


.pipeline-empty {

    text-align:
        center;

    padding:
        50px 10px;

    color:
        rgba(255,255,255,.15);

}


/* =====================================================
   PLAYBOOK
   ===================================================== */

.playbook-window {

    width:
        min(850px,94vw);

}


.playbook-list {

    display:
        grid;

    gap:
        3px;

}


.playbook-row {

    display:
        grid;

    grid-template-columns:
        60px 1fr 30px;

    align-items:
        center;

    text-align:
        left;

    padding:
        20px;

    background:
        rgba(255,255,255,.035);

    border:
        1px solid
        transparent;

    color:
        white;

    cursor:
        pointer;

}


.playbook-row:hover {

    border-color:
        #FF4D00;

    background:
        rgba(255,77,0,.08);

}


.playbook-row.completed {

    opacity:
        .5;

}


.playbook-row > span {

    font-family:
        monospace;

    color:
        #FF4D00;

}


.playbook-row strong {

    display:
        block;

    font-size:
        14px;

}


.playbook-row small {

    display:
        block;

    margin-top:
        5px;

    font-family:
        monospace;

    font-size:
        8px;

    color:
        rgba(255,255,255,.35);

}


.playbook-row em {

    font-style:
        normal;

    color:
        #FF4D00;

}


/* =====================================================
   ACTIVITY
   ===================================================== */

.activity-window {

    width:
        min(800px,94vw);

}


.activity-list {

    border-top:
        1px solid
        rgba(255,255,255,.1);

}


.activity-row {

    display:
        grid;

    grid-template-columns:
        130px 1fr;

    gap:
        20px;

    padding:
        16px 0;

    border-bottom:
        1px solid
        rgba(255,255,255,.08);

}


.activity-row span {

    font-family:
        monospace;

    font-size:
        8px;

    color:
        rgba(255,255,255,.3);

}


.activity-row strong {

    font-size:
        11px;

    font-weight:
        normal;

    color:
        rgba(255,255,255,.7);

}


/* =====================================================
   COMPLETION
   ===================================================== */

.completion-window {

    width:
        min(550px,90vw);

    text-align:
        center;

    padding:
        70px 45px;

}


.completion-mark {

    width:
        75px;

    height:
        75px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    margin:
        35px auto;

    background:
        #FF4D00;

    font-size:
        30px;

}


.completion-window p {

    color:
        rgba(255,255,255,.5);

    margin-bottom:
        30px;

}


/* =====================================================
   RESPONSIVE
   ===================================================== */

@media(max-width:750px) {

    .sos-window {

        padding:
            30px 20px;

    }


    .sos-window h1 {

        font-size:
            45px;

    }


    .sos-window h2 {

        font-size:
            40px;

    }


    .database-stat {

        display:
            none;

    }


    .database-toolbar {

        grid-template-columns:
            1fr;

    }


    .form-grid {

        grid-template-columns:
            1fr;

    }


    .score-grid {

        grid-template-columns:
            1fr;

    }


    .score-buttons {

        max-width:
            300px;

    }


    .detail-grid,
    .step-grid {

        grid-template-columns:
            1fr;

    }


    .dashboard-stats {

        grid-template-columns:
            1fr 1fr;

    }


    .dashboard-stats div:nth-child(2) {

        border-right:
            none;

    }


    .dashboard-grid {

        grid-template-columns:
            1fr;

    }


    .step-heading {

        gap:
            15px;

    }


    .step-number {

        width:
            50px;

        height:
            50px;

        flex-basis:
            50px;

    }


    .detail-top {

        flex-direction:
            column;

        gap:
            30px;

    }


    .detail-score {

        text-align:
            left;

    }


    .activity-row {

        grid-template-columns:
            1fr;

        gap:
            5px;

    }

}

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   40 — CONNECT EXISTING HTML
   ========================================================= */

function initializeExistingInterface() {

    /*
       FLOWCHART / STEP CARDS
    */

    document
        .querySelectorAll(
            ".step"
        )
        .forEach(
            (card, index) => {

                card.addEventListener(
                    "click",
                    () => {

                        openStep(
                            index + 1
                        );

                    }
                );

            }
        );


    /*
       PLAYBOOK CARDS
    */

    document
        .querySelectorAll(
            ".card"
        )
        .forEach(
            (card, index) => {

                card.addEventListener(
                    "click",
                    () => {

                        openStep(
                            index + 1
                        );

                    }
                );

            }
        );


    /*
       START BUTTON
    */

    const startButton =
        document.querySelector(
            ".button"
        );


    if (startButton) {

        startButton.addEventListener(
            "click",
            event => {

                event.preventDefault();


                const target =
                    document.querySelector(
                        "#alur"
                    );


                if (target) {

                    target.scrollIntoView({
                        behavior:
                            "smooth"
                    });

                }

            }
        );

    }


    /*
       OPTIONAL DASHBOARD BUTTON
    */

    document
        .querySelectorAll(
            "[data-open-dashboard]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    openDashboard
                );

            }
        );


    /*
       OPTIONAL DATABASE BUTTON
    */

    document
        .querySelectorAll(
            "[data-open-database]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    openSponsorDatabase
                );

            }
        );

}


/* =========================================================
   41 — BOOT
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeExistingInterface();


        console.log(
            "%cMECHANNIVERSARY 52",
            "font-size:22px;font-weight:900;"
        );


        console.log(
            "%cSPONSORSHIP OPERATING SYSTEM",
            "font-size:11px;letter-spacing:2px;"
        );


        console.log(
            `%c${APP_DATA.sponsors.length} prospects loaded.`,
            "font-size:10px;"
        );

    }
);