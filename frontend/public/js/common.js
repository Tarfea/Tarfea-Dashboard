// public/js/common.js
document.addEventListener("DOMContentLoaded", () => {
    // --- 1️⃣ Disable browser caching ---
    if ("serviceWorker" in navigator) {
        window.addEventListener("pageshow", function (event) {
            if (event.persisted) {
                window.location.reload();
            }
        });
    }

    // --- 2️⃣ Token check: redirect to login if no token ---
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.replace("page-login.html");
        return;
    }

    // --- 3️⃣ Prevent back navigation after logout ---
    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", function () {
        if (!localStorage.getItem("token")) {
            window.location.replace("page-login.html");
        } else {
            window.history.pushState(null, null, window.location.href);
        }
    });

    // --- 4️⃣ Logout button ---
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();

            Swal.fire({
                title: "Are you sure?",
                text: "You will be logged out!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, logout!",
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem("token");
                    window.location.replace("page-login.html");
                }
            });
        });
    }

    // --- 5️⃣ Optional: periodic check if token is expired ---
    setInterval(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.replace("page-login.html");
        } else {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                const now = Date.now() / 1000;
                if (payload.exp && payload.exp < now) {
                    localStorage.removeItem("token");
                    window.location.replace("page-login.html");
                }
            } catch {
                localStorage.removeItem("token");
                window.location.replace("page-login.html");
            }
        }
    }, 5 * 60 * 1000); // check every 5 minutes
});

/* ============================================================
   🧩 Helper Functions for Auth & Secure Fetch
   ============================================================ */

// ✅ Generate secure headers (with token)
function getAuthHeaders() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.replace("page-login.html");
        throw new Error("No token found");
    }

    // Check JWT expiry
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Date.now() / 1000;
        if (payload.exp && payload.exp < now) {
            localStorage.removeItem("token");
            window.location.replace("page-login.html");
            throw new Error("Token expired");
        }
    } catch {
        localStorage.removeItem("token");
        window.location.replace("page-login.html");
        throw new Error("Invalid token");
    }

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

// ✅ Global safe fetch wrapper with token + 401 handling
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.replace("page-login.html");
        throw new Error("No token found");
    }

    // Ensure headers exist
    options.headers = options.headers || {};
    options.headers["Authorization"] = `Bearer ${token}`;
    if (!options.headers["Content-Type"]) {
        options.headers["Content-Type"] = "application/json";
    }

    try {
        const res = await fetch(url, options);

        // If token expired / invalid → redirect
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            Swal.fire({
                icon: "warning",
                title: "Session Expired",
                text: "Please log in again.",
                timer: 1500,
                showConfirmButton: false,
            }).then(() => window.location.replace("page-login.html"));
            throw new Error("Unauthorized or expired token");
        }

        return res;
    } catch (err) {
        console.error("Fetch error:", err);
        throw err;
    }
}
