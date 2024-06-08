// Funció per obtenir les emocions de les frases
function getListsTopEmotions(modelo) {
    const lists = [];
    modelo.grouped_predictions.forEach(predictionGroup => {
        predictionGroup.predictions.forEach(prediction => {
            const list = {
                text: prediction.text,
                time: prediction.time,
                emotions: getTopEmotions(prediction.emotions)
            };
            lists.push(list);
        });
    });
    return lists;
}
//Ordenem les emocions
function getTopEmotions(emotions) {
    return emotions.sort((a, b) => b.score - a.score);
    emotions.slice(0, 5);
}

function getTopEmotionsFaceModel(emotions) {
    const topEmotions = {};
    emotions.forEach(emotionArray => {
        emotionArray.forEach(emotion => {
            if (!topEmotions[emotion.name]) {
                topEmotions[emotion.name] = true;
            }
        });
    });
    return Object.keys(topEmotions);
}

//Calculem la mitja de les emocions
function getAvgEmotionsText(list1, list2) {
    const avgEmotions = list1.map((item, index) => {
        const emotions1 = item.emotions;
        const emotions2 = list2[index].emotions;
        const emotionsAvg = emotions1.map(emotion1 => {
            const emotion2 = emotions2.find(e => e.name === emotion1.name);
            return {
                name: emotion1.name,
                score: emotion2 ? (emotion1.score + emotion2.score) / 2 : emotion1.score
            };
        });
        
        return {
            text: item.text,
            time: item.time,
            emotions: emotionsAvg
        };
    });
    
    return avgEmotions;
}
//Agrupem les emocions en una unica llista per a cada model
function combineEmotions(list) {
    const emotions = {};
    list.forEach(item => {
        item.emotions.forEach(emotion => {
            if (!emotions[emotion.name]) {
                emotions[emotion.name] = [];
            }
            emotions[emotion.name].push(emotion.score);
        });
    });

    const emotionsResult = Object.keys(emotions).map(name => {
        const scores = emotions[name];
        const totalScore = scores.reduce((acc, score) => acc + score, 0);
        const avgScore = totalScore / scores.length;
        return {
            name: name,
            score: avgScore
        };
    });

    return getTopEmotions(emotionsResult);
}

function toggleButton(buttonId) {
    var button = document.getElementById(buttonId);
    button.classList.toggle('inactive');
}

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

function updateChartsBasedOnButtons() {
    let emotionTextList;
    let emotionList;
    if (isSpeechModelActive && isLanguageModelActive && isFaceModelActive) {
        console.log("Tots els models actius");
        emotionList = listMedia;
        emotionTextList = listFraseMedia;
    } else if (isSpeechModelActive && isLanguageModelActive) {
        console.log("Speech i language");
        emotionList = getAvgEmotions(listProsody,listLanguage);
        emotionTextList = listFraseMedia;
    } else if (isSpeechModelActive && isFaceModelActive) {
        console.log("Speech i face");
        emotionList = getAvgEmotions(listProsody,listFace);
        emotionTextList = listFraseProsody;
    } else if (isLanguageModelActive && isFaceModelActive) {
        console.log("Language i face");
        emotionList = getAvgEmotions(listLanguage,listFace);
        emotionTextList = listFraseLanguage;
    } else if (isSpeechModelActive) {
        console.log("speech");
        emotionList = listProsody;
        emotionTextList = listFraseProsody;
    } else if (isLanguageModelActive) {
        console.log("language");
        emotionList = listLanguage; 
        emotionTextList = listFraseLanguage;
    } else if (isFaceModelActive) {
        console.log("face");
        emotionList = listFace; 
        emotionTextList = listFraseMedia;
    } else {
        console.log("Ningun Model actiu");
        emotionList = listMedia; 
        emotionTextList = listFraseMedia;
    }
    updateChartsText(emotionTextList);
    const chartCanvas = document.getElementById("chartGlobal");
    const chart = Chart.getChart(chartCanvas); 
    updateChart(chart,{ emotions: emotionList });
}

function updateChartsText(emotionList) {
    emotionList.forEach((data, index) => {
        const chartCanvas = document.getElementById(`chart-doughnut${index}`);
        if (chartCanvas) {
            const chart = Chart.getChart(chartCanvas); 
            if (chart) {
                updateChart(chart, data); 
            }
        }
    });
}

function updateChart(chart, data) {
    console.log(data)
    const top5Emotions = data.emotions.slice(0, 5).map(emotion => emotion.name);
    const top5EmotionsScores = data.emotions.slice(0, 5).map(emotion => emotion.score);

    const backgroundColors = top5Emotions.map(emotion => emotionColors[emotion] || 'rgba(0, 0, 0, 0.5)');
    const borderColors = top5Emotions.map(emotion => emotionBorderColors[emotion] || 'rgba(0, 0, 0, 1)');

    chart.data.labels = top5Emotions;
    chart.data.datasets[0].data = top5EmotionsScores;
    chart.data.datasets[0].backgroundColor = backgroundColors;
    chart.data.datasets[0].borderColor = borderColors;
    chart.update();
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