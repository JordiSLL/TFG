document.addEventListener("DOMContentLoaded", function () {
    enumerateDevices();
});
const videoSelect = document.getElementById("videoSource");
const audioSelect = document.getElementById("audioSource");

const profileBtn = document.getElementById("profile-btn");
const dropdownContent = document.getElementById("dropdown-content");
const settingsBtn = document.getElementById("settings-btn");
const logoutBtn = document.getElementById("logout-btn");
const configuration = document.getElementById("configuration");
const confCloseBtn = document.getElementById("conf-close-btn");
const saveBtn = document.getElementById("conf-save-btn");

const createNewUser = document.getElementById("createUser");
const newUser = document.getElementById("newUser");
const newUsaveBtn = document.getElementById("newU-save-btn");
const newUcloseBtn = document.getElementById("newU-close-btn");

profileBtn.addEventListener("click", toggleDropdown);
settingsBtn.addEventListener("click", toggleConfiguration);
logoutBtn.addEventListener("click", logout);
confCloseBtn.addEventListener("click", closeConfiguration);
newUcloseBtn.addEventListener("click", closeNewUser);
saveBtn.addEventListener("click", saveConfiguration);
createNewUser.addEventListener("click", toggleNewUser);

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
    // Lógica para cerrar la sesión
}

function closeConfiguration(e) {
    e.stopPropagation();
    configuration.classList.remove("active");
}

function closeNewUser(e) {
    e.stopPropagation();
    newUser.classList.remove("active");
}

function saveConfiguration(e) {
    e.stopPropagation();
    saveSettings();
    configuration.classList.remove("active");
}

function toggleNewUser(e) {
    e.stopPropagation();
    newUser.classList.toggle("active");
}


// Tanquem el Les pop ups quan clickem fora
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

document.querySelector('input[type="date"]').addEventListener('input', function() {
    if (this.value) {
       this.classList.add('date-input--has-value');
    } else {
       this.classList.remove('date-input--has-value');
    }
   });


