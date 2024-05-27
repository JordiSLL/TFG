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
});

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

