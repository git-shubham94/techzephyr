import React, { useState, useEffect } from 'react';
import { getSkills, addSkill, deleteSkill } from '../services/skillService';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useAccessibility } from '../contexts/AccessibilityContext';
import './SkillsPage.css';

function SkillsPage() {
  const visibleSections = useScrollAnimation();
  const { speak, voiceEnabled } = useAccessibility();
  const [skills, setSkills] = useState({
    offering: [],
    seeking: []
  });
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    type: 'offering',
    proficiency: 3
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Auto-announce page load
  useEffect(() => {
    if (voiceEnabled) {
      speak('My Skills page. Manage the skills you can teach and want to learn');
    }
  }, [voiceEnabled]);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const data = await getSkills();
      setSkills(data);
      if (voiceEnabled) {
        const totalSkills = data.offering.length + data.seeking.length;
        speak(`You have ${totalSkills} skill${totalSkills !== 1 ? 's' : ''}. ${data.offering.length} you can teach, ${data.seeking.length} you want to learn`);
      }
    } catch (err) {
      setError(err || 'Failed to fetch skills');
    }
  };

  const handleChange = (e) => {
    setNewSkill({
      ...newSkill,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    
    if (!newSkill.skillName.trim()) {
      setError('Skill name is required');
      if (voiceEnabled) {
        speak('Skill name is required');
      }
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await addSkill(newSkill);
      const successMsg = 'Skill added successfully! 2 credits earned';
      setSuccess(`✅ ${successMsg}`);
      if (voiceEnabled) {
        speak(successMsg);
      }
      setNewSkill({
        skillName: '',
        type: 'offering',
        proficiency: 3
      });
      await fetchSkills();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err || 'Failed to add skill');
      if (voiceEnabled) {
        speak('Failed to add skill');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId, skillName) => {
    if (!window.confirm(`Are you sure you want to remove "${skillName}"?`)) {
      return;
    }

    setDeleteLoading(skillId);
    if (voiceEnabled) {
      speak(`Removing ${skillName}`);
    }
    try {
      await deleteSkill(skillId);
      if (voiceEnabled) {
        speak(`${skillName} removed successfully`);
      }
      await fetchSkills();
    } catch (err) {
      setError(err || 'Failed to delete skill');
      if (voiceEnabled) {
        speak('Failed to delete skill');
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  const getProficiencyLabel = (level) => {
    const labels = {
      1: 'Beginner',
      2: 'Basic',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };
    return labels[level] || 'Intermediate';
  };

  const getProficiencyStars = (level) => {
    return '⭐'.repeat(level);
  };

  const filteredSkills = () => {
    if (activeTab === 'all') {
      return [...skills.offering, ...skills.seeking];
    }
    return activeTab === 'offering' ? skills.offering : skills.seeking;
  };

  const handleVoiceHover = (text) => {
    if (voiceEnabled) {
      speak(text);
    }
  };

  const totalSkills = skills.offering.length + skills.seeking.length;

  return (
    <div className="skills-page">
      <div className="skills-header" data-section="header">
        <div 
          className={visibleSections.has('header') ? 'fade-in-left' : ''}
          onMouseEnter={() => handleVoiceHover('My Skills')}
        >
          <h1>My Skills</h1>
          <p 
            className="page-subtitle"
            onMouseEnter={() => handleVoiceHover('Manage the skills you can teach and want to learn')}
          >
            Manage the skills you can teach and want to learn
          </p>
        </div>
        <div className={`skills-stats ${visibleSections.has('header') ? 'scale-in delay-200' : ''}`}>
          <div 
            className="stat-badge teach"
            onMouseEnter={() => handleVoiceHover(`${skills.offering.length} skills you can teach`)}
          >
            <span className="stat-icon">🎓</span>
            <span className="stat-number">{skills.offering.length}</span>
            <span className="stat-label">Can Teach</span>
          </div>
          <div 
            className="stat-badge learn"
            onMouseEnter={() => handleVoiceHover(`${skills.seeking.length} skills you want to learn`)}
          >
            <span className="stat-icon">📚</span>
            <span className="stat-number">{skills.seeking.length}</span>
            <span className="stat-label">Want to Learn</span>
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
      {success && (
        <div 
          className="success-message fade-in"
          onMouseEnter={() => handleVoiceHover(success)}
        >
          {success}
        </div>
      )}

      <div className="add-skill-section" data-section="add-skill">
        <div 
          className={`add-skill-header ${visibleSections.has('add-skill') ? 'fade-in-left' : ''}`}
          onMouseEnter={() => handleVoiceHover('Add New Skill. Earn 2 credits for each skill you add')}
        >
          <h2>Add New Skill</h2>
          <p className="section-subtitle">Earn +2 credits for each skill you add!</p>
        </div>
        
        <form onSubmit={handleAddSkill} className={`add-skill-form ${visibleSections.has('add-skill') ? 'fade-in-up delay-200' : ''}`}>
          <div className="form-grid">
            <div className="form-group skill-input-group">
              <label htmlFor="skillName">
                <span className="label-icon">💡</span>
                Skill Name
              </label>
              <input
                type="text"
                id="skillName"
                name="skillName"
                value={newSkill.skillName}
                onChange={handleChange}
                onFocus={() => speak('Skill name input field')}
                onMouseEnter={() => handleVoiceHover('Enter skill name. For example: React, Guitar, or Spanish')}
                placeholder="e.g., React, Guitar, Spanish"
                disabled={loading}
                required
                className="skill-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="type">
                <span className="label-icon">🎯</span>
                Type
              </label>
              <select
                id="type"
                name="type"
                value={newSkill.type}
                onChange={handleChange}
                onFocus={() => speak('Skill type dropdown')}
                onMouseEnter={() => handleVoiceHover('Select if you can teach or want to learn this skill')}
                disabled={loading}
                className="skill-select"
              >
                <option value="offering">🎓 I Can Teach</option>
                <option value="seeking">📚 I Want to Learn</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="proficiency">
                <span className="label-icon">⭐</span>
                Proficiency Level
              </label>
              <select
                id="proficiency"
                name="proficiency"
                value={newSkill.proficiency}
                onChange={handleChange}
                onFocus={() => speak('Proficiency level dropdown')}
                onMouseEnter={() => handleVoiceHover('Select your skill proficiency level')}
                disabled={loading}
                className="skill-select"
              >
                <option value="1">⭐ Beginner</option>
                <option value="2">⭐⭐ Basic</option>
                <option value="3">⭐⭐⭐ Intermediate</option>
                <option value="4">⭐⭐⭐⭐ Advanced</option>
                <option value="5">⭐⭐⭐⭐⭐ Expert</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary hover-scale add-skill-btn" 
              disabled={loading}
              onMouseEnter={() => handleVoiceHover('Add skill button')}
            >
              {loading ? (
                <>
                  <span className="spinner-small rotate"></span>
                  Adding...
                </>
              ) : (
                <>
                  <span className="btn-icon">➕</span>
                  Add Skill
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {totalSkills === 0 ? (
        <div 
          className="empty-state fade-in"
          onMouseEnter={() => handleVoiceHover('No skills added yet. Start building your skill profile')}
        >
          <div className="empty-icon">🎯</div>
          <h3>No Skills Added Yet</h3>
          <p>Start building your skill profile by adding your first skill above!</p>
        </div>
      ) : (
        <>
          <div className={`filter-tabs ${visibleSections.has('add-skill') ? 'fade-in-up delay-300' : ''}`}>
            <button
              className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('all');
                speak('Showing all skills');
              }}
              onMouseEnter={() => handleVoiceHover(`All skills. ${totalSkills} total`)}
            >
              <span className="tab-icon">📋</span>
              <span className="tab-label">All Skills</span>
              <span className="tab-count">{totalSkills}</span>
            </button>
            <button
              className={`filter-tab ${activeTab === 'offering' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('offering');
                speak('Showing skills you can teach');
              }}
              onMouseEnter={() => handleVoiceHover(`Can teach. ${skills.offering.length} skills`)}
            >
              <span className="tab-icon">🎓</span>
              <span className="tab-label">Can Teach</span>
              <span className="tab-count">{skills.offering.length}</span>
            </button>
            <button
              className={`filter-tab ${activeTab === 'seeking' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('seeking');
                speak('Showing skills you want to learn');
              }}
              onMouseEnter={() => handleVoiceHover(`Want to learn. ${skills.seeking.length} skills`)}
            >
              <span className="tab-icon">📚</span>
              <span className="tab-label">Want to Learn</span>
              <span className="tab-count">{skills.seeking.length}</span>
            </button>
          </div>

          <div className="skills-grid" data-section="skills">
            {filteredSkills().map((skill, index) => (
              <div
                key={skill.id}
                className={`skill-card ${skill.type} hover-lift ${visibleSections.has('skills') ? 'fade-in-up' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onMouseEnter={() => handleVoiceHover(
                  `${skill.skillName}. ${skill.type === 'offering' ? 'Teaching' : 'Learning'}. Proficiency: ${getProficiencyLabel(skill.proficiency)}`
                )}
              >
                <div className="skill-card-header">
                  <div className="skill-icon-wrapper">
                    <span className="skill-icon">
                      {skill.type === 'offering' ? '🎓' : '📚'}
                    </span>
                  </div>
                  <div className="skill-type-badge">
                    {skill.type === 'offering' ? 'Teaching' : 'Learning'}
                  </div>
                </div>

                <div className="skill-card-body">
                  <h3 className="skill-name">{skill.skillName}</h3>
                  
                  <div className="skill-proficiency">
                    <div className="proficiency-stars">
                      {getProficiencyStars(skill.proficiency)}
                    </div>
                    <span className="proficiency-label">
                      {getProficiencyLabel(skill.proficiency)}
                    </span>
                  </div>
                </div>

                <div className="skill-card-footer">
                  <button
                    onClick={() => handleDeleteSkill(skill.id, skill.skillName)}
                    disabled={deleteLoading === skill.id}
                    className="delete-btn hover-scale"
                    title="Remove skill"
                    onMouseEnter={() => handleVoiceHover(`Remove ${skill.skillName}`)}
                  >
                    {deleteLoading === skill.id ? (
                      <span className="spinner-small rotate"></span>
                    ) : (
                      <>
                        <span className="delete-icon">🗑️</span>
                        <span className="delete-text">Remove</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SkillsPage;
