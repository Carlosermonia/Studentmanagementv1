
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const idnoField = document.getElementById('idno');
    const lastnameField = document.getElementById('lastname');
    const firstnameField = document.getElementById('firstname');
    const courseField = document.getElementById('course');
    const levelField = document.getElementById('level');
    const editIdField = document.getElementById('edit_idno');
    const saveBtn = form ? form.querySelector('input[type="submit"]') : null;

    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDelete');

    const errorModal = document.getElementById('errorModal');
    const errorMessageEl = document.getElementById('errorMessage');

    const imageInput = document.getElementById('imageInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarIcon = document.querySelector('.avatar-icon');

    document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
        input.addEventListener('input', () => { input.value = input.value.toString().toUpperCase(); });
    });

    
    [avatarPreview, avatarIcon].forEach(el => {
        if (el) {
            el.addEventListener('click', () => imageInput.click());
        }
    });

    
    if (imageInput && avatarPreview) {
        imageInput.addEventListener('change', function () {
            const file = this.files && this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => { avatarPreview.src = e.target.result; };
            reader.readAsDataURL(file);
        });
    }

    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const row = e.target.closest('tr');
            if (!row || !form) return;

            idnoField.value = row.dataset.idno || '';
            lastnameField.value = (row.dataset.lastname || '').toUpperCase();
            firstnameField.value = (row.dataset.firstname || '').toUpperCase();
            courseField.value = (row.dataset.course || '').toLowerCase();
            levelField.value = row.dataset.level || '';
            editIdField.value = row.dataset.idno || '';

           
            if (row.dataset.image && row.dataset.image.trim() !== "") {
                avatarPreview.src = `/static/images/${row.dataset.image}`;
            } else {
                avatarPreview.src = avatarPreview.dataset.default;
            }

            if (saveBtn) saveBtn.value = 'UPDATE';
            form.scrollIntoView({behavior: 'smooth', block: 'center'});
        });
    });

    let idToDelete = null;
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const row = e.target.closest('tr');
            if (!row) return;
            idToDelete = row.dataset.idno;
            const p = deleteModal.querySelector('p');
            if (p) p.textContent = `Are you sure you want to delete student ID ${idToDelete}?`;
            deleteModal.style.display = 'block';
        });
    });

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (!idToDelete) return;
            window.location.href = `/delete/${idToDelete}`;
        });
    }

    
    window.addEventListener('click', ev => {
        if (ev.target === deleteModal) deleteModal.style.display = 'none';
        if (ev.target === errorModal) errorModal.style.display = 'none';
    });
    window.addEventListener('keydown', ev => {
        if (ev.key === 'Escape') {
            deleteModal.style.display = 'none';
            errorModal.style.display = 'none';
        }
    });

  
if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();

        const idno = (idnoField.value || '').trim();
        const lastname = (lastnameField.value || '').trim();
        const firstname = (firstnameField.value || '').trim();
        const course = (courseField.value || '').trim();
        const level = (levelField.value || '').trim();

        
        if (!idno || !lastname || !firstname || !course || !level) {
            errorMessageEl.textContent = 'All fields are required. Please complete the form.';
            errorModal.style.display = 'block';
            return;
        }

        
        if (!editIdField.value) { 
            const existingIds = Array.from(document.querySelectorAll('tr[data-idno]'))
                .map(row => row.dataset.idno);

            if (existingIds.includes(idno)) {
                errorMessageEl.textContent = `It looks like Student ID ${idno} is already registered. Please choose a different ID..`;
                errorModal.style.display = 'block';
                return;
            }
        }

        
        form.action = editIdField.value ? `/update/${editIdField.value}` : '/add';
        form.submit();
    });
}


    
    const resetBtn = form.querySelector('input[type="reset"]');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (saveBtn) saveBtn.value = 'SAVE';
            if (editIdField) editIdField.value = '';
            avatarPreview.src = avatarPreview.dataset.default;
            if (imageInput) imageInput.value = '';
        });
    }
});