const backButton = document.getElementById("backButton");
var listaProsody = [];
var listaLanguage = [];
var listaFace = [];
var listaMedia = [];
backButton.addEventListener("click", returnUserSession);

function returnUserSession() {
    const { userId } = getUrlParams();
    const { sessionId } = getUrlParams();
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

async function fetchSession() {
    try {
        const { sessionId } = getUrlParams();
        const { videoId } = getUrlParams();
        const response = await fetch('/getSessionByID', {
            method: 'POST',
            body: JSON.stringify({ sessionId: sessionId }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const videoPath = data.session.videos.find(video => video.id === videoId).path;
        fetchVideoPrediction(videoPath)
    } catch (error) {
        console.error('Fetch error:', error);
        return '';
    }
}

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
        console.log(data)
        //Asignacions de variables
        var models = data[0].results.predictions[0].models;
        listaProsody = obtenerListasConTopEmociones(models.prosody);
        listaLanguage = obtenerListasConTopEmociones(models.language);
        createTextDiv();
    } catch (error) {
        console.error('Fetch error:', error);
        return '';
    }
}
var analyzedData = [
];

function createTextDiv() {

    analyzedData = listaLanguage;
    var analyzedTextContainer = document.getElementById('analyzedText');
    analyzedTextContainer.innerHTML = "";
    analyzedData.forEach(function (data, index) {
        var textDiv = document.createElement('div');
        textDiv.classList.add('analyzedText2');
        var textContentDiv = document.createElement('div');
        textContentDiv.classList.add('text-content');
        var textElement = document.createElement('p');
        textElement.innerHTML = "<strong>Text:</strong> " + data.texto;
        textContentDiv.appendChild(textElement);
        var timeElement = document.createElement('p');
        timeElement.innerHTML = "<strong>Temps Inici:</strong> " + data.tiempo.begin.toFixed(2) 
        + "s <br><strong>Temps Final:</strong> " + data.tiempo.end.toFixed(2) + "s";
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

function createChart(data, chartCanvas) {

    var top5Emotions = data.emociones.slice(0, 5).map(emotion => emotion.name);
    var top5EmotionsScores = data.emociones.slice(0, 5).map(emotion => emotion.score);
    var chartData = {
        labels: top5Emotions,
        datasets: [{
            data: top5EmotionsScores,
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
            ],
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





/*
document.addEventListener('DOMContentLoaded', function () {
    async function fetchData() {
        try {
            const response = await fetch('../predictions-d4a1b4e2-0b6f-499c-914b-ccf13ba1ad62.json');
            const data = await response.json();
            var models = data[0].results.predictions[0].models;
            console.log(data);
            listaProsody = obtenerListasConTopEmociones(models.prosody);
            listaLanguage = obtenerListasConTopEmociones(models.language);
            console.log(models.face)
            //listaFace = obtenerListaTopEmocionesFace()
            listaLanguage.forEach((languageItem, index) => {
                const mediaEmotions = calcularMedia(languageItem.emociones, listaProsody[index].emociones);
                const item = {
                    texto: languageItem.texto,
                    tiempo: languageItem.tiempo,
                    emociones: mediaEmotions
                };
                listaMedia.push(item);
            });
            
            updateDashboard();

        } catch (error) {
            console.error('Error:', error);
        }
    }

    fetchData();
});*/

// Función para obtener el top 5 de emociones
function obtenerListasConTopEmociones(modelo) {
    const listas = [];
    modelo.grouped_predictions.forEach(predictionGroup => {
        predictionGroup.predictions.forEach(prediction => {
            const lista = {
                texto: prediction.text,
                tiempo: prediction.time,
                emociones: obtenerTopEmociones(prediction.emotions)
            };
            listas.push(lista);
        });
    });
    return listas;
}

function obtenerTopEmociones(emociones) {
    emociones.sort((a, b) => b.score - a.score);
    return emociones.slice(0, 5);
}

// Función para calcular la media de emociones de todas las frases
function calcularMediaEmociones(listas) {
    const totalEmociones = {};
    const totalFrases = listas.length;

    listas.forEach(lista => {
        lista.emociones.forEach(emocion => {
            if (!totalEmociones[emocion.name]) {
                totalEmociones[emocion.name] = emocion.score;
            } else {
                totalEmociones[emocion.name] += emocion.score;
            }
        });
    });

    const mediaEmociones = Object.entries(totalEmociones).map(([name, score]) => ({
        name,
        score: score / totalFrases
    }));

    mediaEmociones.sort((a, b) => b.score - a.score);
    return mediaEmociones.slice(0, 5);
}

// Función para calcular la media de emociones entre varios modelos
function calcularMediaEntreModelos(listasModelo1, listasModelo2) {
    const listaMedia = [];
    listasModelo1.forEach((modelo1Item, index) => {
        const mediaEmotions = calcularMedia(modelo1Item.emociones, listasModelo2[index].emociones);
        console.log(index)
        console.log(mediaEmotions)
        const item = {
            texto: modelo1Item.texto,
            tiempo: modelo1Item.tiempo,
            emociones: mediaEmotions
        };
        listaMedia.push(item);
    });
    return listaMedia;
}

// Función para calcular el top 5 de emociones agrupadas
function calcularTopEmocionesAgrupadas(listas) {
    console.log("calcularTopEmocionesAgrupadas")
    console.log(listas)
    const emocionesAgrupadas = {};
    listas.forEach(lista => {
        console.log(lista)
        lista.emociones.forEach(emocion => {
            if (!emocionesAgrupadas[emocion.name]) {
                emocionesAgrupadas[emocion.name] = {
                    name: emocion.name,
                    score: emocion.score,
                    count: 1
                };
            } else {
                emocionesAgrupadas[emocion.name].score += emocion.score;
                emocionesAgrupadas[emocion.name].count++;
            }
        });
    });
    const topEmocionesAgrupadas = Object.values(emocionesAgrupadas);
    console.log("topEmocionesAgrupadas")

    topEmocionesAgrupadas.sort((a, b) => b.score - a.score);
    console.log(topEmocionesAgrupadas)
    return topEmocionesAgrupadas.slice(0, 5);
}
// Función para calcular la media de emociones entre dos predicciones
function calcularMedia(emotions1, emotions2) {
    const media = [];
    emotions1.forEach((emotion1, index) => {
        const emotion2 = emotions2.find(emotion => emotion.name === emotion1.name);
        if (emotion2) {
            const mediaScore = (emotion1.score + emotion2.score) / 2;
            media.push({
                name: emotion1.name,
                score: mediaScore
            });
        } else {
            media.push({
                name: emotion1.name,
                score: emotion1.score
            });
        }
    });
    return media;
}

function toggleButton(buttonId) {
    var button = document.getElementById(buttonId);
    button.classList.toggle('inactive');
}

document.getElementById('faceModelButton').addEventListener('click', function () {
    toggleButton('faceModelButton');
});

document.getElementById('speechModelButton').addEventListener('click', function () {
    toggleButton('speechModelButton');
});

document.getElementById('languageModelButton').addEventListener('click', function () {
    toggleButton('languageModelButton');
});