import './styles/YarnStats.css';

/**
 * Display yarn usage statistics
 */
export default function YarnStats({ yarnUsage }) {
    if (!yarnUsage) {
        return (
            <div className="yarn-stats">
                <h2>Yarn Requirements</h2>
                <p className="no-data">Configure your pattern to see yarn requirements</p>
            </div>
        );
    }

    return (
        <div className="yarn-stats">
            <h2>Yarn Requirements</h2>

            <div className="stats-grid">
                {Object.entries(yarnUsage.byColor).map(([color, data]) => (
                    <div key={color} className="color-stat">
                        <div className="color-header">
                            <div className="color-swatch" style={{ backgroundColor: color }} />
                            <span className="color-label">{color}</span>
                        </div>
                        <div className="stat-details">
                            <div className="stat-row">
                                <span className="stat-label">Stitches:</span>
                                <span className="stat-value">{data.stitches.toLocaleString()}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Thread:</span>
                                <span className="stat-value">{data.threadMeters}m ({data.threadYards} yd)</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Skeins:</span>
                                <span className="stat-value">{data.skeinsNeeded}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="total-stats">
                <h3>Total</h3>
                <div className="stat-row large">
                    <span className="stat-label">Total Stitches:</span>
                    <span className="stat-value">{yarnUsage.total.stitches.toLocaleString()}</span>
                </div>
                <div className="stat-row large">
                    <span className="stat-label">Total Thread:</span>
                    <span className="stat-value">{yarnUsage.total.threadMeters}m ({yarnUsage.total.threadYards} yd)</span>
                </div>
            </div>
        </div>
    );
}
