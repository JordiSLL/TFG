const sessionContainer = document.getElementById('sessionContainer');
const errorMSJ = document.getElementById('errorDiv');
const sessionsContainer = document.getElementById('sessions');
const numSessions = document.getElementById('numSession');
var sessionEmotions = [];

document.addEventListener('DOMContentLoaded', async function () {
    const { userId } = getUrlParams();
    //console.log(userId)
    if (userId) {
        const a = await fetchUser();
        //console.log(a)
        searchInput.value = a;
        fetchsession(userId);
    }
});

function verificarSelectedUserId() {
    const selectedUserId = sessionStorage.getItem('selectedUserId');
    if (selectedUserId) {
        //console.log('El valor de selectedUserId es:', selectedUserId);
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
                //console.log(data);
                errorMSJ.style.display = 'none';
                errorMSJ.classList.remove('show');
                createCalendar(data.sessions)
                createSessionsDiv(data.sessions);
                createGlobalChart(data.sessions);
                createLineChart(data.sessions);
                sessionEmotions = data.sessions.map(session => session.emotion);
                console.log(sessionEmotions)
                numSessions.textContent = data.sessions.length;
                sessionContainer.style.display = 'block';
                sessionContainer.offsetHeight;
                sessionContainer.classList.add('show');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

async function fetchUser() {
    const { userId } = getUrlParams();
    try {
        const response = await fetch('/api/pacient/pacient', {
            method: 'POST',
            body: JSON.stringify({ userId: userId }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.user.name;
    } catch (error) {
        console.error('Fetch error:', error);
        return '';
    }
}

function createSessionsDiv(sessions) {
    //sessions.sort((a, b) => b.date.localeCompare(a.date));
    for (let index = sessions.length - 1; index >= 0; index--) {
        const session = sessions[index];
        //console.log(session);

        const dateString = session.date;
        const day = dateString.slice(4, 6);
        const month = dateString.slice(2, 4);
        const year = dateString.slice(0, 2);
        const hour = dateString.slice(6, 8);
        const minute = dateString.slice(8, 10);
        const second = dateString.slice(10);

        const dateHour = `${hour}:${minute}:${second}`;
        const date = `${day}-${month}-20${year}`;

        var sesionDiv = document.createElement("div");
        sesionDiv.classList.add('sessionDiv');

        var textDiv = document.createElement("div");
        textDiv.classList.add('textDiv');

        var numTextElement = document.createElement('p');
        numTextElement.innerHTML = "<strong>Número de la Sessió: </strong>" + (index + 1);
        textDiv.appendChild(numTextElement);

        var idTextElement = document.createElement('p');
        idTextElement.innerHTML = "<strong>ID de la Sessió: </strong>" + (session._id);
        textDiv.appendChild(idTextElement);

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
        stateTextElement.id = 'textState' + index;
        stateTextElement.innerHTML = "<strong>Estat de la Sessió: </strong>" +
            (session.IdEstado === 1 ? "Sessió pendent de processar" :
                session.IdEstado === 2 ? "Sessió pendent de recepció de dades" :
                    session.IdEstado === 3 ? "Error en el procesament de la Sessió" :
                        "Sessió Analitzada");
        textDiv.appendChild(stateTextElement);
        sesionDiv.appendChild(textDiv);

        if (session.IdEstado == 1 /* || session.IdEstado === undefined */) {
            var analyzeBtn = document.createElement("button");
            analyzeBtn.id = "btn" + index;
            analyzeBtn.classList.add('analyzeBtn');
            analyzeBtn.dataset.sessionId = session._id;
            analyzeBtn.textContent = "Analitzar Sessió";
            analyzeBtn.addEventListener('click', analyzeSession);
            sesionDiv.appendChild(analyzeBtn);
        } else if (session.IdEstado == 2) {
            var getPredictionBtn = document.createElement("button");
            getPredictionBtn.id = "btn" + index;
            getPredictionBtn.classList.add('getPredictionBtn');
            getPredictionBtn.dataset.sessionId = session._id;
            getPredictionBtn.textContent = "Obtenir Prediccions";
            getPredictionBtn.addEventListener('click', getAllPrediction);
            sesionDiv.appendChild(getPredictionBtn);
        } else {
            // chart
            var chartDiv = document.createElement('div');
            chartDiv.classList.add('chart-container');
            var chartCanvas = document.createElement('canvas');
            chartCanvas.id = "chart-doughnut" + index;
            chartCanvas.width = 400;
            chartCanvas.height = 200;
            chartDiv.appendChild(chartCanvas);
            sesionDiv.appendChild(chartDiv);

            var sessionBtn = document.createElement("button");
            sessionBtn.id = "btn" + index;
            sessionBtn.classList.add('sessionBtn');
            sessionBtn.dataset.sessionId = session._id;
            sessionBtn.textContent = "Anar a la Sessió";
            sessionBtn.addEventListener('click', navigateSession);
            sesionDiv.appendChild(sessionBtn);

            const emotions = getAvgEmotions(session.emotion.Prosody, session.emotion.Language, session.emotion.Face);
            createChart(emotions, chartCanvas);
        }

        sessionsContainer.appendChild(sesionDiv);
    }
}


function navigateSession() {
    const sessionId = this.dataset.sessionId;
    var { userId } = getUrlParams();
    if (!userId) {
        userId = sessionStorage.getItem('selectedUserId');
    }
    fetch(`/Dashboard/${userId}/${sessionId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'text/html'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return window.location.href = `/Dashboard/${userId}/${sessionId}`;
        })
        .then(data => {
            //console.log(data);
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

async function getAllPrediction() {
    const sessionId = this.dataset.sessionId;
    const buttonElement = this;
    var { userId } = getUrlParams();
    if (!userId) {
        userId = sessionStorage.getItem('selectedUserId');
    }
    try {
        const response = await fetch('/getAllPredictionVideos', {
            method: 'POST',
            body: JSON.stringify({ userId: userId, sessionId: sessionId }),
            headers: { 'Content-Type': 'application/json' }
        });

        const responseData = await response.json();

        console.log(responseData)
        const textStateElement = document.getElementById('textState' + this.id.replace('btn', ''));
        if (!response.ok) {
            textStateElement.innerHTML = "<strong>Estat de la Sessió: </strong>" + responseData.message;
            //quin error? 
            throw new Error('Network response was not ok');
        } else if (response.status === 200) {
            console.log(userId)
            window.location.href = `/Dashboard/${userId}`;
        }

    } catch (error) {
        console.error('Fetch error:', error);
        return '';
    }
}

async function analyzeSession() {
    //console.log(this.dataset.sessionId);
    const sessionId = this.dataset.sessionId;
    //console.log(this)
    const buttonElement = this;

    var { userId } = getUrlParams();
    if (!userId) {
        userId = sessionStorage.getItem('selectedUserId');
    }
    console.log(sessionId)
    try {
        const response = await fetch('/procesVideos', {
            method: 'POST',
            body: JSON.stringify({ userId: userId, sessionId: sessionId }),
            headers: { 'Content-Type': 'application/json' }
        });

        const responseData = await response.json();

        console.log(responseData)
        const textStateElement = document.getElementById('textState' + this.id.replace('btn', ''));
        if (!response.ok) {
            textStateElement.innerHTML = "<strong>Estat de la Sessió: </strong>" + responseData.message;
            throw new Error('Network response was not ok');
        } else if (response.status === 200) {
            buttonElement.classList.remove('analyzeBtn');
            buttonElement.classList.add('getPredictionBtn');
            buttonElement.textContent = "Obtenir Prediccions"
            textStateElement.innerHTML = "<strong>Estat de la Sessió: </strong>" + "Sessió pendent de recepció de dades";
        }

    } catch (error) {
        console.error('Fetch error:', error);
        return '';
    }
}

function createGlobalChart(sessions) {
    var chartCanvas = document.getElementById("chartGlobal");
    //console.log(sessions)
    emotions = avgEmotionsSession(sessions, ['Face', 'Language', 'Prosody'])
    createChart(emotions, chartCanvas);
    var chart = Chart.getChart(chartCanvas)
    chart.options.plugins.legend.position = 'bottom';
    chart.update();
}

function createLineChart(sessions) {
    var firstEmotionScores = [];
    var avgEmotions = [];
    const filteredData = sessions.filter(session => session.IdEstado === 0 || session.IdEstado === 4);
    filteredData.forEach(session => {
        emotions = getAvgEmotions(session.emotion.Language, session.emotion.Prosody, session.emotion.Face);
        avgEmotions.push(emotions)
        firstEmotionScores.push(emotions[0])
    })
    //console.log(firstEmotionScores)
    const sessionObject = {};
    //console.log("total: "+sessions.length)

    for (let index = sessions.length - 1; index >= 0; index--) {
        const session = sessions[index];
        if (session.IdEstado == 0 || session.IdEstado == 4) {
            sessionObject[index + 1] = 0.5;
        }
    }

    const chartData = {
        labels: Object.keys(sessionObject),
        datasets: []
    };

    const emotionMap = {};
    avgEmotions.forEach((emotionArray, index) => {
        emotionArray.forEach(emotion => {
            if (firstEmotionScores.map(e => e.name).includes(emotion.name)) {
                if (!emotionMap[emotion.name]) {
                    emotionMap[emotion.name] = {
                        label: emotion.name,
                        data: Array(sessions.length).fill(0),
                        borderColor: emotionBorderColors[emotion.name] || 'rgba(0, 0, 0, 1)',
                        backgroundColor: emotionColors[emotion.name] || 'rgba(0, 0, 0, 0.5)',
                        fill: false,
                        tension: 0.1,
                        pointRadius: 0,
                        pointHoverRadius: 0
                    };
                }
                emotionMap[emotion.name].data[index] = emotion.score;
            }
        });
    });
    chartData.datasets = Object.values(emotionMap);
    //console.log("chartData.datasets")
    //console.log(chartData.datasets)
    const config = {
        type: 'line',
        data: chartData,
        options: {
            maintainAspectRatio: true,
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Sessions'
                    },
                    ticks: {
                        maxTicksLimit: filteredData.length,
                        autoSkip: true
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Emotion Score'
                    },
                    min: 0,
                    max: 1,
                    ticks: {
                        min: 0,
                        stepSize: 0.2
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    },
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)}`;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 12
                        },
                        usePointStyle: true,
                        padding: 20
                    }
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy',
                    },
                    pan: {
                        enabled: true,
                        mode: "xy"
                    },
                    limits: {
                        y: { min: 0, max: 1 },
                    }
                }

            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuad'
            },
        },
    };

    // Crear el gráfico
    var myChart = new Chart(
        document.getElementById('chart'),
        config
    );
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

function createChart(emotions, chartCanvas) {

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

function avgEmotionsSession(data, modelNames) {
    const emotions = {};

    const filteredData = data.filter(session => session === undefined || session.IdEstado === 0);

    modelNames.forEach(modelName => {
        filteredData.forEach(session => {
            if (session.emotion && session.emotion[modelName]) {
                session.emotion[modelName].forEach(emotion => {
                    if (!emotions[emotion.name]) {
                        emotions[emotion.name] = {
                            count: 0,
                            totalScore: 0
                        };
                    }
                    emotions[emotion.name].count++;
                    emotions[emotion.name].totalScore += emotion.score;
                });
            }
        });
    });


    const averagedEmotions = Object.keys(emotions).map(emotionName => {
        return {
            name: emotionName,
            score: emotions[emotionName].totalScore / emotions[emotionName].count
        };
    });

    return averagedEmotions.sort((a, b) => b.score - a.score);
}
