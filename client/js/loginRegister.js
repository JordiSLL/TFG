//Codigo Para las opciones de registrar y iniciar sesion
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const emailError = document.querySelector('.email.error');
const passwordError = document.querySelector('.password.error');
const codeError = document.querySelector('.code.error');

registerForm.style.display = "none";

function toggleForm() {
  

  if (loginForm.style.display === "none") {
    loginForm.style.display = "flex";
    registerForm.style.display = "none";
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "flex";
  }
}

registerForm.addEventListener('submit', async (event)=> {
  // Evitamos que el formulario se envíe automáticamente
  event.preventDefault();

  //Reseteamos los errores
  emailError.textContent = '';
  passwordError.textContent = '';
  //Obtenemos los valores
  const userData = {
    name: registerForm.name.value,
    email: registerForm.email.value,
    password: registerForm.password.value
  };
  const name = registerForm.name.value;
  const email = registerForm.email.value;
  const password = registerForm.password.value;
  const code = registerForm.code.value;
console.log(userData)
  try{
    const res = await fetch('/api/users/register', { 
      method: 'POST', 
      body: JSON.stringify(userData),
      headers: {'Content-Type': 'application/json'}  
    });
    const data = await res.json();
    console.log(data);
  }
  catch(error){
    console.log(error);
  }

  console.log("Email: "+ email)
  console.log("Contraseña: "+password)
});
