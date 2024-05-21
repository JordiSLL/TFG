profileBtn.addEventListener("click", toggleDropdown);
settingsBtn.addEventListener("click", toggleConfiguration);
logoutBtn.addEventListener("click", logout);
confCloseBtn.addEventListener("click", closeConfiguration);
mainBtn.addEventListener('click', handleNavigation);
documentationBtn.addEventListener('click', handleNavigation);
sessionBtn.addEventListener('click', handleNavigation);
if (newUcloseBtn) newUcloseBtn.addEventListener("click", closeNewUser);
if (saveBtn) saveBtn.addEventListener("click", saveConfiguration);
if (newUsaveBtn) newUsaveBtn.addEventListener("click", openNewUser);

function handleNavigation(event) {
    const targetId = event.target.id;
    let url;
    switch (targetId) {
        case 'main':
            url = '/main';  
            break;
        case 'documentation':
            url = '/documentation';  
            break;
        case 'filter':
            url = '/userDashboard';  
            break;
    }
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cambiar de página');
            }
            location.assign(url);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

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
    msjNewUserForm.textContent = "";
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

if (createNewUser)
    createNewUser.addEventListener('click', async (event) => {
        event.preventDefault();
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
            if (res.ok) {
                newUser.classList.remove("active");
                msjNewUserForm.classList.remove("error");
                getAllPacients();
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
    if (!e.target.closest(".popup") && newUser) {
        newUser.classList.remove("active");
    }
    if (e.target !== searchInput && e.target !== searchResults && searchResults) {
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

const dateInput = document.querySelector('input[type="date"]');
if (dateInput) {
    dateInput.addEventListener('input', function () {
        if (this.value) {
            this.classList.add('date-input--has-value');
        } else {
            this.classList.remove('date-input--has-value');
        }
    });
}

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
    verificarSelectedUserId();
    searchResults.innerHTML = '';
}

if(searchInput)
searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    const filteredResults = filterResults(query);
    showResults(filteredResults);
});

if(searchInput)
searchInput.addEventListener('focus', () => {
    showResults(data);
});



