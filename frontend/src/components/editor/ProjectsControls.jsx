import { useState, useEffect } from 'react';
import { Plus, Save, FolderOpen, Trash2, X } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import './projectsControls.css';

export default function ProjectsControls() {
  const {
    projectName,
    setProjectName,
    savedProjects,
    loadSavedProjects,
    saveProject,
    loadProject,
    deleteProject,
    updateProject,
    newProject,
    selectedTemplate
  } = useEditorStore();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveAsNew, setSaveAsNew] = useState(true);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editName, setEditName] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    loadSavedProjects();
  }, [loadSavedProjects]);

  const handleSaveClick = () => {
    if (!selectedTemplate) {
      setSaveError('Select a template before saving.');
      return;
    }
    setSaveAsNew(true);
    setEditName(projectName);
    setShowSaveDialog(true);
    setSaveError('');
    setSaveSuccess('');
  };

  const handleSaveAsNew = async () => {
    setSaveError('');
    const result = await saveProject();
    if (result.success) {
      setSaveSuccess('Project saved.');
      setShowSaveDialog(false);
    } else {
      setSaveError(result.error);
    }
  };

  const handleUpdateProject = async (projectId) => {
    setSaveError('');
    const result = await updateProject(projectId);
    if (result.success) {
      setSaveSuccess('Project updated.');
      setShowSaveDialog(false);
      setEditingProjectId(null);
    } else {
      setSaveError(result.error);
    }
  };

  const handleSaveDialogSubmit = () => {
    if (saveAsNew) {
      handleSaveAsNew();
    } else if (editingProjectId) {
      handleUpdateProject(editingProjectId);
    }
  };

  const handleLoadProject = (projectId) => {
    const result = loadProject(projectId);
    if (!result.success) {
      setSaveError(result.error);
    } else {
      setSaveSuccess('Project loaded.');
      setShowSaveDialog(false);
    }
  };

  const handleDeleteProject = (projectId, event) => {
    event.stopPropagation();
    if (window.confirm('Delete this project? This cannot be undone.')) {
      deleteProject(projectId);
    }
  };

  const handleNewProject = () => {
    if (window.confirm('Start a new project? Unsaved changes will be lost.')) {
      newProject();
      setShowSaveDialog(false);
      setEditingProjectId(null);
    }
  };

  const handleEditProject = (project, event) => {
    event.stopPropagation();
    setEditingProjectId(project.id);
    setSaveAsNew(false);
    setEditName(project.name);
    setShowSaveDialog(true);
    setSaveError('');
    setSaveSuccess('');
  };

  const handleNameChange = (event) => {
    const name = event.target.value;
    setEditName(name);
    setProjectName(name);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSaveDialogSubmit();
    }
  };

  return (
    <div className="projects-controls">
      <div className="projects-controls__header">
        <b>Projects</b>
        <p>Save, load, and manage packaging projects.</p>
      </div>

      <div className="projects-controls__current">
        <label className="projects-controls__name">
          Project name
          <input
            type="text"
            value={projectName}
            onChange={handleNameChange}
            placeholder="Untitled packaging concept"
            maxLength={80}
          />
        </label>
        <div className="projects-controls__actions">
          <button className="projects-controls__new" type="button" onClick={handleNewProject} title="New project">
            <Plus size={14} />
          </button>
          <button className="projects-controls__save" type="button" onClick={handleSaveClick} disabled={!selectedTemplate}>
            <Save size={14} />Save
          </button>
        </div>
      </div>

      {savedProjects.length > 0 && (
        <div className="projects-controls__list">
          <b>Saved projects</b>
          {savedProjects
            .slice()
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((project) => {
              const isCurrent = selectedTemplate?.id === project.templateId && projectName === project.name;
              const templateNames = {
                'bottle-plastic-500ml': 'Bottle',
                'mailer-box-standard': 'Mailer',
                'product-box-square': 'Carton',
                'aluminum-can-330ml': 'Can',
                'stand-up-pouch': 'Pouch',
                'cosmetic-jar': 'Jar'
              };
              const templateLabel = templateNames[project.templateId] ?? project.templateId;
              const date = new Date(project.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={project.id}
                  className={`projects-controls__item ${isCurrent ? 'is-current' : ''} ${editingProjectId === project.id ? 'is-editing' : ''}`}
                  onClick={() => editingProjectId === project.id ? null : handleLoadProject(project.id)}
                >
                  <div className="projects-controls__item-main">
                    <strong>{project.name}</strong>
                    <span className="projects-controls__meta">
                      <span className="projects-controls__template">{templateLabel}</span>
                      <span className="projects-controls__date">{date}</span>
                    </span>
                  </div>
                  <div className="projects-controls__item-actions">
                    <button type="button" className="projects-controls__edit" onClick={(e) => handleEditProject(project, e)} title="Rename / Update">
                      <FolderOpen size={13} />
                    </button>
                    <button type="button" className="projects-controls__delete" onClick={(e) => handleDeleteProject(project.id, e)} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {savedProjects.length === 0 && (
        <p className="projects-controls__empty">No saved projects yet. Create a design and click Save.</p>
      )}

      {showSaveDialog && (
        <div className="projects-controls__dialog-overlay" onClick={() => { setShowSaveDialog(false); setEditingProjectId(null); }}>
          <div className="projects-controls__dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{saveAsNew ? 'Save Project' : 'Update Project'}</h3>
            <label>
              Project name
              <input
                type="text"
                value={editName}
                onChange={(e) => { setEditName(e.target.value); setProjectName(e.target.value); }}
                onKeyDown={handleInputKeyDown}
                maxLength={80}
                autoFocus
              />
            </label>
            {saveError && <p className="projects-controls__error">{saveError}</p>}
            {saveSuccess && <p className="projects-controls__success">{saveSuccess}</p>}
            <div className="projects-controls__dialog-actions">
              <button type="button" onClick={() => { setShowSaveDialog(false); setEditingProjectId(null); }}>
                <X size={14} />Cancel
              </button>
              <button type="button" className="projects-controls__confirm" onClick={handleSaveDialogSubmit}>
                {saveAsNew ? 'Save' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}