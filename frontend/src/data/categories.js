export const mockupCategories = [
  ['box', 'Box', 'Sandstone'],
  ['pouch', 'Pouch', 'Blush'],
  ['bottle', 'Bottle', 'Mint'],
  ['can', 'Can', 'Lavender'],
  ['tube', 'Tube', 'Peach'],
  ['cup', 'Cup & container', 'Sky'],
  ['food', 'Food packaging', 'Butter'],
  ['water-bottle', 'Water bottle', 'Aqua'],
  ['gift-box', 'Gift box', 'Rose'],
  ['paper-bag', 'Paper bag', 'Wheat'],
  ['pizza', 'Pizza packaging', 'Lemon'],
  ['supplement', 'Supplement bottle', 'Violet']
].map(([slug, name, tone]) => ({ slug, name, tone, type: 'Mockups' }));
