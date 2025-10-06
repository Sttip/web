// Validación de formulario de registro
document.addEventListener('DOMContentLoaded', function() {
    const registroForm = document.getElementById('registroForm');
    const loginForm = document.getElementById('loginForm');
    
    if (registroForm) {
        registroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const messageDiv = document.getElementById('message');
            
            // Validar formato de email
            if (!isValidEmail(email)) {
                showMessage('Por favor ingresa un email válido', 'error');
                return;
            }
            
            // Validar contraseña (mínimo 8 caracteres, una mayúscula y números)
            if (!isValidPassword(password)) {
                showMessage('La contraseña no cumple los requisitos de seguridad', 'error');
                return;
            }
            
            // Simular registro exitoso
            // En un caso real, aquí harías una petición a tu API
            showMessage('Registro exitoso! Redirigiendo...', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            
            // Validaciones básicas
            if (!email || !password) {
                showMessage('Por favor completa todos los campos', 'error');
                return;
            }
            
            // Simular login exitoso
            // En un caso real, aquí harías una petición a tu API
            showMessage('Login exitoso! Redirigiendo...', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        });
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidPassword(password) {
        // Mínimo 8 caracteres, al menos una mayúscula y un número
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }
    
    function showMessage(text, type) {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.classList.remove('hidden');
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 5000);
    }
});
