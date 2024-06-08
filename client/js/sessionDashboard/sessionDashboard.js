const backButton = document.getElementById("backButton");
const sessionsContainer = document.getElementById("videos")
const sessionIdDiv = document.getElementById("sessionId");
const sessionData = document.getElementById("sessionData");
const sessionHour = document.getElementById("sessionHour");
const videosNumber = document.getElementById("videosNumber");
backButton.addEventListener("click", returnUserSession);

const sessionEmotions = [];
const videoEmotions = [];

document.addEventListener('DOMContentLoaded', function () {
    const { sessionId } = getUrlParams();
    console.log('ID de la sesión:', sessionId);
    sessionIdDiv.textContent = sessionId;
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

function createVideoDiv(session) {
    getDate(session);
    videosNumber.textContent = session.videos.length;
    //session.videos.sort((a, b) => b.id.localeCompare(a.id));
    session.videos.forEach((video,index) => {
        console.log(video)
        var sesionDiv = document.createElement("div");
        sesionDiv.classList.add('sessionDiv');

        var textDiv = document.createElement("div");
        textDiv.classList.add('textDiv');
        var dateTextElement = document.createElement('p');
        dateTextElement.innerHTML = "<strong>Id del Video: "+ video.id +" </strong> " ;
        textDiv.appendChild(dateTextElement);
        
        const hour = video.id.slice(6, 8);
        const minute = video.id.slice(8, 10);
        const second = video.id.slice(10);
    
        var hourTextElement = document.createElement('p');
        hourTextElement.innerHTML = `<strong>Hora del video: ${hour}:${minute}:${second} </strong>` ;
        textDiv.appendChild(hourTextElement);

        var countVideosTextElement = document.createElement('p');
        countVideosTextElement.innerHTML = "<strong>Duració: "+ parseFloat(video.duration).toFixed(2) +"s</strong>" ;
        textDiv.appendChild(countVideosTextElement);

        sesionDiv.appendChild(textDiv);
        //chart

        var chartDiv = document.createElement('div');
        chartDiv.classList.add('chart-container');
        var chartCanvas = document.createElement('canvas');
        chartCanvas.id = "chart-doughnut" + index;
        chartCanvas.width = 400;
        chartCanvas.height = 200;
        chartDiv.appendChild(chartCanvas);
        sesionDiv.appendChild(chartDiv);
        var videoBtn = document.createElement("button");
        videoBtn.classList.add('videoBtn');
        console.log(video.id)
        videoBtn.dataset.id = video.id;
        videoBtn.textContent = "Anar al video"
        videoBtn.addEventListener('click', navigateVideo);
        sesionDiv.appendChild(videoBtn);

        sessionsContainer.appendChild(sesionDiv);
        createChart(video, chartCanvas);
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

function getDate(session) {
    const dateString = session.date;
    const day = dateString.slice(4, 6);
    const month = dateString.slice(2, 4);
    const year = dateString.slice(0, 2);
    const hour = dateString.slice(6, 8);
    const minute = dateString.slice(8, 10);
    const second = dateString.slice(10);

    sessionHour.textContent = `${hour}:${minute}:${second}`;
    sessionData.textContent = `${day}-${month}-20${year}`;
}

function createChart(data, chartCanvas) {
    console.log("DATAAA")
    console.log(data)
    emotions = getAvgEmotions(data.emotion.Prosody, data.emotion.Language, data.emotion.Face)
    var top5Emotions = emotions.slice(0, 5).map(emotion => emotion.name);
    var top5EmotionsScores = emotions.slice(0, 5).map(emotion => emotion.score);

    var backgroundColors = top5Emotions.map(emotion => emotionColors[emotion] || 'rgba(0, 0, 0, 0.5)');
    var borderColors = top5Emotions.map(emotion => emotionBorderColors[emotion] || 'rgba(0, 0, 0, 1)');

    var chartData = {
        labels: top5Emotions,
        datasets: [{
            data: top5EmotionsScores,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
            hoverOffset: 20
        }]
    };

    var chartOptions = {
        responsive: false,
        maintainAspectRatio: false,
        layout: {
            padding: 15
        },
        plugins: {
            legend: {
                display: true,
                position: 'right',
            }
        },
        animation: {
            duration: 2000,
            easing: 'easeInOutQuad'
        }
    };

    var ctx = chartCanvas.getContext('2d');
    //console.log(ctx)
    new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: chartOptions
    });
}

function getAvgEmotions(...lists) {
    const sumEmotion = {};
    const countEmotion = {};

    lists.forEach(list => {
        list.forEach(emotion => {
            if (sumEmotion.hasOwnProperty(emotion.name)) {
                sumEmotion[emotion.name] += emotion.score;
                countEmotion[emotion.name]++;
            } else {
                sumEmotion[emotion.name] = emotion.score;
                countEmotion[emotion.name] = 1;
            }
        });
    });

    const avgEmotion = [];
    for (const emocion in sumEmotion) {
        avgEmotion.push({
            name: emocion,
            score: sumEmotion[emocion] / countEmotion[emocion]
        });
    }

    return getTopEmotions(avgEmotion);
}

function getTopEmotions(emotions) {
    return emotions.sort((a, b) => b.score - a.score);
}