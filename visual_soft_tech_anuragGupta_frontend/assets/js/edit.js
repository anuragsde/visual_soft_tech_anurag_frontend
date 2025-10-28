$(document).ready(function () {

    const token = localStorage.getItem("jwtToken");
    if (!token) {
        Swal.fire("Access Denied", "Please login first!", "warning").then(() => {
            window.location.href = "login.html";
        });
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get("id");

    if (!studentId) {
        Swal.fire("Error", "Invalid student ID!", "error").then(() => {
            window.location.href = "index.html";
        });
        return;
    }

    // 🔹 Load states first
    loadStates();

    function loadStates() {
        $.ajax({
            url: "https://localhost:7232/api/States",
            method: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (data) {
                const dropdown = $("#stateId");
                dropdown.append('<option value="">Select State</option>');
                data.forEach(state => {
                    dropdown.append(`<option value="${state.id}">${state.name}</option>`);
                });

                // Load student data only after states are ready
                loadStudent();
            }
        });
    }

    // 🔹 Load student data
    function loadStudent() {
        $.ajax({
            url: `https://localhost:7232/api/Students/${studentId}`,
            method: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function (student) {
                $("#studentId").val(student.studentId);
                $("#name").val(student.name);
                $("#age").val(student.age);
                $("#address").val(student.address);
                $("#stateId").val(student.stateId);
                $("#phone").val(student.phone);

                // Subjects load
                const tbody = $("#subjectTable tbody");
                tbody.empty();
                student.subjects.forEach(sub => {
                    tbody.append(`
                        <tr data-detailid="${sub.detailId || 0}">
                            <td><input type="text" class="form-control subjectName" value="${sub.subjectName}"></td>
                            <td class="text-center">
                                <button type="button" class="btn btn-danger btn-sm deleteRow">X</button>
                            </td>
                        </tr>
                    `);
                });
            },
            error: function () {
                Swal.fire("Error", "Failed to load student details!", "error");
            }
        });
    }

    // 🔹 Add new subject
    $("#addSubject").click(function () {
        $("#subjectTable tbody").append(`
            <tr data-detailid="0">
                <td><input type="text" class="form-control subjectName" placeholder="Enter Subject"></td>
                <td class="text-center">
                    <button type="button" class="btn btn-danger btn-sm deleteRow">X</button>
                </td>
            </tr>
        `);
    });

    // 🔹 Delete subject row
    $(document).on("click", ".deleteRow", function () {
        $(this).closest("tr").remove();
    });

    // 🔹 Update student with password check
    $("#editForm").on("submit", function (e) {
        e.preventDefault();

        Swal.fire({
            title: "Enter Password",
            input: "password",
            inputLabel: "Please enter password to confirm update",
            inputPlaceholder: "Enter 72991",
            inputAttributes: { maxlength: 10, autocapitalize: "off", autocorrect: "off" },
            showCancelButton: true,
            confirmButtonText: "Verify"
        }).then(result => {
            if (result.isConfirmed && result.value === "72991") {
                updateStudent();
            } else if (result.isConfirmed) {
                Swal.fire("Wrong Password", "Update cancelled!", "error");
            }
        });
    });

   // 🔹 Actual update logic (final version)
function updateStudent() {
    const student = {
        studentId: $("#studentId").val(),
        name: $("#name").val(),
        age: $("#age").val(),
        address: $("#address").val(),
        stateId: $("#stateId").val(),
        phone: $("#phone").val(),
        photoPath: $("#photo")[0].files[0] ? $("#photo")[0].files[0].name : "",
        subjects: $(".subjectName").map(function () {
            return { subjectName: $(this).val() };
        }).get()
    };

    $.ajax({
        url: `https://localhost:7232/api/Students/${student.studentId}`,
        method: "PUT",
        headers: { "Authorization": "Bearer " + token },
        contentType: "application/json",
        data: JSON.stringify(student),
        success: function () {
            Swal.fire({
                title: "Success!",
                text: "Student updated successfully!",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            }).then(() => window.location.href = "index.html");
        },
        error: function (xhr) {
            console.error(xhr);
            Swal.fire("Error", "Failed to update student!", "error");
        }
    });
}

});
