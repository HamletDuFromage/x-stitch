/**
 * Generates a concentric squares/rectangles pattern
 * @param {number} width - Width of the fabric in stitches
 * @param {number} height - Height of the fabric in stitches
 * @param {number} numSquares - Number of concentric layers
 * @param {string[]} colors - Array of colors for each level
 * @param {number} ratioX - Width ratio (default 1)
 * @param {number} ratioY - Height ratio (default 1)
 * @param {number} layerThickness - Optional thickness of each layer in stitches
 * @param {number} tilt - Rotation angle in degrees (default 0)
 * @param {number} offsetX - X offset from center in stitches (default 0)
 * @param {number} offsetY - Y offset from center in stitches (default 0)
 * @returns {Object} Pattern data structure
 */
export function generateConcentricSquares(width, height, numSquares, colors, ratioX = 1, ratioY = 1, layerThickness = null, tilt = 0, offsetX = 0, offsetY = 0) {
    // Create a 2D grid to represent the pattern
    const grid = Array(height).fill(null).map(() => Array(width).fill(null));

    // Calculate the center of the fabric
    const centerX = (width - 1) / 2 + offsetX;
    const centerY = (height - 1) / 2 + offsetY;

    // Convert tilt to radians
    const tiltRad = (tilt * Math.PI) / 180;
    const cosTilt = Math.cos(tiltRad);
    const sinTilt = Math.sin(tiltRad);

    // Calculate the maximum possible distance from center
    // We use the corners to find the max distance after rotation
    const corners = [
        { x: 0, y: 0 },
        { x: width - 1, y: 0 },
        { x: 0, y: height - 1 },
        { x: width - 1, y: height - 1 }
    ];

    let maxDistance = 0;
    corners.forEach(corner => {
        const dx = corner.x - centerX;
        const dy = corner.y - centerY;
        // Rotate coordinates
        const rx = (Math.abs(dx * cosTilt + dy * sinTilt) + 1e-10) / ratioX;
        const ry = (Math.abs(-dx * sinTilt + dy * cosTilt) + 1e-10) / ratioY;
        maxDistance = Math.max(maxDistance, rx, ry);
    });

    // For each stitch position, determine which level it belongs to
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate the distance from the center
            const dx = x - centerX;
            const dy = y - centerY;

            // Rotate coordinates
            const rx = (Math.abs(dx * cosTilt + dy * sinTilt) + 1e-10) / ratioX;
            const ry = (Math.abs(-dx * sinTilt + dy * cosTilt) + 1e-10) / ratioY;
            const distance = Math.max(rx, ry);

            // Determine which level this stitch belongs to
            let level;
            if (layerThickness) {
                // If thickness is S, boundaries are at 0.5S, 1.5S, 2.5S...
                // Level 0: 0 to 0.5S (width S)
                // Level 1: 0.5S to 1.5S
                level = Math.floor((distance + layerThickness / 2) / layerThickness);
            } else {
                level = Math.floor((distance / (maxDistance || 1)) * numSquares);
                level = Math.min(level, numSquares - 1);
            }

            // Cycle through available colors
            const colorIndex = level % colors.length;

            // Assign the color and level
            grid[y][x] = {
                color: colors[colorIndex],
                level: colorIndex
            };
        }
    }

    // Calculate actual number of layers for return
    const actualNumSquares = layerThickness
        ? Math.max(1, Math.ceil((maxDistance + layerThickness / 2) / layerThickness))
        : numSquares;

    return {
        grid,
        width,
        height,
        numSquares: actualNumSquares,
        colors,
        ratioX,
        ratioY,
        layerThickness,
        tilt,
        offsetX,
        offsetY
    };
}

/**
 * Counts stitches by color in a pattern
 * @param {Object} pattern - Pattern data from generateConcentricSquares
 * @returns {Object} Map of color to stitch count
 */
export function countStitchesByColor(pattern) {
    const counts = {};

    pattern.grid.forEach(row => {
        row.forEach(cell => {
            const color = cell.color;
            counts[color] = (counts[color] || 0) + 1;
        });
    });

    return counts;
}

/**
 * Generates a stripes pattern
 * @param {number} width - Width of the fabric in stitches
 * @param {number} height - Height of the fabric in stitches
 * @param {number} stripeWidth - Width of each stripe
 * @param {string[]} colors - Array of colors for stripes
 * @param {number} tilt - Rotation angle in degrees (default 0)
 * @param {number} offsetX - X offset in stitches (default 0)
 * @param {number} offsetY - Y offset in stitches (default 0)
 * @returns {Object} Pattern data structure
 */
export function generateStripes(width, height, stripeWidth, colors, tilt = 0, offsetX = 0, offsetY = 0) {
    const grid = Array(height).fill(null).map(() => Array(width).fill(null));

    // Calculate the center of the fabric
    const centerX = (width - 1) / 2 + offsetX;
    const centerY = (height - 1) / 2 + offsetY;

    // Convert tilt to radians
    // Add 45 degrees by default to maintain "diagonal" feel at 0 tilt if desired, 
    // but user said "not calling diagonal stripes anymore", so 0 = vertical.
    const tiltRad = (tilt * Math.PI) / 180;
    const cosTilt = Math.cos(tiltRad);
    const sinTilt = Math.sin(tiltRad);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate coordinates relative to center
            const dx = x - centerX;
            const dy = y - centerY;

            // Rotate coordinates to find position along the stripes' normal
            const rx = dx * cosTilt + dy * sinTilt + 1e-10;

            // Calculate stripe index with proper modulo for negative values
            const stripePos = Math.floor(rx / stripeWidth);
            const stripeIndex = ((stripePos % colors.length) + colors.length) % colors.length;

            grid[y][x] = {
                color: colors[stripeIndex],
                level: stripeIndex
            };
        }
    }

    return {
        grid,
        width,
        height,
        stripeWidth,
        colors,
        tilt,
        offsetX,
        offsetY
    };
}


/**
 * Generates a 3D isometric cubes pattern (tumbling blocks)
 * @param {number} width - Width of the fabric in stitches
 * @param {number} height - Height of the fabric in stitches
 * @param {number} cubeSize - Size of each cube face
 * @param {string[]} colors - Array of colors (should be 3 contrasting shades)
 * @param {number} offsetX - X offset in stitches (default 0)
 * @param {number} offsetY - Y offset in stitches (default 0)
 * @returns {Object} Pattern data structure
 */
export function generateIsometricCubes(width, height, cubeSize, colors, offsetX = 0, offsetY = 0) {
    const grid = Array(height).fill(null).map(() => Array(width).fill(null));

    // We need at least 3 colors for the 3D effect
    // If fewer are provided, we'll cycle through what we have
    const colorMap = [
        colors[0 % colors.length], // Top face (usually lightest)
        colors[1 % colors.length], // Right face (medium)
        colors[2 % colors.length]  // Left face (darkest)
    ];

    // Geometry parameters for the hexagonal grid
    // cubeSize acts as the side length of the hexagon/cube
    const hexRadius = Math.max(2, cubeSize);

    // Calculate the center of the fabric
    const centerX_orig = (width - 1) / 2 + offsetX;
    const centerY_orig = (height - 1) / 2 + offsetY;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Find the nearest hexagon center using axial coordinates logic
            // q = (sqrt(3)/3 * x - 1/3 * y) / size
            // r = (2/3 * y) / size

            // Adjust x and y by the center before calculating hex coords
            const adjX = x - centerX_orig;
            const adjY = y - centerY_orig;

            const q = (Math.sqrt(3) / 3 * adjX - 1 / 3 * adjY) / hexRadius;
            const r = (2 / 3 * adjY) / hexRadius;

            // Round to nearest hex coordinates
            let rx = Math.round(q);
            let ry = Math.round(r);
            let rz = Math.round(-q - r);

            const x_diff = Math.abs(rx - q);
            const y_diff = Math.abs(ry - r);
            const z_diff = Math.abs(rz - (-q - r));

            if (x_diff > y_diff && x_diff > z_diff) {
                rx = -ry - rz;
            } else if (y_diff > z_diff) {
                ry = -rx - rz;
            } else {
                rz = -rx - ry;
            }

            // Convert back to pixel coordinates to find the center (relative to our base center)
            const hexCenterX = hexRadius * Math.sqrt(3) * (rx + ry / 2);
            const hexCenterY = hexRadius * 3 / 2 * ry;

            // Determine angle relative to center
            const angle = Math.atan2(adjY - hexCenterY, adjX - hexCenterX) * 180 / Math.PI;

            // Map angle to 3 faces (Top, Right, Left)
            // Top: -150 to -30
            // Right: -30 to 90
            // Left: 90 to 180 and -180 to -150

            let faceIndex;
            if (angle >= -150 && angle < -30) {
                faceIndex = 0; // Top
            } else if (angle >= -30 && angle < 90) {
                faceIndex = 1; // Right
            } else {
                faceIndex = 2; // Left
            }

            grid[y][x] = {
                color: colorMap[faceIndex],
                level: faceIndex
            };
        }
    }

    return {
        grid,
        width,
        height,
        cubeSize,
        colors,
        offsetX,
        offsetY
    };
}

/**
 * Generates a concentric circles/ellipses pattern
 * @param {number} width - Width of the fabric in stitches
 * @param {number} height - Height of the fabric in stitches
 * @param {number} numLayers - Number of concentric layers
 * @param {string[]} colors - Array of colors for each level
 * @param {number} ratioX - Width ratio (default 1)
 * @param {number} ratioY - Height ratio (default 1)
 * @param {number} layerThickness - Optional thickness of each layer in stitches
 * @param {number} tilt - Rotation angle in degrees (default 0)
 * @param {number} offsetX - X offset in stitches (default 0)
 * @param {number} offsetY - Y offset in stitches (default 0)
 * @returns {Object} Pattern data structure
 */
export function generateConcentricCircles(width, height, numLayers, colors, ratioX = 1, ratioY = 1, layerThickness = null, tilt = 0, offsetX = 0, offsetY = 0) {
    const grid = Array(height).fill(null).map(() => Array(width).fill(null));

    // Calculate the center of the fabric
    const centerX = (width - 1) / 2 + offsetX;
    const centerY = (height - 1) / 2 + offsetY;

    // Convert tilt to radians
    const tiltRad = (tilt * Math.PI) / 180;
    const cosTilt = Math.cos(tiltRad);
    const sinTilt = Math.sin(tiltRad);

    // Calculate max distance for normalization
    // We use the corners to find the max distance after rotation
    const corners = [
        { x: 0, y: 0 },
        { x: width - 1, y: 0 },
        { x: 0, y: height - 1 },
        { x: width - 1, y: height - 1 }
    ];

    let maxDistance = 0;
    corners.forEach(corner => {
        const dx = corner.x - centerX;
        const dy = corner.y - centerY;
        // Rotate coordinates
        const rx = (dx * cosTilt + dy * sinTilt) / ratioX;
        const ry = (-dx * sinTilt + dy * cosTilt) / ratioY;
        maxDistance = Math.max(maxDistance, Math.sqrt(rx * rx + ry * ry));
    });

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate coordinates relative to center
            const dx = x - centerX;
            const dy = y - centerY;

            // Rotate coordinates
            const rx = (dx * cosTilt + dy * sinTilt + 1e-10) / ratioX;
            const ry = (-dx * sinTilt + dy * cosTilt + 1e-10) / ratioY;
            const distance = Math.sqrt(rx * rx + ry * ry);

            // Determine which level this stitch belongs to
            let level;
            if (layerThickness) {
                level = Math.floor((distance + layerThickness / 2) / layerThickness);
            } else {
                level = Math.floor((distance / (maxDistance || 1)) * numLayers);
                level = Math.min(level, numLayers - 1);
            }

            // Cycle through available colors
            const colorIndex = level % colors.length;

            grid[y][x] = {
                color: colors[colorIndex],
                level: colorIndex
            };
        }
    }

    // Calculate actual number of layers for return
    const actualNumLayers = layerThickness
        ? Math.max(1, Math.ceil((maxDistance + layerThickness / 2) / layerThickness))
        : numLayers;

    return {
        grid,
        width,
        height,
        numLayers: actualNumLayers,
        colors,
        ratioX,
        ratioY,
        layerThickness,
        tilt,
        offsetX,
        offsetY
    };
}

/**
 * Generates a concentric polygon pattern
 * @param {number} width - Width of the fabric in stitches
 * @param {number} height - Height of the fabric in stitches
 * @param {number} numSides - Number of sides for the polygon
 * @param {number} numLayers - Number of concentric layers
 * @param {string[]} colors - Array of colors for each level
 * @param {number} ratioX - Width ratio (default 1)
 * @param {number} ratioY - Height ratio (default 1)
 * @param {number} layerThickness - Optional thickness of each layer in stitches
 * @param {number} tilt - Rotation angle in degrees (default 0)
 * @param {number} offsetX - X offset in stitches (default 0)
 * @param {number} offsetY - Y offset in stitches (default 0)
 * @returns {Object} Pattern data structure
 */
export function generateConcentricPolygons(width, height, numSides, numLayers, colors, ratioX = 1, ratioY = 1, layerThickness = null, tilt = 0, offsetX = 0, offsetY = 0) {
    const grid = Array(height).fill(null).map(() => Array(width).fill(null));

    const centerX = (width - 1) / 2 + offsetX;
    const centerY = (height - 1) / 2 + offsetY;

    const tiltRad = (tilt * Math.PI) / 180;
    const cosTilt = Math.cos(tiltRad);
    const sinTilt = Math.sin(tiltRad);

    const sides = Math.max(3, numSides);
    const angleStep = (2 * Math.PI) / sides;

    const corners = [
        { x: 0, y: 0 },
        { x: width - 1, y: 0 },
        { x: 0, y: height - 1 },
        { x: width - 1, y: height - 1 }
    ];

    let maxDistance = 0;
    corners.forEach(corner => {
        const dx = corner.x - centerX;
        const dy = corner.y - centerY;
        const rx = (dx * cosTilt + dy * sinTilt) / ratioX;
        const ry = (-dx * sinTilt + dy * cosTilt) / ratioY;

        const r = Math.sqrt(rx * rx + ry * ry);
        const theta = Math.atan2(ry, rx);
        const d = r * Math.cos((((theta % angleStep) + angleStep) % angleStep) - angleStep / 2);
        maxDistance = Math.max(maxDistance, d);
    });

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const rx = (dx * cosTilt + dy * sinTilt + 1e-10) / ratioX;
            const ry = (-dx * sinTilt + dy * cosTilt + 1e-10) / ratioY;

            const r = Math.sqrt(rx * rx + ry * ry);
            const theta = Math.atan2(ry, rx);
            const distance = r * Math.cos((((theta % angleStep) + angleStep) % angleStep) - angleStep / 2);

            let level;
            if (layerThickness) {
                level = Math.floor((distance + layerThickness / 2) / layerThickness);
            } else {
                level = Math.floor((distance / (maxDistance || 1)) * numLayers);
                level = Math.min(level, numLayers - 1);
            }

            const colorIndex = level % colors.length;
            grid[y][x] = {
                color: colors[colorIndex],
                level: colorIndex
            };
        }
    }

    const actualNumLayers = layerThickness
        ? Math.max(1, Math.ceil((maxDistance + layerThickness / 2) / layerThickness))
        : numLayers;

    return {
        grid,
        width,
        height,
        numSides: sides,
        numLayers: actualNumLayers,
        colors,
        ratioX,
        ratioY,
        layerThickness,
        tilt,
        offsetX,
        offsetY
    };
}
