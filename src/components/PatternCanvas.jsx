import { useEffect, useRef, useState } from 'react';
import './styles/PatternCanvas.css';

/**
 * Canvas component for rendering cross-stitch pattern preview
 */
export default function PatternCanvas({ pattern, cellSize = 10, onColorClick }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [canZoom, setCanZoom] = useState(false);
    const [hoveredLevel, setHoveredLevel] = useState(null);

    useEffect(() => {
        if (!pattern || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions
        canvas.width = pattern.width * cellSize;
        canvas.height = pattern.height * cellSize;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the pattern
        pattern.grid.forEach((row, y) => {
            row.forEach((cell, x) => {
                // Fill the cell with the color
                ctx.fillStyle = cell.color;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

                // Highlight if this level is hovered
                if (hoveredLevel !== null && cell.level === hoveredLevel) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }

                // Draw grid lines for better visibility
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            });
        });

        // Check if zoom is necessary
        const checkZoom = () => {
            if (canvasRef.current && containerRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const canvasWidth = pattern.width * cellSize;
                const canvasHeight = pattern.height * cellSize;

                // Zoom is available if canvas is larger than container (accounting for padding)
                const padding = 40; // var(--space-xl) is usually 20px, so 40px total
                setCanZoom(
                    canvasWidth > (containerRect.width - padding) ||
                    canvasHeight > (containerRect.height - padding)
                );
            }
        };

        checkZoom();
        window.addEventListener('resize', checkZoom);
        return () => window.removeEventListener('resize', checkZoom);
    }, [pattern, cellSize, hoveredLevel]);

    const getGridCoords = (e) => {
        if (!canvasRef.current) return null;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        const gridX = Math.floor((x * scaleX) / cellSize);
        const gridY = Math.floor((y * scaleY) / cellSize);

        if (gridX >= 0 && gridX < pattern.width && gridY >= 0 && gridY < pattern.height) {
            return { gridX, gridY };
        }
        return null;
    };

    const handleMouseMove = (e) => {
        const coords = getGridCoords(e);
        if (coords) {
            const cell = pattern.grid[coords.gridY][coords.gridX];
            if (cell.level !== hoveredLevel) {
                setHoveredLevel(cell.level);
            }
        } else {
            setHoveredLevel(null);
        }
    };

    const handleCanvasClick = (e) => {
        if (!onColorClick || !pattern) return;
        const coords = getGridCoords(e);
        if (coords) {
            const cell = pattern.grid[coords.gridY][coords.gridX];
            onColorClick(cell.level);
        }
    };

    const handleDownload = () => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `x-stitch-pattern-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="pattern-canvas-container">
            <div
                ref={containerRef}
                className={`canvas-wrapper ${isZoomed ? 'zoomed' : ''}`}
            >
                <canvas
                    ref={canvasRef}
                    className="pattern-canvas"
                    onClick={handleCanvasClick}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredLevel(null)}
                    style={{ cursor: onColorClick ? 'pointer' : 'default' }}
                />
                {canZoom && (
                    <button
                        className="zoom-toggle"
                        onClick={() => setIsZoomed(!isZoomed)}
                        title={isZoomed ? "Zoom Out" : "Zoom In"}
                    >
                        {isZoomed ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                <line x1="8" y1="11" x2="14" y2="11" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                <line x1="11" y1="8" x2="11" y2="14" />
                                <line x1="8" y1="11" x2="14" y2="11" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
            <button onClick={handleDownload} className="download-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Preview
            </button>
        </div>
    );
}
