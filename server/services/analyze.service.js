async function analyzeJsonVideo(jsonData) {
    //console.log(jsonData)
    var models = jsonData[0].results.predictions[0].models;
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
async function analyzeJsonSession(session) {
    console.log(session)
    var listFace = avgEmotionsSession(session, ['Face']);
    var listLanguage = avgEmotionsSession(session, ['Language']);
    var listProsody = avgEmotionsSession(session, ['Prosody']);

    const emotions = {
        listFace: listFace,
        listProsody: listProsody,
        listLanguage: listLanguage
      };
      console.log(listFace)
      console.log(listLanguage)
      console.log(listProsody)
      console.log("Final emotions 2")
    return emotions;
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

function avgEmotionsSession(session, modelNames) {
    const emotions = {};

    modelNames.forEach(modelName => {
        session.videos.forEach(video => {
            if (video.emotion && video.emotion[modelName]) {
                video.emotion[modelName].forEach(emotion => {
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

module.exports = {
    analyzeJsonVideo,
    analyzeJsonSession
};