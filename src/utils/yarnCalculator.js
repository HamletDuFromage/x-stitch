/**
 * Calculates yarn usage for a cross-stitch pattern
 * Standard assumptions:
 * - Each cross-stitch uses approximately 50cm of thread (including waste)
 * - Thread is typically sold in 8m skeins
 */

const THREAD_PER_SKEIN_M = 8; // meters
const CM_PER_METER = 100;

/**
 * Canvas types and their thread usage per stitch in cm
 */
export const CANVAS_TYPES = {
    STANDARD: {
        id: 'standard',
        name: 'Standard (Aida 14ct)',
        cmPerStitch: 50 // Original default, though high
    },
    SUDAN: {
        id: 'sudan',
        name: 'Sudan Canvas (Toile Soudan)',
        cmPerStitch: (8 * 100) / 300 // 8m for 300 stitches
    }
};

/**
 * Calculates yarn requirements for a pattern
 * @param {Object} stitchCounts - Map of color to stitch count
 * @param {string} canvasTypeId - ID of the canvas type
 * @returns {Object} Yarn usage data
 */
export function calculateYarnUsage(stitchCounts, canvasTypeId = 'standard') {
    const canvasType = Object.values(CANVAS_TYPES).find(t => t.id === canvasTypeId) || CANVAS_TYPES.STANDARD;
    const cmPerStitch = canvasType.cmPerStitch;

    const yarnData = {};
    let totalStitches = 0;
    let totalThreadMeters = 0;

    Object.entries(stitchCounts).forEach(([color, count]) => {
        const threadCm = count * cmPerStitch;
        const threadMeters = threadCm / CM_PER_METER;
        const skeinsNeeded = Math.ceil(threadMeters / THREAD_PER_SKEIN_M);

        yarnData[color] = {
            stitches: count,
            threadMeters: parseFloat(threadMeters.toFixed(2)),
            threadYards: parseFloat((threadMeters * 1.09361).toFixed(2)), // Convert to yards
            skeinsNeeded
        };

        totalStitches += count;
        totalThreadMeters += threadMeters;
    });

    return {
        canvasType: canvasType.name,
        byColor: yarnData,
        total: {
            stitches: totalStitches,
            threadMeters: parseFloat(totalThreadMeters.toFixed(2)),
            threadYards: parseFloat((totalThreadMeters * 1.09361).toFixed(2)),
            skeinsNeeded: Math.ceil(totalThreadMeters / THREAD_PER_SKEIN_M)
        }
    };
}

/**
 * Formats yarn usage for display
 * @param {Object} yarnUsage - Yarn usage data from calculateYarnUsage
 * @returns {string} Formatted string
 */
export function formatYarnUsage(yarnUsage) {
    let output = 'Yarn Requirements:\n\n';

    Object.entries(yarnUsage.byColor).forEach(([color, data]) => {
        output += `${color}:\n`;
        output += `  ${data.stitches} stitches\n`;
        output += `  ${data.threadMeters}m (${data.threadYards} yards)\n`;
        output += `  ${data.skeinsNeeded} skein(s)\n\n`;
    });

    output += `Total:\n`;
    output += `  ${yarnUsage.total.stitches} stitches\n`;
    output += `  ${yarnUsage.total.threadMeters}m (${yarnUsage.total.threadYards} yards)\n`;

    return output;
}
