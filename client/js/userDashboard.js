const sessionContainer = document.getElementById('sessionContainer');
const errorMSJ = document.getElementById('errorDiv');
const sessionsContainer = document.getElementById('sessions');

document.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');
    console.log(userId)
    if (userId) {
        searchInput.value = sessionStorage.getItem('selectedUserName');
        fetchsession(userId);
        localStorage.removeItem('userId');
    }
});

function verificarSelectedUserId() {
    const selectedUserId = sessionStorage.getItem('selectedUserId');
    if (selectedUserId) {
        console.log('El valor de selectedUserId es:', selectedUserId);
        fetchsession(selectedUserId);
    } else {
        console.log('No hay ningún valor almacenado en selectedUserId');
    }
}

function fetchsession(userId) {
    sessionsContainer.innerHTML = "";
    fetch('/getSessionsByUserID', {
        method: 'POST',
        body: JSON.stringify({ userId: userId }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (!Array.isArray(data.sessions) || data.sessions.length === 0) {
                sessionContainer.style.display = 'none';
                sessionContainer.classList.remove('show');
                errorMSJ.style.display = 'block';
                errorMSJ.offsetHeight;
                errorMSJ.classList.add('show');
            } else {
                console.log(data);
                errorMSJ.style.display = 'none';
                errorMSJ.classList.remove('show');
                createSessionsDiv(data.sessions);
                sessionContainer.style.display = 'block';
                sessionContainer.offsetHeight;
                sessionContainer.classList.add('show');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

function createSessionsDiv(sessions) {
    sessions.forEach(session => {
        console.log(session)

        const dateString = session.date;
        const year = dateString.slice(4, 6);
        const month = dateString.slice(2, 4);
        const day = dateString.slice(0, 2);
        const hour = dateString.slice(6, 8);
        const minute = dateString.slice(8, 10);
        const second = dateString.slice(10);

        const dateHour = `${hour}:${minute}:${second}`;
        const date = `${day}-${month}-${year}`;

        var sesionDiv = document.createElement("div");
        sesionDiv.classList.add('sessionDiv');

        var textDiv = document.createElement("div");
        textDiv.classList.add('textDiv');
        var dateTextElement = document.createElement('p');
        dateTextElement.innerHTML = "<strong>Data de la Sessió:</strong> " + date;
        textDiv.appendChild(dateTextElement);

        var hourTextElement = document.createElement('p');
        hourTextElement.innerHTML = "<strong>Hora de la Sessió: </strong>" + dateHour;
        textDiv.appendChild(hourTextElement);

        var countVideosTextElement = document.createElement('p');
        countVideosTextElement.innerHTML = "<strong>Número de videos: </strong>" + session.videos.length;
        textDiv.appendChild(countVideosTextElement);

        var stateTextElement = document.createElement('p');
        stateTextElement.innerHTML = "<strong>Estat de la sessió: </strong>";
        textDiv.appendChild(stateTextElement);

        sesionDiv.appendChild(textDiv);

        if (session.IdEstado == 1 /*|| session.IdEstado === undefined*/) {
            var analyzeBtn = document.createElement("button");
            analyzeBtn.classList.add('analyzeBtn');
            analyzeBtn.dataset.sessionId = session._id;
            analyzeBtn.textContent = "Analitzar Sessió";
            analyzeBtn.addEventListener('click', analyzeSession);
            sesionDiv.appendChild(analyzeBtn);
        }
        else {
            //chart
            var sessionBtn = document.createElement("button");
            sessionBtn.classList.add('sessionBtn');
            sessionBtn.dataset.sessionId = session._id;
            sessionBtn.textContent = "Anar a la Sessió"
            sessionBtn.addEventListener('click', navigateSession);
            sesionDiv.appendChild(sessionBtn);
        }
        sessionsContainer.appendChild(sesionDiv)
    });
}

function navigateSession() {
    const sessionId = this.dataset.sessionId;
    fetch(`/sessionDashboard/${sessionId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'text/html' 
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return window.location.href =`/sessionDashboard/${sessionId}`;
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}

function analyzeSession(){
    console.log(this.dataset.sessionId);

}