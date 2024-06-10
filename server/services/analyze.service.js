

async function analyzeJsonVideo(jsonData) {
    console.log("jsonData")
    //console.log(jsonData)
    var models = jsonData[0].results.predictions[0].models;
    console.log("models")
    //console.log(models)
    var listFacetmp = getEmotionsFace(models);

    var listFraseProsody = getListsTopEmotions(models.prosody);
    var listFraseLanguage = getListsTopEmotions(models.language);

    var listProsody = combineEmotions(listFraseProsody);
    var listLanguage = combineEmotions(listFraseLanguage);
    var listFace = combineEmotions(listFacetmp.map(emotions => ({ emotions })));
    
    const emotions = {
        listFace: listFace,
        listProsody: listProsody,
        listLanguage: listLanguage
      };
      console.log("Final emotions")
    return emotions;
}
async function analyzeJsonSession(jsonData) {
    console.log(jsonData)
}

function getEmotionsFace(models) {
    const predictions = models.face.grouped_predictions[0].predictions;
    const groupedEmotions = {};
    predictions.forEach(prediction => {
        const second = Math.floor(prediction.time);
        if (!groupedEmotions[second]) {
            groupedEmotions[second] = [];
        }
        groupedEmotions[second].push(prediction.emotions);
    });

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

        const top5Emotions = Object.entries(emotionsBySecond)
            .sort(([, a], [, b]) => b - a)
            .map(([name, score]) => ({ name, score: score / emotionArray.length }));

        return top5Emotions.sort((a, b) => a.name.localeCompare(b.name));
    });
    return emotions;
}

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

function getTopEmotions(emotions) {
    return emotions.sort((a, b) => b.score - a.score);
    emotions.slice(0, 5);
}

module.exports = {
    analyzeJsonVideo
};