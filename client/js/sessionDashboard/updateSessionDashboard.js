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
        emotionListVideo = groupAndAverageEmotions(videoEmotions, ['Face', 'Prosody', 'Language']);
    } else if (isSpeechModelActive && isLanguageModelActive) {
        console.log("Speech i language");
        emotionListVideo = groupAndAverageEmotions(videoEmotions, ['Language', 'Prosody']);
    } else if (isSpeechModelActive && isFaceModelActive) {
        console.log("Speech i face");
        emotionListVideo = groupAndAverageEmotions(videoEmotions, ['Face', 'Prosody']);
    } else if (isLanguageModelActive && isFaceModelActive) {
        console.log("Language i face");
        emotionListVideo = groupAndAverageEmotions(videoEmotions, ['Language', 'Face']);
    } else if (isSpeechModelActive) {
        console.log("speech");
        emotionListVideo = getModelLists(videoEmotions, 'Prosody');
    } else if (isLanguageModelActive) {
        console.log("language");
        emotionListVideo = getModelLists(videoEmotions, 'Language'); 
    } else if (isFaceModelActive) {
        console.log("face");
        emotionListVideo = getModelLists(videoEmotions, 'Face'); 
    } else {
        console.log("Ningun Model actiu");
        emotionListVideo = groupAndAverageEmotions(videoEmotions, ['Face', 'Prosody', 'Language']);
    }
    
    updateChartsText(emotionListVideo);
    
    
    //const chartCanvas = document.getElementById("chartGlobal");
    //const chart = Chart.getChart(chartCanvas); 
    
    //updateChart(chart,{ emotions: emotionList });
    console.log("emotionList")
    console.log(emotionList)
}
//sessionEmotions videoEmotions
function getModelLists(list, modelName) {
    return list.map(emotion => emotion[modelName]);
}

function updateChartsText(emotionList) {
    emotionList.forEach((data, index) => {
        console.log(data)
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
    console.log(data)
    const top5Emotions = data.emotions.slice(0, 5).map(emotion => emotion.name);
    const top5EmotionsScores = data.emotions.slice(0, 5).map(emotion => emotion.score);
    console.log(top5Emotions)

    const backgroundColors = top5Emotions.map(emotion => emotionColors[emotion] || 'rgba(0, 0, 0, 0.5)');
    const borderColors = top5Emotions.map(emotion => emotionBorderColors[emotion] || 'rgba(0, 0, 0, 1)');

    chart.data.labels = top5Emotions;
    chart.data.datasets[0].data = top5EmotionsScores;
    chart.data.datasets[0].backgroundColor = backgroundColors;
    chart.data.datasets[0].borderColor = borderColors;
    chart.update();
}

function groupAndAverageEmotions(list, modelNames) {
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