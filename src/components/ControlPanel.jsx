import { getAllPaletteNames, getPalette } from '../utils/colorPalettes';
import { CANVAS_TYPES } from '../utils/yarnCalculator';
import './styles/ControlPanel.css';

/**
 * Helper to find the smallest repeating period in an array of colors
 */
const findPeriod = (colors) => {
    if (colors.length <= 1) return colors.length;
    // Check for repeating patterns from length 1 up to half the array
    for (let p = 1; p <= colors.length / 2; p++) {
        let match = true;
        for (let i = p; i < colors.length; i++) {
            if (colors[i] !== colors[i % p]) {
                match = false;
                break;
            }
        }
        if (match) return p;
    }
    return colors.length;
};

/**
 * Control panel for pattern parameters
 */
export default function ControlPanel({ config, onChange }) {
    const paletteOptions = getAllPaletteNames();

    const handleChange = (field, value) => {
        onChange({ ...config, [field]: value });
    };

    const handleColorChange = (index, color) => {
        const newColors = [...config.colors];
        newColors[index] = color;
        onChange({ ...config, colors: newColors });
    };

    const handleNumSquaresChange = (num) => {
        // Different max values for different pattern types
        const maxValue = config.patternType === 'squares' ? 20 : 50;
        const newNum = Math.max(1, Math.min(maxValue, num));

        if (config.patternType === 'squares') {
            // For squares pattern, we need exactly newNum colors
            const newColors = [...config.colors];

            if (newNum > newColors.length) {
                // Repeat the existing sequence
                const period = findPeriod(newColors);
                while (newColors.length < newNum) {
                    newColors.push(newColors[newColors.length % period]);
                }
            } else {
                newColors.splice(newNum);
            }

            onChange({ ...config, numSquares: newNum, colors: newColors });
        } else {
            // For stripes/diamonds/cubes, numSquares is just the size/width
            onChange({ ...config, numSquares: newNum });
        }
    };

    const handleNumColorsChange = (num) => {
        const newNum = Math.max(1, Math.min(20, num));
        const newColors = [...config.colors];

        if (newNum > newColors.length) {
            // Repeat the existing sequence
            const period = findPeriod(newColors);
            while (newColors.length < newNum) {
                newColors.push(newColors[newColors.length % period]);
            }
        } else {
            newColors.splice(newNum);
        }

        onChange({ ...config, colors: newColors });
    };

    const handlePatternTypeChange = (type) => {
        if (type === 'cubes') {
            // Ensure we have exactly 3 colors for cubes
            let newColors = [...config.colors];
            while (newColors.length < 3) {
                newColors.push('#abcdef'); // Fallback
            }
            // If we have more than 3, take the first 3
            newColors = newColors.slice(0, 3);

            onChange({
                ...config,
                patternType: type,
                colors: newColors,
                numSquares: 10 // Default cube size
            });
        } else {
            onChange({ ...config, patternType: type });
        }
    };

    const handlePaletteChange = (paletteKey) => {
        const palette = getPalette(paletteKey);

        if (config.patternType === 'cubes') {
            // For cubes, just take the first 3 colors
            onChange({
                ...config,
                colors: palette.colors.slice(0, 3)
            });
            return;
        }

        // For all other patterns, cycle the palette colors to fill the current count
        const targetCount = config.patternType === 'squares' ? config.numSquares : config.colors.length;

        // If the palette is larger than current count, we might want to expand?
        // But the user specifically asked to repeat the palette to fill the slots.
        const finalCount = Math.max(targetCount, palette.colors.length);

        const newColors = Array.from({ length: finalCount }, (_, i) =>
            palette.colors[i % palette.colors.length]
        );

        onChange({
            ...config,
            colors: newColors,
            // For squares, we must keep numSquares in sync with color count
            ...(config.patternType === 'squares' && { numSquares: finalCount })
        });
    };

    const getPatternLabel = () => {
        switch (config.patternType) {
            case 'squares':
            case 'circles':
            case 'polygons': return config.squaresSizeMode === 'count' ? 'Number of Layers' : 'Layer Thickness';
            case 'stripes': return 'Stripe Width';
            case 'diamonds': return 'Diamond Size';
            case 'cubes': return 'Cube Size';
            default: return 'Pattern Size';
        }
    };

    return (
        <div className="control-panel">
            <h2>Pattern Settings</h2>

            <div className="control-section">
                <h3>Pattern Type</h3>
                <div className="pattern-selector">
                    <button
                        className={`pattern-btn ${config.patternType === 'squares' ? 'active' : ''}`}
                        onClick={() => handlePatternTypeChange('squares')}
                    >
                        <span className="pattern-icon">◻</span>
                        Concentric Rectangles
                    </button>
                    <button
                        className={`pattern-btn ${config.patternType === 'circles' ? 'active' : ''}`}
                        onClick={() => handlePatternTypeChange('circles')}
                    >
                        <span className="pattern-icon">◯</span>
                        Concentric Circles
                    </button>
                    <button
                        className={`pattern-btn ${config.patternType === 'stripes' ? 'active' : ''}`}
                        onClick={() => handlePatternTypeChange('stripes')}
                    >
                        <span className="pattern-icon">▤</span>
                        Stripes
                    </button>
                    <button
                        className={`pattern-btn ${config.patternType === 'polygons' ? 'active' : ''}`}
                        onClick={() => handlePatternTypeChange('polygons')}
                    >
                        <span className="pattern-icon">⬠</span>
                        Concentric Polygons
                    </button>
                    <button
                        className={`pattern-btn ${config.patternType === 'cubes' ? 'active' : ''}`}
                        onClick={() => handlePatternTypeChange('cubes')}
                    >
                        <span className="pattern-icon">⬢</span>
                        Isometric Cubes
                    </button>
                </div>
            </div>

            <div className="control-section">
                <h3>Color Palette</h3>
                <select
                    className="palette-select"
                    onChange={(e) => handlePaletteChange(e.target.value)}
                >
                    <option value="">Custom Colors</option>
                    {paletteOptions.map(({ key, name }) => (
                        <option key={key} value={key}>{name}</option>
                    ))}
                </select>
            </div>

            <div className="control-section">
                <h3>Fabric Size</h3>
                <div className="control-group ratio-group">
                    <label>
                        <span>Width (stitches)</span>
                        <input
                            type="number"
                            min="10"
                            max="500"
                            value={config.width}
                            onChange={(e) => handleChange('width', parseInt(e.target.value) || 50)}
                            className="number-input"
                        />
                    </label>

                    <label>
                        <span>Height (stitches)</span>
                        <input
                            type="number"
                            min="10"
                            max="500"
                            value={config.height}
                            onChange={(e) => handleChange('height', parseInt(e.target.value) || 50)}
                            className="number-input"
                        />
                    </label>
                </div>
            </div>

            <div className="control-section">
                <h3>Canvas Type</h3>
                <select
                    className="palette-select"
                    value={config.canvasType || 'standard'}
                    onChange={(e) => handleChange('canvasType', e.target.value)}
                >
                    {Object.values(CANVAS_TYPES).map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>
                <p className="control-help" style={{ marginTop: '8px', fontSize: '0.85rem', opacity: 0.8 }}>
                    {config.canvasType === 'sudan'
                        ? '300 stitches = 8m skein'
                        : 'Standard calculation (50cm/stitch)'}
                </p>
            </div>

            <div className="control-section">
                <h3>Pattern Offset</h3>
                <div className="control-group offset-group">
                    <label>
                        <span>X Offset</span>
                        <div className="range-with-value">
                            <input
                                type="range"
                                min={-Math.floor(config.width / 2)}
                                max={Math.floor(config.width / 2)}
                                value={config.offsetX || 0}
                                onChange={(e) => handleChange('offsetX', parseInt(e.target.value) || 0)}
                            />
                            <input
                                type="number"
                                className="value-badge"
                                value={config.offsetX || 0}
                                onChange={(e) => handleChange('offsetX', parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </label>
                    <label>
                        <span>Y Offset</span>
                        <div className="range-with-value">
                            <input
                                type="range"
                                min={-Math.floor(config.height / 2)}
                                max={Math.floor(config.height / 2)}
                                value={config.offsetY || 0}
                                onChange={(e) => handleChange('offsetY', parseInt(e.target.value) || 0)}
                            />
                            <input
                                type="number"
                                className="value-badge"
                                value={config.offsetY || 0}
                                onChange={(e) => handleChange('offsetY', parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </label>
                </div>
            </div>

            <div className="control-section">
                <h3>Pattern Parameters</h3>
                <div className="control-group" style={{ marginBottom: '16px' }}>
                    <label>
                        <span>
                            {(config.patternType === 'squares' || config.patternType === 'circles' || config.patternType === 'polygons') && (config.squaresSizeMode === 'count' ? 'Number of Layers' : 'Layer Thickness (stitches)')}
                            {config.patternType === 'stripes' && 'Stripe Width (stitches)'}
                            {config.patternType === 'diamonds' && 'Diamond Size (stitches)'}
                            {config.patternType === 'cubes' && 'Cube Size'}
                        </span>
                        {(config.patternType === 'squares' || config.patternType === 'circles' || config.patternType === 'polygons') && (
                            <div className="size-mode-selector" style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
                                <button
                                    className={`pattern-btn ${config.squaresSizeMode === 'count' ? 'active' : ''}`}
                                    onClick={() => handleChange('squaresSizeMode', 'count')}
                                    style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                                >
                                    By Count
                                </button>
                                <button
                                    className={`pattern-btn ${config.squaresSizeMode === 'thickness' ? 'active' : ''}`}
                                    onClick={() => handleChange('squaresSizeMode', 'thickness')}
                                    style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                                >
                                    By Thickness
                                </button>
                            </div>
                        )}
                        <input
                            type="number"
                            min="1"
                            max={(config.patternType === 'squares' || config.patternType === 'circles' || config.patternType === 'polygons') ? (config.squaresSizeMode === 'count' ? 20 : 100) : 50}
                            value={(config.patternType === 'squares' || config.patternType === 'circles' || config.patternType === 'polygons') && config.squaresSizeMode === 'thickness' ? config.layerThickness : config.numSquares}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                if ((config.patternType === 'squares' || config.patternType === 'circles' || config.patternType === 'polygons') && config.squaresSizeMode === 'thickness') {
                                    handleChange('layerThickness', val);
                                } else {
                                    handleNumSquaresChange(val);
                                }
                            }}
                            className="number-input"
                        />
                    </label>
                </div>

                {config.patternType === 'polygons' && (
                    <div className="control-group" style={{ marginBottom: '16px' }}>
                        <label>
                            <span>Number of Polygons Sides</span>
                            <input
                                type="number"
                                min="3"
                                max="20"
                                value={config.numSides || 5}
                                onChange={(e) => handleChange('numSides', parseInt(e.target.value) || 3)}
                                className="number-input"
                            />
                        </label>
                    </div>
                )}

                {(config.patternType === 'squares' || config.patternType === 'circles' || config.patternType === 'polygons' || config.patternType === 'stripes') && (
                    <div className="control-group" style={{ marginBottom: '16px' }}>
                        <label>Pattern Tilt (degrees)</label>
                        <div className="range-with-value">
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={config.tilt || 0}
                                onChange={(e) => onChange({ ...config, tilt: parseInt(e.target.value) })}
                            />
                            <input
                                type="number"
                                className="value-badge"
                                min="0"
                                max="360"
                                value={config.tilt || 0}
                                onChange={(e) => onChange({ ...config, tilt: parseInt(e.target.value) || 0 })}
                            />
                            <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>°</span>
                        </div>
                    </div>
                )}

                {(config.patternType === 'squares' || config.patternType === 'circles' || config.patternType === 'polygons') && (
                    <div className="control-group">
                        <label>Pattern Ratio</label>
                        <div className="control-group ratio-group">
                            <label>
                                <span>Width Ratio</span>
                                <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    max="10"
                                    value={config.ratioX}
                                    onChange={(e) => handleChange('ratioX', parseFloat(e.target.value) || 1)}
                                    className="number-input"
                                />
                            </label>
                            <label>
                                <span>Height Ratio</span>
                                <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    max="10"
                                    value={config.ratioY}
                                    onChange={(e) => handleChange('ratioY', parseFloat(e.target.value) || 1)}
                                    className="number-input"
                                />
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {(config.patternType === 'stripes' || config.patternType === 'diamonds') && (
                <div className="control-section">
                    <h3>Number of Colors</h3>
                    <label>
                        <span>Unique colors in cycle</span>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={config.colors.length}
                            onChange={(e) => handleNumColorsChange(parseInt(e.target.value) || 2)}
                            className="number-input"
                        />
                    </label>
                </div>
            )}

            <div className="control-section">
                <h3>Colors</h3>
                <div className="color-grid">
                    {config.colors.map((color, index) => (
                        <label key={`color-${index}-${color}`} className="color-control">
                            <span>Color {index + 1}</span>
                            <div className="color-input-wrapper">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => handleColorChange(index, e.target.value)}
                                    className="color-input"
                                />
                                <div className="color-preview" style={{ backgroundColor: color }} />
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
