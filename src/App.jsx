import { useState, useEffect, useMemo } from 'react';
import PatternCanvas from './components/PatternCanvas';
import ControlPanel from './components/ControlPanel';
import YarnStats from './components/YarnStats';
import ExportButtons from './components/ExportButtons';
import ColorPickerModal from './components/ColorPickerModal';
import {
  generateConcentricSquares,
  generateStripes,
  generateIsometricCubes,
  generateConcentricCircles,
  generateConcentricPolygons,
  countStitchesByColor
} from './utils/patternGenerator';
import { calculateYarnUsage } from './utils/yarnCalculator';
import './App.css';

function App() {
  const [config, setConfig] = useState({
    width: 100,
    height: 100,
    numSquares: 5,
    patternType: 'squares', // 'squares', 'stripes', 'diamonds', 'cubes'
    colors: [
      '#E8B4B8', // Pastel Garden palette
      '#F4D1AE',
      '#F9EAC2',
      '#C8E3D4',
      '#B4D4E1',
    ],
    canvasType: 'standard',
    ratioX: 1,
    ratioY: 1,
    squaresSizeMode: 'count', // 'count' or 'thickness'
    layerThickness: 10,
    tilt: 0,
    numSides: 5,
    offsetX: 0,
    offsetY: 0
  });

  const [editingColorIndex, setEditingColorIndex] = useState(null);

  // Generate pattern based on config and pattern type
  const pattern = useMemo(() => {
    switch (config.patternType) {
      case 'stripes':
        return generateStripes(
          config.width,
          config.height,
          config.numSquares,
          config.colors,
          config.tilt,
          config.offsetX,
          config.offsetY
        );
      case 'cubes':
        return generateIsometricCubes(
          config.width,
          config.height,
          config.numSquares,
          config.colors,
          config.offsetX,
          config.offsetY
        );
      case 'circles':
        return generateConcentricCircles(
          config.width,
          config.height,
          config.numSquares,
          config.colors,
          config.ratioX,
          config.ratioY,
          config.squaresSizeMode === 'thickness' ? config.layerThickness : null,
          config.tilt,
          config.offsetX,
          config.offsetY
        );
      case 'polygons':
        return generateConcentricPolygons(
          config.width,
          config.height,
          config.numSides,
          config.numSquares,
          config.colors,
          config.ratioX,
          config.ratioY,
          config.squaresSizeMode === 'thickness' ? config.layerThickness : null,
          config.tilt,
          config.offsetX,
          config.offsetY
        );
      case 'squares':
      default:
        return generateConcentricSquares(
          config.width,
          config.height,
          config.numSquares,
          config.colors,
          config.ratioX,
          config.ratioY,
          config.squaresSizeMode === 'thickness' ? config.layerThickness : null,
          config.tilt,
          config.offsetX,
          config.offsetY
        );
    }
  }, [config]);

  // Sync colors array with the number of layers needed
  useEffect(() => {
    // Determine how many colors we need
    let neededCount = config.numSquares;

    if (config.squaresSizeMode === 'thickness' && (config.patternType === 'squares' || config.patternType === 'circles')) {
      // For thickness mode, we need to estimate or use the actual count from the pattern
      // Since pattern is calculated in useMemo, we can use pattern.numSquares/numLayers
      if (pattern && (pattern.numSquares !== undefined || pattern.numLayers !== undefined)) {
        neededCount = pattern.numSquares || pattern.numLayers;
      }
    }

    if (config.colors.length !== neededCount) {
      const newColors = [...config.colors];

      if (newColors.length < neededCount) {
        // Add colors by cycling through existing ones
        while (newColors.length < neededCount) {
          newColors.push(config.colors[newColors.length % config.colors.length]);
        }
      } else {
        // Truncate colors if we have too many
        newColors.length = neededCount;
      }

      setConfig(prev => ({ ...prev, colors: newColors }));
    }
  }, [config.numSquares, config.squaresSizeMode, config.layerThickness, config.patternType, pattern?.numSquares, pattern?.numLayers, pattern?.numSides]);

  // Calculate yarn usage
  const yarnUsage = useMemo(() => {
    const stitchCounts = countStitchesByColor(pattern);
    return calculateYarnUsage(stitchCounts, config.canvasType);
  }, [pattern, config.canvasType]);

  const handleColorClick = (index) => {
    setEditingColorIndex(index);
  };

  const handleColorUpdate = (newColor) => {
    if (editingColorIndex !== null) {
      const newColors = [...config.colors];
      newColors[editingColorIndex] = newColor;
      setConfig({ ...config, colors: newColors });
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-decoration">
            <span className="stitch-dot">✦</span>
            <span className="stitch-dot">✦</span>
            <span className="stitch-dot">✦</span>
          </div>
          <h1>
            <span className="logo-x">X</span>
            <span className="logo-stitch">-Stitch</span>
          </h1>
          <p className="tagline">Cross-Stitch Pattern Designer</p>
          <div className="thread-decoration">
            <svg viewBox="0 0 100 20" className="thread-svg">
              <path d="M 0 10 Q 25 0, 50 10 T 100 10" stroke="currentColor" fill="none" strokeWidth="2" strokeDasharray="4,4" />
            </svg>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="sidebar">
          <div className="sidebar-scroll">
            <ControlPanel config={config} onChange={setConfig} />
            <ExportButtons config={config} pattern={pattern} />
          </div>
        </div>

        <div className="content">
          <section className="preview-section">
            <h2 className="section-title">Pattern Preview</h2>
            <PatternCanvas
              pattern={pattern}
              cellSize={8}
              onColorClick={handleColorClick}
            />
          </section>

          <section className="stats-section">
            <YarnStats yarnUsage={yarnUsage} />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>Made with ❤️ for cross-stitch enthusiasts</p>
      </footer>

      <ColorPickerModal
        isOpen={editingColorIndex !== null}
        onClose={() => setEditingColorIndex(null)}
        color={editingColorIndex !== null ? config.colors[editingColorIndex] : '#000000'}
        onChange={handleColorUpdate}
        currentPalette={config.colors}
      />
    </div>
  );
}

export default App;
