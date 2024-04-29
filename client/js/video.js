
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
    try {
        batchBtn.disabled= true;
        uploadBtn.disabled= true;
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
/*
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
    startButton.disabled = false;
    stopButton.disabled = true;
    finishButton.disabled = true;
}*/

async function handleStop() {
    const blob = new Blob(recordedChunks, {
      type: 'video/mp4'
    });
  
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async function() {
      const base64data = reader.result;
      const userId = sessionStorage.getItem('selectedUserId');
  
      try {
        const response = await fetch('/uploadVideo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ base64data, userId})
        });
        if (!response.ok) {
          throw new Error('Error en la subida del vídeo');
        }
        const data = await response.json();
        console.log('Vídeo subido correctamente:', data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
    recordedChunks = [];
    startButton.disabled = false;
    stopButton.disabled = true;
    finishButton.disabled = true;
  }