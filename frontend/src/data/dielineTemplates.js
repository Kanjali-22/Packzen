const dimensions = (length, width, height) => ({ length, width, height, unit: 'mm' });

// Only the style IDs implemented by dielineGeometry.js are used here. A card
// may describe a broader packaging family, but its editor mapping is explicit.
export const dielineTemplates = [
  { id: 'fefco-0201-rsc', code: 'FEFCO 0201', title: 'Regular Slotted Carton', category: 'FEFCO Boxes', description: 'Four-flap corrugated shipping carton for dependable fulfilment.', styleId: 'shipping-box', dimensions: dimensions(300, 200, 150), previewTone: 'violet' },
  { id: 'reverse-tuck-end', title: 'Reverse Tuck End Box', category: 'Tuck End Boxes', description: 'Retail carton with opposing tuck closures.', styleId: 'folding-carton', dimensions: dimensions(120, 80, 40), previewTone: 'blue', illustrative: true },
  { id: 'straight-tuck-end', title: 'Straight Tuck End Box', category: 'Tuck End Boxes', description: 'A compact folding carton with aligned tuck closures.', styleId: 'folding-carton', dimensions: dimensions(140, 70, 45), previewTone: 'green', illustrative: true },
  { id: 'mailer-box', title: 'Mailer Box', category: 'Mailer Boxes', description: 'Self-locking mailer for subscription and e-commerce shipments.', styleId: 'mailer-box', dimensions: dimensions(300, 200, 100), previewTone: 'orange' },
  { id: 'rollover-hinged-mailer', title: 'Rollover Hinged Lid Mailer', category: 'Mailer Boxes', description: 'A hinged presentation mailer with protective side walls.', styleId: 'mailer-box', dimensions: dimensions(260, 180, 70), previewTone: 'purple', illustrative: true },
  { id: 'tuck-end-mailer', title: 'Tuck End Mailer Box', category: 'Mailer Boxes', description: 'A compact mailer profile for smaller products.', styleId: 'mailer-box', dimensions: dimensions(220, 150, 60), previewTone: 'teal', illustrative: true },
  { id: 'folding-carton', title: 'Folding Carton', category: 'Folding Boxes', description: 'Versatile retail packaging with a glue flap and tuck panels.', styleId: 'folding-carton', dimensions: dimensions(160, 90, 55), previewTone: 'pink' },
  { id: 'tray-box', title: 'Tray Box', category: 'Tray Boxes', description: 'Low-profile open tray for sets, food, and presentation kits.', styleId: 'custom-box', dimensions: dimensions(240, 160, 45), previewTone: 'yellow', illustrative: true },
  { id: 'display-box', title: 'Display Box', category: 'Display Boxes', description: 'Counter-ready packaging with a structured front presentation.', styleId: 'custom-box', dimensions: dimensions(180, 120, 120), previewTone: 'red', illustrative: true },
  { id: 'flip-top-gift-box', title: 'Flip-Top Magnetic Gift Box', category: 'Rigid Boxes', description: 'Premium hinged gift-box concept for high-value products.', styleId: 'mailer-box', dimensions: dimensions(280, 200, 85), previewTone: 'navy', illustrative: true },
  { id: 'full-telescope-box', title: 'Full Telescope Box', category: 'Boxes with Lid', description: 'Two-piece lid-and-base presentation box concept.', styleId: 'custom-box', dimensions: dimensions(260, 190, 90), previewTone: 'brown', illustrative: true },
  { id: 'carrying-handle-box', title: 'Carrying Handle Box', category: 'Display Boxes', description: 'Retail-ready pack concept with a portable handle profile.', styleId: 'folding-carton', dimensions: dimensions(200, 120, 130), previewTone: 'sky', illustrative: true },
];

export const dielineCategories = [
  'All', 'FEFCO Boxes', 'Folding Boxes', 'Tray Boxes', 'Display Boxes',
  'Tuck End Boxes', 'Mailer Boxes', 'Box Inserts', 'Paper Bags', 'Rigid Boxes',
  'Window Boxes', 'Boxes with Lid', 'Storage Boxes', 'Sleeves', 'Envelopes',
];

export function getDielineTemplate(id) {
  return dielineTemplates.find((template) => template.id === id) ?? null;
}
