//Codigo Para las opciones de registrar y iniciar sesion
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const registerError = document.getElementById("registerError");
const loginError = document.getElementById("loginError");

registerForm.style.display = "none";

function toggleForm() {
  

  if (loginForm.style.display === "none") {
    loginForm.style.display = "flex";
    registerForm.style.display = "none";
    registerError.textContent="";
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "flex";
    registerError.textContent="";
  }
}

registerForm.addEventListener('submit', async (event)=> {
  // Evitamos que el formulario se envíe automáticamente
  event.preventDefault();

  registerError.textContent="";
  
  const userData = {
    name: registerForm.name.value,
    email: registerForm.email.value,
    password: registerForm.password.value,
    code: registerForm.code.value
  };

  try {
    const res = await fetch('/api/users/register', { 
      method: 'POST', 
      body: JSON.stringify(userData),
      headers: {'Content-Type': 'application/json'}  
    });
  
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        location.assign('/main');
      } else {
        location.assign('/');
      }
    } else if (res.status === 400) {
      const errorData = await res.json();
      const errorMessage = errorData.message;
      registerForm.reset();
      registerError.textContent = errorMessage;
      console.error(`Error 400 - ${errorMessage}`);
    } else {
      throw new Error('Error de red o código de estado no esperado');
    }
  } catch (error) {
    console.error('Error al registrar el usuari:', error);
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.textContent = "";

  const userData = {
    email: loginForm.email.value,
    password: loginForm.password.value
  };

  try {
    const res = await fetch('/api/users/login', { 
      method: 'POST', 
      body: JSON.stringify(userData),
      headers: {'Content-Type': 'application/json'}  
    });

    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        location.assign('/main');
      } else {
        location.assign('/');
      }
    } else if (res.status === 400) {
      const errorData = await res.json();
      const errorMessage = errorData.message;
      registerForm.reset();
      loginError.textContent = errorMessage;
      console.error(`Error 400 - ${errorMessage}`);
    } else if (res.status === 401) {
      const errorMessage = "Contrasenya invàlida"; 
      registerForm.reset();
      loginError.textContent = errorMessage;
      console.error(`Error 401 - ${errorMessage}`);
    } else if (res.status === 404) {
      const errorMessage = "Usuari no trobat"; 
      registerForm.reset();
      loginError.textContent = errorMessage;
      console.error(`Error 404 - ${errorMessage}`);
    } else {
      throw new Error('Error de red o código de estado no esperado');
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
  }
});

