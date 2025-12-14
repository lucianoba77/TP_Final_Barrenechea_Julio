/**
 * Servicio para gestionar medicamentos en Firestore
 * Maneja todas las operaciones CRUD de medicamentos
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Obtiene todos los medicamentos de un usuario
 */
export const obtenerMedicamentos = async (userId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    if (!userId) {
      return {
        success: false,
        error: 'Usuario no identificado',
        medicamentos: []
      };
    }

    const medicamentosRef = collection(db, 'medicamentos');
    const q = query(
      medicamentosRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const medicamentos = [];

    querySnapshot.forEach((doc) => {
      medicamentos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Ordenar manualmente por primeraToma
    medicamentos.sort((a, b) => {
      const horaA = a.primeraToma || '00:00';
      const horaB = b.primeraToma || '00:00';
      return horaA.localeCompare(horaB);
    });

    return {
      success: true,
      medicamentos
    };
  } catch (error) {
    console.error('Error al obtener medicamentos:', error);
    return {
      success: false,
      error: error.message,
      medicamentos: []
    };
  }
};

/**
 * Obtiene un medicamento por ID
 */
export const obtenerMedicamento = async (medicamentoId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    const medicamentoDoc = await getDoc(doc(db, 'medicamentos', medicamentoId));
    
    if (medicamentoDoc.exists()) {
      return {
        success: true,
        medicamento: {
          id: medicamentoDoc.id,
          ...medicamentoDoc.data()
        }
      };
    } else {
      return {
        success: false,
        error: 'Medicamento no encontrado'
      };
    }
  } catch (error) {
    console.error('Error al obtener medicamento:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Agrega un nuevo medicamento
 */
export const agregarMedicamento = async (userId, medicamentoData) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    // Asegurar que stockInicial y stockActual sean números
    // Convertir explícitamente a número y asegurar que no sea NaN
    const stockInicial = medicamentoData.stockInicial !== undefined && medicamentoData.stockInicial !== null
      ? Number(medicamentoData.stockInicial)
      : 0;
    const stockActual = isNaN(stockInicial) ? 0 : stockInicial; // Al crear, stockActual = stockInicial

    // Crear el objeto sin hacer spread primero para evitar valores incorrectos
    const medicamentoCompleto = {
      nombre: medicamentoData.nombre,
      presentacion: medicamentoData.presentacion,
      tomasDiarias: Number(medicamentoData.tomasDiarias) ?? 1,
      primeraToma: medicamentoData.primeraToma,
      afeccion: medicamentoData.afeccion,
      stockInicial: stockInicial, // Guardar el valor correcto
      stockActual: stockActual, // Al crear, ambos son iguales
      diasTratamiento: Number(medicamentoData.diasTratamiento) ?? 0,
      esCronico: medicamentoData.esCronico || false,
      alarmasActivas: medicamentoData.alarmasActivas !== undefined ? medicamentoData.alarmasActivas : true,
      detalles: medicamentoData.detalles || '',
      fechaVencimiento: medicamentoData.fechaVencimiento || '',
      color: medicamentoData.color,
      userId,
      tomasRealizadas: medicamentoData.tomasRealizadas || [],
      activo: medicamentoData.activo !== undefined ? medicamentoData.activo : true,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      eventoIdsGoogleCalendar: [] // IDs de eventos en Google Calendar
    };

    const docRef = await addDoc(collection(db, 'medicamentos'), medicamentoCompleto);

    // Intentar crear eventos en Google Calendar si está conectado
    try {
      const { obtenerTokenGoogle } = await import('./calendarService');
      const { crearEventosRecurrentes } = await import('./calendarService');
      const tokenData = await obtenerTokenGoogle(userId);
      
      if (tokenData && tokenData.access_token) {
        const resultado = await crearEventosRecurrentes(
          tokenData.access_token,
          medicamentoCompleto
        );
        
        if (resultado.success && resultado.eventoIds) {
          await updateDoc(docRef, {
            eventoIdsGoogleCalendar: resultado.eventoIds
          });
        }
      }
    } catch (calendarError) {
      // Si falla la sincronización con Google Calendar, no es crítico
    }

    return {
      success: true,
      medicamento: {
        id: docRef.id,
        ...medicamentoCompleto
      }
    };
  } catch (error) {
    console.error('Error al agregar medicamento:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Actualiza un medicamento existente
 */
export const actualizarMedicamento = async (medicamentoId, datosActualizados) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    // Asegurar que stockInicial y stockActual sean números si se están actualizando
    if (datosActualizados.stockInicial !== undefined) {
      datosActualizados.stockInicial = Number(datosActualizados.stockInicial) || 0;
      
      // Si se actualiza stockInicial y no se está actualizando stockActual explícitamente,
      // actualizar stockActual al nuevo valor de stockInicial
      if (datosActualizados.stockActual === undefined) {
        datosActualizados.stockActual = datosActualizados.stockInicial;
      }
    }
    
    // Asegurar que stockActual sea un número si se está actualizando
    if (datosActualizados.stockActual !== undefined) {
      datosActualizados.stockActual = Number(datosActualizados.stockActual) || 0;
    }
    
    const medicamentoRef = doc(db, 'medicamentos', medicamentoId);
    const medicamentoSnap = await getDoc(medicamentoRef);
    
    if (!medicamentoSnap.exists()) {
      return {
        success: false,
        error: 'Medicamento no encontrado'
      };
    }

    const medicamentoActual = medicamentoSnap.data();
    
    // Si cambió el horario o las tomas, actualizar eventos de Google Calendar
    const horarioCambio = datosActualizados.primeraToma !== medicamentoActual.primeraToma ||
                         datosActualizados.tomasDiarias !== medicamentoActual.tomasDiarias;
    
    if (horarioCambio && medicamentoActual.eventoIdsGoogleCalendar && medicamentoActual.eventoIdsGoogleCalendar.length > 0) {
      try {
        const { obtenerTokenGoogle, eliminarEventoToma } = await import('./calendarService');
        const tokenData = await obtenerTokenGoogle(medicamentoActual.userId);
        
        if (tokenData && tokenData.access_token) {
          // Eliminar eventos antiguos
          for (const eventoId of medicamentoActual.eventoIdsGoogleCalendar) {
            await eliminarEventoToma(tokenData.access_token, eventoId);
          }
          
          // Crear nuevos eventos con el horario actualizado
          const medicamentoActualizado = { ...medicamentoActual, ...datosActualizados };
          const { crearEventosRecurrentes } = await import('./calendarService');
          const resultado = await crearEventosRecurrentes(
            tokenData.access_token,
            medicamentoActualizado
          );
          
          if (resultado.success && resultado.eventoIds) {
            datosActualizados.eventoIdsGoogleCalendar = resultado.eventoIds;
          } else {
            datosActualizados.eventoIdsGoogleCalendar = [];
          }
        }
      } catch (calendarError) {
      }
    }
    
    await updateDoc(medicamentoRef, {
      ...datosActualizados,
      fechaActualizacion: new Date().toISOString()
    });

    return {
      success: true
    };
  } catch (error) {
    console.error('Error al actualizar medicamento:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Resta una unidad del stock de un medicamento
 * Para medicamentos ocasionales, también registra la toma en tomasRealizadas
 */
export const restarStockMedicamento = async (medicamentoId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    const medicamentoRef = doc(db, 'medicamentos', medicamentoId);
    const medicamentoSnap = await getDoc(medicamentoRef);
    
    if (!medicamentoSnap.exists()) {
      return {
        success: false,
        error: 'Medicamento no encontrado'
      };
    }

    const medicamentoData = medicamentoSnap.data();

    const stockActual = Number(medicamentoData.stockActual) || 0;
    
    if (stockActual <= 0) {
      return {
        success: false,
        error: 'No hay stock disponible para restar'
      };
    }

    const nuevoStock = Math.max(0, stockActual - 1);
    
    // Si es un medicamento ocasional (tomasDiarias === 0), registrar la toma
    const esOcasional = medicamentoData.tomasDiarias === 0;
    const datosActualizados = {
      stockActual: nuevoStock,
      fechaActualizacion: new Date().toISOString()
    };

    if (esOcasional) {
      // Registrar la toma para medicamentos ocasionales
      const fechaHoy = new Date().toISOString().split('T')[0];
      const horaActual = new Date().toTimeString().split(' ')[0].substring(0, 5); // HH:MM
      
      const nuevaToma = {
        fecha: fechaHoy,
        hora: horaActual,
        tomada: true,
        tipo: 'ocasional'
      };

      const tomasActualizadas = [...(medicamentoData.tomasRealizadas || []), nuevaToma];
      datosActualizados.tomasRealizadas = tomasActualizadas;
    }

    await updateDoc(medicamentoRef, datosActualizados);

    return {
      success: true,
      stockActual: nuevoStock,
      tomaRegistrada: esOcasional
    };
  } catch (error) {
    console.error('Error al restar stock:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Agrega stock a un medicamento ocasional y solicita fecha de vencimiento
 */
export const agregarStockOcasional = async (medicamentoId, cantidad, fechaVencimiento) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    if (!fechaVencimiento) {
      return {
        success: false,
        error: 'La fecha de vencimiento es requerida cuando se agrega stock'
      };
    }

    const medicamentoRef = doc(db, 'medicamentos', medicamentoId);
    const medicamentoSnap = await getDoc(medicamentoRef);
    
    if (!medicamentoSnap.exists()) {
      return {
        success: false,
        error: 'Medicamento no encontrado'
      };
    }

    const medicamentoData = medicamentoSnap.data();
    const stockActual = Number(medicamentoData.stockActual) || 0;
    const stockInicial = Number(medicamentoData.stockInicial) || 0;
    const nuevoStock = stockActual + Number(cantidad);
    const nuevoStockInicial = stockInicial + Number(cantidad);

    await updateDoc(medicamentoRef, {
      stockActual: nuevoStock,
      stockInicial: nuevoStockInicial,
      fechaVencimiento: fechaVencimiento,
      fechaActualizacion: new Date().toISOString()
    });

    return {
      success: true,
      stockActual: nuevoStock,
      stockInicial: nuevoStockInicial
    };
  } catch (error) {
    console.error('Error al agregar stock:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Elimina un medicamento
 */
export const eliminarMedicamento = async (medicamentoId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    // Obtener el medicamento antes de eliminarlo para borrar eventos de Google Calendar
    const medicamentoRef = doc(db, 'medicamentos', medicamentoId);
    const medicamentoSnap = await getDoc(medicamentoRef);
    
    if (medicamentoSnap.exists()) {
      const medicamentoData = medicamentoSnap.data();
      
      // Eliminar eventos de Google Calendar si existen
      if (medicamentoData.eventoIdsGoogleCalendar && medicamentoData.eventoIdsGoogleCalendar.length > 0) {
        try {
          const { obtenerTokenGoogle, eliminarEventoToma } = await import('./calendarService');
          const tokenData = await obtenerTokenGoogle(medicamentoData.userId);
          
          if (tokenData && tokenData.access_token) {
            // Eliminar todos los eventos asociados
            for (const eventoId of medicamentoData.eventoIdsGoogleCalendar) {
              await eliminarEventoToma(tokenData.access_token, eventoId);
            }
          }
        } catch (calendarError) {
        }
      }
    }

    await deleteDoc(medicamentoRef);

    return {
      success: true
    };
  } catch (error) {
    console.error('Error al eliminar medicamento:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Marca una toma como realizada
 */
export const marcarTomaRealizada = async (medicamentoId, hora) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    // Obtener el medicamento actual
    const medicamentoDoc = await getDoc(doc(db, 'medicamentos', medicamentoId));
    
    if (!medicamentoDoc.exists()) {
      return {
        success: false,
        error: 'Medicamento no encontrado'
      };
    }

    const medicamento = medicamentoDoc.data();
    const fecha = new Date().toISOString().split('T')[0];
    
    // Asegurar que stockActual sea un número válido
    const stockActualActual = medicamento.stockActual !== undefined && medicamento.stockActual !== null
      ? Number(medicamento.stockActual)
      : (medicamento.stockInicial !== undefined ? Number(medicamento.stockInicial) : 0);
    
    // Verificar si hay stock disponible
    if (stockActualActual <= 0) {
      return {
        success: false,
        error: 'No hay stock disponible para marcar esta toma'
      };
    }
    
    const nuevaToma = {
      fecha,
      hora,
      tomada: true,
      timestamp: new Date().toISOString()
    };

    const tomasActualizadas = [...(medicamento.tomasRealizadas || []), nuevaToma];
    // Restar 1 del stock actual, asegurando que no sea menor a 0
    const nuevoStockActual = Math.max(0, stockActualActual - 1);

    await updateDoc(doc(db, 'medicamentos', medicamentoId), {
      tomasRealizadas: tomasActualizadas,
      stockActual: nuevoStockActual,
      fechaActualizacion: new Date().toISOString()
    });

    return {
      success: true,
      toma: nuevaToma
    };
  } catch (error) {
    console.error('Error al marcar toma:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Elimina todos los medicamentos de un usuario
 */
export const eliminarTodosLosMedicamentos = async (userId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    if (!userId) {
      throw new Error('Usuario no identificado');
    }

    // Obtener todos los medicamentos del usuario
    const medicamentosRef = collection(db, 'medicamentos');
    const q = query(
      medicamentosRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const eliminaciones = [];

    // Eliminar cada medicamento
    for (const docSnapshot of querySnapshot.docs) {
      const medicamentoData = docSnapshot.data();
      
      // Eliminar eventos de Google Calendar si existen
      if (medicamentoData.eventoIdsGoogleCalendar && medicamentoData.eventoIdsGoogleCalendar.length > 0) {
        try {
          const { obtenerTokenGoogle, eliminarEventoToma } = await import('./calendarService');
          const tokenData = await obtenerTokenGoogle(userId);
          
          if (tokenData && tokenData.access_token) {
            for (const eventoId of medicamentoData.eventoIdsGoogleCalendar) {
              await eliminarEventoToma(tokenData.access_token, eventoId);
            }
          }
        } catch (calendarError) {
        }
      }

      await deleteDoc(doc(db, 'medicamentos', docSnapshot.id));
      eliminaciones.push(docSnapshot.id);
    }

    return {
      success: true,
      eliminados: eliminaciones.length
    };
  } catch (error) {
    console.error('Error al eliminar todos los medicamentos:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Suscribe a cambios en tiempo real de los medicamentos de un usuario
 */
export const suscribirMedicamentos = (userId, callback) => {
  if (!db) {
    return () => {};
  }

  if (!userId) {
    callback([]);
    return () => {};
  }

  const medicamentosRef = collection(db, 'medicamentos');
  const q = query(
    medicamentosRef,
    where('userId', '==', userId)
  );

  return onSnapshot(q, (querySnapshot) => {
    const medicamentos = [];
    querySnapshot.forEach((doc) => {
      medicamentos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    // Ordenar manualmente por primeraToma
    medicamentos.sort((a, b) => {
      const horaA = a.primeraToma || '00:00';
      const horaB = b.primeraToma || '00:00';
      return horaA.localeCompare(horaB);
    });
    callback(medicamentos);
  }, (error) => {
    console.error('Error en suscripción de medicamentos:', error);
    callback([]);
  });
};

