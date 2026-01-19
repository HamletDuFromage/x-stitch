/**
 * Harmonious color palettes for cross-stitch patterns
 * Organized by theme with carefully selected colors
 */

export const COLOR_PALETTES = {
    earthTones: {
        name: 'Earth Tones',
        colors: ['#8B7355', '#A0826D', '#C9B299', '#E8D5C4', '#F5EBE0']
    },
    pastelGarden: {
        name: 'Pastel Garden',
        colors: ['#E8B4B8', '#F4D1AE', '#F9EAC2', '#C8E3D4', '#B4D4E1']
    },
    autumnLeaves: {
        name: 'Autumn Leaves',
        colors: ['#8B4513', '#CD853F', '#DAA520', '#D2691E', '#A0522D']
    },
    oceanBreeze: {
        name: 'Ocean Breeze',
        colors: ['#4A90A4', '#5FB3B3', '#8ECAE6', '#A8DADC', '#C1E7E3']
    },
    lavenderFields: {
        name: 'Lavender Fields',
        colors: ['#9D84B7', '#B8A4C9', '#D4C5E2', '#E8DFF5', '#F5F0FA']
    },
    sunsetBlush: {
        name: 'Sunset Blush',
        colors: ['#E07A5F', '#F2A490', '#F4C2B8', '#F9DCC4', '#FEF0E7']
    },
    forestMoss: {
        name: 'Forest Moss',
        colors: ['#3D5A40', '#5F7A61', '#8B9D83', '#B8C5B4', '#D8E2DC']
    },
    berrySweet: {
        name: 'Berry Sweet',
        colors: ['#A4508B', '#C97C9D', '#E5A4B4', '#F4C2C2', '#FFE5EC']
    },
    vintageTea: {
        name: 'Vintage Tea',
        colors: ['#9B6B4F', '#B8927D', '#D4B5A0', '#E8D5C4', '#F5EBE0']
    },
    mintChocolate: {
        name: 'Mint Chocolate',
        colors: ['#4A5240', '#6B7F5E', '#A8C69F', '#C8E6C9', '#E8F5E9']
    }
};

/**
 * Get a random harmonious palette
 */
export function getRandomPalette() {
    const palettes = Object.values(COLOR_PALETTES);
    return palettes[Math.floor(Math.random() * palettes.length)];
}

/**
 * Get palette by key
 */
export function getPalette(key) {
    return COLOR_PALETTES[key] || COLOR_PALETTES.pastelGarden;
}

/**
 * Get all palette names for selection
 */
export function getAllPaletteNames() {
    return Object.entries(COLOR_PALETTES).map(([key, palette]) => ({
        key,
        name: palette.name
    }));
}
