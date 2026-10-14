import { create } from 'zustand';
import { getTemplateById } from '../data/templates/boxTemplates';

export const defaultLighting = { background: '#f7f6f9', intensity: 1, shadows: true };
export const defaultProjectName = 'Untitled packaging concept';

const STORAGE_KEY = 'packzen-projects';
const MAX_PROJECTS = 50;
const MAX_ARTWORK_SIZE = 5 * 1024 * 1024; // 5MB base64 limit per artwork

function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProjects(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.slice(-MAX_PROJECTS)));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      const trimmed = projects.slice(-Math.floor(MAX_PROJECTS / 2));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch {
        // Storage full, silently fail
      }
    }
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function base64ToBlob(base64) {
  const [header, data] = base64.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export const useEditorStore = create((set, get) => ({
  selectedTemplate: null,
  artworkByTemplate: {},
  materialByTemplate: {},
  objectSettingsByTemplate: {},
  lighting: defaultLighting,
  exportCanvas: null,
  projectName: defaultProjectName,
  savedProjects: [],

  setTemplate: (selectedTemplate) => set({ selectedTemplate }),
  setMaterial: (templateId, material) => set((state) => ({ materialByTemplate: { ...state.materialByTemplate, [templateId]: material } })),
  clearMaterial: (templateId) => set((state) => {
    const materialByTemplate = { ...state.materialByTemplate };
    delete materialByTemplate[templateId];
    return { materialByTemplate };
  }),
  updateObjectSettings: (templateId, partId, patch) => set((state) => ({
    objectSettingsByTemplate: {
      ...state.objectSettingsByTemplate,
      [templateId]: { ...state.objectSettingsByTemplate[templateId], [partId]: { ...state.objectSettingsByTemplate[templateId]?.[partId], ...patch } }
    }
  })),
  clearObjectSettings: (templateId, partId) => set((state) => {
    const templateSettings = { ...state.objectSettingsByTemplate[templateId] };
    delete templateSettings[partId];
    return { objectSettingsByTemplate: { ...state.objectSettingsByTemplate, [templateId]: templateSettings } };
  }),
  setLighting: (patch) => set((state) => ({ lighting: { ...state.lighting, ...patch } })),
  resetLighting: () => set({ lighting: defaultLighting }),
  setExportCanvas: (exportCanvas) => set({ exportCanvas }),
  setArtwork: (templateId, artwork) => set((state) => {
    const previous = state.artworkByTemplate[templateId];
    if (previous?.objectUrl && previous.src !== artwork.src) URL.revokeObjectURL(previous.src);
    return { artworkByTemplate: { ...state.artworkByTemplate, [templateId]: artwork } };
  }),
  updateArtwork: (templateId, patch) => set((state) => {
    const artwork = state.artworkByTemplate[templateId];
    if (!artwork) return state;
    return { artworkByTemplate: { ...state.artworkByTemplate, [templateId]: { ...artwork, ...patch } } };
  }),
  clearArtwork: (templateId) => set((state) => {
    const artwork = state.artworkByTemplate[templateId];
    if (artwork?.objectUrl) URL.revokeObjectURL(artwork.src);
    const artworkByTemplate = { ...state.artworkByTemplate };
    delete artworkByTemplate[templateId];
    return { artworkByTemplate };
  }),

  setProjectName: (name) => set({ projectName: name.trim() || defaultProjectName }),

  loadSavedProjects: () => {
    const projects = loadProjects();
    set({ savedProjects: projects });
  },

  saveProject: async () => {
    const { selectedTemplate, artworkByTemplate, materialByTemplate, objectSettingsByTemplate, lighting, projectName } = get();
    if (!selectedTemplate) return { success: false, error: 'No template selected' };

    const templateId = selectedTemplate.id;
    const artwork = artworkByTemplate[templateId] ?? null;

    let artworkData = null;
    if (artwork) {
      if (artwork.objectUrl) {
        try {
          const response = await fetch(artwork.src);
          const blob = await response.blob();
          if (blob.size > MAX_ARTWORK_SIZE) {
            return { success: false, error: 'Artwork too large to save (max 5MB). Please use a smaller image.' };
          }
          artworkData = await fileToBase64(blob);
        } catch {
          return { success: false, error: 'Failed to process artwork for saving.' };
        }
      } else if (artwork.src.startsWith('data:')) {
        if (artwork.src.length > MAX_ARTWORK_SIZE * 1.37) { // base64 overhead
          return { success: false, error: 'Artwork too large to save (max 5MB).' };
        }
        artworkData = artwork.src;
      }
    }

    const project = {
      id: crypto.randomUUID(),
      name: projectName.trim() || defaultProjectName,
      templateId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      artwork: artworkData ? { ...artwork, src: artworkData, objectUrl: false } : null,
      material: materialByTemplate[templateId] ?? null,
      objectSettings: objectSettingsByTemplate[templateId] ?? {},
      lighting: { ...lighting }
    };

    const projects = loadProjects();
    projects.push(project);
    saveProjects(projects);
    set({ savedProjects: projects });
    return { success: true, project };
  },

  loadProject: (projectId) => {
    const projects = loadProjects();
    const project = projects.find((p) => p.id === projectId);
    if (!project) return { success: false, error: 'Project not found' };

    const template = getTemplateById(project.templateId);
    if (!template) return { success: false, error: 'Template no longer available' };

    let artwork = null;
    if (project.artwork) {
      const blob = base64ToBlob(project.artwork.src);
      const objectUrl = URL.createObjectURL(blob);
      artwork = { ...project.artwork, src: objectUrl, objectUrl: true };
    }

    set({
      selectedTemplate: template,
      projectName: project.name,
      artworkByTemplate: artwork ? { [project.templateId]: artwork } : {},
      materialByTemplate: project.material ? { [project.templateId]: project.material } : {},
      objectSettingsByTemplate: project.objectSettings ? { [project.templateId]: project.objectSettings } : {},
      lighting: project.lighting ?? defaultLighting
    });

    return { success: true, project };
  },

  deleteProject: (projectId) => {
    const projects = loadProjects().filter((p) => p.id !== projectId);
    saveProjects(projects);
    set({ savedProjects: projects });
  },

  updateProject: async (projectId) => {
    const { selectedTemplate, artworkByTemplate, materialByTemplate, objectSettingsByTemplate, lighting, projectName } = get();
    if (!selectedTemplate) return { success: false, error: 'No template selected' };

    const templateId = selectedTemplate.id;
    const artwork = artworkByTemplate[templateId] ?? null;

    let artworkData = null;
    if (artwork) {
      if (artwork.objectUrl) {
        try {
          const response = await fetch(artwork.src);
          const blob = await response.blob();
          if (blob.size > MAX_ARTWORK_SIZE) {
            return { success: false, error: 'Artwork too large to save (max 5MB).' };
          }
          artworkData = await fileToBase64(blob);
        } catch {
          return { success: false, error: 'Failed to process artwork for saving.' };
        }
      } else if (artwork.src.startsWith('data:')) {
        if (artwork.src.length > MAX_ARTWORK_SIZE * 1.37) {
          return { success: false, error: 'Artwork too large to save (max 5MB).' };
        }
        artworkData = artwork.src;
      }
    }

    const projects = loadProjects();
    const index = projects.findIndex((p) => p.id === projectId);
    if (index === -1) return { success: false, error: 'Project not found' };

    projects[index] = {
      ...projects[index],
      name: projectName.trim() || defaultProjectName,
      templateId,
      updatedAt: Date.now(),
      artwork: artworkData ? { ...artwork, src: artworkData, objectUrl: false } : null,
      material: materialByTemplate[templateId] ?? null,
      objectSettings: objectSettingsByTemplate[templateId] ?? {},
      lighting: { ...lighting }
    };

    saveProjects(projects);
    set({ savedProjects: projects });
    return { success: true, project: projects[index] };
  },

  newProject: () => set({
    selectedTemplate: null,
    projectName: defaultProjectName,
    artworkByTemplate: {},
    materialByTemplate: {},
    objectSettingsByTemplate: {},
    lighting: defaultLighting
  })
}));
