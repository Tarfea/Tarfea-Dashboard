// public/js/company.js

let isEditing = false;
let editingId = null;

  const API_BASE = window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://tarfeadashboard.vercel.app/";

// --- Auth helpers ---
function getToken() {
    return localStorage.getItem('token') || '';
}

// Decode JWT payload (no verification, just read client-side)
function parseJwtPayload(token) {
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decodeURIComponent(escape(payload)));
    } catch (e) {
        return null;
    }
}

function getAuthHeaders() {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

// --- Helper Functions ---
function parseDateSafe(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
}

function formatDateDDMMYYYY(dateStr) {
    const d = parseDateSafe(dateStr);
    if (!d) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

// Returns 'Expired' | 'Nearly Expired' | 'Active'
function calculateStatus(dates) {
    const today = new Date();
    let expired = false;
    let nearlyExpired = false;

    for (const dateStr of dates) {
        const date = parseDateSafe(dateStr);
        if (!date) continue;
        const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
            expired = true;
            break;
        } else if (diffDays <= 30) {
            nearlyExpired = true;
        }
    }

    if (expired) return 'Expired';
    if (nearlyExpired) return 'Nearly Expired';
    return 'Active';
}

function getStatusColorClass(status) {
    if (status === 'Expired') return 'text-danger';
    if (status === 'Nearly Expired') return 'text-warning';
    return 'text-success';
}

// Escape HTML
function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// DataTable instance
let companyTable = null;

async function loadCompanyData() {
    try {
        const res = await fetchWithAuth(`${API_BASE}/api/company`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch company data');

        const companyList = await res.json();
        const tbody = document.querySelector('#example5 tbody');

        // Destroy DataTable if it already exists
        if ($.fn.DataTable.isDataTable('#example5')) {
            $('#example5').DataTable().clear().destroy();
        }

        tbody.innerHTML = '';

        const today = new Date();

        companyList.sort((a, b) => {
            const rank = s => (s === 'Expired' ? 0 : s === 'Nearly Expired' ? 1 : 2);
            const sa = calculateStatus([a.licenceExp, a.munshaExp, a.mathafiExp, a.damanExp, a.echannelExp]);
            const sb = calculateStatus([b.licenceExp, b.munshaExp, b.mathafiExp, b.damanExp, b.echannelExp]);
            if (rank(sa) !== rank(sb)) return rank(sa) - rank(sb);
            return a.companyName.localeCompare(b.companyName);
        });

        companyList.forEach(item => {
            const dates = [item.licenceExp, item.munshaExp, item.mathafiExp, item.damanExp, item.echannelExp];
            const status = calculateStatus(dates);
            const statusClass = getStatusColorClass(status);

            const dateColors = dates.map(dateStr => {
                const d = parseDateSafe(dateStr);
                if (!d) return '';
                const diffDays = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
                if (diffDays < 0) return 'text-danger';
                if (diffDays <= 30) return 'text-warning';
                return 'text-success';
            });

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="ps-0">${escapeHtml(item.companyName)}</td>
                <td>${escapeHtml(item.mobileNo)}</td>
                <td class="${dateColors[0]}">${formatDateDDMMYYYY(item.licenceExp)}</td>
                <td class="${dateColors[1]}">${formatDateDDMMYYYY(item.munshaExp)}</td>
                <td class="${dateColors[2]}">${formatDateDDMMYYYY(item.mathafiExp)}</td>
                <td class="${dateColors[3]}">${formatDateDDMMYYYY(item.damanExp)}</td>
                <td class="${dateColors[4]}">${formatDateDDMMYYYY(item.echannelExp)}</td>
                <td class="${statusClass} fw-bold">${status}</td>
                <td class="text-end">
                    <span class="me-3">
                        <a href="#" class="edit-staff" data-id="${item._id}" data-item='${escapeHtml(JSON.stringify(item))}'>
                            <i class="fa fa-pencil fs-18 text-success"></i>
                        </a>
                    </span>
                    <span>
                        <a href="#" class="delete-staff" data-id="${item._id}">
                            <i class="fa fa-trash fs-18 text-danger"></i>
                        </a>
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Wait for DOM to update, then reinit DataTable
        await new Promise(r => setTimeout(r, 50));

        $('#example5').DataTable({
            searching: true,
            paging: true,
            lengthChange: false,
            dom: 'lrtip',
            order: [],
            columnDefs: [{ orderable: false, targets: -1 }]
        });

        // Rebind search
        $('.search-area input').off('keyup').on('keyup', function () {
            $('#example5').DataTable().search(this.value).draw();
        });

    } catch (err) {
        console.error('Error loading data:', err);
    }
}


// --- DOM Ready ---
document.addEventListener('DOMContentLoaded', () => {
    // protect page
    const token = getToken();
    if (!token) {
        window.location.replace('page-login.html');
        return;
    }

    loadCompanyData();

    document.getElementById('submitCompany').addEventListener('click', async (e) => {
        e.preventDefault();

        const getInput = id => document.getElementById(id).value.trim();

        const data = {
            companyName: getInput('companyName'),
            mobileNo: getInput('mobileNo'),
            licenceExp: getInput('licenceExp'),
            munshaExp: getInput('munshaExp'),
            mathafiExp: getInput('mathafiExp'),
            damanExp: getInput('damanExp'),
            echannelExp: getInput('echannelExp')
        };

        // include computed status
        data.status = calculateStatus([data.licenceExp, data.munshaExp, data.mathafiExp, data.damanExp, data.echannelExp]);

        // attach userId from token payload so server can persist / filter per user
        const payloadUser = parseJwtPayload(getToken());
        if (payloadUser && payloadUser.id) data.userId = payloadUser.id;

        if (!data.companyName || !data.mobileNo || !data.licenceExp || !data.munshaExp || !data.mathafiExp || !data.damanExp || !data.echannelExp) {
            return Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Please fill all required fields' });
        }

        try {
            let response;
            if (isEditing) {
                response = await fetchWithAuth(`${API_BASE}/api/company/${editingId}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(data)
                });
            } else {
                response = await fetchWithAuth(`${API_BASE}/api/company`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(data)
                });
            }

            if (response.ok) {
                Swal.fire({ icon: 'success', title: 'Success', text: isEditing ? 'Updated successfully' : 'Saved successfully' });
                bootstrap.Modal.getInstance(document.getElementById('exampleModal')).hide();
                document.getElementById('companyForm').reset();
                isEditing = false;
                editingId = null;
                await loadCompanyData(); // refresh table data without full reload
            } else {
                const errData = await response.json();
                Swal.fire({ icon: 'error', title: 'Error', text: errData.error || 'Something went wrong' });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Something went wrong while saving data' });
        }
    });

    document.querySelector('#example5 tbody').addEventListener('click', async e => {
        if (e.target.closest('.edit-staff')) {
            const btn = e.target.closest('.edit-staff');
            const item = JSON.parse(btn.dataset.item);

            document.getElementById('companyName').value = item.companyName || '';
            document.getElementById('mobileNo').value = item.mobileNo || '';
            document.getElementById('licenceExp').value = (item.licenceExp || '').split('T')[0];
            document.getElementById('munshaExp').value = (item.munshaExp || '').split('T')[0];
            document.getElementById('mathafiExp').value = (item.mathafiExp || '').split('T')[0];
            document.getElementById('damanExp').value = (item.damanExp || '').split('T')[0];
            document.getElementById('echannelExp').value = (item.echannelExp || '').split('T')[0];

            isEditing = true;
            editingId = btn.dataset.id;

            new bootstrap.Modal(document.getElementById('exampleModal')).show();
        }

        if (e.target.closest('.delete-staff')) {
            const id = e.target.closest('.delete-staff').dataset.id;
            const confirm = await Swal.fire({
                title: 'Are you sure?',
                text: 'You will not be able to recover this record!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });

            if (confirm.isConfirmed) {
                try {
                    const res = await fetchWithAuth(`${API_BASE}/api/company/${id}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders()
                    });
                    if (res.ok) {
                        Swal.fire('Deleted!', 'Record has been deleted.', 'success');
                        await loadCompanyData(); // immediate refresh
                    } else {
                        Swal.fire('Error', 'Failed to delete record', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    Swal.fire('Error', 'Something went wrong', 'error');
                }
            }
        }
    });

    // --- Logout Handling ---
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Swal.fire({
                title: 'Are you sure?',
                text: 'Do you really want to logout?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, logout!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.clear();
                    sessionStorage.clear();
                    Swal.fire({ title: 'Logged Out', text: 'You have been successfully logged out.', icon: 'success', timer: 1000, showConfirmButton: false })
                        .then(() => { window.location.replace('page-login.html'); });
                }
            });
        });
    }

    // Prevent going back to protected pages after logout
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
        if (!localStorage.getItem('token')) window.location.replace('page-login.html');
        else window.history.pushState(null, "", window.location.href);
    };

});
