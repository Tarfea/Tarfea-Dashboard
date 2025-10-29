// public/js/login.js

  const API_BASE = window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://tarfeadashboard.vercel.app/";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");

    // Redirect if already logged in
    const token = localStorage.getItem("token");
    if (token) window.location.replace("index.html");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const res = await fetch(`${API_BASE}/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            console.log(data);


            if (!res.ok) {
                Swal.fire({
                    icon: "error",
                    title: "Login Failed",
                    text: data.error || "Invalid email or password",
                });
                return;
            }

            // Store token and userId
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.userId);

            Swal.fire({
                icon: "success",
                title: "Login Successful!",
                text: "Redirecting to dashboard...",
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                window.location.replace("index.html");
            });
        } catch (err) {
            console.error("Login error:", err);
            Swal.fire({
                icon: "error",
                title: "Server Error",
                text: "Please try again later.",
            });
        }
    });

    // Password toggle
    const togglePass = document.querySelector(".show-pass.eye");
    if (togglePass) {
        const passwordInput = document.getElementById("password");
        const eyeSlash = togglePass.querySelector(".fa-eye-slash");
        const eye = togglePass.querySelector(".fa-eye");
        eye.style.display = "none";

        togglePass.addEventListener("click", () => {
            const type = passwordInput.type === "password" ? "text" : "password";
            passwordInput.type = type;
            eye.style.display = type === "text" ? "inline" : "none";
            eyeSlash.style.display = type === "text" ? "none" : "inline";
        });
    }

    // Prevent back to login page after login
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => {
        if (localStorage.getItem("token")) {
            window.location.replace("index.html");
        } else {
            window.history.pushState(null, "", window.location.href);
        }
    };
});
