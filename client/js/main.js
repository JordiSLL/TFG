document.addEventListener("DOMContentLoaded", function () {
    enumerateDevices();
});
const data = [{
    "_id": "661fde3fb9094d628bb7c14b",
    "name": "Nero02",
    "date": "2024-04-18",
    "code": "CB696688695FR"
},
{
    "_id": "661fdf95cd2ea3cda8b6af3d",
    "name": "Jordi",
    "date": "0001-01-01",
    "code": "CB696688695FR"
},
{
    "_id": "661fe70ee3b0ad286dd8e0d8",
    "name": "Jordi",
    "date": "2024-04-12",
    "code": "CB696688695FR"
},
{
    "_id": "661fe714e3b0ad286dd8e0d9",
    "name": "Nero02",
    "date": "2024-04-07",
    "code": "990618"
},
{
    "_id": "661fe71ce3b0ad286dd8e0da",
    "name": "NeroBot",
    "date": "2024-04-04",
    "code": "VYNTWBD"
},
{
    "_id": "661fe747e3b0ad286dd8e0db",
    "name": "Josep Sanchez Aldeguer",
    "date": "2024-04-19",
    "code": "1234"
},
{
    "_id": "661fe757e3b0ad286dd8e0dc",
    "name": "Jordi Sanchez Lloansi",
    "date": "2024-04-20",
    "code": "123456789"
}];
const videoSelect = document.getElementById("videoSource");
const audioSelect = document.getElementById("audioSource");

const profileBtn = document.getElementById("profile-btn");
const dropdownContent = document.getElementById("dropdown-content");
const settingsBtn = document.getElementById("settings-btn");
const logoutBtn = document.getElementById("logout-btn");
const configuration = document.getElementById("configuration");
const confCloseBtn = document.getElementById("conf-close-btn");
const saveBtn = document.getElementById("conf-save-btn");

const newUsaveBtn = document.getElementById("createUser");
const newUser = document.getElementById("newUser");
const newUcloseBtn = document.getElementById("newU-close-btn");
const newPacientForm = document.getElementById("createUserForm");
const createNewUser = document.getElementById("newU-save-btn");

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

profileBtn.addEventListener("click", toggleDropdown);
settingsBtn.addEventListener("click", toggleConfiguration);
logoutBtn.addEventListener("click", logout);
confCloseBtn.addEventListener("click", closeConfiguration);
newUcloseBtn.addEventListener("click", closeNewUser);
saveBtn.addEventListener("click", saveConfiguration);
newUsaveBtn.addEventListener("click", openNewUser);

function toggleDropdown(e) {
    e.stopPropagation();
    dropdownContent.classList.toggle("active");
    configuration.classList.remove("active");
}

function toggleConfiguration(e) {
    e.stopPropagation();
    configuration.classList.toggle("active");
    dropdownContent.classList.remove("active");
    enumerateDevices();
}

function logout(e) {
    e.stopPropagation();
    fetch('/api/users/logout')
        .then(response => {
            if (response.ok) {
                location.assign('/');
            } else {
                console.error('Error en el logout:', response.status);
            }
        })
        .catch(error => {
            console.error('Error al intentar hacer logout:', error);
        });
}

function closeConfiguration(e) {
    e.stopPropagation();
    configuration.classList.remove("active");
}

function closeNewUser(e) {
    e.stopPropagation();
    e.preventDefault();
    newUser.classList.remove("active");
}

function saveConfiguration(e) {
    e.stopPropagation();
    saveSettings();
    configuration.classList.remove("active");
}

function openNewUser(e) {
    e.stopPropagation();
    newPacientForm.reset();
    newUser.classList.toggle("active");
}
function searchInfoUser(e) {
    e.stopPropagation();
    console.log("bUSCAR");
    fetch('/api/pacient/')
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

createNewUser.addEventListener('click', async (event) => {
    event.preventDefault();
    const msjNewUserForm = document.getElementById("msj");
    msjNewUserForm.textContent = "";
    const PacientData = {
        name: newPacientForm.name.value,
        date: newPacientForm.date.value,
        code: newPacientForm.code.value
    };

    console.log(PacientData);

    try {
        const res = await fetch('/api/pacient/create', {
            method: 'POST',
            body: JSON.stringify(PacientData),
            headers: { 'Content-Type': 'application/json' }
        });
        console.log("HERE");
        if (res.ok) {
            newUser.classList.remove("active");
            msjNewUserForm.classList.remove("error");
        } else if (res.status === 400) {
            const msj = await res.json();
            msjNewUserForm.textContent = msj.message;
            msjNewUserForm.classList.add("error");
        } else {
            throw new Error('Error de red o código de estado no esperado');
        }
    } catch (error) {
        console.error('Error al registrar el usuari:', error);
    }
});

// Tanquem les pop ups quan clickem fora
document.addEventListener("click", function (e) {
    if (!e.target.closest(".profile-dropdown")) {
        dropdownContent.classList.remove("active");
    }
    if (!e.target.closest(".popup")) {
        configuration.classList.remove("active");
    }
    if (!e.target.closest(".popup")) {
        newUser.classList.remove("active");
    }
    if (e.target !== searchInput && e.target !== searchResults) {
        searchResults.innerHTML = '';
    }
});

// Buscar els dispositius d'audio i video conectats al ordinador
async function enumerateDevices() {
    videoSelect.innerHTML = "";
    audioSelect.innerHTML = "";
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        devices.forEach(device => {
            if (device.kind === 'videoinput') {
                const option = document.createElement('option');
                option.id = device.deviceId;
                option.value = device.deviceId;
                option.setAttribute("class", "same-as-selected");
                if (device.deviceId == localStorage.getItem("selectedVideoDevice")) {
                    option.selected = true;
                }
                option.text = device.label || `Cámara ${videoSelect.length + 1}`;
                videoSelect.appendChild(option);
            } else if (device.kind === 'audioinput') {
                const option = document.createElement('option');
                option.id = device.deviceId;
                option.value = device.deviceId;
                if (device.deviceId == localStorage.getItem("selectedAudioDevice")) {
                    option.selected = true;
                }
                option.text = device.label || `Dispositivo de Audio ${audioSelect.length + 1}`;
                audioSelect.appendChild(option);
            }
        });
    } catch (err) {
        console.error('Error al enumerar dispositivos:', err);
    }
}

function saveSettings() {
    localStorage.setItem("selectedVideoDevice", videoSelect.value);
    localStorage.setItem("selectedAudioDevice", audioSelect.value);
}

document.querySelector('input[type="date"]').addEventListener('input', function () {
    if (this.value) {
        this.classList.add('date-input--has-value');
    } else {
        this.classList.remove('date-input--has-value');
    }
});



function filterResults(query) {
    return data.filter(item => {
        const name = item.name.toLowerCase();
        const code = item.code.toLowerCase();
        const lowerQuery = query.toLowerCase();
        return name.includes(lowerQuery) || code.includes(lowerQuery);
    });
}

function showResults(results) {
    searchResults.innerHTML = '';
    results.forEach(item => {
        const option = document.createElement('div');
        option.textContent = item.name;
        option.classList.add('search-result');
        option.addEventListener('click', () => selectUser(item._id, item.name));
        searchResults.appendChild(option);
    });
}

function selectUser(userId, userName) {
    sessionStorage.setItem('selectedUserId', userId);
    searchInput.value = userName;
    searchResults.innerHTML = '';
}

searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    const filteredResults = filterResults(query);
    showResults(filteredResults);
});

searchInput.addEventListener('focus', () => {
    showResults(data);
});



