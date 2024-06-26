const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const finishButton = document.getElementById('finishButton');
const videoElement = document.getElementById('video');

const customcheckbox = document.getElementById('custom-checkbox');
const questionariMode = document.getElementById('questionariMode');
const batchBtn = document.getElementById('batch-btn');
const uploadBtn = document.getElementById('upload-btn');
const uploadVideoDiv = document.getElementById('uploadVideo');

const videoBatchDiv = document.getElementById('videoBatch');
const checkbox = document.querySelector('.custom-checkbox input');

let mediaRecorder;
let recordedChunks = [];
let audioStream;
let videoStream;

batchBtn.addEventListener("click", function () {
    batchUpload('batch');
});
uploadBtn.addEventListener("click", function () {
    batchUpload('upload');
});

function verificarSelectedUserId() {
    const selectedUserId = sessionStorage.getItem('selectedUserId');
    if (selectedUserId) {
        console.log('El valor de selectedUserId es:', selectedUserId);
        batchBtn.style.display = 'block';
        uploadBtn.style.display = 'block';
        customcheckbox.style.display = 'flex';

    } else {
        console.log('No hay ningún valor almacenado en selectedUserId');
    }
}

function batchUpload(btnClicked) {
    if (btnClicked === 'batch') {
        if (batchBtn.classList.contains("selected")) {
            videoBatchDiv.style.display = "none";
            batchBtn.classList.remove("selected");
            enableButtons();
        } else {
            uploadBtn.classList.remove("selected");
            uploadVideoDiv.style.display = "none";
            videoBatchDiv.style.display = "block";
            batchBtn.classList.add("selected");
            disableButtons();
        }
    } else if (btnClicked === 'upload') {
        if (uploadBtn.classList.contains("selected")) {
            uploadVideoDiv.style.display = "none";
            uploadBtn.classList.remove("selected");
            console.log("Disabled true");
            enableButtons();
        } else {
            batchBtn.classList.remove("selected");
            videoBatchDiv.style.display = "none";
            uploadVideoDiv.style.display = "block";
            uploadBtn.classList.add("selected");
            console.log("Disabled false");
            disableButtons();
        }
    }
}

function disableButtons() {
    newUsaveBtn.disabled = true;
    profileBtn.disabled = true;
    searchInput.disabled = true;
    mainBtn.disabled = true;
    documentationBtn.disabled = true;
    sessionBtn.disabled = true;
    questionariMode.disabled = true;
}
function enableButtons() {
    newUsaveBtn.disabled = false;
    profileBtn.disabled = false;
    searchInput.disabled = false;
    mainBtn.disabled = false;
    documentationBtn.disabled = false;
    sessionBtn.disabled = false;
    questionariMode.disabled = false;
}

startButton.addEventListener('click', async () => {
    //Assignem els dispositius d'audio i video
    try {
        batchBtn.disabled = true;
        uploadBtn.disabled = true;
        console.log("video " + videoSelect.value)
        console.log("audio " + audioSelect.value)
        const videoConstraints = {
            deviceId: videoSelect.value ? { exact: videoSelect.value } : undefined
        };
        const audioConstraints = {
            deviceId: audioSelect.value ? { exact: audioSelect.value } : undefined
        };
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints
        });
        audioStream = await navigator.mediaDevices.getUserMedia({
            audio: audioConstraints
        });

        const stream = new MediaStream([...videoStream.getTracks(), ...audioStream.getTracks()]);
        videoElement.srcObject = stream;

        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = handleStop;
        mediaRecorder.start();
        startButton.disabled = true;
        stopButton.disabled = false;
        finishButton.disabled = false;
    } catch (err) {
        console.error('Error al acceder a los dispositivos:', err);
    }
    //Creem la nova sessió
    try {
        const tmpcurrentSession = JSON.parse(sessionStorage.getItem('currentSession'));
        if (!tmpcurrentSession) {
            const SessionData = {
                userId: sessionStorage.getItem('selectedUserId'),
                date: tmpcurrentSession ? tmpcurrentSession.sessionDate : '',
                IndQuestionari: checkbox.checked ? 1: 0
            };

            const response = await fetch('/createSession', {
                method: 'POST',
                body: JSON.stringify(SessionData),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Error al crear la sessio');
            }

            const responseData = await response.json();

            const currentSession = {
                sessionDate: responseData.sessionDate,
                sessionId: responseData.sessionId
            };

            console.log(currentSession);
            sessionStorage.setItem('currentSession', JSON.stringify(currentSession));
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Evento al hacer clic en "Finalizar Grabación"
stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    audioStream.getTracks().forEach(track => track.stop());

});

finishButton.addEventListener('click', () => {
    console.log(mediaRecorder.state);
    if (mediaRecorder.state === "recording" || mediaRecorder.state === "paused") {
        // Crear una promesa que se resolverá cuando se dispare el evento 'stop'
        const stopRecording = new Promise((resolve, reject) => {
            mediaRecorder.addEventListener('stop', resolve, { once: true });
            mediaRecorder.addEventListener('error', reject, { once: true });
        });

        mediaRecorder.stop();

        // Esperamos a que se dispare el evento 'stop'
        stopRecording.then(() => {
            videoStream.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
            startButton.disabled = false;
            stopButton.disabled = true;
            finishButton.disabled = true;
            batchBtn.disabled = false;
            uploadBtn.disabled = false;
            videoBatchDiv.style.display = "none";
            batchBtn.classList.remove("selected");
            enableButtons();
            sessionStorage.removeItem('currentSession');
        }).catch(error => {
            console.error('Error stopping the media recorder:', error);
        });
    } else if (mediaRecorder.state === "inactive") {
        videoStream.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
        startButton.disabled = false;
        stopButton.disabled = true;
        finishButton.disabled = true;
        batchBtn.disabled = false;
        uploadBtn.disabled = false;
        videoBatchDiv.style.display = "none";
        batchBtn.classList.remove("selected");
        enableButtons();
        sessionStorage.removeItem('currentSession');
        console.log('MediaRecorder is inactive, actions performed directly.');
    } 
});


// Función para manejar los datos disponibles durante la grabación
function handleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
    }
}

async function handleStop() {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm'
    });

    const userId = sessionStorage.getItem('selectedUserId');
    const currentSession = JSON.parse(sessionStorage.getItem('currentSession'));

    try {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('SessionDate', currentSession.sessionDate);
        formData.append('SessionId', currentSession.sessionId);
        formData.append('video', blob, 'video.webm');

        const response = await fetch('/uploadVideo', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error('Error en la subida del vídeo');
        }
        const data = await response.json();
        console.log('Vídeo subido correctamente:', data);
    } catch (error) {
        console.error('Error:', error);
    }

    recordedChunks = [];
    startButton.disabled = false;
    stopButton.disabled = true;
    finishButton.disabled = false;
}


checkbox.addEventListener('change', function () {
    console.log('Checkbox checked:', checkbox.checked);
});

