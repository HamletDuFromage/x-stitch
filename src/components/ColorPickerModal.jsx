import React from 'react';
import { createPortal } from 'react-dom';
import './styles/ColorPickerModal.css';

export default function ColorPickerModal({
    isOpen,
    onClose,
    color,
    onChange,
    currentPalette
}) {
    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <h3>Edit Color</h3>

                <div className="color-picker-section">
                    <label>Choose Color</label>
                    <div className="color-input-wrapper">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => onChange(e.target.value)}
                            className="modal-color-input"
                        />
                        <span className="color-hex">{color}</span>
                    </div>
                </div>

                <div className="palette-section">
                    <label>Pick from Current Palette</label>
                    <div className="palette-grid">
                        {currentPalette.map((c, i) => (
                            <button
                                key={`${i}-${c}`}
                                className={`palette-swatch ${c === color ? 'active' : ''}`}
                                style={{ backgroundColor: c }}
                                onClick={() => onChange(c)}
                                title={c}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
