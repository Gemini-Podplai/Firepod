import { Extension, extensionMarketplaceService } from './ExtensionMarketplaceService';

export interface InstalledExtension extends Extension {
  installedAt: string;
  enabled: boolean;
}

export class ExtensionManager {
  private installedExtensions: Map<string, InstalledExtension> = new Map();
  private storageKey = 'installedExtensions';
  
  constructor() {
    this.loadInstalledExtensions();
  }
  
  private loadInstalledExtensions(): void {
    try {
      const storedExtensions = localStorage.getItem(this.storageKey);
      if (storedExtensions) {
        const extensions = JSON.parse(storedExtensions) as InstalledExtension[];
        extensions.forEach(ext => {
          this.installedExtensions.set(ext.id, ext);
        });
      }
    } catch (error) {
      console.error('Error loading installed extensions:', error);
    }
  }
  
  private saveInstalledExtensions(): void {
    try {
      const extensions = Array.from(this.installedExtensions.values());
      localStorage.setItem(this.storageKey, JSON.stringify(extensions));
    } catch (error) {
      console.error('Error saving installed extensions:', error);
    }
  }
  
  getInstalledExtensions(): InstalledExtension[] {
    return Array.from(this.installedExtensions.values());
  }
  
  isExtensionInstalled(extensionId: string): boolean {
    return this.installedExtensions.has(extensionId);
  }
  
  async installExtension(extensionId: string): Promise<InstalledExtension> {
    if (this.isExtensionInstalled(extensionId)) {
      throw new Error('Extension already installed');
    }
    
    const extension = await extensionMarketplaceService.getExtensionDetails(extensionId);
    const extensionData = await extensionMarketplaceService.downloadExtension(extension);
    
    // Here you would typically process the extension data and actually install it in your sandbox
    // For demonstration, we're just storing the extension metadata
    
    const installedExtension: InstalledExtension = {
      ...extension,
      installedAt: new Date().toISOString(),
      enabled: true
    };
    
    this.installedExtensions.set(extensionId, installedExtension);
    this.saveInstalledExtensions();
    
    return installedExtension;
  }
  
  async uninstallExtension(extensionId: string): Promise<void> {
    if (!this.isExtensionInstalled(extensionId)) {
      throw new Error('Extension not installed');
    }
    
    // Here you would actually remove the extension from your sandbox
    
    this.installedExtensions.delete(extensionId);
    this.saveInstalledExtensions();
  }
  
  async toggleExtensionState(extensionId: string, enabled: boolean): Promise<InstalledExtension> {
    const extension = this.installedExtensions.get(extensionId);
    if (!extension) {
      throw new Error('Extension not installed');
    }
    
    extension.enabled = enabled;
    this.installedExtensions.set(extensionId, extension);
    this.saveInstalledExtensions();
    
    return extension;
  }
}

export const extensionManager = new ExtensionManager();
