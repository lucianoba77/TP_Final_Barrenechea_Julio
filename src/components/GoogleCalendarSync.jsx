import React, { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  eliminarTokenGoogle,
  tieneGoogleCalendarConectado
} from '../services/calendarService';
import { autorizarGoogleCalendar } from '../utils/googleAuthHelper';
import './GoogleCalendarSync.css';

const GoogleCalendarSync = () => {
  const { usuarioActual } = useAuth();
  const { showError, showWarning, showSuccess } = useNotification();
  const [conectado, setConectado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    // Solo verificar conexión, el callback se maneja en GoogleCalendarCallback
    verificarConexion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioActual]);

  const verificarConexion = async () => {
    if (!usuarioActual) {
      setCargando(false);
      return;
    }

    try {
      const tieneConexion = await tieneGoogleCalendarConectado(usuarioActual.id);
      setConectado(tieneConexion);
    } catch (error) {
      console.error('Error al verificar conexión:', error);
      setConectado(false);
    } finally {
      setCargando(false);
    }
  };


  const manejarLoginExitoso = async (credentialResponse) => {
    if (!usuarioActual) return;

    try {
      // El credentialResponse contiene el token de ID de Google
      // Para obtener access_token necesitamos usar el flujo OAuth 2.0 implícito
      if (GOOGLE_CLIENT_ID) {
        autorizarGoogleCalendar(GOOGLE_CLIENT_ID);
      } else {
        showWarning('Google Client ID no configurado. Configura REACT_APP_GOOGLE_CLIENT_ID en .env');
      }
    } catch (error) {
      console.error('Error al iniciar autorización:', error);
      showError('Error al conectar Google Calendar');
    }
  };

  const manejarLogout = async () => {
    if (!usuarioActual) return;

    try {
      googleLogout();
      await eliminarTokenGoogle(usuarioActual.id);
      setConectado(false);
      showSuccess('Google Calendar desconectado correctamente');
    } catch (error) {
      console.error('Error al desconectar:', error);
      showError('Error al desconectar Google Calendar');
    }
  };

  const manejarError = (error) => {
    console.error('Error en Google Login:', error);
    showError('Error al conectar con Google Calendar');
  };

  if (cargando) {
    return (
      <div className="calendar-sync-loading">
        <p>Verificando conexión...</p>
      </div>
    );
  }

  return (
    <div className="calendar-sync-container">

      {conectado ? (
        <div className="calendar-sync-connected">
          <div className="status-badge connected">
            <span>✅</span>
            <span>Conectado</span>
          </div>
          <p className="sync-info">
            Tus tomas de medicamentos se sincronizarán automáticamente con Google Calendar.
            Los eventos se crearán con recordatorios 15 y 5 minutos antes de cada toma.
          </p>
          <button onClick={manejarLogout} className="btn-disconnect">
            Desconectar Google Calendar
          </button>
        </div>
      ) : (
        <div className="calendar-sync-disconnected">
          <div className="status-badge disconnected">
            <span>❌</span>
            <span>No conectado</span>
          </div>
          <p className="sync-info">
            Conecta tu cuenta de Google para sincronizar automáticamente tus tomas de medicamentos
            con Google Calendar. Recibirás recordatorios en tu calendario.
          </p>
          <GoogleLogin
            onSuccess={manejarLoginExitoso}
            onError={manejarError}
            useOneTap={false}
          />
        </div>
      )}

      <div className="calendar-sync-features">
        <h4>Funcionalidades:</h4>
        <ul>
          <li>✅ Eventos automáticos para cada toma programada</li>
          <li>✅ Recordatorios 15 y 5 minutos antes</li>
          <li>✅ Sincronización en tiempo real</li>
          <li>✅ Actualización automática al cambiar horarios</li>
          <li>✅ Eliminación automática al eliminar medicamentos</li>
        </ul>
      </div>
    </div>
  );
};

export default GoogleCalendarSync;

