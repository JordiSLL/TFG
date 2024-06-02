const backButton = document.getElementById("backButton");
const sessionIdDiv = document.getElementById("sessionId");
const sessionDataDiv = document.getElementById("sessionData");
const sessionHourDiv = document.getElementById("sessionHour");
const videoIdDiv = document.getElementById("videoId");
const videoDurationDiv = document.getElementById("videoDuration");
const phraseNumberDiv = document.getElementById("phraseNumber");
 
backButton.addEventListener("click", returnUserSession);

var listProsody = [];
var listLanguage = [];
var listFace = [];
var listMedia = [];

var listFraseLanguage = [];
var listFraseProsody = [];
var listFraseMedia = [];

function returnUserSession() {
    const { userId, sessionId } = getUrlParams();
    window.location.href = `/Dashboard/${userId}/${sessionId}`;
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

document.addEventListener('DOMContentLoaded', function () {
    fetchSession()
});
//Obtenim la informació de la Sessió
async function fetchSession() {
    try {
        const { sessionId, videoId } = getUrlParams();
        sessionIdDiv.textContent = sessionId;
        videoIdDiv.textContent =videoId;
        const response = await fetch('/getSessionByID', {
            method: 'POST',
            body: JSON.stringify({ sessionId: sessionId }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        getDate(data.session);
        const videoPath = data.session.videos.find(video => video.id === videoId).path;
        fetchVideo();
        fetchVideoPrediction(videoPath)
    } catch (error) {
        console.error('Fetch error:', error);
        return '';
    }
}

function getDate(session) {
    console.log(session)
    const dateString = session.date;
    const day = dateString.slice(4, 6);
    const month = dateString.slice(2, 4);
    const year = dateString.slice(0, 2);
    const hour = dateString.slice(6, 8);
    const minute = dateString.slice(8, 10);
    const second = dateString.slice(10);

    sessionHourDiv.textContent = `${hour}:${minute}:${second}`;
    sessionDataDiv.textContent = `${day}-${month}-20${year}`;
}

//Obtenim el video mp4
function fetchVideo() {
    const { userId, sessionId, videoId } = getUrlParams();
    const videoUrl = `/video/${userId}/${sessionId}/${videoId}`;
    const videoElement = document.getElementById('video');
    document.getElementById('video-source').src = videoUrl;
    videoElement.load();
    videoElement.addEventListener('loadedmetadata', function() {
        videoDurationDiv.textContent = videoElement.duration.toFixed(2) + ' segons';
    });
}
//Obtenim el json amb les emocions del video
async function fetchVideoPrediction(videoPath) {
    try {
        const response = await fetch('/getVideoPrediction', {
            method: 'POST',
            body: JSON.stringify({ videoPath: videoPath }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        var models = data[0].results.predictions[0].models;

        var listFacetmp = createFaceChart(models);
        createFactChart(models);

        listFraseProsody = getListsTopEmotions(models.prosody);
        listFraseLanguage = getListsTopEmotions(models.language);
        listFraseMedia = getAvgEmotionsText(listFraseProsody,listFraseLanguage)

        listProsody = combineEmotions(listFraseProsody);
        listLanguage = combineEmotions(listFraseLanguage);
        listFace = combineEmotions(listFacetmp.map(emotions => ({ emotions })));
        listMedia = getAvgEmotions(listProsody,listLanguage,listFace);
        createGlobalChart();
        createTextDiv();
    } catch (error) {
        console.error('Fetch error:', error);
        return '';
    }
}

function createGlobalChart(){
    var chartCanvas = document.getElementById("chartGlobal");
    createChart({ emotions: listMedia }, chartCanvas);
    var chart = Chart.getChart(chartCanvas)
    chart.options.plugins.legend.position = 'bottom';
    chart.update();
}

//Creació del grafic Face
function createFaceChart(models) {
    // Agrupem les emociones per segon
    const predictions = models.face.grouped_predictions[0].predictions;
    const groupedEmotions = {};
    predictions.forEach(prediction => {
        const second = Math.floor(prediction.time);
        if (!groupedEmotions[second]) {
            groupedEmotions[second] = [];
        }
        groupedEmotions[second].push(prediction.emotions);
    });

    // Calculem les 5 emocions amb major puntuació per segon
    const labels = Object.keys(groupedEmotions);
    const emotions = Object.values(groupedEmotions).map(emotionArray => {
        const emotionsBySecond = {};
        emotionArray.forEach(emotions => {
            emotions.forEach(({ name, score }) => {
                if (!emotionsBySecond[name]) {
                    emotionsBySecond[name] = 0;
                }
                emotionsBySecond[name] += score;
            });
        });

        // Obtenim les emocions que estan en el top 5
        const top5Emotions = Object.entries(emotionsBySecond)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, score]) => ({ name, score: score / emotionArray.length }));

        return top5Emotions.sort((a, b) => a.name.localeCompare(b.name));
    });

    const topEmotions = getTopEmotionsFaceModel(emotions);
    const emotions2 = Object.values(groupedEmotions).map(emotionArray => {
        const emotionsBySecond = {};
        emotionArray.forEach(emotions => {
            emotions.forEach(({ name, score }) => {
                if (!emotionsBySecond[name]) {
                    emotionsBySecond[name] = 0;
                }
                emotionsBySecond[name] += score;
            });
        });

        const top5Emotions = Object.entries(emotionsBySecond)
            .sort(([, a], [, b]) => b - a)
            .map(([name, score]) => ({ name, score: score / emotionArray.length }));

        return top5Emotions.sort((a, b) => a.name.localeCompare(b.name));
    });

    const chartData = {
        labels: labels,
        datasets: []
    };

    const emotionNames = [];
    console.log(emotions2)
    emotions2.forEach(emotionArray => {
        emotionArray.forEach(emotion => {
            if (topEmotions.includes(emotion.name)) {
                if (!emotionNames.includes(emotion.name)) {
                    emotionNames.push(emotion.name);
                    const dataset = {
                        label: emotion.name,
                        data: labels.map((_, j) => {
                            const secEmotions = emotions2[j].find(em => em.name === emotion.name);
                            return secEmotions ? secEmotions.score : 0;
                        }),
                        borderColor: emotionBorderColors[emotion.name] || 'rgba(0, 0, 0, 1)',
                        backgroundColor: emotionColors[emotion.name] || 'rgba(0, 0, 0, 0.5)',
                        fill: false,
                        tension: 0.1,
                        pointRadius: 0,          
                        pointHoverRadius: 0,      
                        hidden: !topEmotions.slice(0, 5).includes(emotion.name)
                    };
                    chartData.datasets.push(dataset);
                }
            }
        });
    });

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
                        text: 'Time (s)'
                    },
                    ticks: {
                    maxTicksLimit: 6,
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
                        y: {min: 0, max: 1},
                      }
                }

            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuad'
            },
        },
    };

    // Creem el grafic
    var myChart = new Chart(
        document.getElementById('chart1'),
        config
    );

    return emotions2;
}

//Creació del grafic FACT
function createFactChart(models) {
    const predictions = models.face.grouped_predictions[0].predictions;
    const predictionsBySecond = {};
    let lastFramePrediction = {};
    let second = 0;

    predictions.forEach((prediction) => {
        const currentSecond = Math.floor(prediction.time);
        for (let i = second + 1; i < currentSecond; i++) {
            predictionsBySecond[i] = predictionsBySecond[i] || [];
            predictionsBySecond[i].push(lastFramePrediction[second] || null);
        }
        second = currentSecond;
        predictionsBySecond[second] = predictionsBySecond[second] || [];
        predictionsBySecond[second].push(prediction);
        lastFramePrediction[second] = prediction;
    });

    const facsWithMaxScoreBySecond = {};
    let lastFACS = null;

    for (let second = 0; second <= Object.keys(predictionsBySecond).length; second++) {
        let maxScore = -1;
        let maxFACS = null;

        predictionsBySecond[second]?.forEach(prediction => {
            prediction.facs.forEach(facs => {
                if (facs.score > maxScore) {
                    maxScore = facs.score;
                    maxFACS = facs.name;
                }
            });
            lastFACS = maxFACS;
        });

        facsWithMaxScoreBySecond[second] = lastFACS;
    }

    const times = Object.keys(facsWithMaxScoreBySecond);
    const facsNames = times.map(second => facsWithMaxScoreBySecond[second]);
    const facsScores = times.map(second => {
        const prediction = predictionsBySecond[second]?.find(prediction =>
            prediction.facs.some(facs => facs.name === facsWithMaxScoreBySecond[second])
        );
        const facs = prediction?.facs.find(facs => facs.name === facsWithMaxScoreBySecond[second]);
        return facs?.score || null;
    });

    for (let i = 0; i < facsScores.length; i++) {
        if (!facsScores[i]) {
            facsScores[i] = facsScores[i - 1];
        }
    }

    const ctx = document.getElementById('chart2').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times.map(second => second),
            datasets: [{
                label: 'FACS with the Highest Score per Second',
                data: facsScores,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointBorderColor: '#fff',
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
                pointHoverBorderColor: 'rgba(220, 220, 220, 1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const index = context.dataIndex;
                            const facsName = facsNames[index];
                            const score = context.raw.toFixed(2);
                            return `FACS: ${facsName}, Score: ${score}`;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14
                        },
                        padding: 20
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuad'
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (Seconds)',
                        font: {
                            size: 14
                        }
                    },
                    ticks: {
                    maxTicksLimit: 6,
                    autoSkip: true
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'FACS Score',
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}

//Creem la part dels textos
function createTextDiv() {
    var analyzedData = listFraseMedia;
    var analyzedTextContainer = document.getElementById('analyzedText');
    analyzedTextContainer.innerHTML = "";
    phraseNumberDiv.textContent = analyzedData.length
    analyzedData.forEach(function (data, index) {
        var textDiv = document.createElement('div');
        textDiv.classList.add('analyzedText2');
        var textContentDiv = document.createElement('div');
        textContentDiv.classList.add('text-content');
        var textElement = document.createElement('p');
        textElement.innerHTML = "<strong>Text:</strong> " + data.text;
        textContentDiv.appendChild(textElement);
        var timeElement = document.createElement('p');
        timeElement.innerHTML = "<strong>Temps Inici:</strong> " + data.time.begin.toFixed(2)
            + "s <br><strong>Temps Final:</strong> " + data.time.end.toFixed(2) + "s";
        textContentDiv.appendChild(timeElement);
        var chartDiv = document.createElement('div');
        chartDiv.classList.add('chart-container');
        var chartCanvas = document.createElement('canvas');
        chartCanvas.id = "chart-doughnut" + index;
        chartCanvas.width = 400;
        chartCanvas.height = 200;
        textDiv.appendChild(textContentDiv);
        chartDiv.appendChild(chartCanvas);
        textDiv.appendChild(chartDiv);
        analyzedTextContainer.appendChild(textDiv);
        createChart(data, chartCanvas);
    })
}

//Grafic dels Textos
function createChart(data, chartCanvas) {
    var top5Emotions = data.emotions.slice(0, 5).map(emotion => emotion.name);
    var top5EmotionsScores = data.emotions.slice(0, 5).map(emotion => emotion.score);

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
    new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: chartOptions
    });
}