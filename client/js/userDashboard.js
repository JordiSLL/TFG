function verificarSelectedUserId() {
    const selectedUserId = sessionStorage.getItem('selectedUserId');
    if (selectedUserId) {
        console.log('El valor de selectedUserId es:', selectedUserId);
    } else {
        console.log('No hay ningún valor almacenado en selectedUserId');
    }
}