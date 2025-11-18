import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { guardarTokenGoogle } from '../services/calendarService';
import { obtenerTokenDeURL } from '../utils/googleAuthHelper';

/**
 * Componente que maneja el callback de OAuth de Google Calendar
 * Se ejecuta cuando Google redirige de vuelta después de la autorización
 */
const GoogleCalendarCallback = () => {
  const { usuarioActual } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const procesarCallback = async () => {
      try {
        let intentos = 0;
        const maxIntentos = 20;
        
        while (!usuarioActual && intentos < maxIntentos) {
          await new Promise(resolve => setTimeout(resolve, 500));
          intentos++;
        }

        if (!usuarioActual) {
          showError('Sesión no disponible. Por favor, inicia sesión nuevamente.');
          navigate('/login');
          return;
        }

        const hash = window.location.hash;
        if (hash) {
          const params = new URLSearchParams(hash.substring(1));
          const error = params.get('error');
          if (error) {
            const errorDescription = params.get('error_description') || 'Error desconocido';
            showError('No se pudo conectar con Google Calendar: ' + errorDescription);
            navigate('/ajustes');
            return;
          }
        }

        const tokenData = obtenerTokenDeURL();
        if (!tokenData) {
          showError('No se pudo obtener el token de Google. Intenta nuevamente.');
          navigate('/ajustes');
          return;
        }

        const userId = usuarioActual.id || usuarioActual.uid;
        if (!userId) {
          showError('Error al identificar el usuario. Por favor, inicia sesión nuevamente.');
          navigate('/login');
          return;
        }
        
        const resultado = await guardarTokenGoogle(userId, tokenData);
        
        if (resultado.success) {
          window.history.replaceState({}, document.title, '/ajustes');
          navigate('/ajustes', { replace: true });
          setTimeout(() => {
            showSuccess('Google Calendar conectado exitosamente');
          }, 500);
        } else {
          throw new Error(resultado.error || 'Error al guardar token');
        }
      } catch (error) {
        console.error('Error en callback OAuth:', error);
        showError('Error al conectar Google Calendar: ' + error.message);
        navigate('/ajustes');
      }
    };

    procesarCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioActual, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ fontSize: '48px' }}>⏳</div>
      <p>Procesando conexión con Google Calendar...</p>
    </div>
  );
};

export default GoogleCalendarCallback;

