const apiUrl = '/api/events';
const form = document.getElementById('eventForm');
const eventsList = document.getElementById('eventsList');
const message = document.getElementById('message');
const formTitle = document.getElementById('formTitle');
const cancelEdit = document.getElementById('cancelEdit');
const themeToggle = document.getElementById('themeToggle');

const fields = {
    eventId: document.getElementById('eventId'),
    title: document.getElementById('title'),
    location: document.getElementById('location'),
    description: document.getElementById('description'),
    startDate: document.getElementById('startDate'),
    endDate: document.getElementById('endDate')
};

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️ Tryb jasny' : '🌙 Tryb ciemny';
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

function resetForm() {
    fields.eventId.value = '';
    form.reset();
    formTitle.textContent = 'Dodaj wydarzenie';
}

function toInputDate(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}

function showMessage(text) {
    message.textContent = text;
}

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

async function loadEvents() {
    const response = await fetch(apiUrl);
    const data = await response.json();

    eventsList.innerHTML = data.length
        ? data.map((item) => `
            <article class="event-item">
                <h3>${escapeHtml(item.title)}</h3>
                <p class="meta">${escapeHtml(item.location)}</p>
                <p>${escapeHtml(item.description || '')}</p>
                <p class="meta">${new Date(item.startDate).toLocaleString('pl-PL')} - ${new Date(item.endDate).toLocaleString('pl-PL')}</p>
                <div class="event-actions">
                    <button class="button secondary" data-edit="${item.id}">Edytuj</button>
                    <button class="button secondary" data-delete="${item.id}">Usuń</button>
                </div>
            </article>`)
            .join('')
        : '<p>Brak wydarzeń do wyświetlenia.</p>';
}

eventsList.addEventListener('click', async (event) => {
    const editId = event.target.dataset.edit;
    const deleteId = event.target.dataset.delete;

    if (editId) {
        const response = await fetch(`${apiUrl}/${editId}`);
        if (!response.ok) {
            showMessage('Nie udało się pobrać wydarzenia do edycji.');
            return;
        }

        const item = await response.json();
        fields.eventId.value = item.id;
        fields.title.value = item.title;
        fields.location.value = item.location;
        fields.description.value = item.description ?? '';
        fields.startDate.value = toInputDate(item.startDate);
        fields.endDate.value = toInputDate(item.endDate);
        formTitle.textContent = 'Edytuj wydarzenie';
        showMessage('');
    }

    if (deleteId) {
        const response = await fetch(`${apiUrl}/${deleteId}`, { method: 'DELETE' });
        if (response.ok) {
            showMessage('Wydarzenie usunięte.');
            await loadEvents();
            resetForm();
        } else {
            showMessage('Nie udało się usunąć wydarzenia.');
        }
    }
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
        title: fields.title.value.trim(),
        location: fields.location.value.trim(),
        description: fields.description.value.trim(),
        startDate: new Date(fields.startDate.value).toISOString(),
        endDate: new Date(fields.endDate.value).toISOString()
    };

    const id = fields.eventId.value;
    const response = await fetch(id ? `${apiUrl}/${id}` : apiUrl, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (response.ok) {
        showMessage(id ? 'Wydarzenie zaktualizowane.' : 'Wydarzenie dodane.');
        await loadEvents();
        resetForm();
    } else {
        const error = await response.text();
        showMessage(error || 'Nie udało się zapisać zmian.');
    }
});

cancelEdit.addEventListener('click', () => {
    resetForm();
    showMessage('');
});

applyTheme(localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');
resetForm();
loadEvents();
