import React from 'react';
import { useMed } from '../context/MedContext';
import { useAuth } from '../context/AuthContext';
import MedicamentoCard from '../components/MedicamentoCard';
import MainMenu from '../components/MainMenu';
import './DashboardScreen.css';

const DashboardScreen = () => {
  const { medicines } = useMed();
  const { currentUser } = useAuth();

  // Filtrar medicamentos del día de hoy
  const medicamentosHoy = medicines.filter(med => {
    // Esta lógica se puede expandir según necesidad
    return med.activo !== false;
  });

  // Ordenar por hora
  const ordenados = [...medicamentosHoy].sort((a, b) => {
    const horaA = parseInt(a.primeraToma.replace(':', ''));
    const horaB = parseInt(b.primeraToma.replace(':', ''));
    return horaA - horaB;
  });

  return (
    <div className="dashboard-screen">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="greeting">¡Hola, {currentUser?.nombre || 'Usuario'}!</h1>
          <p className="sub-greeting">Mantén tu tratamiento al día</p>
        </div>
        <div className="header-icon">👤</div>
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
            {ordenados.map(med => (
              <MedicamentoCard 
                key={med.id} 
                medicamento={med} 
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

