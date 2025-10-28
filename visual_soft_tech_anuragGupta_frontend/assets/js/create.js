$(document).ready(function () {

    const token = localStorage.getItem("jwtToken");
    if (!token) {
        Swal.fire("Access Denied", "Please login first!", "warning").then(() => {
            window.location.href = "login.html";
        });
        return;
    }

    // 🔹 Load States in dropdown
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
            },
            error: function () {
                Swal.fire("Error", "Failed to load states", "error");
            }
        });
    }

    // 🔹 Add Subject Row
    $("#addSubject").click(function () {
        $("#subjectTable tbody").append(`
            <tr>
                <td><input type="text" class="form-control subjectName" placeholder="Enter Subject"></td>
                <td class="text-center">
                    <button type="button" class="btn btn-danger btn-sm deleteRow">X</button>
                </td>
            </tr>
        `);
    });

    // 🔹 Delete Subject Row
    $(document).on("click", ".deleteRow", function () {
        $(this).closest("tr").remove();
    });

    // 🔹 Submit Create Form
    $("#studentForm").on("submit", function (e) {
        e.preventDefault();

        const name = $("#name").val().trim();
        const age = $("#age").val();
        const address = $("#address").val().trim();
        const stateId = $("#stateId").val();
        const phone = $("#phone").val().trim();
        const photoFile = $("#photo")[0].files[0];

        if (!name || !age || !stateId || !phone) {
            Swal.fire("Validation Error", "Please fill all required fields.", "warning");
            return;
        }

        // 🔹 Subjects array बनाना
        const subjects = [];
        $(".subjectName").each(function () {
            const val = $(this).val().trim();
            if (val) subjects.push({ subjectName: val });
        });

        // 🔹 FormData बनाना (file upload + JSON दोनों के लिए)
        const formData = new FormData();
        formData.append("Name", name);
        formData.append("Age", age);
        formData.append("Address", address);
        formData.append("StateId", stateId);
        formData.append("Phone", phone);
        formData.append("SubjectsJson", JSON.stringify(subjects));
        if (photoFile) {
            formData.append("Photo", photoFile);
        }

        $.ajax({
            url: "https://localhost:7232/api/Students/upload", // ✅ सही endpoint
            method: "POST",
            headers: { "Authorization": "Bearer " + token },
            processData: false,
            contentType: false,
            data: formData,
            success: function (response) {
                Swal.fire({
                    title: "Success!",
                    text: response.message || "Student added successfully!",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "index.html";
                });
            },
            error: function (xhr) {
                console.error(xhr);
                Swal.fire("Error", "Failed to save student.", "error");
            }
        });
    });
});
