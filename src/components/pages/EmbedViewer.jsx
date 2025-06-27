import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import ErrorState from "@/components/atoms/ErrorState";
import EmptyState from "@/components/atoms/EmptyState";
import SkeletonLoader from "@/components/atoms/SkeletonLoader";
import ListingCard from "@/components/molecules/ListingCard";
import SearchBar from "@/components/molecules/SearchBar";
import listingService from "@/services/api/listingService";
import categoryService from "@/services/api/categoryService";
import embedService from "@/services/api/embedService";

function EmbedViewer() {
  const { embedId } = useParams();
  const [embed, setEmbed] = useState(null);
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadEmbedData();
  }, [embedId]);

  useEffect(() => {
    if (embed) {
      loadListings();
    }
  }, [embed, searchQuery, selectedCategory]);

  const loadEmbedData = async () => {
    try {
      setLoading(true);
      setError(null);
      const embedData = await embedService.getById(embedId);
      
      if (embedData.type !== 'classiflow') {
        throw new Error('Invalid embed type');
      }
      
      setEmbed(embedData);
      
      // Load categories for filtering
      const categoriesData = await categoryService.getPublicCategories();
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message || 'Failed to load embed configuration');
    } finally {
      setLoading(false);
    }
  };

  const loadListings = async () => {
    try {
      const embedConfig = {
        categories: selectedCategory ? [parseInt(selectedCategory)] : embed.categories,
        search: searchQuery,
        maxListings: embed.maxListings
      };
      
      const listingsData = await listingService.getEmbedListings(embedConfig);
      setListings(listingsData);
    } catch (err) {
      console.error('Failed to load listings:', err);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4" style={{ fontFamily: 'inherit' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <SkeletonLoader height="h-12" className="w-48 mb-4" />
            <SkeletonLoader height="h-4" className="w-96" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonLoader key={i} height="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ fontFamily: 'inherit' }}>
        <ErrorState
          message={error}
          onRetry={loadEmbedData}
          icon="AlertCircle"
        />
      </div>
    );
  }

  return (
    <div
    className="min-h-screen p-4"
    style={{
        fontFamily: "inherit",
        backgroundColor: "var(--embed-bg-color, #f8fafc)",
        color: "var(--embed-text-color, #1e293b)"
    }}>
    <style>{`
        /* CSS Reset for embed */
        * {
          box-sizing: border-box;
        }
        
        /* Inherit host styles */
        .embed-container {
          font-family: inherit;
          line-height: inherit;
          color: inherit;
        }
        
        /* Custom properties for theming */
        :root {
          --embed-primary: var(--host-primary, #3b82f6);
          --embed-secondary: var(--host-secondary, #64748b);
          --embed-accent: var(--host-accent, #06b6d4);
          --embed-surface: var(--host-surface, #ffffff);
          --embed-border: var(--host-border, #e2e8f0);
        }
        
        .embed-button {
          background: var(--embed-primary);
          border: 1px solid var(--embed-primary);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .embed-button:hover {
          opacity: 0.9;
        }
        
        .embed-card {
          background: var(--embed-surface);
          border: 1px solid var(--embed-border);
          border-radius: 0.5rem;
          overflow: hidden;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .embed-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
      `}</style>
    <div className="max-w-6xl mx-auto embed-container">
        {/* Header */}
        <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
                {embed.name}
            </h1>
            {embed.description && <p className="text-sm opacity-70">
                {embed.description}
            </p>}
        </div>
        {/* Search and Filters */}
        {embed.showSearch && <div className="mb-6 space-y-4">
            <SearchBar
                placeholder="Search listings..."
                onSearch={handleSearch}
                className="max-w-md" />
            {categories.length > 0 && <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => handleCategoryChange("")}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${selectedCategory === "" ? "embed-button" : "border-current opacity-60 hover:opacity-80"}`}>All Categories
                                    </button>
                {categories.map(category => <button
                    key={category.Id}
                    onClick={() => handleCategoryChange(category.Id.toString())}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${selectedCategory === category.Id.toString() ? "embed-button" : "border-current opacity-60 hover:opacity-80"}`}>
                    {category.name}({category.listingCount})
                                      </button>)}
            </div>}
        </div>}
        {/* Listings Grid */}
        {listings.length === 0 ? <div className="text-center py-12">
            <EmptyState
                icon="Search"
                title="No listings found"
                description={searchQuery ? "No listings match your search criteria." : "No listings available at this time."} />
        </div> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map(listing => <div key={listing.Id} className="embed-card">
                <ListingCard listing={listing} showActions={false} />
            </div>)}
        </div>})

                {/* Footer */}
        <div
            className="mt-8 pt-6 border-t border-current opacity-20 text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={() => {
                        if (window.parent) {
                            window.parent.postMessage({
                                type: "OPEN_POST_AD",

                                data: {
                                    embedId: embedId
                                }
                            }, "*");
                        } else {
                            window.open("/post", "_blank");
                        }
                    }}
                    className="embed-button text-sm px-4 py-2">
                    <span className="flex items-center gap-2">
                        <ApperIcon name="Plus" size={16} />Post Your Ad
                                      </span>
                </button>
            </div>
            <p className="text-xs opacity-60">Powered by ClassiFlow Pro
                          </p>
        </div>
    </div></div>
  );
}

export default EmbedViewer;