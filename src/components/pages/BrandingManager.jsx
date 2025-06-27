import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { HexColorPicker } from 'react-colorful';
import Prism from 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism.css';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import brandingService from '@/services/api/brandingService';

function BrandingManager() {
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('logo');
  const [showColorPicker, setShowColorPicker] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    logo: null,
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Inter',
    fontSize: '16',
    headerHeight: '64',
    sidebarWidth: '256',
    borderRadius: '8',
    customCSS: '',
    isActive: false
  });

  const tabs = [
    { id: 'logo', label: 'Logo & Identity', icon: 'Image' },
    { id: 'colors', label: 'Colors', icon: 'Palette' },
    { id: 'typography', label: 'Typography', icon: 'Type' },
    { id: 'layout', label: 'Layout', icon: 'Layout' },
    { id: 'css', label: 'Custom CSS', icon: 'Code' }
  ];

  const colorPresets = [
    { name: 'Blue', primary: '#3b82f6', secondary: '#1e40af', accent: '#f59e0b' },
    { name: 'Green', primary: '#10b981', secondary: '#047857', accent: '#f59e0b' },
    { name: 'Purple', primary: '#8b5cf6', secondary: '#6d28d9', accent: '#f59e0b' },
    { name: 'Red', primary: '#ef4444', secondary: '#dc2626', accent: '#f59e0b' },
    { name: 'Gray', primary: '#6b7280', secondary: '#374151', accent: '#f59e0b' }
  ];

  const fontOptions = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro',
    'Poppins', 'Nunito', 'Raleway', 'Work Sans'
  ];

  useEffect(() => {
    loadBranding();
  }, []);

  useEffect(() => {
    if (formData.customCSS && activeTab === 'css') {
      setTimeout(() => {
        Prism.highlightAll();
      }, 100);
    }
  }, [formData.customCSS, activeTab]);

  const loadBranding = async () => {
    try {
      setLoading(true);
      const active = await brandingService.getActive();
      
      if (active) {
        setBranding(active);
        setFormData(active);
      } else {
        // Create default branding if none exists
        const defaultBranding = await brandingService.create({
          name: 'Default Theme',
          ...formData,
          isActive: true
        });
        setBranding(defaultBranding);
        setFormData(defaultBranding);
      }
    } catch (error) {
      console.error('Error loading branding:', error);
      toast.error('Failed to load branding configuration');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          logo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.gif']
    },
    multiple: false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleColorChange = (field, color) => {
    setFormData(prev => ({
      ...prev,
      [field]: color
    }));
  };

  const applyColorPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    }));
    toast.success(`Applied ${preset.name} color preset`);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (branding) {
        await brandingService.update(branding.Id, formData);
        toast.success('Branding updated successfully');
      } else {
        const created = await brandingService.create({ ...formData, isActive: true });
        setBranding(created);
        toast.success('Branding created successfully');
      }
      
      loadBranding(); // Reload to get updated data
    } catch (error) {
      console.error('Error saving branding:', error);
      toast.error('Failed to save branding configuration');
    } finally {
      setSaving(false);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo: null
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-200 rounded w-1/4"></div>
          <div className="h-64 bg-surface-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-surface-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Branding Manager</h1>
            <p className="text-surface-600 mt-1">Customize your application's appearance and branding</p>
          </div>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Tabs Sidebar */}
        <div className="w-64 border-r border-surface-200 bg-surface-50">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                  ${activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-surface-700 hover:bg-surface-100'
                  }
                `}
              >
                <ApperIcon name={tab.icon} size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Panel */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'logo' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-4">Logo & Identity</h3>
                  
                  <div className="space-y-4">
                    <Input
                      label="Brand Name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter brand name"
                    />

                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Logo Upload
                      </label>
                      
                      {formData.logo ? (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <img
                              src={formData.logo}
                              alt="Brand Logo"
                              className="h-20 object-contain border border-surface-200 rounded-lg p-2"
                            />
                            <button
                              onClick={removeLogo}
                              className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1 hover:bg-error-dark transition-colors"
                            >
                              <ApperIcon name="X" size={14} />
                            </button>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => setFormData(prev => ({ ...prev, logo: null }))}
                          >
                            Change Logo
                          </Button>
                        </div>
                      ) : (
                        <div
                          {...getRootProps()}
                          className={`
                            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                            ${isDragActive
                              ? 'border-primary bg-primary/5'
                              : 'border-surface-300 hover:border-surface-400'
                            }
                          `}
                        >
                          <input {...getInputProps()} />
                          <ApperIcon name="Upload" size={32} className="mx-auto text-surface-400 mb-4" />
                          {isDragActive ? (
                            <p className="text-primary font-medium">Drop your logo here...</p>
                          ) : (
                            <>
                              <p className="text-surface-600 font-medium mb-2">
                                Drag & drop your logo here, or click to select
                              </p>
                              <p className="text-sm text-surface-500">
                                PNG, JPG, SVG up to 5MB
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'colors' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-4">Color Scheme</h3>
                  
                  <div className="space-y-6">
                    {/* Color Presets */}
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-3">
                        Quick Presets
                      </label>
                      <div className="grid grid-cols-5 gap-3">
                        {colorPresets.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => applyColorPreset(preset)}
                            className="flex flex-col items-center p-3 border border-surface-200 rounded-lg hover:border-surface-300 transition-colors"
                          >
                            <div className="flex gap-1 mb-2">
                              <div
                                className="w-4 h-4 rounded-full border border-surface-200"
                                style={{ backgroundColor: preset.primary }}
                              />
                              <div
                                className="w-4 h-4 rounded-full border border-surface-200"
                                style={{ backgroundColor: preset.secondary }}
                              />
                              <div
                                className="w-4 h-4 rounded-full border border-surface-200"
                                style={{ backgroundColor: preset.accent }}
                              />
                            </div>
                            <span className="text-xs font-medium text-surface-700">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Colors */}
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { key: 'primaryColor', label: 'Primary Color' },
                        { key: 'secondaryColor', label: 'Secondary Color' },
                        { key: 'accentColor', label: 'Accent Color' },
                        { key: 'backgroundColor', label: 'Background Color' },
                        { key: 'textColor', label: 'Text Color' }
                      ].map(({ key, label }) => (
                        <div key={key} className="space-y-2">
                          <label className="block text-sm font-medium text-surface-700">
                            {label}
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setShowColorPicker(showColorPicker === key ? null : key)}
                              className="w-10 h-10 rounded-lg border-2 border-surface-200 hover:border-surface-300 transition-colors"
                              style={{ backgroundColor: formData[key] }}
                            />
                            <Input
                              value={formData[key]}
                              onChange={(e) => handleColorChange(key, e.target.value)}
                              className="flex-1"
                            />
                          </div>
                          {showColorPicker === key && (
                            <div className="absolute z-10 mt-2">
                              <div
                                className="fixed inset-0"
                                onClick={() => setShowColorPicker(null)}
                              />
                              <div className="bg-white border border-surface-200 rounded-lg p-3 shadow-lg">
                                <HexColorPicker
                                  color={formData[key]}
                                  onChange={(color) => handleColorChange(key, color)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'typography' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-4">Typography</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Font Family
                      </label>
                      <select
                        value={formData.fontFamily}
                        onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                        className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {fontOptions.map((font) => (
                          <option key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Base Font Size (px)"
                      type="number"
                      min="12"
                      max="24"
                      value={formData.fontSize}
                      onChange={(e) => handleInputChange('fontSize', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-4">Layout Settings</h3>
                  
                  <div className="space-y-4">
                    <Input
                      label="Header Height (px)"
                      type="number"
                      min="48"
                      max="120"
                      value={formData.headerHeight}
                      onChange={(e) => handleInputChange('headerHeight', e.target.value)}
                    />

                    <Input
                      label="Sidebar Width (px)"
                      type="number"
                      min="200"
                      max="400"
                      value={formData.sidebarWidth}
                      onChange={(e) => handleInputChange('sidebarWidth', e.target.value)}
                    />

                    <Input
                      label="Border Radius (px)"
                      type="number"
                      min="0"
                      max="24"
                      value={formData.borderRadius}
                      onChange={(e) => handleInputChange('borderRadius', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'css' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-4">Custom CSS</h3>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-surface-700">
                      Additional CSS Rules
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.customCSS}
                        onChange={(e) => handleInputChange('customCSS', e.target.value)}
                        placeholder="/* Add your custom CSS here */
.custom-button {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border: none;
  border-radius: 8px;
}

.custom-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.custom-card:hover {
  transform: translateY(-2px);
}"
                        className="w-full h-64 p-4 font-mono text-sm border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      />
                      {formData.customCSS && (
                        <div className="mt-4 p-4 bg-surface-900 text-surface-100 rounded-lg overflow-x-auto">
                          <pre className="text-sm">
                            <code className="language-css">{formData.customCSS}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Panel */}
          <div className="w-96 border-l border-surface-200 bg-surface-50 flex flex-col">
            <div className="p-4 border-b border-surface-200">
              <h3 className="font-semibold text-surface-900 flex items-center gap-2">
                <ApperIcon name="Eye" size={18} />
                Live Preview
              </h3>
            </div>
            
            <div className="flex-1 p-4">
              <div
                className="bg-white rounded-lg border border-surface-200 overflow-hidden"
                style={{
                  fontFamily: formData.fontFamily,
                  fontSize: `${formData.fontSize}px`,
                  '--primary-color': formData.primaryColor,
                  '--secondary-color': formData.secondaryColor,
                  '--accent-color': formData.accentColor,
                  '--background-color': formData.backgroundColor,
                  '--text-color': formData.textColor
                }}
              >
                {/* Preview Header */}
                <div
                  className="flex items-center justify-between px-4 py-3 border-b border-surface-200"
                  style={{
                    height: `${formData.headerHeight}px`,
                    backgroundColor: formData.primaryColor,
                    color: 'white'
                  }}
                >
                  <div className="flex items-center gap-3">
                    {formData.logo && (
                      <img
                        src={formData.logo}
                        alt="Logo"
                        className="h-8 object-contain"
                      />
                    )}
                    <span className="font-bold">{formData.name || 'Brand Name'}</span>
                  </div>
                  <ApperIcon name="Bell" size={18} />
                </div>

                {/* Preview Content */}
                <div className="flex">
                  <div
                    className="border-r border-surface-200 p-3"
                    style={{
                      width: `${Math.min(formData.sidebarWidth, 120)}px`,
                      backgroundColor: formData.backgroundColor
                    }}
                  >
                    <div className="space-y-2">
                      <div
                        className="px-2 py-1 rounded text-xs text-white"
                        style={{
                          backgroundColor: formData.primaryColor,
                          borderRadius: `${formData.borderRadius}px`
                        }}
                      >
                        Home
                      </div>
                      <div
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          color: formData.textColor,
                          borderRadius: `${formData.borderRadius}px`
                        }}
                      >
                        Browse
                      </div>
                      <div
                        className="px-2 py-1 rounded text-xs"
                        style={{
                          color: formData.textColor,
                          borderRadius: `${formData.borderRadius}px`
                        }}
                      >
                        Post Ad
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-3" style={{ backgroundColor: formData.backgroundColor }}>
                    <div
                      className="p-3 border rounded mb-3"
                      style={{
                        borderColor: formData.primaryColor + '30',
                        backgroundColor: formData.primaryColor + '10',
                        borderRadius: `${formData.borderRadius}px`,
                        color: formData.textColor
                      }}
                    >
                      <div className="text-sm font-medium">Sample Card</div>
                      <div className="text-xs mt-1 opacity-70">Preview content</div>
                    </div>
                    
                    <button
                      className="px-3 py-1.5 text-xs text-white rounded"
                      style={{
                        backgroundColor: formData.accentColor,
                        borderRadius: `${formData.borderRadius}px`
                      }}
                    >
                      Action Button
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom CSS Preview */}
              {formData.customCSS && (
                <div className="mt-4">
                  <style dangerouslySetInnerHTML={{ __html: formData.customCSS }} />
                  <div className="text-xs text-surface-600 mb-2">Custom CSS Applied</div>
                  <div className="custom-card custom-button p-2 text-xs text-center text-white rounded">
                    Custom Styled Element
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandingManager;