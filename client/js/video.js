
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const finishButton = document.getElementById('finishButton');
const videoElement = document.getElementById('video');

const batchBtn = document.getElementById('batch-btn');
const uploadBtn = document.getElementById('upload-btn');
const uploadVideoDiv = document.getElementById('uploadVideo');

const videoBatchDiv = document.getElementById('videoBatch');

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

function batchUpload(btnClicked) {
    if (btnClicked === 'batch') {
        if (batchBtn.classList.contains("selected")) {
            videoBatchDiv.style.display = "none";
            batchBtn.classList.remove("selected");
        } else {
            uploadBtn.classList.remove("selected");
            uploadVideoDiv.style.display = "none";
            videoBatchDiv.style.display = "block";
            batchBtn.classList.add("selected");
        }
    } else if (btnClicked === 'upload') {
        if (uploadBtn.classList.contains("selected")) {
            uploadVideoDiv.style.display = "none";
            uploadBtn.classList.remove("selected");
        } else {
            batchBtn.classList.remove("selected");
            videoBatchDiv.style.display = "none";
            uploadVideoDiv.style.display = "block";
            uploadBtn.classList.add("selected");
        }
    }
}

startButton.addEventListener('click', async () => {
    try {
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
        startButton.style.display = 'none';
        stopButton.style.display = 'inline';
        finishButton.style.display = 'inline';
    } catch (err) {
        console.error('Error al acceder a los dispositivos:', err);
    }
});

// Evento al hacer clic en "Finalizar Grabación"
stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    audioStream.getTracks().forEach(track => track.stop());
});

// Evento al hacer clic en "Finalizar Completamente"
finishButton.addEventListener('click', () => {
    videoStream.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
    startButton.style.display = 'inline';
    stopButton.style.display = 'none';
    finishButton.style.display = 'none';
});

// Función para manejar los datos disponibles durante la grabación
function handleDataAvailable(event) {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
    }
}

// Función para manejar la finalización de la grabación
function handleStop() {
    const blob = new Blob(recordedChunks, {
        type: 'video/mp4'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'video.mp4';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
    recordedChunks = [];
    startButton.style.display = 'inline';
    stopButton.style.display = 'none';
    finishButton.style.display = 'none';
}
