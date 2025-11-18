import React from 'react';
import { useMed } from '../context/MedContext';
import { useAuth } from '../context/AuthContext';
import { useStockAlerts } from '../hooks/useStockAlerts';
import MedicamentoCard from '../components/MedicamentoCard';
import MainMenu from '../components/MainMenu';
import UserMenu from '../components/UserMenu';
import './DashboardScreen.css';

const DashboardScreen = () => {
  const { medicamentos } = useMed();
  const { usuarioActual } = useAuth();
  
  // Monitorear stock y mostrar alertas
  useStockAlerts(7); // Alertar cuando queden 7 días o menos

  // Filtrar medicamentos del día de hoy
  // Solo mostrar medicamentos activos con tomas diarias > 0 (los de 0 tomas solo aparecen en botiquín)
  const medicamentosHoy = medicamentos.filter(medicamento => {
    return medicamento.activo !== false && 
           medicamento.tomasDiarias > 0 &&
           medicamento.primeraToma; // Debe tener hora programada
  });

  // Ordenar por hora
  const ordenados = [...medicamentosHoy].sort((medicamentoA, medicamentoB) => {
    const horaA = parseInt(medicamentoA.primeraToma.replace(':', ''));
    const horaB = parseInt(medicamentoB.primeraToma.replace(':', ''));
    return horaA - horaB;
  });

  return (
    <div className="dashboard-screen">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="greeting">¡Hola, {usuarioActual?.nombre || 'Usuario'}!</h1>
          <p className="sub-greeting">Mantén tu tratamiento al día</p>
        </div>
        <UserMenu />
      </div>

      <div className="dashboard-content">
        <h2 className="section-title">Medicamentos de hoy</h2>
        
        {ordenados.length === 0 ? (
          <div className="empty-state">
            <p>No hay medicamentos programados para hoy</p>
            <p className="empty-hint">Agrega tu primer medicamento</p>
          </div>
        ) : (
          <div className="medicamentos-list">
            {ordenados.map(medicamento => (
              <MedicamentoCard 
                key={medicamento.id} 
                medicamento={medicamento} 
                tipoVista="dashboard"
              />
            ))}
          </div>
        )}
      </div>

      <MainMenu />
    </div>
  );
};

export default DashboardScreen;

