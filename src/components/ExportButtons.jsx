import './styles/ExportButtons.css';

/**
 * Export buttons for pattern data and preview
 */
export default function ExportButtons({ config, pattern }) {
    const handleExportJSON = () => {
        const exportData = {
            version: '1.0',
            pattern: 'concentric-squares',
            timestamp: new Date().toISOString(),
            config: {
                width: config.width,
                height: config.height,
                numSquares: config.numSquares,
                colors: config.colors
            }
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `x-stitch-pattern-${Date.now()}.json`;
        link.click();

        URL.revokeObjectURL(url);
    };

    const handleImportJSON = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result);
                if (data.config && window.confirm('Import this pattern configuration?')) {
                    // This would need to be passed up to parent component
                    console.log('Import data:', data.config);
                    alert('Import functionality requires parent component integration');
                }
            } catch (error) {
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="export-buttons">
            <h3>Export & Import</h3>
            <div className="button-group">
                <button onClick={handleExportJSON} className="export-btn json-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    Export JSON
                </button>

                <label className="export-btn import-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="12" x2="12" y2="18" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    Import JSON
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJSON}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>
        </div>
    );
}
