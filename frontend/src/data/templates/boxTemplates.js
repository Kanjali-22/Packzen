const sharedCapabilities = ['Artwork placement', 'Material color', 'Studio lighting'];

const withSceneScale = (template) => ({ ...template, sceneScale: template.sceneScale ?? 0.1 });

// These are the only products currently backed by an editor model. Gallery copy,
// CSS preview metadata, physical dimensions, and editor identity all live here.
export const templates = [
  withSceneScale({
    id: 'bottle-plastic-500ml', productName: 'Plastic Water Bottle · 500 ml', name: 'Plastic Water Bottle · 500 ml', category: 'bottle', categoryLabel: 'Bottles',
    dimensions: { width: 7.8, height: 24.5, depth: 7.8, unit: 'cm' }, preview: { kind: 'bottle', alt: 'Illustrated 500 millilitre plastic water bottle', mark: '500 ML' },
    summary: 'PET bottle with a screw cap and centered label area.', modelType: 'bottle', material: { color: '#dcefe6', roughness: 0.35, metalness: 0.02 }, camera: { position: [3.4, 2.1, 5.4], target: [0, 0.25, 0], fov: 42 }, capabilities: [...sharedCapabilities, 'Bottle label'], assetUrl: null
  }),
  withSceneScale({
    id: 'mailer-box-standard', productName: 'Standard Mailer Box', name: 'Standard Mailer Box', category: 'box', categoryLabel: 'Boxes',
    dimensions: { width: 30, height: 20, depth: 40, unit: 'cm' }, sceneScale: 0.05, preview: { kind: 'mailer', alt: 'Illustrated folded kraft mailer box', mark: 'MAILER' },
    summary: 'Folded mailer with a lift lid, front tuck, and printable panels.', modelType: 'mailer', material: { color: '#e8d6ba', roughness: 0.6, metalness: 0.05 }, camera: { position: [3.8, 2.7, 5.4], target: [0, -0.2, 0], fov: 45 }, capabilities: [...sharedCapabilities, 'Outer panels'], assetUrl: null
  }),
  withSceneScale({
    id: 'product-box-square', productName: 'Upright Product Carton', name: 'Upright Product Carton', category: 'box', categoryLabel: 'Boxes',
    dimensions: { width: 10, height: 20, depth: 8, unit: 'cm' }, preview: { kind: 'product-box', alt: 'Illustrated upright folding carton', mark: 'CARTON' },
    summary: 'Upright folding carton with a front face and visible side panel.', modelType: 'productBox', material: { color: '#e9e4f4', roughness: 0.6, metalness: 0.05 }, camera: { position: [3.2, 2.5, 5], target: [0, 0.1, 0], fov: 43 }, capabilities: [...sharedCapabilities, 'Front and side panels'], assetUrl: null
  }),
  withSceneScale({
    id: 'aluminum-can-330ml', productName: 'Slim Aluminum Can · 330 ml', name: 'Slim Aluminum Can · 330 ml', category: 'can', categoryLabel: 'Cans',
    dimensions: { width: 6.6, height: 16.5, depth: 6.6, unit: 'cm' }, sceneScale: 0.13, preview: { kind: 'can', alt: 'Illustrated slim 330 millilitre aluminum can', mark: '330 ML' },
    summary: 'Slim aluminum can with rolled rims and a wraparound label area.', modelType: 'can', material: { color: '#c5b4e8', roughness: 0.28, metalness: 0.72 }, camera: { position: [3.1, 2, 5], target: [0, 0.15, 0], fov: 42 }, capabilities: [...sharedCapabilities, 'Wraparound label'], assetUrl: null
  }),
  withSceneScale({
    id: 'stand-up-pouch', productName: 'Stand-up Pouch', name: 'Stand-up Pouch', category: 'pouch', categoryLabel: 'Pouches',
    dimensions: { width: 15.5, height: 22, depth: 4.8, unit: 'cm' }, preview: { kind: 'pouch', alt: 'Illustrated resealable stand-up pouch', mark: 'POUCH' },
    summary: 'Flexible stand-up pouch with sealed edges and a front artwork panel.', modelType: 'pouch', material: { color: '#efb6b7', roughness: 0.5, metalness: 0.03 }, camera: { position: [3.2, 2.1, 5.2], target: [0, 0.1, 0], fov: 43 }, capabilities: [...sharedCapabilities, 'Front artwork panel'], assetUrl: null
  }),
  withSceneScale({
    id: 'cosmetic-jar', productName: 'Cosmetic Cream Jar', name: 'Cosmetic Cream Jar', category: 'jar', categoryLabel: 'Jars',
    dimensions: { width: 14.5, height: 11.5, depth: 14.5, unit: 'cm' }, preview: { kind: 'jar', alt: 'Illustrated cosmetic cream jar with lid', mark: 'CREAM' },
    summary: 'Low cosmetic jar with a separate screw-top lid and label band.', modelType: 'jar', material: { color: '#beded1', roughness: 0.38, metalness: 0.08 }, camera: { position: [3.2, 2.1, 5], target: [0, -0.2, 0], fov: 43 }, capabilities: [...sharedCapabilities, 'Label band'], assetUrl: null
  })
];

const templateById = new Map(templates.map((template) => [template.id, template]));
const categoryTemplateIds = { bottle: 'bottle-plastic-500ml', 'water-bottle': 'bottle-plastic-500ml', supplement: 'bottle-plastic-500ml', box: 'product-box-square', 'gift-box': 'product-box-square', pizza: 'mailer-box-standard', pouch: 'stand-up-pouch', food: 'stand-up-pouch', can: 'aluminum-can-330ml', cup: 'cosmetic-jar', tube: 'cosmetic-jar', 'paper-bag': 'mailer-box-standard', mailer: 'mailer-box-standard' };

export const getTemplateById = (id) => templateById.get(id) ?? null;
export const getTemplateIdForCategory = (category) => categoryTemplateIds[category] ?? 'product-box-square';
export const getSceneDimensions = ({ dimensions, sceneScale = 0.1 }) => ({ width: dimensions.width * sceneScale, height: dimensions.height * sceneScale, depth: dimensions.depth * sceneScale });
const categoryTones = { bottle: 'Mint', box: 'Sandstone', can: 'Lavender', pouch: 'Blush', jar: 'Aqua' };
export const templateCategories = [...new Map(templates.map(({ category, categoryLabel }) => [category, { slug: category, name: categoryLabel, tone: categoryTones[category] }])).values()];
