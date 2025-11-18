import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { esUsuarioGoogle } from '../services/authService';
import MainMenu from '../components/MainMenu';
import UserMenu from '../components/UserMenu';
import GoogleCalendarSync from '../components/GoogleCalendarSync';
import GestionarAsistentes from '../components/GestionarAsistentes';
import './AjustesScreen.css';

const AjustesScreen = () => {
  const navigate = useNavigate();
  const { usuarioActual, logout, eliminarCuenta } = useAuth();
  const { showSuccess, showError, showConfirm } = useNotification();
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [credencialesEliminar, setCredencialesEliminar] = useState({
    email: '',
    password: ''
  });
  const [eliminando, setEliminando] = useState(false);
  const [esUsuarioGoogleAuth, setEsUsuarioGoogleAuth] = useState(false);
  const [formData, setFormData] = useState({
    nombre: usuarioActual?.nombre || 'lucianoba77',
    email: usuarioActual?.email || 'lucianoba77@hotmail.com',
    notificacionesActivas: true,
    tonoAlarma: 'por-defecto',
    repeticionesAlarma: 3,
    diasAntesStock: 7
  });

  useEffect(() => {
    // Verificar si el usuario se autenticó con Google
    setEsUsuarioGoogleAuth(esUsuarioGoogle());
  }, [usuarioActual]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogout = async () => {
    await logout();
    showSuccess('Sesión cerrada correctamente');
    navigate('/login');
  };

  const handleEliminarCuenta = async () => {
    // Si es usuario de Google, no necesita email/password
    if (!esUsuarioGoogleAuth) {
      if (!credencialesEliminar.email.trim() || !credencialesEliminar.password.trim()) {
        showError('Por favor completa todos los campos');
        return;
      }
    }

    const confirmado = await showConfirm({
      title: 'Eliminar cuenta permanentemente',
      message: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción eliminará todos tus datos, medicamentos y asistentes. Esta acción NO se puede deshacer.',
      confirmText: 'Sí, eliminar cuenta',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmado) {
      return;
    }

    setEliminando(true);
    const resultado = await eliminarCuenta(
      credencialesEliminar.email.trim(),
      credencialesEliminar.password.trim(),
      esUsuarioGoogleAuth
    );

    if (resultado.success) {
      setMostrarModalEliminar(false);
      setCredencialesEliminar({ email: '', password: '' });
      navigate('/?cuentaEliminada=true');
    } else {
      showError(resultado.error || 'Error al eliminar la cuenta');
    }
    setEliminando(false);
  };

  return (
    <div className="ajustes-screen">
      <div className="ajustes-header">
        <button className="btn-home" onClick={() => navigate('/dashboard')}>🏠</button>
        <h1>Ajustes</h1>
        <UserMenu />
      </div>

      <div className="ajustes-content">
        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">👥</div>
            <h2 className="section-title">Asistentes y Supervisores</h2>
          </div>
          <GestionarAsistentes />
        </div>

        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">📅</div>
            <h2 className="section-title">Sincronización con Google Calendar</h2>
          </div>
          <GoogleCalendarSync />
        </div>

        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">👤</div>
            <h2 className="section-title">Información personal</h2>
          </div>

          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">🔔</div>
            <h2 className="section-title">Alarmas</h2>
          </div>

          <div className="toggle-group">
            <label htmlFor="notificacionesActivas">Activar notificaciones</label>
            <label className="switch">
              <input
                type="checkbox"
                id="notificacionesActivas"
                name="notificacionesActivas"
                checked={formData.notificacionesActivas}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="tonoAlarma">Tono de alarma</label>
            <select
              id="tonoAlarma"
              name="tonoAlarma"
              value={formData.tonoAlarma}
              onChange={handleChange}
            >
              <option value="por-defecto">Por defecto</option>
              <option value="suave">Suave</option>
              <option value="fuerte">Fuerte</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="repeticionesAlarma">Repeticiones de alarma</label>
            <input
              type="number"
              id="repeticionesAlarma"
              name="repeticionesAlarma"
              value={formData.repeticionesAlarma}
              onChange={handleChange}
              min="1"
              max="10"
            />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">⚠️</div>
            <h2 className="section-title">Alertas de stock</h2>
          </div>

          <div className="form-group">
            <label htmlFor="diasAntesStock">Días antes de aviso por stock bajo</label>
            <input
              type="number"
              id="diasAntesStock"
              name="diasAntesStock"
              value={formData.diasAntesStock}
              onChange={handleChange}
              min="1"
              max="30"
            />
          </div>

          <p className="info-text">
            Recibirás una notificación cuando el stock sea suficiente para {formData.diasAntesStock} días o menos
          </p>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <div className="section-icon">🚪</div>
            <h2 className="section-title">Sesión</h2>
          </div>
          <button 
            className="btn-logout"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
          <button 
            className="btn-eliminar-cuenta"
            onClick={() => {
              setCredencialesEliminar({
                email: usuarioActual?.email || '',
                password: ''
              });
              setMostrarModalEliminar(true);
            }}
          >
            🗑️ Eliminar Cuenta
          </button>
        </div>
      </div>

      {/* Modal para eliminar cuenta */}
      {mostrarModalEliminar && (
        <div className="modal-overlay" onClick={() => !eliminando && setMostrarModalEliminar(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Eliminar Cuenta</h2>
              <button 
                className="modal-close"
                onClick={() => !eliminando && setMostrarModalEliminar(false)}
                disabled={eliminando}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-warning">
                ⚠️ Esta acción es permanente y no se puede deshacer. Se eliminarán:
              </p>
              <ul className="modal-list">
                <li>Tu cuenta de usuario</li>
                <li>Todos tus medicamentos</li>
                <li>Todos tus asistentes</li>
                <li>Todos tus registros e historial</li>
              </ul>
              {esUsuarioGoogleAuth ? (
                <div className="google-auth-message">
                  <p className="auth-info">
                    🔐 Para confirmar la eliminación, deberás autenticarte nuevamente con Google.
                  </p>
                  <p className="auth-warning">
                    Se abrirá una ventana de Google para verificar tu identidad.
                  </p>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="email-eliminar">Email</label>
                    <input
                      type="email"
                      id="email-eliminar"
                      value={credencialesEliminar.email}
                      onChange={(e) => setCredencialesEliminar(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Tu email"
                      disabled={eliminando}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password-eliminar">Contraseña</label>
                    <input
                      type="password"
                      id="password-eliminar"
                      value={credencialesEliminar.password}
                      onChange={(e) => setCredencialesEliminar(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Tu contraseña"
                      disabled={eliminando}
                      required
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal-cancel"
                onClick={() => setMostrarModalEliminar(false)}
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button
                className="btn-modal-delete"
                onClick={handleEliminarCuenta}
                disabled={eliminando}
              >
                {eliminando ? 'Eliminando...' : 'Eliminar Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}

      <MainMenu />
    </div>
  );
};

export default AjustesScreen;

