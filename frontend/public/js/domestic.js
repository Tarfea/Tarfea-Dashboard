// public/js/domestic.js

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#example5 tbody");
  const tableSearch = document.getElementById("tableSearch");
  let domesticTable = null;

  // --- Status Helper ---
  function getStatus(damanExp) {
    const today = new Date();
    const expDate = new Date(damanExp);
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Expired", color: "red", rank: 0 };
    if (diffDays <= 30) return { text: "Nearly Expired", color: "orange", rank: 1 };
    return { text: "Active", color: "green", rank: 2 };
  }

  function formatDateDDMMYYYY(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  }

  function escapeHtml(text) {
    if (text === undefined || text === null) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- Load Data (with full DataTable refresh) ---
  async function loadDomesticData() {
    try {
      const res = await fetchWithAuth("/api/domestic", {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch data");

      let data = await res.json();

      // Sort by status & expiry
      data.sort((a, b) => {
        const aRank = getStatus(a.damanExp).rank;
        const bRank = getStatus(b.damanExp).rank;
        if (aRank !== bRank) return aRank - bRank;
        return new Date(a.damanExp) - new Date(b.damanExp);
      });

      // ✅ If DataTable exists, clear and reload data instead of reinitializing
      if (domesticTable) {
        domesticTable.clear().destroy();
      }

      // Clear HTML table body
      tableBody.innerHTML = "";

      data.forEach((item) => {
        const { text: statusText, color: statusColor } = getStatus(item.damanExp);
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>
            <div class="checkbox text-end align-self-center">
              <div class="form-check custom-checkbox">
                <input type="checkbox" class="form-check-input" />
              </div>
            </div>
          </td>
          <td>${escapeHtml(item.sponsor)}</td>
          <td>${escapeHtml(item.contact)}</td>
          <td>${escapeHtml(item.housemaid)}</td>
          <td>${formatDateDDMMYYYY(item.damanExp)}</td>
          <td><span class="fw-bold" style="color:${statusColor}">${statusText}</span></td>
          <td class="text-end">
            <a href="#" class="edit-btn me-3" data-id="${item._id}">
              <i class="fa fa-pencil fs-18 text-success"></i>
            </a>
            <a href="#" class="delete-btn" data-id="${item._id}">
              <i class="fa fa-trash fs-18 text-danger"></i>
            </a>
          </td>
        `;
        tableBody.appendChild(row);
      });

      // ✅ Reinitialize DataTable cleanly
      domesticTable = $("#example5").DataTable({
        pageLength: 10,
        lengthChange: false,
        info: false,
        ordering: true,
        order: [],
        columnDefs: [{ orderable: false, targets: [0, 6] }],
        dom: "lrtip",
      });

      if (tableSearch) {
        tableSearch.oninput = function () {
          domesticTable.search(this.value).draw();
        };
      }

    } catch (err) {
      console.error("Error loading domestic data:", err);
    }
  }

  // --- Add ---
  document.getElementById("addDomesticForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const damanExp = document.getElementById("addDamanExp").value;
      const { text: status } = getStatus(damanExp);

      const payload = {
        sponsor: document.getElementById("addSponsor").value,
        contact: document.getElementById("addContact").value,
        housemaid: document.getElementById("addHousemaid").value,
        damanExp,
        status,
      };

      const res = await fetchWithAuth("/api/domestic", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Add failed");

      bootstrap.Modal.getInstance(document.getElementById("addDomesticModal"))?.hide();
      e.target.reset();
      await loadDomesticData();
      Swal.fire("Added!", "Record added successfully.", "success");
    } catch (err) {
      console.error("Add error:", err);
      Swal.fire("Error", "Failed to add record.", "error");
    }
  });

  // --- Edit Save ---
  document.getElementById("editDomesticForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const id = document.getElementById("editDomesticId").value;
      const damanExp = document.getElementById("editDamanExp").value;
      const { text: status } = getStatus(damanExp);

      const payload = {
        sponsor: document.getElementById("editSponsor").value,
        contact: document.getElementById("editContact").value,
        housemaid: document.getElementById("editHousemaid").value,
        damanExp,
        status,
      };

      const res = await fetchWithAuth(`/api/domestic/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed");

      bootstrap.Modal.getInstance(document.getElementById("editDomesticModal"))?.hide();
      await loadDomesticData();
      Swal.fire("Updated!", "Record updated successfully.", "success");
    } catch (err) {
      console.error("Edit error:", err);
      Swal.fire("Error", "Failed to update record.", "error");
    }
  });

  // --- Delete ---
  document.addEventListener("click", async (e) => {
    const delBtn = e.target.closest(".delete-btn");
    if (delBtn) {
      e.preventDefault();
      const id = delBtn.getAttribute("data-id");

      Swal.fire({
        title: "Are you sure?",
        text: "This record will be deleted permanently.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await fetchWithAuth(`/api/domestic/${id}`, {
              method: "DELETE",
              headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error("Delete failed");
            await loadDomesticData();
            Swal.fire("Deleted!", "Record deleted successfully.", "success");
          } catch (err) {
            console.error("Delete error:", err);
            Swal.fire("Error", "Failed to delete record.", "error");
          }
        }
      });
    }

    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) {
      e.preventDefault();
      try {
        const id = editBtn.getAttribute("data-id");
        const res = await fetchWithAuth(`/api/domestic/${id}`, {
          method: "GET",
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();

        document.getElementById("editDomesticId").value = data._id;
        document.getElementById("editSponsor").value = data.sponsor || "";
        document.getElementById("editContact").value = data.contact || "";
        document.getElementById("editHousemaid").value = data.housemaid || "";
        document.getElementById("editDamanExp").value = (data.damanExp || "").split("T")[0];

        new bootstrap.Modal(document.getElementById("editDomesticModal")).show();
      } catch (err) {
        console.error("Open edit error:", err);
        Swal.fire("Error", "Unable to open edit form.", "error");
      }
    }
  });

  // --- Initial Load ---
  loadDomesticData();
});
