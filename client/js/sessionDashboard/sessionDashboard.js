const backButton = document.getElementById("backButton");
const sessionsContainer = document.getElementById("videos")

backButton.addEventListener("click", returnUserSession);

document.addEventListener('DOMContentLoaded', function () {
    const { sessionId } = getUrlParams();
    console.log('ID de la sesión:', sessionId);
    if (sessionId)
    fetchsession(sessionId)
});

function returnUserSession() {
    const { userId } = getUrlParams();
    console.log("User ID: "+userId)
    window.location.href = "/Dashboard/"+userId;
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
        console.log(video.id)
        videoBtn.dataset.id = video.id;
        videoBtn.textContent = "Anar al video"
        videoBtn.addEventListener('click', navigateVideo);
        sesionDiv.appendChild(videoBtn);

        sessionsContainer.appendChild(sesionDiv)
    });
}

function navigateVideo() {
    const videoID = this.dataset.id;
    const { userId } = getUrlParams();
    const { sessionId } = getUrlParams();
    fetch(`/Dashboard/${userId}/${sessionId}/${videoID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'text/html'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return window.location.href = `/Dashboard/${userId}/${sessionId}/${videoID}`;
        })
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

function getUrlParams() {
    const url = new URL(window.location.href);
    const params = url.pathname.split('/').filter(param => param);
    const dashboardIndex = params.indexOf('Dashboard');
    const userId = params[dashboardIndex + 1] || null;
    const sessionId = params[dashboardIndex + 2] || null;
    const videoId = params[dashboardIndex + 3] || null;

    return { userId, sessionId, videoId };
}

function getDate() {
    const dateString = session.date;
    const day = dateString.slice(4, 6);
    const month = dateString.slice(2, 4);
    const year = dateString.slice(0, 2);
    const hour = dateString.slice(6, 8);
    const minute = dateString.slice(8, 10);
    const second = dateString.slice(10);

    const dateHour = `${hour}:${minute}:${second}`;
    const date = `${day}-${month}-${year}`;
}