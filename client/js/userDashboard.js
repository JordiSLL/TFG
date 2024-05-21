const sessionContainer = document.getElementById('sessionContainer');
const errorMSJ = document.getElementById('errorDiv');
function verificarSelectedUserId() {
    const selectedUserId = sessionStorage.getItem('selectedUserId');
    if (selectedUserId) {
        console.log('El valor de selectedUserId es:', selectedUserId);
        fetchsession();
    } else {
        console.log('No hay ningún valor almacenado en selectedUserId');
    }
}

function fetchsession(){
    fetch('/getSessionsByUserID',{
        method: 'POST',
        body: JSON.stringify({ userId: sessionStorage.getItem('selectedUserId') }),
        headers: { 'Content-Type': 'application/json' }
    })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); 
  })
  .then(data => {
    console.log(data)
    if (!Array.isArray(data.sessions) || data.sessions.length === 0) {
      console.log('No sessions found for the user.');
      sessionContainer.style.display = 'none';
      errorMSJ.style.display = 'block';
    } else {
      console.log('Sessions found:', data);
      errorMSJ.style.display ='none';
      sessionContainer.style.display = 'block';
    }
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });
}