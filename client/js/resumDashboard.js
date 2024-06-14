const errorMSJ = document.getElementById('errorDiv');
const sessionContainer = document.getElementById('sessionContainer');
const sessionsContainer = document.getElementById('sessions');

const searchSessionsInput = document.getElementById('searchSessionsInput');
const searchSessionsResults = document.getElementById('searchSessionsResults');

const sessionOpt = [];
var sessions = [];
var order = [];

document.addEventListener('DOMContentLoaded', async function () {
    searchSessionsInput.disabled = true;
});

document.addEventListener("click", function (e) {

    if (e.target !== searchSessionsInput && e.target !== searchSessionsResults && searchSessionsResults) {
        searchSessionsResults.innerHTML = '';
    }
});

function verificarSelectedUserId() {
    const selectedUserId = sessionStorage.getItem('selectedUserId');
    if (selectedUserId) {
        // console.log('El valor de selectedUserId es:', selectedUserId);
        fetchsession(selectedUserId);

    } else {
        console.log('No hay ningún valor almacenado en selectedUserId');
    }
}

function fetchsession(userId) {
    sessionsContainer.innerHTML = "";
    fetch('/getSessionsByUserID', {
        method: 'POST',
        body: JSON.stringify({ userId: userId }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (!Array.isArray(data.sessions) || data.sessions.length === 0) {
                console.log(data)
                sessionContainer.style.display = 'none';
                sessionContainer.classList.remove('show');
                errorMSJ.style.display = 'block';
                errorMSJ.offsetHeight;
                errorMSJ.classList.add('show');
                searchSessionsInput.disabled = true;
            } else {
                //console.log(data);
                searchSessionsInput.disabled = false;
                errorMSJ.style.display = 'none';
                errorMSJ.classList.remove('show');
                sessionContainer.style.display = 'block';
                sessionContainer.offsetHeight;
                sessionContainer.classList.add('show');
                sessions = data.sessions;
                data.sessions.sort((a, b) => b.date.localeCompare(a.date));
                createOptionsForSession(data.sessions);
                searchSessionsInput.value = sessionOpt[0].date;
                createSessionsDivs(data.sessions);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

searchSessionsInput.addEventListener('input', () => {
    const query = searchSessionsInput.value.trim();
    //console.log(query)
    const filteredResults = filterResultsSession(query);
    showResultsSession(filteredResults);
});

function filterResultsSession(query) {
    return sessionOpt.filter(item => {
        //console.log(item)
        const name = item.toLowerCase();
        const lowerQuery = query.toLowerCase();
        return name.includes(lowerQuery);
    });
}


searchSessionsInput.addEventListener('focus', () => {
    //console.log("searchSessionsInputF")
    showResultsSession(sessionOpt);
});

function showResultsSession(results) {
   // console.log("showResults2")
    //console.log(results)
    searchSessionsResults.innerHTML = '';
    results.forEach(item => {
        const option = document.createElement('div');
        option.textContent = item.date;
        option.classList.add('search-result');
        option.addEventListener('click', () => selectSession(item));
        searchSessionsResults.appendChild(option);
    });
}

function selectSession(item) {
    searchSessionsInput.value = item.date;
    searchSessionsResults.innerHTML = '';
    console.log(item.id)
    sessionsContainer.innerHTML= "";
    if(item.id === "ALL"){
    createSessionsDivs(sessions)
    }else{
        createSessionsDivs(sessions.filter(session => {
            return session.date === item.id;
        }))
        
    }
}

function createOptionsForSession(sessions) {
    sessionOpt.push({date:"Totes les Sessions",id:"ALL"})
    sessions.forEach(session => {
        const date = createDate(session);
        if (!sessionOpt.some(opt => opt.date === date) && (session.IdEstado === 0 || session.IdEstado === 4)) {
            sessionOpt.push({ date: date, id: session.date });
        }
    });
    console.log(sessionOpt)
}

function createDate(session) {
    const dateString = session.date;
    const day = dateString.slice(4, 6);
    const month = dateString.slice(2, 4);
    const year = dateString.slice(0, 2);
    const hour = dateString.slice(6, 8);
    const minute = dateString.slice(8, 10);
    const second = dateString.slice(10);
    const date = `${day}-${month}-20${year}`;

    return date;
}

function selectUser(userId, userName) {
    sessionStorage.setItem('selectedUserId', userId);
    searchInput.value = userName;
    verificarSelectedUserId();
    searchResults.innerHTML = '';
    searchSessionsInput.value = '';

}

function createSessionsDivs(sessions) {
    const sessionsContainer = document.getElementById('sessions');
    console.log(sessions);
    sessions.sort((a, b) => a.date.localeCompare(b.date));
    let haveOrder = order.length > 0;
    console.log("order")
    console.log(order)
    console.log(haveOrder)
    for (let index = sessions.length - 1; index >= 0; index--) {
        const session = sessions[index];
        //console.log(index);
        //console.log(session);
        if (session.IdEstado === 0 || session.IdEstado === 4) {
            if (!haveOrder)
                order.push({index:index+1, session:session });
            for (let i = 0; i < 5; i++) {
                const div = document.createElement('div');
                const textPos = document.createElement('p');
                const textNeg = document.createElement('p');
                const topEmotion = document.createElement('p');
                switch (i) {
                    case 0:
                        const textId = document.createElement('p');
                        const matchingOrder = order.find(item => item.session._id === session._id);
                        if(haveOrder)
                        textId.innerHTML = "<strong>Número Sessió: </strong>" + matchingOrder.index;
                        else
                        textId.innerHTML = "<strong>Número Sessió: </strong>" + (index+1);
                        div.appendChild(textId);
                        const textdate = document.createElement('p');
                        textdate.innerHTML = "<strong>Data: </strong>" + createDate(session);
                        div.appendChild(textdate);

                        break;

                    case 1:
                        div.appendChild(calculateQuest(div,session));
                        break;
                    case 2:
                        var { negativePercentage, positivePercentage } = calculateEmotionsPercentage(session.emotion.Face);
                        topEmotion.innerHTML = "<strong>" + session.emotion.Face[0].name + "</strong>";
                        topEmotion.classList.add("topEmotion");
                        textNeg.textContent = "Emocions negatives: " + negativePercentage.toFixed(2) + "%";
                        textPos.textContent = "Emocions positives: " + positivePercentage.toFixed(2) + "%";
                        div.classList.add(positivePercentage > negativePercentage ? "positiveDiv":"negativeDiv");
                        div.appendChild(topEmotion);
                        div.appendChild(textNeg);
                        div.appendChild(textPos);
                        break;
                    case 3:
                        var { negativePercentage, positivePercentage } = calculateEmotionsPercentage(session.emotion.Prosody);
                        topEmotion.innerHTML = "<strong>" + session.emotion.Prosody[0].name + "</strong>";
                        topEmotion.classList.add("topEmotion");
                        textNeg.textContent = "Emocions negatives: " + negativePercentage.toFixed(2) + "%";
                        textPos.textContent = "Emocions positives: " + positivePercentage.toFixed(2) + "%";
                        div.classList.add(positivePercentage > negativePercentage ? "positiveDiv":"negativeDiv");
                        div.appendChild(topEmotion);
                        div.appendChild(textNeg);
                        div.appendChild(textPos);
                        break;
                    case 4:
                        var { negativePercentage, positivePercentage } = calculateEmotionsPercentage(session.emotion.Language);
                        topEmotion.innerHTML = "<strong>" + session.emotion.Language[0].name + "</strong>";
                        topEmotion.classList.add("topEmotion");
                        textNeg.textContent = "Emocions negatives: " + negativePercentage.toFixed(2) + "%";
                        textPos.textContent = "Emocions positives: " + positivePercentage.toFixed(2) + "%";
                        div.classList.add(positivePercentage > negativePercentage ? "positiveDiv":"negativeDiv");
                        div.appendChild(topEmotion);
                        div.appendChild(textNeg);
                        div.appendChild(textPos);
                        break;

                    default:
                        console.log('Unexpected case:', i);
                }
                sessionsContainer.appendChild(div);
            }
        }
    }
}

function calculateQuest(div,session) {
    const text = document.createElement('p');
    if (session.IndQuestionari) {
        const resultQ = parseInt(session.resultQ);
        switch (true) {
            case (resultQ >= 0 && resultQ <= 4):
                resultClass = 'cap-minim';
                resultText = 'Cap - Mínim';
                break;
            case (resultQ >= 5 && resultQ <= 9):
                resultClass = 'lleu';
                resultText = 'Lleu';
                break;
            case (resultQ >= 10 && resultQ <= 14):
                resultClass = 'moderat';
                resultText = 'Moderat';
                break;
            case (resultQ >= 15 && resultQ <= 19):
                resultClass = 'moderadament-greu';
                resultText = 'Moderadament greu';
                break;
            case (resultQ >= 20 && resultQ <= 27):
                resultClass = 'greu';
                resultText = 'Greu';
                break;
            default:
                resultClass = 'no-definit';
                resultText = 'Resultat no definit';
        }
        text.textContent = resultText;
        div.id = resultClass;
    } else {
        text.innerHTML = "<strong>No s'ha utilitzat qüestionari</strong>";
    }
    return text;
}

function calculateEmotionsPercentage(model) {
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

