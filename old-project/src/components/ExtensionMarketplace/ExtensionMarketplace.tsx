import React, { useState, useEffect } from 'react';
import { Extension, SearchResult, extensionMarketplaceService } from '../../services/ExtensionMarketplaceService';
import { extensionManager } from '../../services/ExtensionManager';
import ExtensionCard from './ExtensionCard';
import { useToast } from '../../hooks/useToast'; // Assuming you have a toast hook, or create one

const EXTENSIONS_PER_PAGE = 12;

const ExtensionMarketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult>({ extensions: [], total: 0 });
  const [installedExtensions, setInstalledExtensions] = useState(extensionManager.getInstalledExtensions());
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'installed'>('marketplace');
  const { showToast } = useToast(); // You'll need to implement this toast hook

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch extensions when debounced query changes
  useEffect(() => {
    if (activeTab === 'marketplace') {
      fetchExtensions();
    }
  }, [debouncedQuery, currentPage, activeTab]);

  const fetchExtensions = async () => {
    try {
      setLoading(true);
      const query = debouncedQuery.trim() || '*';
      const result = await extensionMarketplaceService.searchExtensions(
        query,
        EXTENSIONS_PER_PAGE,
        currentPage * EXTENSIONS_PER_PAGE
      );
      setSearchResults(result);
    } catch (error) {
      console.error('Error fetching extensions:', error);
      showToast('Failed to fetch extensions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshInstalledExtensions = () => {
    setInstalledExtensions(extensionManager.getInstalledExtensions());
  };

  const handleInstall = async (extension: Extension) => {
    try {
      showToast(`Installing ${extension.displayName}...`, 'info');
      await extensionManager.installExtension(extension.id);
      refreshInstalledExtensions();
      showToast(`${extension.displayName} installed successfully!`, 'success');
    } catch (error) {
      console.error('Error installing extension:', error);
      showToast(`Failed to install ${extension.displayName}`, 'error');
    }
  };

  const handleUninstall = async (extensionId: string) => {
    try {
      const extension = installedExtensions.find(ext => ext.id === extensionId);
      if (!extension) return;
      
      showToast(`Uninstalling ${extension.displayName}...`, 'info');
      await extensionManager.uninstallExtension(extensionId);
      refreshInstalledExtensions();
      showToast(`${extension.displayName} uninstalled successfully!`, 'success');
    } catch (error) {
      console.error('Error uninstalling extension:', error);
      showToast(`Failed to uninstall extension`, 'error');
    }
  };

  const handleToggleState = async (extensionId: string, enabled: boolean) => {
    try {
      await extensionManager.toggleExtensionState(extensionId, enabled);
      refreshInstalledExtensions();
      const extension = installedExtensions.find(ext => ext.id === extensionId);
      showToast(`${extension?.displayName} ${enabled ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Error toggling extension state:', error);
      showToast(`Failed to update extension state`, 'error');
    }
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(searchResults.total / EXTENSIONS_PER_PAGE);
    
    return (
      <div className="flex justify-center mt-6">
        <button
          className="px-3 py-1 rounded-md bg-gray-100 mr-2 disabled:opacity-50"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0 || loading}
        >
          Previous
        </button>
        <span className="flex items-center mx-2">
          Page {currentPage + 1} of {Math.max(1, totalPages)}
        </span>
        <button
          className="px-3 py-1 rounded-md bg-gray-100 ml-2 disabled:opacity-50"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={(currentPage + 1) * EXTENSIONS_PER_PAGE >= searchResults.total || loading}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Extension Marketplace</h2>
      
      <div className="mb-6">
        <div className="flex mb-4">
          <button
            className={`mr-4 pb-2 font-medium ${activeTab === 'marketplace' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('marketplace')}
          >
            Marketplace
          </button>
          <button
            className={`pb-2 font-medium ${activeTab === 'installed' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => {
              setActiveTab('installed');
              refreshInstalledExtensions();
            }}
          >
            Installed ({installedExtensions.length})
          </button>
        </div>
        
        {activeTab === 'marketplace' && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search extensions..."
              className="w-full p-2 border rounded-md pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3 top-3 h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {!loading && activeTab === 'marketplace' && searchResults.extensions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No extensions found. Try a different search.</p>
        </div>
      )}

      {!loading && activeTab === 'installed' && installedExtensions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No extensions installed yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTab === 'marketplace' && !loading && searchResults.extensions.map(extension => (
          <ExtensionCard
            key={extension.id}
            extension={extension}
            isInstalled={extensionManager.isExtensionInstalled(extension.id)}
            onInstall={handleInstall}
            onUninstall={handleUninstall}
            onToggleState={handleToggleState}
          />
        ))}
        
        {activeTab === 'installed' && installedExtensions.map(extension => (
          <ExtensionCard
            key={extension.id}
            extension={extension}
            isInstalled={true}
            onInstall={handleInstall}
            onUninstall={handleUninstall}
            onToggleState={handleToggleState}
          />
        ))}
      </div>
      
      {activeTab === 'marketplace' && searchResults.extensions.length > 0 && renderPagination()}
    </div>
  );
};

export default ExtensionMarketplace;
