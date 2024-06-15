const infoModel = document.getElementById("info2");

function globalResult(sessions) {

    const textPos = document.createElement('p');
    const textNeg = document.createElement('p');
    const topEmotion = document.createElement('p');
    console.log("sessions")
    console.log(sessions)
    const emotions = calculateAVGSession(sessions, ['Face', 'Language', 'Prosody'], 3)
    var { negativePercentage, positivePercentage } = calculateEmotionsPercentage(emotions);
    topEmotion.innerHTML = "<strong>" + emotions[0].name + "</strong>";
    topEmotion.classList.add("topEmotion");
    textNeg.innerHTML = '<strong><span class="negative">Emocions negatives: ' + negativePercentage.toFixed(2) + '%</span></strong>';
    textPos.innerHTML = '<strong><span class="positive">Emocions positives: ' + positivePercentage.toFixed(2) + '%</span></strong>';
    infoModel.classList.add(positivePercentage > negativePercentage ? "positiveDiv" : "negativeDiv");
    //console.log(avgmotion)
    const listFace = calculateAVGSession(sessions, ['Face'], 3)
    const listProsody = calculateAVGSession(sessions, ['Prosody'], 3)
    const listLanguage = calculateAVGSession(sessions, ['Language'], 3)
    var textInc = checkInconsistencies(listFace, listProsody, listLanguage);
    const resultInc = document.createElement('p');
    resultInc.innerHTML = textInc;
    infoModel.appendChild(topEmotion);
    infoModel.appendChild(textNeg);
    infoModel.appendChild(textPos);
    infoModel.appendChild(resultInc);
}

function calculateEmotionsPercentage(model) {
    console.log(model)
    const negativesSet = new Set(negatives);
    const positivesSet = new Set(positives);

    let negativeScore = 0;
    let positiveScore = 0;
    let totalScore = 0;

    model.forEach(emotion => {
        totalScore += emotion.score;
        if (negativesSet.has(emotion.name)) {
            negativeScore += emotion.score;
        }
        if (positivesSet.has(emotion.name)) {
            positiveScore += emotion.score;
        }
    });

    const negativePercentage = (negativeScore / totalScore) * 100;
    const positivePercentage = (positiveScore / totalScore) * 100;

    return { negativePercentage, positivePercentage };
}


function checkInconsistencies(Face, Language, Prosody) {
    const faceResults = calculateEmotionsPercentage(Face);
    const speechResults = calculateEmotionsPercentage(Prosody);
    const languageResults = calculateEmotionsPercentage(Language);

    const results = [
        { name: 'Face', ...faceResults },
        { name: 'Speech', ...speechResults },
        { name: 'Language', ...languageResults }
    ];

    let positiveCount = 0;
    let negativeCount = 0;
    let positiveModels = [];
    let negativeModels = [];

    results.forEach(result => {
        if (result.positivePercentage > 50) {
            positiveCount++;
            positiveModels.push(result.name);
        }
        if (result.negativePercentage > 50) {
            negativeCount++;
            negativeModels.push(result.name);
        }
    });

    let message = "<strong>Anàlisi d'emocions: </strong>";
    if (positiveCount === 3) {
        message += '<br>Els tres models mostren emocions predominantment <strong><span class="positive">positives</span></strong>.';
    } else if (negativeCount === 3) {
        message += '<br>Els tres models mostren emocions predominantment <strong><span class="negative">negatives</span></strong>.';
    } else if (positiveCount > 0 && negativeCount > 0) {
        message += '<strong><span class="negative">Inconsistències detectades</span></strong>';
        message += `<br>Models amb emocions positives: <span class="positive"><strong>${positiveModels.join(', ')}</strong></span>.`;
        message += `<br>Models amb emocions negatives: <span class="negative"><strong>${negativeModels.join(', ')}</strong></span>.`;
    } else {
        message += "<br>Els resultats són mixtos i no hi ha una predominància clara d'emocions positives o negatives en tots els models.";
    }
    console.log(message)
    return message;
}

function calculateAVGSession(data, modelNames, recentSessionWeight) {
    const emotions = {};
    
    const filteredData = data.filter(session => session.IdEstado === 0 || session.IdEstado === 4);

    if (filteredData.length === 0) {
        return [];
    }

    const mostRecentSession = filteredData.reduce((latest, session) => {
        return !latest || new Date(session.date) > new Date(latest.date) ? session : latest;
    }, null);

    modelNames.forEach(modelName => {
        filteredData.forEach(session => {
            if (session.emotion && session.emotion[modelName]) {
                const isMostRecent = session === mostRecentSession;
                const weight = isMostRecent ? recentSessionWeight : 1;

                session.emotion[modelName].forEach(emotion => {
                    if (!emotions[emotion.name]) {
                        emotions[emotion.name] = {
                            count: 0,
                            totalScore: 0
                        };
                    }
                    emotions[emotion.name].count += weight;
                    emotions[emotion.name].totalScore += emotion.score * weight;
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