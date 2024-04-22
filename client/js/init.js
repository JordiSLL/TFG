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

let data =[];

document.addEventListener("DOMContentLoaded", function () {
    enumerateDevices();
    getAllPacients();
});

function getAllPacients(){
    fetch('/api/pacient/')
    .then(response => {
        return response.json();
    })
    .then(data2 => {
        data=data2.result;
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}