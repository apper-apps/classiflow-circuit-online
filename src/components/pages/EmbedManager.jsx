import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ApperIcon from "@/components/ApperIcon";
import ErrorState from "@/components/atoms/ErrorState";
import SkeletonLoader from "@/components/atoms/SkeletonLoader";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import embedService from "@/services/api/embedService";

function EmbedManager() {
  const [embeds, setEmbeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmbed, setSelectedEmbed] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    width: '100%',
    height: '400',
    allowFullscreen: true,
    sandbox: true,
    description: ''
  });

  useEffect(() => {
    loadEmbeds();
  }, []);

  const loadEmbeds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await embedService.getAll();
      setEmbeds(data);
    } catch (err) {
      setError('Failed to load embed configurations');
      toast.error('Failed to load embed configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEmbed) {
        const updated = await embedService.update(selectedEmbed.Id, formData);
        setEmbeds(prev => prev.map(embed => 
          embed.Id === selectedEmbed.Id ? updated : embed
        ));
        toast.success('Embed configuration updated successfully');
      } else {
        const created = await embedService.create(formData);
        setEmbeds(prev => [...prev, created]);
        toast.success('Embed configuration created successfully');
      }
      handleCancel();
    } catch (err) {
      toast.error('Failed to save embed configuration');
    }
  };

  const handleEdit = (embed) => {
    setSelectedEmbed(embed);
    setFormData({
      name: embed.name,
      url: embed.url,
      width: embed.width,
      height: embed.height,
      allowFullscreen: embed.allowFullscreen,
      sandbox: embed.sandbox,
      description: embed.description
    });
    setShowForm(true);
  };

  const handleDelete = async (embed) => {
    if (!confirm(`Are you sure you want to delete "${embed.name}"?`)) return;
    
    try {
      await embedService.delete(embed.Id);
      setEmbeds(prev => prev.filter(e => e.Id !== embed.Id));
      toast.success('Embed configuration deleted successfully');
    } catch (err) {
      toast.error('Failed to delete embed configuration');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedEmbed(null);
    setFormData({
      name: '',
      url: '',
      width: '100%',
      height: '400',
      allowFullscreen: true,
      sandbox: true,
      description: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
};

  const generateEmbedCode = (embed) => {
    if (!embed) return '';
    
    const sandboxAttr = embed.sandbox ? ' sandbox="allow-scripts allow-same-origin"' : '';
    const allowFullscreenAttr = embed.allowFullscreen ? ' allowfullscreen' : '';
    
    return `<iframe
  src="${embed.url}"
  width="${embed.width}"
  height="${embed.height}"${sandboxAttr}${allowFullscreenAttr}
  frameborder="0"
  title="${embed.name || 'Embed'}"
></iframe>`;
  };

  const handleCopyEmbedCode = (embed) => {
    if (!embed) {
      toast.error('No embed selected');
      return;
    }
    toast.success('Embed code copied to clipboard');
  };
  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <SkeletonLoader height="h-8" className="w-64 mb-2" />
          <SkeletonLoader height="h-4" className="w-96" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonLoader height="h-96" />
          <SkeletonLoader height="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          message={error}
          onRetry={loadEmbeds}
          icon="AlertCircle"
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-surface-900 mb-2">
              Embed Manager
            </h1>
            <p className="text-surface-600">
              Configure and manage iframe embeds for your marketplace
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="primary"
            size="lg"
          >
            <ApperIcon name="Plus" size={20} />
            New Embed
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Configuration Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h2 className="text-xl font-semibold text-surface-900 mb-4">
              {selectedEmbed ? 'Edit Configuration' : 'New Configuration'}
            </h2>
            
            {showForm ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  label="Configuration Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter configuration name"
                  required
                />

                <FormField
                  label="Embed URL"
                  name="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://example.com/embed"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Width"
                    name="width"
                    type="text"
                    value={formData.width}
                    onChange={(e) => handleInputChange('width', e.target.value)}
                    placeholder="100% or 800px"
                  />

                  <FormField
                    label="Height"
                    name="height"
                    type="text"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="400px"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.allowFullscreen}
                      onChange={(e) => handleInputChange('allowFullscreen', e.target.checked)}
                      className="w-4 h-4 text-primary border-surface-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-surface-700">
                      Allow Fullscreen
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.sandbox}
                      onChange={(e) => handleInputChange('sandbox', e.target.checked)}
                      className="w-4 h-4 text-primary border-surface-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-surface-700">
                      Enable Sandbox Security
                    </span>
                  </label>
                </div>

                <FormField
                  label="Description"
                  name="description"
                  type="textarea"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of this embed"
                  rows={3}
                />

                <div className="flex gap-3 pt-4">
                  <Button type="submit" variant="primary">
                    {selectedEmbed ? 'Update' : 'Create'} Configuration
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="Monitor" size={48} className="mx-auto text-surface-400 mb-4" />
                <p className="text-surface-600 mb-4">
                  Create or select an embed configuration to get started
                </p>
                <Button onClick={() => setShowForm(true)} variant="outline">
                  <ApperIcon name="Plus" size={16} />
                  New Configuration
                </Button>
              </div>
            )}
          </div>

          {/* Existing Configurations */}
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">
              Existing Configurations ({embeds.length})
            </h3>
            
            {embeds.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="FileX" size={48} className="mx-auto text-surface-400 mb-4" />
                <p className="text-surface-600">No embed configurations found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {embeds.map((embed) => (
                  <div
                    key={embed.Id}
                    className="flex items-center justify-between p-4 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-surface-900">{embed.name}</h4>
                      <p className="text-sm text-surface-600 truncate max-w-xs">
                        {embed.url}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-surface-500">
                        <span>{embed.width} × {embed.height}</span>
                        {embed.allowFullscreen && (
                          <span className="flex items-center gap-1">
                            <ApperIcon name="Maximize" size={12} />
                            Fullscreen
                          </span>
                        )}
                        {embed.sandbox && (
                          <span className="flex items-center gap-1">
                            <ApperIcon name="Shield" size={12} />
                            Sandbox
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(embed)}
                      >
                        <ApperIcon name="Edit" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(embed)}
                        className="text-error hover:text-error hover:bg-error/10"
                      >
                        <ApperIcon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

{/* Live Preview & Embed Code */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h2 className="text-xl font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <ApperIcon name="Eye" size={20} />
              Live Preview
            </h2>
            
            {(formData.url || formData.type === 'classiflow') ? (
              <div className="space-y-4">
                <div className="p-4 bg-surface-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-surface-700">Type:</span>
                      <p className="text-surface-600 capitalize">{formData.type}</p>
                    </div>
                    <div>
                      <span className="font-medium text-surface-700">Dimensions:</span>
                      <p className="text-surface-600">{formData.width} × {formData.height}</p>
                    </div>
                  </div>
                  {formData.type === 'classiflow' && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-surface-700">Categories:</span>
                      <p className="text-surface-600">
                        {formData.categories.length === 0 
                          ? 'All Categories' 
                          : `${formData.categories.length} selected`}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="border border-surface-200 rounded-lg overflow-hidden">
                  {formData.type === 'classiflow' ? (
                    <div className="p-8 bg-surface-50 text-center">
                      <ApperIcon name="Monitor" size={48} className="mx-auto text-surface-400 mb-4" />
                      <p className="text-surface-600 mb-2">ClassiFlow Embed Preview</p>
                      <p className="text-sm text-surface-500">
                        Preview will be available after saving the configuration
                      </p>
                    </div>
                  ) : (
                    <iframe
                      src={formData.url}
                      width={formData.width}
                      height={formData.height}
                      allowFullScreen={formData.allowFullscreen}
                      sandbox={formData.sandbox ? "allow-scripts allow-same-origin" : undefined}
                      className="w-full"
                      title={formData.name || 'Embed Preview'}
                    />
                  )}
                </div>
                
                <div className="text-xs text-surface-500 space-y-1">
                  <p>• Security: {formData.sandbox ? 'Sandboxed' : 'No sandbox'}</p>
                  <p>• Fullscreen: {formData.allowFullscreen ? 'Allowed' : 'Disabled'}</p>
                  {formData.type === 'classiflow' && (
                    <>
                      <p>• Search: {formData.showSearch ? 'Enabled' : 'Disabled'}</p>
                      <p>• Max Listings: {formData.maxListings}</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <ApperIcon name="Globe" size={48} className="mx-auto text-surface-400 mb-4" />
                <p className="text-surface-600">
                  {formData.type === 'external' 
                    ? 'Enter a URL in the configuration form to see the live preview'
                    : 'Configure ClassiFlow embed settings to see the preview'}
                </p>
              </div>
            )}
          </div>

          {/* Embed Code Generator */}
          {selectedEmbed && (
            <div className="bg-white rounded-xl border border-surface-200 p-6">
              <h3 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <ApperIcon name="Code" size={18} />
                Embed Code
              </h3>
              
              <div className="space-y-3">
                <div className="relative">
                  <pre className="bg-surface-900 text-surface-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{generateEmbedCode(selectedEmbed)}</code>
                  </pre>
                  <CopyToClipboard
                    text={generateEmbedCode(selectedEmbed)}
                    onCopy={() => handleCopyEmbedCode(selectedEmbed)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-surface-800 hover:bg-surface-700 text-surface-200"
                    >
                      <ApperIcon name="Copy" size={16} />
                      Copy
                    </Button>
                  </CopyToClipboard>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <ApperIcon name="Info" size={16} className="inline mr-2" />
                    Copy this code and paste it into your website's HTML where you want the embed to appear.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmbedManager;