import React, { useState } from 'react';
import './AIDescriptionGenerator.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AIDescriptionGenerator = ({ onClose }) => {
  const [formData, setFormData] = useState({
    project_title: '',
    project_type: 'photography',
    brief: '',
    tone: 'professional'
  });
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = async () => {
    if (!formData.project_title.trim()) {
      setError('Judul project wajib diisi');
      return;
    }

    setIsGenerating(true);
    setGeneratedText('');
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/ai/generate-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate description');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            } else if (data.startsWith('[ERROR:')) {
              setError(data);
              break;
            } else {
              fullText += data;
              setGeneratedText(fullText);
            }
          }
        }
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    alert('Deskripsi berhasil disalin!');
  };

  const handleReset = () => {
    setFormData({
      project_title: '',
      project_type: 'photography',
      brief: '',
      tone: 'professional'
    });
    setGeneratedText('');
    setError('');
  };

  return (
    <div className="ai-generator-overlay">
      <div className="ai-generator-modal">
        <div className="ai-generator-header">
          <h2>✨ AI Description Generator</h2>
          <button className="ai-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="ai-generator-content">
          {/* Input Form */}
          <div className="ai-form-section">
            <div className="ai-form-group">
              <label>Judul Project *</label>
              <input
                type="text"
                name="project_title"
                value={formData.project_title}
                onChange={handleInputChange}
                placeholder="Contoh: Urban Dreams, Bayangan Senja"
                disabled={isGenerating}
              />
            </div>

            <div className="ai-form-group">
              <label>Tipe Project</label>
              <select
                name="project_type"
                value={formData.project_type}
                onChange={handleInputChange}
                disabled={isGenerating}
              >
                <option value="photography">Photography</option>
                <option value="writing">Writing / Novel</option>
              </select>
            </div>

            <div className="ai-form-group">
              <label>Brief / Konteks (Opsional)</label>
              <textarea
                name="brief"
                value={formData.brief}
                onChange={handleInputChange}
                placeholder="Berikan konteks tambahan tentang project ini..."
                rows="3"
                disabled={isGenerating}
              />
            </div>

            <div className="ai-form-group">
              <label>Tone</label>
              <div className="ai-tone-options">
                <label className="ai-radio-label">
                  <input
                    type="radio"
                    name="tone"
                    value="professional"
                    checked={formData.tone === 'professional'}
                    onChange={handleInputChange}
                    disabled={isGenerating}
                  />
                  <span>Professional</span>
                </label>
                <label className="ai-radio-label">
                  <input
                    type="radio"
                    name="tone"
                    value="creative"
                    checked={formData.tone === 'creative'}
                    onChange={handleInputChange}
                    disabled={isGenerating}
                  />
                  <span>Creative</span>
                </label>
                <label className="ai-radio-label">
                  <input
                    type="radio"
                    name="tone"
                    value="casual"
                    checked={formData.tone === 'casual'}
                    onChange={handleInputChange}
                    disabled={isGenerating}
                  />
                  <span>Casual</span>
                </label>
              </div>
            </div>

            <div className="ai-form-actions">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="ai-generate-btn"
              >
                {isGenerating ? (
                  <>
                    <span className="ai-spinner"></span>
                    Generating...
                  </>
                ) : (
                  '✨ Generate Description'
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={isGenerating}
                className="ai-reset-btn"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="ai-output-section">
            <div className="ai-output-header">
              <label>Generated Description</label>
              {generatedText && (
                <button onClick={handleCopy} className="ai-copy-btn">
                  📋 Copy
                </button>
              )}
            </div>
            <div className="ai-output-box">
              {error ? (
                <div className="ai-error">{error}</div>
              ) : generatedText ? (
                <p className="ai-generated-text">{generatedText}</p>
              ) : (
                <p className="ai-placeholder">
                  {isGenerating 
                    ? 'AI sedang menulis deskripsi Anda...' 
                    : 'Deskripsi hasil generate akan muncul di sini'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="ai-generator-footer">
          <span className="ai-footer-note">
            Powered by GPT 6 Sol via Emergent Universal Key
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIDescriptionGenerator;
