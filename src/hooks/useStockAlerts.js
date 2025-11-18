import { useEffect, useRef } from 'react';
import { useMed } from '../context/MedContext';
import { useNotification } from '../context/NotificationContext';

/**
 * Hook para monitorear el stock de medicamentos y mostrar alertas
 */
export const useStockAlerts = (diasAntesAlerta = 7) => {
  const { medicamentos } = useMed();
  const { showWarning, showError } = useNotification();
  const alertadosRef = useRef(new Set());

  useEffect(() => {
    if (!medicamentos || medicamentos.length === 0) return;

    medicamentos.forEach(medicamento => {
      if (!medicamento.activo) return;

      const stockActual = Number(medicamento.stockActual) || 0;
      const tomasDiarias = Number(medicamento.tomasDiarias) || 1;
      const diasTratamiento = Number(medicamento.diasTratamiento) || 0;
      const diasRestantes = Math.floor(stockActual / tomasDiarias);
      const medicamentoId = medicamento.id;

      // Si el stock está en 0 o negativo
      if (stockActual <= 0) {
        if (!alertadosRef.current.has(`${medicamentoId}-agotado`)) {
          showError(
            `⚠️ ${medicamento.nombre} se ha agotado. Por favor, recarga tu stock.`,
            5000
          );
          alertadosRef.current.add(`${medicamentoId}-agotado`);
        }
      }
      // Verificar si el tratamiento tiene más días que el stock restante
      else if (diasTratamiento > 0 && diasRestantes < diasTratamiento) {
        // Alerta cuando quede 1 día
        if (diasRestantes === 1) {
          if (!alertadosRef.current.has(`${medicamentoId}-1dia`)) {
            showWarning(
              `⚠️ ${medicamento.nombre}: Solo queda medicamento para 1 día. Debes agregar stock para completar el tratamiento.`,
              6000
            );
            alertadosRef.current.add(`${medicamentoId}-1dia`);
            // Limpiar otras alertas
            alertadosRef.current.delete(`${medicamentoId}-2dias`);
            alertadosRef.current.delete(`${medicamentoId}-3dias`);
            alertadosRef.current.delete(`${medicamentoId}-7dias`);
          }
        }
        // Alerta cuando queden 2 días
        else if (diasRestantes === 2) {
          if (!alertadosRef.current.has(`${medicamentoId}-2dias`)) {
            showWarning(
              `⚠️ ${medicamento.nombre}: Queda medicamento para 2 días.`,
              5000
            );
            alertadosRef.current.add(`${medicamentoId}-2dias`);
            // Limpiar otras alertas
            alertadosRef.current.delete(`${medicamentoId}-3dias`);
            alertadosRef.current.delete(`${medicamentoId}-7dias`);
          }
        }
        // Alerta cuando queden 3 días
        else if (diasRestantes === 3) {
          if (!alertadosRef.current.has(`${medicamentoId}-3dias`)) {
            showWarning(
              `⚠️ ${medicamento.nombre}: Queda medicamento para 3 días.`,
              5000
            );
            alertadosRef.current.add(`${medicamentoId}-3dias`);
            // Limpiar otras alertas
            alertadosRef.current.delete(`${medicamentoId}-7dias`);
          }
        }
        // Alerta cuando queden 7 días o menos (pero más de 3)
        else if (diasRestantes <= diasAntesAlerta && diasRestantes > 3) {
          if (!alertadosRef.current.has(`${medicamentoId}-7dias`)) {
            showWarning(
              `⚠️ ${medicamento.nombre}: El medicamento se acabará antes de terminar el tratamiento. Quedan aproximadamente ${diasRestantes} días de stock.`,
              5000
            );
            alertadosRef.current.add(`${medicamentoId}-7dias`);
          }
        } else {
          // Si el stock se recuperó, remover todas las alertas
          alertadosRef.current.delete(`${medicamentoId}-1dia`);
          alertadosRef.current.delete(`${medicamentoId}-2dias`);
          alertadosRef.current.delete(`${medicamentoId}-3dias`);
          alertadosRef.current.delete(`${medicamentoId}-7dias`);
          alertadosRef.current.delete(`${medicamentoId}-agotado`);
        }
      } else {
        // Si el stock es suficiente, remover todas las alertas
        alertadosRef.current.delete(`${medicamentoId}-1dia`);
        alertadosRef.current.delete(`${medicamentoId}-2dias`);
        alertadosRef.current.delete(`${medicamentoId}-3dias`);
        alertadosRef.current.delete(`${medicamentoId}-7dias`);
        alertadosRef.current.delete(`${medicamentoId}-agotado`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicamentos, diasAntesAlerta]);

  // Limpiar alertados cuando cambian los medicamentos
  useEffect(() => {
    const medicamentoIds = new Set(medicamentos.map(m => m.id));
    alertadosRef.current.forEach(key => {
      const medicamentoId = key.split('-')[0];
      if (!medicamentoIds.has(medicamentoId)) {
        alertadosRef.current.delete(key);
      }
    });
  }, [medicamentos]);
};

