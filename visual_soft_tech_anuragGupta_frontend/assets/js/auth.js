$(document).ready(function () {

    $("#btnLogin").click(function () {
        const username = $("#username").val().trim();
        const password = $("#password").val().trim();

        if (username === "" || password === "") {
            Swal.fire("Error", "Please enter both username and password.", "error");
            return;
        }

        $.ajax({
            url: "https://localhost:7232/api/Auth/login", // 🔹 Backend API URL
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                username: username,
                password: password
            }),
            success: function (response) {
                // Save JWT token in localStorage
                localStorage.setItem("jwtToken", response.token);
                localStorage.setItem("username", response.username);
               

                Swal.fire({
                    title: "Login Successful!",
                    text: "Redirecting to dashboard...",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "index.html";
                });
            },
            error: function (xhr) {
                if (xhr.status === 401)
                    Swal.fire("Invalid", "Invalid Username or Password!", "error");
                else
                    Swal.fire("Error", "Something went wrong!", "error");
            }
        });
    });
});
