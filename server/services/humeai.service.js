const config = require("../config/config");

const formData = new FormData();

const fileFile = document.getElementById("file").files[0];
formData.append("file", fileFile);

formData.append("json", JSON.stringify({
    "transcription": {
      "language": "es"
    },
    "models": {
      "face": {
        "fps_pred": 1,
        "facs": {},
        "descriptions": {}
      },
      "burst": {},
      "prosody": {
        "granularity": "sentence"
      },
      "language": {
        "granularity": "sentence",
        "sentiment": {},
        "toxicity": {}
      },
      "ner": {},
      "facemesh": {}
    }
  }));

// Start inference job from local file (POST /v0/batch/jobs)
const response = await fetch("https://api.hume.ai/v0/batch/jobs", {
  method: "POST",
  headers: {
    "X-Hume-Api-Key": config.API_HUMEAI
  },
  body: formData,
});

const body = await response.json();
console.log(body);