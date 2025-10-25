import React, { useState, useEffect } from 'react';
import { getProjects, createProject, joinProject } from '../services/projectService';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useAccessibility } from '../contexts/AccessibilityContext';
import './ProjectsPage.css';

function ProjectsPage() {
  const visibleSections = useScrollAnimation();
  const { speak, voiceEnabled } = useAccessibility();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joinLoading, setJoinLoading] = useState(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    skills: '',
    location: ''
  });

  // Auto-announce page load
  useEffect(() => {
    if (voiceEnabled) {
      speak('Collaborative Projects page. Join or create exciting projects');
    }
  }, [voiceEnabled]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
      if (voiceEnabled) {
        speak(`${data.length} active project${data.length !== 1 ? 's' : ''} available`);
      }
    } catch (err) {
      setError(err || 'Failed to fetch projects');
      if (voiceEnabled) {
        speak('Failed to load projects');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setNewProject({
      ...newProject,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const projectData = {
        ...newProject,
        skills: newProject.skills.split(',').map(s => s.trim()).filter(Boolean)
      };

      await createProject(projectData);
      if (voiceEnabled) {
        speak('Project created successfully');
      }
      setNewProject({ title: '', description: '', skills: '', location: '' });
      setShowCreateForm(false);
      await fetchProjects();
    } catch (err) {
      setError(err || 'Failed to create project');
      if (voiceEnabled) {
        speak('Failed to create project');
      }
    }
  };

  const handleJoinProject = async (projectId) => {
    setJoinLoading(projectId);
    try {
      await joinProject(projectId);
      await fetchProjects();
      if (voiceEnabled) {
        speak('Successfully joined project');
      }
      alert('Successfully joined project! 🎉');
    } catch (err) {
      setError(err || 'Failed to join project');
      if (voiceEnabled) {
        speak('Failed to join project');
      }
    } finally {
      setJoinLoading(null);
    }
  };

  const handleVoiceHover = (text) => {
    if (voiceEnabled) {
      speak(text);
    }
  };

  if (loading) {
    return (
      <div className="projects-page">
        <div className="loading-state fade-in">
          <div className="spinner rotate"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="projects-header" data-section="header">
        <div 
          className={visibleSections.has('header') ? 'fade-in-left' : ''}
          onMouseEnter={() => handleVoiceHover('Collaborative Projects')}
        >
          <h1>Collaborative Projects</h1>
          <p 
            className="page-subtitle"
            onMouseEnter={() => handleVoiceHover('Join or create exciting projects with skilled people')}
          >
            Join or create exciting projects with skilled people
          </p>
        </div>
        <div 
          className={`projects-stats ${visibleSections.has('header') ? 'scale-in delay-200' : ''}`}
          onMouseEnter={() => handleVoiceHover(`${projects.length} active projects`)}
        >
          <div className="stat-badge">
            <span className="stat-icon">🚀</span>
            <span className="stat-number">{projects.length}</span>
            <span className="stat-label">Active Projects</span>
          </div>
        </div>
      </div>

      {error && (
        <div 
          className="error-message fade-in"
          onMouseEnter={() => handleVoiceHover(error)}
        >
          {error}
        </div>
      )}

      <div className={`create-project-section ${visibleSections.has('header') ? 'fade-in-up delay-300' : ''}`}>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            speak(showCreateForm ? 'Closing create project form' : 'Opening create project form');
          }}
          onMouseEnter={() => handleVoiceHover(showCreateForm ? 'Cancel button' : 'Create new project button')}
          className={`btn btn-primary hover-scale create-toggle-btn ${showCreateForm ? 'active' : ''}`}
        >
          {showCreateForm ? (
            <>
              <span className="btn-icon">✕</span>
              Cancel
            </>
          ) : (
            <>
              <span className="btn-icon">➕</span>
              Create New Project
            </>
          )}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form-container slide-in-down">
          <div 
            className="form-header"
            onMouseEnter={() => handleVoiceHover('Create new project form')}
          >
            <h2>Create New Project</h2>
            <p className="form-subtitle">Start a collaborative project and find team members</p>
          </div>
          
          <form onSubmit={handleCreateProject} className="create-form">
            <div className="form-group">
              <label htmlFor="title">
                <span className="label-icon">📝</span>
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newProject.title}
                onChange={handleChange}
                onFocus={() => speak('Project title input field')}
                onMouseEnter={() => handleVoiceHover('Enter project title')}
                placeholder="e.g., Build a Weather App, Learn Spanish Together"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                <span className="label-icon">📄</span>
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={newProject.description}
                onChange={handleChange}
                onFocus={() => speak('Project description text area')}
                onMouseEnter={() => handleVoiceHover('Describe your project goals and what you are looking for')}
                rows="5"
                placeholder="Describe your project, goals, and what you're looking for..."
                required
                className="form-textarea"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="skills">
                  <span className="label-icon">🎯</span>
                  Required Skills
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={newProject.skills}
                  onChange={handleChange}
                  onFocus={() => speak('Required skills input field')}
                  onMouseEnter={() => handleVoiceHover('Enter required skills separated by commas')}
                  placeholder="e.g., React, Node.js, UI Design"
                  className="form-input"
                />
                <small>Separate skills with commas</small>
              </div>

              <div className="form-group">
                <label htmlFor="location">
                  <span className="label-icon">📍</span>
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newProject.location}
                  onChange={handleChange}
                  onFocus={() => speak('Location input field')}
                  onMouseEnter={() => handleVoiceHover('Enter project location or select remote')}
                  placeholder="Remote, New York, etc."
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary hover-scale"
                onMouseEnter={() => handleVoiceHover('Create project button')}
              >
                <span className="btn-icon">🚀</span>
                Create Project
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  speak('Closing create project form');
                }}
                onMouseEnter={() => handleVoiceHover('Cancel button')}
                className="btn btn-secondary hover-scale"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="projects-grid" data-section="projects">
        {projects.length === 0 ? (
          <div 
            className="empty-state fade-in"
            onMouseEnter={() => handleVoiceHover('No projects yet. Be the first to create a collaborative project')}
          >
            <div className="empty-icon">📁</div>
            <h3>No Projects Yet</h3>
            <p>Be the first to create a collaborative project!</p>
            <button
              onClick={() => {
                setShowCreateForm(true);
                speak('Opening create project form');
              }}
              onMouseEnter={() => handleVoiceHover('Create first project button')}
              className="btn btn-primary btn-lg hover-scale"
            >
              <span className="btn-icon">➕</span>
              Create First Project
            </button>
          </div>
        ) : (
          projects.map((project, index) => (
            <div
              key={project.id}
              className={`project-card hover-lift ${visibleSections.has('projects') ? 'fade-in-up' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => handleVoiceHover(
                `${project.title}. ${project.description}. Created by ${project.creatorName}. ${project.members?.length || 0} members`
              )}
            >
              <div className="project-card-header">
                <div 
                  className="project-status-badge"
                  onMouseEnter={() => handleVoiceHover(`Project status: ${project.status || 'Active'}`)}
                >
                  <span className="status-icon">🟢</span>
                  <span className="status-text">{project.status || 'Active'}</span>
                </div>
                <div 
                  className="member-count-badge"
                  onMouseEnter={() => handleVoiceHover(`${project.members?.length || 0} members`)}
                >
                  <span className="member-icon">👥</span>
                  <span className="member-count">{project.members?.length || 0}</span>
                </div>
              </div>

              <div className="project-card-body">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>

                {project.skills && project.skills.length > 0 && (
                  <div 
                    className="project-skills"
                    onMouseEnter={() => handleVoiceHover(`Required skills: ${project.skills.join(', ')}`)}
                  >
                    <span className="skills-label">Required Skills:</span>
                    <div className="skills-list">
                      {project.skills.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="skill-tag"
                          onMouseEnter={() => handleVoiceHover(skill)}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="project-meta">
                  <div 
                    className="meta-item"
                    onMouseEnter={() => handleVoiceHover(`Created by ${project.creatorName}`)}
                  >
                    <span className="meta-icon">👤</span>
                    <span className="meta-text">Created by <strong>{project.creatorName}</strong></span>
                  </div>
                  {project.location && (
                    <div 
                      className="meta-item"
                      onMouseEnter={() => handleVoiceHover(`Location: ${project.location}`)}
                    >
                      <span className="meta-icon">📍</span>
                      <span className="meta-text">{project.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="project-card-footer">
                <button
                  onClick={() => handleJoinProject(project.id)}
                  disabled={joinLoading === project.id}
                  onMouseEnter={() => handleVoiceHover(`Join ${project.title}`)}
                  className="btn btn-primary btn-join hover-scale"
                >
                  {joinLoading === project.id ? (
                    <>
                      <span className="spinner-small rotate"></span>
                      Joining...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">🤝</span>
                      Join Project
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProjectsPage;
