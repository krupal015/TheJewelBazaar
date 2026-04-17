const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    try {
        const res = await fetch("http://localhost:5000/api/v1/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message);
            return;
        }

        // ✅ Save token
        localStorage.setItem("accessToken", data.accessToken);

        // ✅ Redirect
        window.location.href = "dashboard.html";

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
});