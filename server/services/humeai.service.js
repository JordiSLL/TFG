const config = require("../config/config");
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function sendVideoToAPI(filePath) {
  try {
    console.log(filePath)
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);
    formData.append('file', fileStream);

    //console.log(fileStream)
    formData.append("json", JSON.stringify({
      "transcription": {
        "language": "es"
      },
      "models": {
        "face": {
          "fps_pred": 30,
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
        accept: 'application/json',
        "X-Hume-Api-Key": config.API_HUMEAI
      },
      body: formData,
    });

    const body = await response.json();
    console.log(body);
    if (body && body.job_id) {
      return body.job_id;
  } else {
      return -1;
  }
  } catch (error) {
    console.error('Error sending data to API:', error);
    throw error;
  }
}

async function getJsonAPI(jobId) {
  try {
    console.log(jobId)

    const response = await fetch(`https://api.hume.ai/v0/batch/jobs/${jobId}/predictions`, {
      method: "GET",
      headers: {
        "X-Hume-Api-Key": config.API_HUMEAI
      },
    });
    const body = await response.json();
    console.log(body);
    return body;
  } catch (error) {
    console.error('Error receiving data:', error);
    throw error;
  }
}

async function getJobDetail(jobId) {
  // Get job details (GET /v0/batch/jobs/:id)
  const response = await fetch(`https://api.hume.ai/v0/batch/jobs/${jobId}`, {
    method: "GET",
    headers: {
      "X-Hume-Api-Key": config.API_HUMEAI
    },
  });

  const body = await response.json();
  console.log(body);
  console.log(body.state);
  return body.state
}

module.exports = {
  sendVideoToAPI,
  getJsonAPI,
  getJobDetail
};