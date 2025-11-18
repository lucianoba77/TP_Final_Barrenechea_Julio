import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMed } from '../context/MedContext';
import { useNotification } from '../context/NotificationContext';
import { obtenerIconoPresentacion } from '../utils/presentacionIcons';
import MainMenu from '../components/MainMenu';
import UserMenu from '../components/UserMenu';
import './BotiquinScreen.css';

const BotiquinScreen = () => {
  const navigate = useNavigate();
  const { medicamentos, eliminarMedicina, suspenderMedicina, restarStock } = useMed();
  const { showConfirm, showSuccess, showError } = useNotification();
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin registrar';
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return 'Sin registrar';
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const calcularPorcentajeStock = (medicamento) => {
    if (!medicamento || !medicamento.stockInicial || medicamento.stockInicial <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(100, (medicamento.stockActual / medicamento.stockInicial) * 100));
  };

  const obtenerTextoStock = (medicamento) => {
    if (!medicamento || medicamento.stockActual === undefined || medicamento.stockActual === null) {
      return 'Sin stock disponible';
    }
    
    const stockActual = Number(medicamento.stockActual) || 0;
    
    if (stockActual <= 0) {
      return 'Sin stock disponible';
    }
    
    // Si tiene días de tratamiento, mostrar "stock de días"
    // Si no tiene días de tratamiento (medicamento ocasional), mostrar solo el número
    if (medicamento.diasTratamiento && medicamento.diasTratamiento > 0) {
      return `${stockActual} de ${medicamento.diasTratamiento}`;
    } else {
      // Medicamento ocasional: mostrar solo la cantidad restante
      return `${stockActual}`;
    }
  };

  return (
    <div className="botiquin-screen">
      <div className="botiquin-header">
        <button className="btn-home" onClick={() => navigate('/dashboard')}>🏠</button>
        <h1>Mi Botiquín</h1>
        <UserMenu />
      </div>

      <div className="botiquin-content">
        {medicamentos.length === 0 ? (
          <div className="empty-state">
            <p>No hay medicamentos en tu botiquín</p>
            <p className="empty-hint">Agrega tu primer medicamento</p>
          </div>
        ) : (
          <div className="medicamentos-grid">
            {medicamentos.map(medicamento => (
              <div key={medicamento.id} className="medicamento-card-container">
                <div className="med-card-header">
                  <div className="med-icon-circle" style={{ backgroundColor: medicamento.color }}>
                    <img 
                      src={obtenerIconoPresentacion(medicamento.presentacion)} 
                      alt={medicamento.presentacion || 'medicamento'} 
                      className="med-icon-image"
                    />
                  </div>
                  <div className="med-title-section">
                    <h3 className="med-nombre">{medicamento.nombre}</h3>
                    <span className={`status-badge ${medicamento.activo !== false ? 'activo' : 'inactivo'}`}>
                      {medicamento.activo !== false ? 'Activo' : 'Suspendido'}
                    </span>
                  </div>
                </div>
                
                <div className="med-details">
                  <div className="detail-row">
                    <span className="detail-label">Presentación:</span>
                    <span className="detail-value">{medicamento.presentacion}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tomas diarias:</span>
                    <span className="detail-value">
                      {medicamento.tomasDiarias === 0 ? (
                        <span style={{ color: '#FF9800', fontWeight: '600' }}>
                          0 (Ocasional)
                        </span>
                      ) : (
                        medicamento.tomasDiarias
                      )}
                    </span>
                  </div>
                  {medicamento.tomasDiarias > 0 && (
                    <div className="detail-row">
                      <span className="detail-label">Primera toma:</span>
                      <span className="detail-value">{medicamento.primeraToma || 'Sin programar'}</span>
                    </div>
                  )}
                  {medicamento.tomasDiarias === 0 && (
                    <div className="detail-row reminder-badge">
                      <span className="detail-label">💊 Uso:</span>
                      <span className="detail-value" style={{ color: '#FF9800', fontWeight: '600' }}>
                        Ocasional (según necesidad)
                      </span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Condición:</span>
                    <span className="detail-value">{medicamento.afeccion}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Vence:</span>
                    <span className="detail-value">{formatearFecha(medicamento.fechaVencimiento)}</span>
                  </div>
                  
                  <div className="stock-row">
                    <span className="detail-label">Stock:</span>
                    <div className="stock-bar-container">
                      <div 
                        className="stock-bar"
                        style={{ 
                          width: `${calcularPorcentajeStock(medicamento)}%`,
                          backgroundColor: medicamento.stockInicial <= 0
                            ? '#B0BEC5'
                            : medicamento.stockActual <= 7 ? '#f44336' : '#4CAF50'
                        }}
                      />
                    </div>
                    <span className="stock-text">{obtenerTextoStock(medicamento)}</span>
                  </div>
                  
                  {/* Botón de restar stock para medicamentos ocasionales */}
                  {medicamento.tomasDiarias === 0 && medicamento.stockActual > 0 && (
                    <div className="stock-actions">
                      <button
                        className="btn-restar-stock"
                        onClick={async () => {
                          const resultado = await restarStock(medicamento.id);
                          if (resultado.success) {
                            showSuccess(`Stock actualizado: ${resultado.stockActual} unidades restantes`);
                          } else {
                            showError(resultado.error || 'Error al restar stock');
                          }
                        }}
                      >
                        <span className="btn-restar-icon">−</span> Restar uno
                      </button>
                    </div>
                  )}
                </div>

                <div className="med-actions">
                  <button 
                    className="btn-editar"
                    onClick={() => navigate(`/nuevo?editar=${medicamento.id}`)}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn-suspender"
                    onClick={async () => {
                      const resultado = await suspenderMedicina(medicamento.id);
                      if (resultado.success) {
                        showSuccess(`${medicamento.nombre} ha sido suspendido`);
                      } else {
                        showError(resultado.error || 'Error al suspender medicamento');
                      }
                    }}
                  >
                    Suspender
                  </button>
                  <button 
                    className="btn-eliminar"
                    onClick={async () => {
                      const confirmado = await showConfirm({
                        title: 'Eliminar medicamento',
                        message: `¿Estás seguro de que deseas eliminar "${medicamento.nombre}"? Esta acción no se puede deshacer.`,
                        confirmText: 'Eliminar',
                        cancelText: 'Cancelar',
                        type: 'danger'
                      });

                      if (confirmado) {
                        const resultado = await eliminarMedicina(medicamento.id);
                        if (resultado.success) {
                          showSuccess(`${medicamento.nombre} ha sido eliminado`);
                        } else {
                          showError(resultado.error || 'Error al eliminar medicamento');
                        }
                      }
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MainMenu />
    </div>
  );
};

export default BotiquinScreen;

