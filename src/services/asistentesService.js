/**
 * Servicio para gestionar asistentes/supervisores
 * Maneja la relación entre pacientes y asistentes
 */

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  deleteDoc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { db, auth } from '../config/firebase';

const COLECCION_ASISTENTES = 'asistentes';

/**
 * Agrega un asistente a un paciente
 * @param {string} pacienteId - ID del paciente
 * @param {string} emailAsistente - Email del asistente
 * @param {string} nombreAsistente - Nombre del asistente
 * @param {string} password - Contraseña del asistente
 * @param {object} credencialesPaciente - Credenciales del paciente para restaurar sesión { email, password, esGoogle }
 */
export const agregarAsistente = async (pacienteId, emailAsistente, nombreAsistente, password, credencialesPaciente = null) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    if (!pacienteId) {
      throw new Error('Paciente no identificado. Vuelve a iniciar sesión e intenta nuevamente.');
    }

    // Verificar que el asistente no esté ya agregado
    const q = query(
      collection(db, COLECCION_ASISTENTES),
      where('pacienteId', '==', pacienteId),
      where('emailAsistente', '==', emailAsistente)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return {
        success: false,
        error: 'Este asistente ya está agregado'
      };
    }

    // Crear el documento en Firestore primero
    const asistenteData = {
      pacienteId,
      emailAsistente,
      nombreAsistente,
      fechaAgregado: new Date().toISOString(),
      activo: true
    };

    const docRef = await addDoc(collection(db, COLECCION_ASISTENTES), asistenteData);

    // Ahora crear el usuario del asistente en Firebase Auth
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailAsistente, password);
      const asistenteUser = userCredential.user;

      // Actualizar el perfil con el nombre
      await updateProfile(asistenteUser, {
        displayName: nombreAsistente
      });

      // Crear el documento del asistente en Firestore con rol correcto
      const usuarioAsistenteData = {
        id: asistenteUser.uid,
        email: asistenteUser.email,
        nombre: nombreAsistente,
        role: 'asistente',
        pacienteId: pacienteId,
        tipoSuscripcion: 'gratis',
        esPremium: false,
        fechaCreacion: new Date().toISOString(),
        ultimaSesion: new Date().toISOString()
      };

      await setDoc(doc(db, 'usuarios', asistenteUser.uid), usuarioAsistenteData);

      // Cerrar sesión del asistente
      await signOut(auth);

      // Restaurar sesión del paciente
      if (credencialesPaciente && credencialesPaciente.esGoogle) {
        // Si el paciente se logueó con Google, intentar restaurar con popup
        try {
          const provider = new GoogleAuthProvider();
          await signInWithPopup(auth, provider);
          // Si la restauración fue exitosa, retornar éxito sin requerir re-login
          return {
            success: true,
            asistente: { id: docRef.id, ...asistenteData }
          };
        } catch (googleError) {
          console.error('Error al restaurar sesión con Google:', googleError);
          // Si falla, el usuario tendrá que loguearse manualmente
          return {
            success: true,
            asistente: { id: docRef.id, ...asistenteData },
            requiereReLogin: true,
            mensaje: 'Asistente creado exitosamente. Por favor, inicia sesión nuevamente.'
          };
        }
      } else {
        // Si el paciente se logueó con email/password, no podemos restaurar automáticamente
        // porque no tenemos acceso a la contraseña (por seguridad)
        // El usuario tendrá que loguearse manualmente
        return {
          success: true,
          asistente: { id: docRef.id, ...asistenteData },
          requiereReLogin: true,
          mensaje: 'Asistente creado exitosamente. Por favor, inicia sesión nuevamente.'
        };
      }
    } catch (authError) {
      console.error('Error al crear usuario del asistente en Firebase Auth:', authError);
      
      // Si falla la creación del usuario, eliminar el documento de asistente creado
      try {
        await deleteDoc(docRef);
      } catch (deleteError) {
        console.error('Error al eliminar documento de asistente:', deleteError);
      }

      let mensajeError = 'Error al crear la cuenta del asistente';
      if (authError.code === 'auth/email-already-in-use') {
        mensajeError = 'Este email ya está registrado. El asistente debe usar otro email o iniciar sesión con este.';
      } else if (authError.code === 'auth/invalid-email') {
        mensajeError = 'El email no es válido';
      } else if (authError.code === 'auth/weak-password') {
        mensajeError = 'La contraseña es muy débil (mínimo 6 caracteres)';
      } else if (authError.message) {
        mensajeError = authError.message;
      }
      
      return {
        success: false,
        error: mensajeError
      };
    }
  } catch (error) {
    console.error('Error al agregar asistente:', error);
    
    let mensajeError = 'Error al agregar asistente';
    if (error.message) {
      mensajeError = error.message;
    }
    
    return {
      success: false,
      error: mensajeError
    };
  }
};

/**
 * Obtiene todos los asistentes de un paciente
 */
export const obtenerAsistentes = async (pacienteId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    if (!pacienteId) {
      throw new Error('Paciente no identificado');
    }

    const q = query(
      collection(db, COLECCION_ASISTENTES),
      where('pacienteId', '==', pacienteId),
      where('activo', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const asistentes = [];

    querySnapshot.forEach((doc) => {
      asistentes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      asistentes
    };
  } catch (error) {
    console.error('Error al obtener asistentes:', error);
    return {
      success: false,
      error: error.message || 'Error al obtener asistentes',
      asistentes: []
    };
  }
};

/**
 * Elimina un asistente
 */
export const eliminarAsistente = async (asistenteId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    await deleteDoc(doc(db, COLECCION_ASISTENTES, asistenteId));

    return {
      success: true
    };
  } catch (error) {
    console.error('Error al eliminar asistente:', error);
    return {
      success: false,
      error: error.message || 'Error al eliminar asistente'
    };
  }
};

/**
 * Elimina todos los asistentes de un paciente
 */
export const eliminarTodosLosAsistentes = async (pacienteId) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    if (!pacienteId) {
      throw new Error('Paciente no identificado');
    }

    // Obtener todos los asistentes del paciente
    const q = query(
      collection(db, COLECCION_ASISTENTES),
      where('pacienteId', '==', pacienteId)
    );

    const querySnapshot = await getDocs(q);
    const eliminaciones = [];

    // Eliminar cada asistente
    for (const docSnapshot of querySnapshot.docs) {
      await deleteDoc(doc(db, COLECCION_ASISTENTES, docSnapshot.id));
      eliminaciones.push(docSnapshot.id);
    }

    return {
      success: true,
      eliminados: eliminaciones.length
    };
  } catch (error) {
    console.error('Error al eliminar todos los asistentes:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verifica si un usuario es asistente de algún paciente
 */
export const esAsistenteDe = async (emailAsistente, opciones = {}) => {
  try {
    if (!db) {
      throw new Error('Firestore no está disponible');
    }

    const { ignorarPacienteId } = opciones;

    const q = query(
      collection(db, COLECCION_ASISTENTES),
      where('emailAsistente', '==', emailAsistente),
      where('activo', '==', true)
    );

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      for (const asistenteDoc of querySnapshot.docs) {
        const asistenteData = asistenteDoc.data();

        if (!asistenteData.pacienteId) {
          continue;
        }
        if (ignorarPacienteId && asistenteData.pacienteId === ignorarPacienteId) {
          continue;
        }
        
        // Obtener datos del paciente
        const pacienteDoc = await getDoc(doc(db, 'usuarios', asistenteData.pacienteId));
        
        if (pacienteDoc.exists()) {
          return {
            success: true,
            esAsistente: true,
            pacienteId: asistenteData.pacienteId,
            paciente: {
              id: pacienteDoc.id,
              ...pacienteDoc.data()
            },
            asistente: {
              id: asistenteDoc.id,
              ...asistenteData
            }
          };
        }
      }
    }

    return {
      success: true,
      esAsistente: false
    };
  } catch (error) {
    console.error('Error al verificar asistente:', error);
    return {
      success: false,
      esAsistente: false,
      error: error.message
    };
  }
};

/**
 * Obtiene el paciente asociado a un asistente
 */
export const obtenerPacienteDeAsistente = async (emailAsistente) => {
  try {
    const resultado = await esAsistenteDe(emailAsistente);
    
    if (resultado.success && resultado.esAsistente) {
      return {
        success: true,
        paciente: resultado.paciente,
        pacienteId: resultado.pacienteId
      };
    }

    return {
      success: false,
      error: 'No se encontró paciente asociado'
    };
  } catch (error) {
    console.error('Error al obtener paciente de asistente:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

