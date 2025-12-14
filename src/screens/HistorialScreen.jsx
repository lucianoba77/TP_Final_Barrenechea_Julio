import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMed } from '../context/MedContext';
import { useAuth } from '../context/AuthContext';
import MainMenu from '../components/MainMenu';
import UserMenu from '../components/UserMenu';
import { 
  calcularAdherencia, 
  calcularAdherenciaPromedio, 
  obtenerEstadoAdherencia,
  contarTomasOcasionalesSemana
} from '../utils/adherenciaUtils';
import './HistorialScreen.css';

const HistorialScreen = () => {
  const navigate = useNavigate();
  const { medicamentos } = useMed();
  const { usuarioActual } = useAuth();

  const totalMedicamentos = medicamentos.length;
  const activos = medicamentos.filter(medicamento => medicamento.activo !== false).length;
  const completados = medicamentos.filter(medicamento => medicamento.stockActual === 0 || medicamento.activo === false).length;
  
  // Separar medicamentos con adherencia de los ocasionales
  const medicamentosConAdherencia = medicamentos.filter(med => 
    med.activo !== false && med.tomasDiarias > 0
  );
  const medicamentosOcasionales = medicamentos.filter(med => 
    med.activo !== false && med.tomasDiarias === 0
  );
  
  // Calcular adherencia promedio total (solo medicamentos con adherencia, excluyendo ocasionales)
  const adherenciaPromedioTotal = calcularAdherenciaPromedio(medicamentos, 'total');
  const estadoAdherencia = obtenerEstadoAdherencia(adherenciaPromedioTotal);
  const esAsistente = usuarioActual?.role === 'asistente';
  const nombrePaciente = usuarioActual?.paciente?.nombre || 'Paciente';

  // Redirigir según el rol al hacer clic en home
  const handleHomeClick = () => {
    if (esAsistente) {
      navigate('/botiquin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="historial-screen">
      <div className="historial-header">
        <button className="btn-home" onClick={handleHomeClick}>🏠</button>
        <h1>{esAsistente ? `Historial del Paciente ${nombrePaciente}` : 'Historial'}</h1>
        <UserMenu />
      </div>

      <div className="historial-content">
        {/* Tarjeta de adherencia promedio total */}
        <div className="adherencia-promedio-card" style={{ borderLeftColor: estadoAdherencia.color }}>
          <div className="adherencia-promedio-header">
            <div className="adherencia-icon">{estadoAdherencia.icono}</div>
            <div>
              <h2>Adherencia Total</h2>
              <p className="adherencia-mensaje">{estadoAdherencia.mensaje} - Desde el inicio del tratamiento</p>
            </div>
          </div>
          <div className="adherencia-porcentaje-grande" style={{ color: estadoAdherencia.color }}>
            {adherenciaPromedioTotal}%
          </div>
          <div className="adherencia-bar-large">
            <div 
              className="adherencia-bar-fill" 
              style={{ 
                width: `${adherenciaPromedioTotal}%`,
                backgroundColor: estadoAdherencia.color
              }}
            />
          </div>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#E3F2FD' }}>
              💊
            </div>
            <div className="stat-number">{totalMedicamentos}</div>
            <div className="stat-label">Total medicamentos</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#E8F5E9' }}>
              ✓
            </div>
            <div className="stat-number">{activos}</div>
            <div className="stat-label">Activos</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#F3E5F5' }}>
              📈
            </div>
            <div className="stat-number">{completados}</div>
            <div className="stat-label">Completados</div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <div className="section-icon">📈</div>
            <h2 className="section-title">Adherencia por medicamento (Total)</h2>
          </div>
          
          <div className="adherencia-list">
            {medicamentosConAdherencia.length === 0 ? (
              <p className="empty-message">No hay medicamentos con adherencia registrada</p>
            ) : (
              medicamentosConAdherencia.map(medicamento => {
                  const adherenciaTotal = calcularAdherencia(medicamento, 'total');
                  const adherenciaMensual = calcularAdherencia(medicamento, 'mensual');
                  const adherenciaSemanal = calcularAdherencia(medicamento, 'semanal');
                  const estado = obtenerEstadoAdherencia(adherenciaTotal.porcentaje);
                  const esCronico = medicamento.esCronico || false;
                  
                  return (
                    <div key={medicamento.id} className="adherencia-item">
                      <div className="adherencia-item-header">
                        <div>
                          <span className="adherencia-nombre">{medicamento.nombre}</span>
                          {esCronico && <span className="cronico-badge">Crónico</span>}
                        </div>
                        <span className="adherencia-porcentaje" style={{ color: estado.color }}>
                          {adherenciaTotal.porcentaje}%
                        </span>
                      </div>
                      <div className="adherencia-bar-container">
                        <div 
                          className="adherencia-bar"
                          style={{ 
                            width: `${adherenciaTotal.porcentaje}%`,
                            backgroundColor: estado.color
                          }}
                        />
                      </div>
                      <div className="adherencia-stats">
                        <div className="stat-row">
                          <span className="stat-label"><strong>Total:</strong> {adherenciaTotal.realizadas}/{adherenciaTotal.esperadas} tomas ({adherenciaTotal.dias} días)</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">Mensual: {adherenciaMensual.porcentaje}% ({adherenciaMensual.realizadas}/{adherenciaMensual.esperadas})</span>
                          <span className="stat-label">Semanal: {adherenciaSemanal.porcentaje}% ({adherenciaSemanal.realizadas}/{adherenciaSemanal.esperadas})</span>
                        </div>
                        <span className="stat-label">{estado.mensaje}</span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Sección de medicamentos ocasionales */}
        {medicamentosOcasionales.length > 0 && (
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon">💊</div>
              <h2 className="section-title">Medicamentos ocasionales (última semana)</h2>
            </div>
            
            <div className="ocasionales-list">
              {medicamentosOcasionales.map(medicamento => {
                const tomasSemana = contarTomasOcasionalesSemana(medicamento);
                
                return (
                  <div key={medicamento.id} className="ocasional-item">
                    <div className="ocasional-item-header">
                      <span className="ocasional-nombre">{medicamento.nombre}</span>
                      <span className="ocasional-tomas">
                        {tomasSemana} {tomasSemana === 1 ? 'vez' : 'veces'} esta semana
                      </span>
                    </div>
                    <div className="ocasional-info">
                      <span className="ocasional-stock">Stock: {medicamento.stockActual || 0}</span>
                      {medicamento.afeccion && (
                        <span className="ocasional-afeccion">• {medicamento.afeccion}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <MainMenu />
    </div>
  );
};

export default HistorialScreen;

