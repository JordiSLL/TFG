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
    let emotionListVideo;
    let emotionListGlobal;

    if (isSpeechModelActive && isLanguageModelActive && isFaceModelActive) {
        console.log("Tots els models actius");
        emotionListGlobal = avgEmotionsSession(sessionEmotions, ['Face', 'Prosody', 'Language']);
        emotionListVideo = avgEmotionsVideo(videoEmotions, ['Face', 'Prosody', 'Language']);
    } else if (isSpeechModelActive && isLanguageModelActive) {
        console.log("Speech i language");
        emotionListGlobal = avgEmotionsSession(sessionEmotions, ['Language', 'Prosody']);
        emotionListVideo = avgEmotionsVideo(videoEmotions, ['Language', 'Prosody']);
    } else if (isSpeechModelActive && isFaceModelActive) {
        console.log("Speech i face");
        emotionListGlobal = avgEmotionsSession(sessionEmotions, ['Face', 'Prosody']);
        emotionListVideo = avgEmotionsVideo(videoEmotions, ['Face', 'Prosody']);
    } else if (isLanguageModelActive && isFaceModelActive) {
        console.log("Language i face");
        emotionListGlobal = avgEmotionsSession(sessionEmotions, ['Language', 'Face']);
        emotionListVideo = avgEmotionsVideo(videoEmotions, ['Language', 'Face']);
    } else if (isSpeechModelActive) {
        console.log("speech");
        emotionListGlobal = sessionEmotions['Prosody'];
        emotionListVideo = getModelLists(videoEmotions, 'Prosody');
    } else if (isLanguageModelActive) {
        console.log("language");
        emotionListGlobal = sessionEmotions['Language']; 
        emotionListVideo = getModelLists(videoEmotions, 'Language'); 
    } else if (isFaceModelActive) {
        console.log("face");
        emotionListGlobal = sessionEmotions['Face']; 
        emotionListVideo = getModelLists(videoEmotions, 'Face'); 
    } else {
        console.log("Ningun Model actiu");
        emotionListGlobal = avgEmotionsSession(sessionEmotions, ['Face', 'Prosody', 'Language']);
        emotionListVideo = avgEmotionsVideo(videoEmotions, ['Face', 'Prosody', 'Language']);
    }
    console.log(emotionListVideo)
    updateChartsText(emotionListVideo);
    const chartCanvas = document.getElementById("chartGlobal");
    const chart = Chart.getChart(chartCanvas); 
    updateChart(chart,{ emotions: emotionListGlobal });
    updateChartLine(emotionListVideo);
}

function getModelLists(list, modelName) {
    return list.map(emotion => emotion[modelName]);
}

function updateChartsText(emotionList) {
    emotionList.forEach((data, index) => {
       // console.log(data)
        const chartCanvas = document.getElementById(`chart-doughnut${index}`);
        if (chartCanvas) {
            const chart = Chart.getChart(chartCanvas); 
            if (chart) {
                updateChart(chart, { emotions:data}); 
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

function updateChartLine(emotions){
    const chartCanvas = document.getElementById("chart");
    const chart = Chart.getChart(chartCanvas); 
    var firstEmotionScores = [];
    emotions.forEach((video,index) => {
        firstEmotionScores.push(emotions[index][0])
    })
    console.log("firstEmotionScores")
    console.log(firstEmotionScores)
    const videoObject = {};

    for (let i = 1; i <= emotions.length; i++) {
        videoObject[i] = 0.5;
    }
    const chartData = {
        labels: Object.keys(videoObject),
        datasets: []
    };

    const emotionMap = {};
    emotions.forEach((emotionArray, videoIndex) => {
        emotionArray.forEach(emotion => {
            if (firstEmotionScores.map(e => e.name).includes(emotion.name)) {
                if (!emotionMap[emotion.name]) {
                    emotionMap[emotion.name] = {
                        label: emotion.name,
                        data: Array(videos.length).fill(0),
                        borderColor: emotionBorderColors[emotion.name] || 'rgba(0, 0, 0, 1)',
                        backgroundColor: emotionColors[emotion.name] || 'rgba(0, 0, 0, 0.5)',
                        fill: false,
                        tension: 0.1,
                        pointRadius: 0,
                        pointHoverRadius: 0
                    };
                }
                emotionMap[emotion.name].data[videoIndex] = emotion.score;
            }
        });
    });
    chartData.datasets = Object.values(emotionMap);
    chart.data = chartData;
    chart.update();
}

function avgEmotionsVideo(list, modelNames) {
    return list.map(video => {
        const emotionSums = {};
        const emotionCounts = {};

        modelNames.forEach(modelName => {
            const emotions = video[modelName];
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

function avgEmotionsSession(data, modelNames) {
    const emotions = {};

    modelNames.forEach(modelName => {
        data[modelName].forEach(emotion => {
            if (!emotions[emotion.name]) {
                emotions[emotion.name] = {
                    count: 0,
                    totalScore: 0
                };
            }
        });
    });

    modelNames.forEach(modelName => {
        data[modelName].forEach(emotion => {
            emotions[emotion.name].count++;
            emotions[emotion.name].totalScore += emotion.score;
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