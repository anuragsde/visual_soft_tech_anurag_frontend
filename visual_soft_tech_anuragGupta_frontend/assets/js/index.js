$(document).ready(function () {
    const token = localStorage.getItem("jwtToken");

    // 🔹 1. Token check
    if (!token) {
        Swal.fire("Unauthorized", "Please login first!", "warning").then(() => {
            window.location.href = "login.html";
        });
        return;
    }

    // 🔹 2. Logout button click
    $("#btnLogout").click(function () {
        Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Logout",
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                window.location.href = "login.html";
            }
        });
    });

    // 🔹 3. Load Students Data
    function loadStudents() {
        $("tbody").html("<tr><td colspan='8' class='text-center'>Loading students...</td></tr>");

        $.ajax({
            url: "https://localhost:7232/api/Students",
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                if (data.length === 0) {
                    $("tbody").html("<tr><td colspan='8' class='text-center'>No records found.</td></tr>");
                    return;
                }

                let rows = "";
                data.forEach((s) => {
                    const subjects = s.subjects.map(sub => sub.subjectName).join(", ");
                    rows += `
                        <tr data-id="${s.studentId}">
                            <td>${s.name}</td>
                            <td>${s.age}</td>
                            <td>${s.address || '-'}</td>
                            <td>${s.stateName || '-'}</td>
                            <td>${s.phone}</td>
                            <td>${s.photoPath ? `<img src="${s.photoPath}" width="60" class="rounded" />` : '-'}</td>
                            <td>${subjects || '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-primary btn-edit">Edit</button>
                                <button class="btn btn-sm btn-danger btn-delete">Delete</button>
                            </td>
                        </tr>
                    `;
                });
                $("tbody").html(rows);
            },
            error: function (xhr) {
                if (xhr.status === 401) {
                    Swal.fire("Unauthorized", "Session expired, please login again!", "warning").then(() => {
                        window.location.href = "login.html";
                    });
                } else {
                    Swal.fire("Error", "Unable to fetch students!", "error");
                }
            }
        });
    }

    loadStudents();

    // 🔹 4. Edit button
    $(document).on("click", ".btn-edit", function () {
        const id = $(this).closest("tr").data("id");
        window.location.href = `edit.html?id=${id}`;
    });

    // 🔹 5. Delete button
    $(document).on("click", ".btn-delete", function () {
        const id = $(this).closest("tr").data("id");

        Swal.fire({
            title: "Are you sure?",
            text: "This student record will be deleted permanently!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Delete",
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `https://localhost:7232/api/Students/${id}`,
                    method: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + token
                    },
                    success: function () {
                        Swal.fire("Deleted!", "Record deleted successfully.", "success");
                        loadStudents();
                    },
                    error: function () {
                        Swal.fire("Error", "Unable to delete record!", "error");
                    }
                });
            }
        });
    });
});
