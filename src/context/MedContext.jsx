import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { puedeAgregarMedicamento } from '../utils/subscription';
import { 
  obtenerMedicamentos,
  agregarMedicamento as agregarMedicamentoFirebase,
  actualizarMedicamento,
  eliminarMedicamento as eliminarMedicamentoFirebase,
  marcarTomaRealizada as marcarTomaRealizadaFirebase,
  restarStockMedicamento as restarStockMedicamentoFirebase,
  agregarStockOcasional as agregarStockOcasionalFirebase,
  suscribirMedicamentos
} from '../services/medicamentosService';

const MedContext = createContext();

export const MedProvider = ({ children }) => {
  const { usuarioActual } = useAuth();
  const [medicamentos, setMedicamentos] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Cargar medicamentos cuando el usuario se autentica
  useEffect(() => {
    if (usuarioActual) {
      // Determinar el userId: si es asistente, usar pacienteId; si no, usar su propio id
      const userIdBase = usuarioActual.role === 'asistente' 
        ? usuarioActual.pacienteId 
        : usuarioActual.id;
      const userId = userIdBase || usuarioActual.uid;

      if (!userId) {
        return undefined;
      }
      
      cargarMedicamentos();
      
      // Suscribirse a cambios en tiempo real
      const unsubscribe = suscribirMedicamentos(userId, (medicamentosActualizados) => {
        setMedicamentos(medicamentosActualizados);
      });

      return () => unsubscribe();
    } else {
      setMedicamentos([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioActual]);

  const cargarMedicamentos = async () => {
    if (!usuarioActual) return;

    // Si es asistente, cargar medicamentos del paciente; si no, los suyos
    const userIdBase = usuarioActual.role === 'asistente' 
      ? usuarioActual.pacienteId 
      : usuarioActual.id;
    const userId = userIdBase || usuarioActual.uid;

    if (!userId) {
      setCargando(false);
      return;
    }

    setCargando(true);
    const resultado = await obtenerMedicamentos(userId);
    if (resultado.success) {
      setMedicamentos(resultado.medicamentos);
    } else {
      console.error('Error al cargar medicamentos:', resultado.error);
    }
    setCargando(false);
  };

  const agregarMedicina = async (medicina, tipoSuscripcion = 'gratis') => {
    if (!usuarioActual) {
      return {
        success: false,
        error: 'Debes estar autenticado para agregar medicamentos'
      };
    }

    // Verificar límite de medicamentos
    if (!puedeAgregarMedicamento(medicamentos.length, tipoSuscripcion)) {
      return {
        success: false,
        error: 'Límite de medicamentos alcanzado. Suscríbete a Premium para agregar más.'
      };
    }

    // Determinar el userId: si es asistente, usar pacienteId; si no, usar su propio id
    // Los pacientes siempre agregan medicamentos para sí mismos
    const userIdBase = usuarioActual.role === 'asistente' 
      ? usuarioActual.pacienteId 
      : usuarioActual.id;
    const userId = userIdBase || usuarioActual.uid;

    if (!userId) {
      return {
        success: false,
        error: 'No se pudo determinar el usuario. Por favor, vuelve a iniciar sesión.'
      };
    }

    // Si Firebase está disponible, usar Firestore
    try {
      const resultado = await agregarMedicamentoFirebase(userId, medicina);
      if (resultado.success) {
        // La suscripción en tiempo real actualizará el estado automáticamente
        return resultado;
      }
      return resultado;
    } catch (error) {
      console.error('Error al agregar medicamento:', error);
      return {
        success: false,
        error: error.message || 'Error al agregar medicamento'
      };
    }
  };

  const editarMedicina = async (id, datosActualizados) => {
    try {
      const resultado = await actualizarMedicamento(id, datosActualizados);
      return resultado;
    } catch (error) {
      console.error('Error al editar medicamento:', error);
      return {
        success: false,
        error: error.message || 'Error al editar medicamento'
      };
    }
  };

  const eliminarMedicina = async (id) => {
    try {
      const resultado = await eliminarMedicamentoFirebase(id);
      return resultado;
    } catch (error) {
      console.error('Error al eliminar medicamento:', error);
      return {
        success: false,
        error: error.message || 'Error al eliminar medicamento'
      };
    }
  };

  const suspenderMedicina = async (id) => {
    return await editarMedicina(id, { activo: false });
  };

  const marcarToma = async (id, hora) => {
    try {
      const resultado = await marcarTomaRealizadaFirebase(id, hora);
      return resultado;
    } catch (error) {
      console.error('Error al marcar toma:', error);
      return {
        success: false,
        error: error.message || 'Error al marcar toma'
      };
    }
  };

  const restarStock = async (medicamentoId) => {
    try {
      const resultado = await restarStockMedicamentoFirebase(medicamentoId);
      return resultado;
    } catch (error) {
      console.error('Error al restar stock:', error);
      return {
        success: false,
        error: error.message || 'Error al restar stock'
      };
    }
  };

  const agregarStockOcasional = async (medicamentoId, cantidad, fechaVencimiento) => {
    try {
      const resultado = await agregarStockOcasionalFirebase(medicamentoId, cantidad, fechaVencimiento);
      return resultado;
    } catch (error) {
      console.error('Error al agregar stock:', error);
      return {
        success: false,
        error: error.message || 'Error al agregar stock'
      };
    }
  };

  return (
    <MedContext.Provider value={{
      medicamentos,
      agregarMedicina,
      editarMedicina,
      eliminarMedicina,
      suspenderMedicina,
      marcarToma,
      restarStock,
      agregarStockOcasional,
      cargando,
      recargarMedicamentos: cargarMedicamentos
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

