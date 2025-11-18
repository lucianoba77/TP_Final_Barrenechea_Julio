/**
 * Servicio de autenticación con Firebase Auth
 * Maneja registro, login, logout y gestión de sesión
 */

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Registra un nuevo usuario
 */
export const registrarUsuario = async (email, password, nombre) => {
  try {
    // Verificar si este email corresponde a un asistente antes de crear
    const { esAsistenteDe } = await import('./asistentesService');
    const asistenteResult = await esAsistenteDe(email);
    
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Actualizar el perfil con el nombre
    await updateProfile(user, {
      displayName: nombre
    });

    // Determinar el rol: si es asistente, usar 'asistente', sino 'paciente'
    let role = 'paciente';
    let pacienteId = null;
    let nombreFinal = nombre;
    
    if (asistenteResult.success && asistenteResult.esAsistente) {
      role = 'asistente';
      pacienteId = asistenteResult.pacienteId;
      // Usar el nombre del asistente guardado en Firestore si está disponible
      if (asistenteResult.asistente && asistenteResult.asistente.nombreAsistente) {
        nombreFinal = asistenteResult.asistente.nombreAsistente;
        // Actualizar también el displayName en Firebase Auth
        await updateProfile(user, {
          displayName: nombreFinal
        });
      }
    }

    // Crear documento de usuario en Firestore
    const usuarioData = {
      id: user.uid,
      email: user.email,
      nombre: nombreFinal,
      role: role,
      pacienteId: pacienteId,
      tipoSuscripcion: 'gratis',
      esPremium: false,
      fechaCreacion: new Date().toISOString(),
      ultimaSesion: new Date().toISOString()
    };

    await setDoc(doc(db, 'usuarios', user.uid), usuarioData);

    return {
      success: true,
      usuario: usuarioData
    };
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return {
      success: false,
      error: obtenerMensajeError(error.code)
    };
  }
};

/**
 * Inicia sesión con email y password
 */
export const iniciarSesion = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Obtener datos del usuario desde Firestore
    const usuarioDoc = await getDoc(doc(db, 'usuarios', user.uid));
    
    // Verificar si es asistente
    const { esAsistenteDe } = await import('./asistentesService');
    const asistenteResult = await esAsistenteDe(user.email, { ignorarPacienteId: user.uid });
    
    if (usuarioDoc.exists()) {
      const usuarioData = usuarioDoc.data();
      
      // Actualizar última sesión
      await setDoc(doc(db, 'usuarios', user.uid), {
        ...usuarioData,
        ultimaSesion: new Date().toISOString()
      }, { merge: true });

      let usuarioFinal = {
        id: user.uid,
        email: user.email,
        nombre: user.displayName || usuarioData.nombre,
        ...usuarioData
      };

      // Si es asistente, agregar información del paciente
      if (asistenteResult.success && asistenteResult.esAsistente) {
        usuarioFinal.role = 'asistente';
        usuarioFinal.pacienteId = asistenteResult.pacienteId || usuarioData.pacienteId;
        usuarioFinal.paciente = asistenteResult.paciente;
      }

      return {
        success: true,
        usuario: usuarioFinal
      };
    } else {
      // Si no existe el documento, verificar si es asistente antes de crear
      let role = 'paciente';
      let pacienteId = null;
      
      // Verificar si este email corresponde a un asistente
      if (asistenteResult.success && asistenteResult.esAsistente) {
        role = 'asistente';
        pacienteId = asistenteResult.pacienteId;
      }
      
      const usuarioData = {
        id: user.uid,
        email: user.email,
        nombre: user.displayName || email.split('@')[0],
        role: role,
        pacienteId: pacienteId,
        tipoSuscripcion: 'gratis',
        esPremium: false,
        fechaCreacion: new Date().toISOString(),
        ultimaSesion: new Date().toISOString()
      };

      await setDoc(doc(db, 'usuarios', user.uid), usuarioData);

      return {
        success: true,
        usuario: usuarioData
      };
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    
    // Si el error es que el usuario no existe o credenciales inválidas,
    // verificar si el email corresponde a un asistente en Firestore
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      try {
        const { esAsistenteDe } = await import('./asistentesService');
        const asistenteResult = await esAsistenteDe(email, { ignorarPacienteId: null });
        
        if (asistenteResult.success && asistenteResult.esAsistente) {
          return {
            success: false,
            error: 'Este email corresponde a un asistente, pero aún no has creado tu cuenta. Por favor, ve a "Registrarse" y crea tu cuenta con este email y la contraseña que te proporcionó el paciente.'
          };
        }
      } catch (verificacionError) {
        console.error('Error al verificar asistente:', verificacionError);
      }
    }
    
    return {
      success: false,
      error: obtenerMensajeError(error.code)
    };
  }
};

/**
 * Inicia sesión con Google
 */
export const iniciarSesionConGoogle = async () => {
  try {
    // Verificar primero si el email corresponde a un asistente
    // Los asistentes NO pueden usar Google login, solo email/password
    const { esAsistenteDe } = await import('./asistentesService');
    
    // Necesitamos el email antes de hacer el popup, pero no lo tenemos
    // Entonces haremos la verificación después del login
    // Pero primero intentamos el login
    
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Verificar si el usuario ya existe en Firestore
    const usuarioDoc = await getDoc(doc(db, 'usuarios', user.uid));
    
    // Verificar si es asistente
    const asistenteResult = await esAsistenteDe(user.email, { ignorarPacienteId: user.uid });
    
    // Si es asistente, cerrar sesión y mostrar error
    if (asistenteResult.success && asistenteResult.esAsistente) {
      await signOut(auth);
      return {
        success: false,
        error: 'Los asistentes solo pueden iniciar sesión con email y contraseña. No pueden usar Google login.'
      };
    }
    
    if (usuarioDoc.exists()) {
      const usuarioData = usuarioDoc.data();
      
      // Actualizar última sesión
      await setDoc(doc(db, 'usuarios', user.uid), {
        ...usuarioData,
        ultimaSesion: new Date().toISOString()
      }, { merge: true });

      let usuarioFinal = {
        id: user.uid,
        email: user.email,
        nombre: user.displayName || usuarioData.nombre,
        ...usuarioData
      };

      // Si es asistente, agregar información
      if (asistenteResult.success && asistenteResult.esAsistente) {
        usuarioFinal.role = 'asistente';
        usuarioFinal.pacienteId = asistenteResult.pacienteId;
        usuarioFinal.paciente = asistenteResult.paciente;
      }

      return {
        success: true,
        usuario: usuarioFinal
      };
    } else {
      // Crear nuevo usuario en Firestore
      let role = 'paciente';
      let pacienteId = null;
      let paciente = null;

      if (asistenteResult.success && asistenteResult.esAsistente) {
        role = 'asistente';
        pacienteId = asistenteResult.pacienteId;
        paciente = asistenteResult.paciente;
      }

      const usuarioData = {
        id: user.uid,
        email: user.email,
        nombre: user.displayName || user.email.split('@')[0],
        role,
        tipoSuscripcion: 'gratis',
        esPremium: false,
        fechaCreacion: new Date().toISOString(),
        ultimaSesion: new Date().toISOString()
      };

      await setDoc(doc(db, 'usuarios', user.uid), usuarioData);

      return {
        success: true,
        usuario: {
          ...usuarioData,
          pacienteId,
          paciente
        }
      };
    }
  } catch (error) {
    console.error('Error al iniciar sesión con Google:', error);
    
    // Mensajes de error más específicos
    let mensajeError = obtenerMensajeError(error.code);
    
    if (error.code === 'auth/popup-closed-by-user') {
      mensajeError = 'El popup fue cerrado. Intenta nuevamente.';
    } else if (error.code === 'auth/popup-blocked') {
      mensajeError = 'El popup fue bloqueado. Permite ventanas emergentes para este sitio.';
    } else if (error.code === 'auth/unauthorized-domain') {
      mensajeError = 'Este dominio no está autorizado. Verifica la configuración de Firebase.';
    } else if (error.code === 'auth/operation-not-allowed') {
      mensajeError = 'El login con Google no está habilitado. Verifica la configuración de Firebase Auth.';
    }
    
    return {
      success: false,
      error: mensajeError
    };
  }
};

/**
 * Cierra la sesión del usuario
 */
export const cerrarSesion = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Observa cambios en el estado de autenticación
 */
export const observarEstadoAuth = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Usuario autenticado, obtener datos de Firestore
      try {
        const usuarioDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (usuarioDoc.exists()) {
          const usuarioData = usuarioDoc.data();
          
          // Verificar si es asistente
          const { esAsistenteDe } = await import('./asistentesService');
          const asistenteResult = await esAsistenteDe(user.email, { ignorarPacienteId: user.uid });
          
          if (asistenteResult.success && asistenteResult.esAsistente) {
            // Si el usuario tiene providerData de Google, es un login con Google
            // Los asistentes no pueden usar Google login
            const tieneGoogleProvider = user.providerData.some(provider => provider.providerId === 'google.com');
            if (tieneGoogleProvider) {
              // Cerrar sesión y no permitir login
              await signOut(auth);
              callback(null);
              return;
            }
            
            callback({
              id: user.uid,
              email: user.email,
              nombre: user.displayName || usuarioData.nombre,
              role: 'asistente',
              pacienteId: asistenteResult.pacienteId || usuarioData.pacienteId,
              paciente: asistenteResult.paciente,
              ...usuarioData
            });
          } else {
            callback({
              id: user.uid,
              email: user.email,
              nombre: user.displayName || usuarioData.nombre,
              role: usuarioData.role || 'paciente',
              ...usuarioData
            });
          }
        } else {
          // Usuario nuevo, verificar si es asistente
          try {
            const { esAsistenteDe } = await import('./asistentesService');
            const asistenteResult = await esAsistenteDe(user.email, { ignorarPacienteId: user.uid });
            
            if (asistenteResult.success && asistenteResult.esAsistente) {
              // Si el usuario tiene providerData de Google, es un login con Google
              // Los asistentes no pueden usar Google login
              const tieneGoogleProvider = user.providerData.some(provider => provider.providerId === 'google.com');
              if (tieneGoogleProvider) {
                // Cerrar sesión y no permitir login
                await signOut(auth);
                callback(null);
                return;
              }
              
              callback({
                id: user.uid,
                email: user.email,
                nombre: user.displayName || user.email.split('@')[0],
                role: 'asistente',
                pacienteId: asistenteResult.pacienteId,
                paciente: asistenteResult.paciente
              });
            } else {
              callback(null);
            }
          } catch (error) {
            console.error('Error al verificar asistente:', error);
            callback(null);
          }
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        callback(null);
      }
    } else {
      // Usuario no autenticado
      callback(null);
    }
  });
};

/**
 * Obtiene el usuario actual
 */
export const obtenerUsuarioActual = async () => {
  if (!auth.currentUser) {
    return null;
  }

  try {
    const usuarioDoc = await getDoc(doc(db, 'usuarios', auth.currentUser.uid));
    if (usuarioDoc.exists()) {
      return {
        id: auth.currentUser.uid,
        email: auth.currentUser.email,
        nombre: auth.currentUser.displayName || usuarioDoc.data().nombre,
        ...usuarioDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    return null;
  }
};

/**
 * Verifica si el usuario se autenticó con Google
 */
export const esUsuarioGoogle = () => {
  if (!auth.currentUser) {
    return false;
  }
  
  const user = auth.currentUser;
  // Verificar si tiene proveedor de Google
  return user.providerData.some(provider => provider.providerId === 'google.com');
};

/**
 * Elimina la cuenta del usuario y todos sus datos asociados
 * @param {string} email - Email del usuario (opcional si es Google)
 * @param {string} password - Contraseña del usuario (opcional si es Google)
 * @param {boolean} esGoogle - Indica si el usuario se autenticó con Google
 */
export const eliminarCuenta = async (email, password, esGoogle = false) => {
  try {
    if (!auth.currentUser) {
      return {
        success: false,
        error: 'No hay usuario autenticado'
      };
    }

    const user = auth.currentUser;
    const userId = user.uid;

    // Reautenticar al usuario según su método de autenticación
    if (esGoogle) {
      // Reautenticar con Google
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
    } else {
      // Verificar que el email coincida
      if (user.email !== email) {
        return {
          success: false,
          error: 'El email no coincide con tu cuenta'
        };
      }

      // Reautenticar con email y contraseña
      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);
    }

    // Eliminar todos los medicamentos del usuario
    const { eliminarTodosLosMedicamentos } = await import('./medicamentosService');
    const resultadoMedicamentos = await eliminarTodosLosMedicamentos(userId);
    if (!resultadoMedicamentos.success) {
      console.warn('Error al eliminar medicamentos:', resultadoMedicamentos.error);
    }

    // Eliminar todos los asistentes del paciente
    const { eliminarTodosLosAsistentes } = await import('./asistentesService');
    const resultadoAsistentes = await eliminarTodosLosAsistentes(userId);
    if (!resultadoAsistentes.success) {
      console.warn('Error al eliminar asistentes:', resultadoAsistentes.error);
    }

    // Eliminar tokens de Google Calendar si existen
    try {
      const tokenRef = doc(db, 'googleTokens', userId);
      const tokenDoc = await getDoc(tokenRef);
      if (tokenDoc.exists()) {
        await deleteDoc(tokenRef);
      }
    } catch (tokenError) {
      console.warn('Error al eliminar tokens de Google Calendar:', tokenError);
    }

    // Eliminar el documento del usuario en Firestore
    try {
      const usuarioRef = doc(db, 'usuarios', userId);
      await deleteDoc(usuarioRef);
    } catch (firestoreError) {
      console.warn('Error al eliminar documento de usuario:', firestoreError);
    }

    // Eliminar el usuario de Firebase Auth
    await deleteUser(user);

    return {
      success: true
    };
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    
    let mensajeError = 'Error al eliminar la cuenta';
    if (error.code === 'auth/wrong-password') {
      mensajeError = 'Contraseña incorrecta';
    } else if (error.code === 'auth/invalid-credential') {
      mensajeError = 'Credenciales inválidas';
    } else if (error.code === 'auth/requires-recent-login') {
      mensajeError = 'Por seguridad, debes iniciar sesión nuevamente antes de eliminar tu cuenta';
    } else if (error.message) {
      mensajeError = error.message;
    }

    return {
      success: false,
      error: mensajeError
    };
  }
};

/**
 * Convierte códigos de error de Firebase a mensajes en español
 */
const obtenerMensajeError = (codigoError) => {
  const mensajes = {
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/invalid-email': 'El email no es válido',
    'auth/operation-not-allowed': 'Operación no permitida. Verifica que Google esté habilitado en Firebase Auth.',
    'auth/weak-password': 'La contraseña es muy débil',
    'auth/user-disabled': 'Este usuario ha sido deshabilitado',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/popup-closed-by-user': 'El popup fue cerrado. Intenta nuevamente.',
    'auth/popup-blocked': 'El popup fue bloqueado. Permite ventanas emergentes.',
    'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase.',
    'auth/cancelled-popup-request': 'Solo se puede abrir un popup a la vez.',
    'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este email usando otro método de login.'
  };

  return mensajes[codigoError] || `Error de autenticación: ${codigoError || 'Error desconocido'}`;
};

