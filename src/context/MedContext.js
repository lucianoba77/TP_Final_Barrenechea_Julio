import React, { createContext, useState, useContext } from 'react';

const MedContext = createContext();

export const MedProvider = ({ children, initialMedicines }) => {
  const [medicines, setMedicines] = useState(initialMedicines);

  const agregarMedicina = (medicina) => {
    const newId = `${Date.now()}`;
    const nuevaMedicina = {
      ...medicina,
      id: newId,
      stockActual: medicina.stockInicial,
      tomasRealizadas: []
    };
    setMedicines([...medicines, nuevaMedicina]);
    return nuevaMedicina;
  };

  const editarMedicina = (id, datosActualizados) => {
    setMedicines(medicines.map(med => 
      med.id === id ? { ...med, ...datosActualizados } : med
    ));
  };

  const eliminarMedicina = (id) => {
    setMedicines(medicines.filter(med => med.id !== id));
  };

  const suspenderMedicina = (id) => {
    setMedicines(medicines.map(med => 
      med.id === id ? { ...med, activo: false } : med
    ));
  };

  const marcarToma = (id, hora) => {
    const fecha = new Date().toISOString().split('T')[0];
    setMedicines(medicines.map(med => {
      if (med.id === id) {
        const nuevaToma = {
          fecha,
          hora,
          tomada: true
        };
        return {
          ...med,
          stockActual: med.stockActual > 0 ? med.stockActual - 1 : 0,
          tomasRealizadas: [...med.tomasRealizadas, nuevaToma]
        };
      }
      return med;
    }));
  };

  return (
    <MedContext.Provider value={{
      medicines,
      agregarMedicina,
      editarMedicina,
      eliminarMedicina,
      suspenderMedicina,
      marcarToma
    }}>
      {children}
    </MedContext.Provider>
  );
};

export const useMed = () => {
  const context = useContext(MedContext);
  if (!context) {
    throw new Error('useMed debe ser usado dentro de MedProvider');
  }
  return context;
};

