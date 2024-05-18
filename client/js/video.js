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

function disableButtons(){
    newUsaveBtn.disabled = true;
    profileBtn.disabled = true;
    searchInput.disabled = true;
}
function enableButtons(){
    newUsaveBtn.disabled = false;
    profileBtn.disabled = false;
    searchInput.disabled = false;
}

startButton.addEventListener('click', async () => {
    //Assignem els dispositius d'audio i video
    try {
        batchBtn.disabled= true;
        uploadBtn.disabled= true;
        console.log("video "+videoSelect.value )
        console.log("audio "+ audioSelect.value )
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
        
        const SessionData = {
            userId: sessionStorage.getItem('selectedUserId'),
            date: sessionStorage.getItem('currentSession')
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
        sessionStorage.setItem('currentSession',responseData.sessionDate);
      } catch (error) {
        console.error('Error:', error);
      }
});

// Evento al hacer clic en "Finalizar Grabación"
stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    audioStream.getTracks().forEach(track => track.stop());
    sessionStorage.removeItem('currentSession');
});

// Evento al hacer clic en "Finalizar Completamente"
finishButton.addEventListener('click', () => {
    videoStream.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
    startButton.disabled = false;
    stopButton.disabled = true;
    finishButton.disabled = false;
    batchBtn.disabled= false;
    uploadBtn.disabled= false;
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
      try {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('currentSession',sessionStorage.getItem('currentSession'));
        formData.append('video', blob, 'video.webm');
        
        for (const entry of formData.entries()) {
            console.log(entry[0], entry[1]); 
        }

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
    finishButton.disabled = true;
  }