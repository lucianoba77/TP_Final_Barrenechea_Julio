/**
 * Utilidades para calcular métricas de adherencia al tratamiento
 */

/**
 * Calcula el porcentaje de adherencia de un medicamento desde el inicio del tratamiento
 * @param {Object} medicamento - Objeto del medicamento con tomasRealizadas
 * @param {string} periodo - 'total', 'mensual', 'semanal', 'diario'
 * @returns {Object} Objeto con porcentaje, tomas esperadas y realizadas
 */
export const calcularAdherencia = (medicamento, periodo = 'total') => {
  if (!medicamento) {
    return { porcentaje: 0, esperadas: 0, realizadas: 0 };
  }

  // Si no está activo, no calcular adherencia
  if (medicamento.activo === false) {
    return { porcentaje: 0, esperadas: 0, realizadas: 0 };
  }

  // Los medicamentos ocasionales (tomasDiarias === 0) no se incluyen en adherencia
  if (medicamento.tomasDiarias === 0) {
    return { porcentaje: 0, esperadas: 0, realizadas: 0 };
  }

  // Obtener fecha de inicio del tratamiento
  const fechaInicioStr = medicamento.fechaCreacion || medicamento.fechaInicio;
  if (!fechaInicioStr) {
    return { porcentaje: 0, esperadas: 0, realizadas: 0 };
  }

  const fechaInicio = new Date(fechaInicioStr);
  const fechaActual = new Date();
  
  // Resetear horas para comparar solo días
  fechaInicio.setHours(0, 0, 0, 0);
  fechaActual.setHours(0, 0, 0, 0);
  
  // Calcular fecha límite según el período
  let fechaLimite = fechaInicio;
  if (periodo === 'mensual') {
    fechaLimite = new Date(fechaActual);
    fechaLimite.setDate(fechaLimite.getDate() - 30);
    fechaLimite.setHours(0, 0, 0, 0);
    // Usar la fecha más reciente
    fechaLimite = fechaLimite > fechaInicio ? fechaLimite : fechaInicio;
  } else if (periodo === 'semanal') {
    fechaLimite = new Date(fechaActual);
    fechaLimite.setDate(fechaLimite.getDate() - 7);
    fechaLimite.setHours(0, 0, 0, 0);
    fechaLimite = fechaLimite > fechaInicio ? fechaLimite : fechaInicio;
  } else if (periodo === 'diario') {
    fechaLimite = fechaActual;
  }
  // Para 'total', usar fechaInicio
  
  // Calcular días en el período
  const diasEnPeriodo = Math.max(1, Math.floor((fechaActual - fechaLimite) / (1000 * 60 * 60 * 24)) + 1);
  
  // Calcular tomas esperadas
  const tomasDiarias = medicamento.tomasDiarias || 1;
  const tomasEsperadas = diasEnPeriodo * tomasDiarias;
  
  if (tomasEsperadas === 0) {
    return { porcentaje: 0, esperadas: 0, realizadas: 0 };
  }
  
  // Obtener tomas realizadas en el período
  const tomasRealizadas = medicamento.tomasRealizadas || [];
  const tomasEnPeriodo = tomasRealizadas.filter(toma => {
    if (toma.fecha && toma.tomada) {
      try {
        const fecha = new Date(toma.fecha);
        fecha.setHours(0, 0, 0, 0);
        return fecha >= fechaLimite && fecha <= fechaActual;
      } catch (error) {
        return false;
      }
    }
    return false;
  });
  
  const tomasRealizadasCount = tomasEnPeriodo.length;
  
  // Calcular porcentaje basado en tomas (no días completos)
  const porcentaje = Math.min(100, Math.round((tomasRealizadasCount / tomasEsperadas) * 100));
  
  return {
    porcentaje,
    esperadas: tomasEsperadas,
    realizadas: tomasRealizadasCount,
    dias: diasEnPeriodo
  };
};

/**
 * Cuenta las veces que se tomó un medicamento ocasional en la semana
 * @param {Object} medicamento - Objeto del medicamento ocasional
 * @returns {number} Cantidad de veces que se tomó en la semana
 */
export const contarTomasOcasionalesSemana = (medicamento) => {
  if (!medicamento || medicamento.tomasDiarias !== 0) {
    return 0;
  }

  const tomasRealizadas = medicamento.tomasRealizadas || [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const hace7Dias = new Date(hoy);
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  hace7Dias.setHours(0, 0, 0, 0);
  
  const tomasEnSemana = tomasRealizadas.filter(toma => {
    if (toma.fecha && toma.tomada) {
      try {
        const fecha = new Date(toma.fecha);
        fecha.setHours(0, 0, 0, 0);
        return fecha >= hace7Dias && fecha <= hoy;
      } catch (error) {
        return false;
      }
    }
    return false;
  });
  
  return tomasEnSemana.length;
};

/**
 * Calcula las tomas realizadas en los últimos 7 días
 * @param {Object} medicamento - Objeto del medicamento
 * @returns {Array} Array con tomas por día de la semana
 */
export const calcularTomasSemana = (medicamento) => {
  const tomasRealizadas = medicamento.tomasRealizadas || [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const resultado = [];
  
  // Crear array con los últimos 7 días
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    fecha.setHours(0, 0, 0, 0);
    
    const fechaKey = fecha.toISOString().split('T')[0];
    const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const indiceDia = diaSemana === 0 ? 6 : diaSemana - 1; // Ajustar para que Lunes = 0
    
    resultado.push({
      dia: diasSemana[indiceDia],
      fecha: fechaKey,
      fechaObj: fecha,
      tomas: 0
    });
  }
  
  // Contar tomas por día
  tomasRealizadas.forEach(toma => {
    if (toma.fecha) {
      try {
        const fecha = new Date(toma.fecha);
        fecha.setHours(0, 0, 0, 0);
        const fechaKey = fecha.toISOString().split('T')[0];
        
        // Buscar el día correspondiente
        const diaEncontrado = resultado.find(d => d.fecha === fechaKey);
        if (diaEncontrado) {
          diaEncontrado.tomas++;
        }
      } catch (error) {
        console.warn('Error al procesar fecha de toma:', error);
      }
    }
  });
  
  return resultado;
};

/**
 * Calcula la adherencia promedio de todos los medicamentos
 * @param {Array} medicamentos - Array de medicamentos
 * @param {string} periodo - 'total', 'mensual', 'semanal', 'diario'
 * @returns {number} Porcentaje promedio de adherencia
 */
export const calcularAdherenciaPromedio = (medicamentos, periodo = 'total') => {
  if (!medicamentos || medicamentos.length === 0) {
    return 0;
  }
  
  // Filtrar medicamentos activos y que NO sean ocasionales (tomasDiarias > 0)
  const medicamentosConAdherencia = medicamentos.filter(med => 
    med.activo !== false && med.tomasDiarias > 0
  );
  
  if (medicamentosConAdherencia.length === 0) {
    return 0;
  }
  
  const adherencias = medicamentosConAdherencia
    .map(med => calcularAdherencia(med, periodo).porcentaje);
  
  if (adherencias.length === 0) {
    return 0;
  }
  
  const suma = adherencias.reduce((acc, val) => acc + val, 0);
  return Math.round(suma / adherencias.length);
};

/**
 * Obtiene el estado de adherencia basado en el porcentaje
 * @param {number} porcentaje - Porcentaje de adherencia
 * @returns {Object} Objeto con estado, color y mensaje
 */
export const obtenerEstadoAdherencia = (porcentaje) => {
  if (porcentaje >= 90) {
    return {
      estado: 'excelente',
      color: '#4CAF50',
      mensaje: 'Excelente adherencia',
      icono: '✅'
    };
  } else if (porcentaje >= 70) {
    return {
      estado: 'buena',
      color: '#8BC34A',
      mensaje: 'Buena adherencia',
      icono: '👍'
    };
  } else if (porcentaje >= 50) {
    return {
      estado: 'regular',
      color: '#FF9800',
      mensaje: 'Adherencia regular',
      icono: '⚠️'
    };
  } else {
    return {
      estado: 'baja',
      color: '#F44336',
      mensaje: 'Adherencia baja',
      icono: '❌'
    };
  }
};

/**
 * Calcula las tomas esperadas vs realizadas en los últimos 30 días
 * @param {Object} medicamento - Objeto del medicamento
 * @returns {Object} Objeto con tomas esperadas y realizadas
 */
export const calcularTomasMensuales = (medicamento) => {
  return calcularAdherencia(medicamento, 'mensual');
};

