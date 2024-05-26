const backButton = document.getElementById("backButton");
const sessionsContainer = document.getElementById("videos")

backButton.addEventListener("click", returnUserSession);

document.addEventListener('DOMContentLoaded', function () {
    const sessionId = getSessionIdFromUrl();
    console.log('ID de la sesión:', sessionId);
    fetchsession(sessionId)
});

function returnUserSession() {
    localStorage.setItem('userId', sessionStorage.getItem('selectedUserId'));
    window.location.href = "/userDashboard";
}

function fetchsession(sessionId) {
    fetch('/getSessionByID', {
        method: 'POST',
        body: JSON.stringify({ sessionId: sessionId }),
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
            createVideoDiv(data.session);
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

function createVideoDiv(sessions) {

    sessions.videos.forEach(video => {
        console.log(video)

        var sesionDiv = document.createElement("div");
        sesionDiv.classList.add('sessionDiv');

        var textDiv = document.createElement("div");
        textDiv.classList.add('textDiv');
        var dateTextElement = document.createElement('p');
        dateTextElement.innerHTML = "<strong>Id del Video:</strong> " ;
        textDiv.appendChild(dateTextElement);

        var hourTextElement = document.createElement('p');
        hourTextElement.innerHTML = "<strong>Hora del video: </strong>" ;
        textDiv.appendChild(hourTextElement);

        var countVideosTextElement = document.createElement('p');
        countVideosTextElement.innerHTML = "<strong>Duracio: </strong>" ;
        textDiv.appendChild(countVideosTextElement);

        sesionDiv.appendChild(textDiv);
        //chart
        var videoBtn = document.createElement("button");
        videoBtn.classList.add('videoBtn');
        console.log(video.path)
        videoBtn.dataset.path = video.path;
        videoBtn.textContent = "Anar al video"
        videoBtn.addEventListener('click', navigateVideo);
        sesionDiv.appendChild(videoBtn);

        sessionsContainer.appendChild(sesionDiv)
    });
}

function navigateVideo() {
    const sessionId = getSessionIdFromUrl();
    const videoID = this.dataset.path;
    fetch(`/videoDashboard/${sessionId}/${videoID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'text/html'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return window.location.href = `/videoDashboard/${sessionId}/${videoID}`;
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

function getSessionIdFromUrl() {
    const url = window.location.href;
    const segments = url.split('/');
    return segments[segments.length - 1];
}

function getDate() {
    const dateString = session.date;
    const year = dateString.slice(4, 6);
    const month = dateString.slice(2, 4);
    const day = dateString.slice(0, 2);
    const hour = dateString.slice(6, 8);
    const minute = dateString.slice(8, 10);
    const second = dateString.slice(10);

    const dateHour = `${hour}:${minute}:${second}`;
    const date = `${day}-${month}-${year}`;
}