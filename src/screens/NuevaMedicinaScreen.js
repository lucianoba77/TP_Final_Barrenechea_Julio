import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMed } from '../context/MedContext';
import { coloresMedicamento } from '../data/mockData';
import './NuevaMedicinaScreen.css';

const NuevaMedicinaScreen = () => {
  const navigate = useNavigate();
  const { agregarMedicina } = useMed();
  
  const [formData, setFormData] = useState({
    nombre: '',
    presentacion: 'comprimidos',
    tomasDiarias: 1,
    primeraToma: '',
    afeccion: '',
    stockInicial: 30,
    color: '#FFFFFF',
    diasTratamiento: 30,
    esCronico: false,
    alarmasActivas: true,
    detalles: ''
  });

  const [colorSeleccionado, setColorSeleccionado] = useState('#FFFFFF');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleColorSelect = (color) => {
    setColorSeleccionado(color.valor);
    setFormData(prev => ({ ...prev, color: color.valor }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const nuevaMedicina = agregarMedicina(formData);
    if (nuevaMedicina) {
      navigate('/botiquin');
    }
  };

  const presentaciones = ['comprimidos', 'inyeccion', 'jarabe', 'gotas', 'crema', 'supositorio'];

  return (
    <div className="nueva-medicina-screen">
      <div className="nm-header">
        <button className="btn-back" onClick={() => navigate('/botiquin')}>🏠</button>
        <h1>Nueva Medicina</h1>
      </div>

      <div className="nm-container">
        <form onSubmit={handleSubmit} className="nm-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre del medicamento *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Paracetamol"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="presentacion">Presentación</label>
            <select
              id="presentacion"
              name="presentacion"
              value={formData.presentacion}
              onChange={handleChange}
            >
              {presentaciones.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="tomasDiarias">Tomas diarias</label>
              <input
                type="number"
                id="tomasDiarias"
                name="tomasDiarias"
                value={formData.tomasDiarias}
                onChange={handleChange}
                min="1"
                max="6"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="primeraToma">Primera toma</label>
              <input
                type="time"
                id="primeraToma"
                name="primeraToma"
                value={formData.primeraToma}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="afeccion">Condición que trata</label>
            <input
              type="text"
              id="afeccion"
              name="afeccion"
              value={formData.afeccion}
              onChange={handleChange}
              placeholder="Ej: Dolor de cabeza, Hipertensión"
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="stockInicial">Stock inicial</label>
              <input
                type="number"
                id="stockInicial"
                name="stockInicial"
                value={formData.stockInicial}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="diasTratamiento">Días de tratamiento</label>
              <input
                type="number"
                id="diasTratamiento"
                name="diasTratamiento"
                value={formData.diasTratamiento}
                onChange={handleChange}
                min="1"
                required
              />
              <button
                type="button"
                className="btn-cronico"
                onClick={() => setFormData(prev => ({ ...prev, esCronico: !prev.esCronico }))}
              >
                {formData.esCronico ? 'Crónico ✓' : 'Crónico'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Color del medicamento</label>
            <p className="color-description">
              Selecciona el color que más se parezca a tu medicamento o envase
            </p>
            <div className="color-grid">
              {coloresMedicamento.map((color, index) => (
                <div
                  key={index}
                  className={`color-swatch ${colorSeleccionado === color.valor ? 'selected' : ''}`}
                  style={{ backgroundColor: color.valor }}
                  onClick={() => handleColorSelect(color)}
                >
                  {colorSeleccionado === color.valor && <span className="checkmark">✓</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <div className="toggle-group">
              <label htmlFor="alarmasActivas">Activar alarmas</label>
              <input
                type="checkbox"
                id="alarmasActivas"
                name="alarmasActivas"
                checked={formData.alarmasActivas}
                onChange={handleChange}
                className="checkbox-toggle"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="detalles">Detalles adicionales</label>
            <textarea
              id="detalles"
              name="detalles"
              value={formData.detalles}
              onChange={handleChange}
              rows="4"
              placeholder="Instrucciones especiales, efectos secundarios a vigilar, etc."
            />
          </div>

          <button type="submit" className="btn-submit">
            + Agregar Medicamento
          </button>
        </form>
      </div>
    </div>
  );
};

export default NuevaMedicinaScreen;

