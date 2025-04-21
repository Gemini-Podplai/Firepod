import React from 'react';
import { Extension } from '../../services/ExtensionMarketplaceService';
import { InstalledExtension, extensionManager } from '../../services/ExtensionManager';

interface ExtensionCardProps {
  extension: Extension;
  isInstalled: boolean;
  onInstall: (extension: Extension) => Promise<void>;
  onUninstall: (extensionId: string) => Promise<void>;
  onToggleState?: (extensionId: string, enabled: boolean) => Promise<void>;
}

const ExtensionCard: React.FC<ExtensionCardProps> = ({
  extension,
  isInstalled,
  onInstall,
  onUninstall,
  onToggleState
}) => {
  const [loading, setLoading] = React.useState(false);
  const installedExtension = isInstalled 
    ? extensionManager.getInstalledExtensions().find(e => e.id === extension.id) as InstalledExtension
    : undefined;

  const handleAction = async () => {
    try {
      setLoading(true);
      if (isInstalled) {
        await onUninstall(extension.id);
      } else {
        await onInstall(extension);
      }
    } catch (error) {
      console.error('Error handling extension action:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleState = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onToggleState && installedExtension) {
      try {
        setLoading(true);
        await onToggleState(extension.id, e.target.checked);
      } catch (error) {
        console.error('Error toggling extension state:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="border rounded-md p-4 mb-4 flex flex-col h-full">
      <div className="flex items-center mb-3">
        {extension.iconUrl ? (
          <img 
            src={extension.iconUrl} 
            alt={`${extension.displayName} icon`}
            className="w-10 h-10 mr-3"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-md mr-3 flex items-center justify-center">
            <span className="text-lg">{extension.displayName.charAt(0)}</span>
          </div>
        )}
        <div>
          <h3 className="font-semibold">{extension.displayName}</h3>
          <p className="text-sm text-gray-500">{extension.publisher}</p>
        </div>
      </div>
      
      <p className="text-sm mb-3 flex-grow">{extension.description}</p>
      
      <div className="mt-auto flex items-center justify-between">
        <div className="text-xs text-gray-500">
          v{extension.version}
          {extension.downloadCount && <span className="ml-2">• {extension.downloadCount.toLocaleString()} downloads</span>}
        </div>
        
        <div className="flex items-center">
          {isInstalled && onToggleState && (
            <label className="inline-flex items-center mr-3 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4"
                checked={installedExtension?.enabled}
                onChange={handleToggleState}
                disabled={loading}
              />
              <span className="ml-1 text-sm">Enabled</span>
            </label>
          )}
          
          <button
            className={`text-sm px-3 py-1 rounded-md ${
              isInstalled 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            onClick={handleAction}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isInstalled ? 'Uninstalling...' : 'Installing...'}
              </span>
            ) : (
              isInstalled ? 'Uninstall' : 'Install'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtensionCard;
