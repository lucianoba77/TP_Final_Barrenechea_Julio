import React from 'react';
import { useMed } from '../context/MedContext';
import './MedicamentoCard.css';

const MedicamentoCard = ({ medicamento, tipoVista = 'dashboard' }) => {
  const { marcarToma } = useMed();

  // Calcular porcentaje de stock
  const stockPorcentaje = (medicamento.stockActual / medicamento.stockInicial) * 100;

  // Función para calcular el color de la barra según la hora
  const getBarraColor = (tomaNumero) => {
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    
    // Calcular la hora de la toma
    const [hora, minuto] = medicamento.primeraToma.split(':');
    const horaPrimeraToma = parseInt(hora) * 60 + parseInt(minuto);
    const horaToma = horaPrimeraToma + ((tomaNumero - 1) * (24 * 60 / medicamento.tomasDiarias));
    
    const diferencia = horaActual - horaToma;
    
    // Verificar si ya fue tomada
    const hoy = new Date().toISOString().split('T')[0];
    const tomarRealizada = medicamento.tomasRealizadas.find(
      t => t.fecha === hoy && t.hora === medicamento.primeraToma
    );
    
    if (tomarRealizada && tomarRealizada.tomada) {
      return '#4CAF50'; // Verde - ya tomada
    }
    
    if (diferencia < -30) {
      return '#FFC107'; // Amarillo - pendiente (aún no)
    } else if (diferencia >= -30 && diferencia <= 30) {
      return '#FF9800'; // Naranja - hora actual
    } else if (diferencia > 30 && diferencia < 240) {
      return '#FF5722'; // Rojo oscuro - pasado reciente
    } else {
      return '#F44336'; // Rojo - pasado
    }
  };

  const handleMarcarToma = () => {
    marcarToma(medicamento.id, medicamento.primeraToma);
  };

  // Obtener ícono según presentación
  const getIcono = () => {
    if (medicamento.presentacion === 'inyeccion') {
      return '💉';
    }
    return '💊';
  };

  return (
    <div className="medicamento-card">
      <div 
        className="card-background"
        style={{
          background: `linear-gradient(135deg, ${medicamento.color} ${stockPorcentaje}%, transparent ${stockPorcentaje}%)`
        }}
      >
        <div className="card-content">
          <div className="med-header">
            <div 
              className="med-icon"
              style={{ backgroundColor: medicamento.color }}
            >
              {getIcono()}
            </div>
            <div className="med-info">
              <h3 className="med-nombre">{medicamento.nombre}</h3>
              <span className="med-tomas-count">
                {medicamento.tomasDiarias} toma{medicamento.tomasDiarias > 1 ? 's' : ''} hoy
              </span>
            </div>
            <div className="med-hora">
              🕐 {medicamento.primeraToma}
            </div>
          </div>

          <div className="tomas-barras">
            {Array.from({ length: medicamento.tomasDiarias }).map((_, index) => (
              <div key={index} className="toma-item">
                <span className="toma-label">Toma #{index + 1}</span>
                <div 
                  className="toma-barra"
                  style={{ 
                    backgroundColor: getBarraColor(index + 1),
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    marginTop: '4px'
                  }}
                />
              </div>
            ))}
          </div>

          {tipoVista === 'dashboard' && (
            <>
              <button 
                className="btn-marcar"
                onClick={handleMarcarToma}
                style={{ backgroundColor: medicamento.color }}
              >
                ✓ Marcar como tomado
              </button>
              <div className="stock-info">
                Stock disponible: <strong>{medicamento.stockActual} de {medicamento.stockInicial}</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicamentoCard;

