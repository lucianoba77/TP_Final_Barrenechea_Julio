import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMed } from '../context/MedContext';
import MainMenu from '../components/MainMenu';
import './BotiquinScreen.css';

const BotiquinScreen = () => {
  const navigate = useNavigate();
  const { medicines, eliminarMedicina, suspenderMedicina } = useMed();

  return (
    <div className="botiquin-screen">
      <div className="botiquin-header">
        <button className="btn-home" onClick={() => navigate('/')}>🏠</button>
        <h1>Mi Botiquín</h1>
      </div>

      <div className="botiquin-content">
        {medicines.length === 0 ? (
          <div className="empty-state">
            <p>No hay medicamentos en tu botiquín</p>
            <p className="empty-hint">Agrega tu primer medicamento</p>
          </div>
        ) : (
          <div className="medicamentos-grid">
            {medicines.map(med => (
              <div key={med.id} className="medicamento-card-container">
                <div className="med-card-header">
                  <div className="med-icon-circle" style={{ backgroundColor: med.color }}>
                    {med.presentacion === 'inyeccion' ? '💉' : '💊'}
                  </div>
                  <div className="med-title-section">
                    <h3 className="med-nombre">{med.nombre}</h3>
                    <span className={`status-badge ${med.activo !== false ? 'activo' : 'inactivo'}`}>
                      {med.activo !== false ? 'Activo' : 'Suspendido'}
                    </span>
                  </div>
                </div>
                
                <div className="med-details">
                  <div className="detail-row">
                    <span className="detail-label">Presentación:</span>
                    <span className="detail-value">{med.presentacion}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tomas diarias:</span>
                    <span className="detail-value">{med.tomasDiarias}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Primera toma:</span>
                    <span className="detail-value">{med.primeraToma}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Condición:</span>
                    <span className="detail-value">{med.afeccion}</span>
                  </div>
                  
                  <div className="stock-row">
                    <span className="detail-label">Stock:</span>
                    <div className="stock-bar-container">
                      <div 
                        className="stock-bar"
                        style={{ 
                          width: `${(med.stockActual / med.stockInicial) * 100}%`,
                          backgroundColor: med.stockActual <= 7 ? '#f44336' : '#4CAF50'
                        }}
                      />
                    </div>
                    <span className="stock-text">{med.stockActual} de {med.stockInicial}</span>
                  </div>
                </div>

                <div className="med-actions">
                  <button 
                    className="btn-suspender"
                    onClick={() => suspenderMedicina(med.id)}
                  >
                    Suspender
                  </button>
                  <button 
                    className="btn-eliminar"
                    onClick={() => eliminarMedicina(med.id)}
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

