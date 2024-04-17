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

const newUsaveBtn = document.getElementById("createUser");
const newUser = document.getElementById("newUser");
const newUcloseBtn = document.getElementById("newU-close-btn");
const newPacientForm = document.getElementById("createUserForm");
const createNewUser = document.getElementById("newU-save-btn");

const searchUser = document.getElementById("searchUser");

profileBtn.addEventListener("click", toggleDropdown);
settingsBtn.addEventListener("click", toggleConfiguration);
logoutBtn.addEventListener("click", logout);
confCloseBtn.addEventListener("click", closeConfiguration);
newUcloseBtn.addEventListener("click", closeNewUser);
saveBtn.addEventListener("click", saveConfiguration);
newUsaveBtn.addEventListener("click", openNewUser);
searchUser.addEventListener("click", searchInfoUser);

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

createNewUser.addEventListener('click', async (event)=> {
    event.preventDefault();
    const msjNewUserForm = document.getElementById("msj");
    msjNewUserForm.textContent ="";
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
      headers: {'Content-Type': 'application/json'}  
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


