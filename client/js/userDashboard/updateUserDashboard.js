let isSpeechModelActive = true;
let isLanguageModelActive = true;
let isFaceModelActive = true;

document.getElementById('faceModelButton').addEventListener('click', function () {
    isFaceModelActive = !isFaceModelActive;
    toggleButton('faceModelButton');
    updateChartsBasedOnButtons();
});

document.getElementById('speechModelButton').addEventListener('click', function () {
    isSpeechModelActive = !isSpeechModelActive;
    toggleButton('speechModelButton');
    updateChartsBasedOnButtons();

});

document.getElementById('languageModelButton').addEventListener('click', function () {
    isLanguageModelActive = !isLanguageModelActive;
    toggleButton('languageModelButton');
    updateChartsBasedOnButtons();
});

function toggleButton(buttonId) {
    var button = document.getElementById(buttonId);
    button.classList.toggle('inactive');
}

function updateChartsBasedOnButtons() {
    let emotionListSession;
    let emotionListGlobal;

    if (isSpeechModelActive && isLanguageModelActive && isFaceModelActive) {
       //console.log("Tots els models actius");
        emotionListGlobal = avgEmotionsSessions(sessionEmotions, ['Face', 'Prosody', 'Language']);
        emotionListSession = avgEmotionsSessionUpd(sessionEmotions, ['Face', 'Prosody', 'Language']);
    } else if (isSpeechModelActive && isLanguageModelActive) {
       //console.log("Speech i language");
        emotionListGlobal = avgEmotionsSessions(sessionEmotions, ['Language', 'Prosody']);
        emotionListSession = avgEmotionsSessionUpd(sessionEmotions, ['Language', 'Prosody']);
    } else if (isSpeechModelActive && isFaceModelActive) {
       //console.log("Speech i face");
        emotionListGlobal = avgEmotionsSessions(sessionEmotions, ['Face', 'Prosody']);
        emotionListSession = avgEmotionsSessionUpd(sessionEmotions, ['Face', 'Prosody']);
    } else if (isLanguageModelActive && isFaceModelActive) {
       //console.log("Language i face");
        emotionListGlobal = avgEmotionsSessions(sessionEmotions, ['Language', 'Face']);
        emotionListSession = avgEmotionsSessionUpd(sessionEmotions, ['Language', 'Face']);
    } else if (isSpeechModelActive) {
       //console.log("speech");
        emotionListGlobal = avgEmotionsSessions(sessionEmotions, ['Prosody']);
        emotionListSession = getModelLists(sessionEmotions, 'Prosody');
    } else if (isLanguageModelActive) {
       //console.log("language");
        emotionListGlobal = avgEmotionsSessions(sessionEmotions, ['Language']);
        emotionListSession = getModelLists(sessionEmotions, 'Language');
    } else if (isFaceModelActive) {
       //console.log("face");
        emotionListGlobal = avgEmotionsSessions(sessionEmotions, ['Face']);
        emotionListSession = getModelLists(sessionEmotions, 'Face');
    } else {
       //console.log("Ningun Model actiu");
        emotionListGlobal = avgEmotionsSessions(sessionEmotions, ['Face', 'Prosody', 'Language']);
        emotionListSession = avgEmotionsSessionUpd(sessionEmotions, ['Face', 'Prosody', 'Language']);
    }
   //console.log(emotionListSession)
   //console.log(emotionListGlobal)
    updateChartsText(emotionListSession);
    const chartCanvas = document.getElementById("chartGlobal");
    const chart = Chart.getChart(chartCanvas);
    updateChart(chart, { emotions: emotionListGlobal });
    updateChartLine(emotionListSession);
}

function getModelLists(list, modelName) {
   //console.log(list);
    return list.map(session => {
        if (session && Array.isArray(session[modelName])) {
            return session[modelName];
        } else {
            return [];
        }
    });
}

function avgEmotionsSessions(data, modelNames) {
    const emotions = {};

    const filteredData = data.filter(session => session !== null && session !== undefined);

    modelNames.forEach(modelName => {
        filteredData.forEach(session => {

            if (session[modelName]) {
                session[modelName].forEach(emotion => {

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

function avgEmotionsSessionUpd(list, modelNames) {
    return list.map(session => {
        const emotionSums = {};
        const emotionCounts = {};
        modelNames.forEach(modelName => {
            const emotions = session?.[modelName];
            if (Array.isArray(emotions)) {
                emotions.forEach(emotion => {
                    if (!emotionSums[emotion.name]) {
                        emotionSums[emotion.name] = 0;
                        emotionCounts[emotion.name] = 0;
                    }
                    emotionSums[emotion.name] += emotion.score;
                    emotionCounts[emotion.name] += 1;
                });
            }
        });

        const averagedEmotions = Object.keys(emotionSums).map(emotionName => {
            return {
                name: emotionName,
                score: emotionSums[emotionName] / emotionCounts[emotionName]
            };
        });

        return averagedEmotions.sort((a, b) => b.score - a.score);
    });
}

function updateChartsText(emotionList) {
    emotionList.forEach((data, index) => {
        ////console.log(data)
        const chartCanvas = document.getElementById(`chart-doughnut${index}`);
        if (chartCanvas) {
            const chart = Chart.getChart(chartCanvas);
            if (chart) {
                updateChart(chart, { emotions: data });
            }
        }
    });
}

function updateChart(chart, data) {
    //console.log(data)
    const top5Emotions = data.emotions.slice(0, 5).map(emotion => emotion.name);
    const top5EmotionsScores = data.emotions.slice(0, 5).map(emotion => emotion.score);
    //console.log(top5Emotions)
    const backgroundColors = top5Emotions.map(emotion => emotionColors[emotion] || 'rgba(0, 0, 0, 0.5)');
    const borderColors = top5Emotions.map(emotion => emotionBorderColors[emotion] || 'rgba(0, 0, 0, 1)');
    chart.data.labels = top5Emotions;
    chart.data.datasets[0].data = top5EmotionsScores;
    chart.data.datasets[0].backgroundColor = backgroundColors;
    chart.data.datasets[0].borderColor = borderColors;
    chart.update();
}

function updateChartLine(sessions) {
    const chartCanvas = document.getElementById("chart");
    const chart = Chart.getChart(chartCanvas);
    var firstEmotionScores = [];

    const filteredData = sessions.filter(session => session.length > 0).filter(session => session !== null);

   //console.log("filteredData")
   //console.log(filteredData)

    filteredData.forEach(session => {
        firstEmotionScores.push(session[0])
    })

   //console.log(emotions)
   //console.log(firstEmotionScores)
    const emotionMap = {};
    filteredData.forEach((emotionArray, index) => {
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
    
    chart.data.datasets = Object.values(emotionMap);
    chart.update();
}
