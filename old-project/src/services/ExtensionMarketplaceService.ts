import axios from 'axios';

export interface Extension {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  publisher: string;
  downloadUrl: string;
  iconUrl?: string;
  downloadCount?: number;
  timestamp?: string;
}

export interface SearchResult {
  extensions: Extension[];
  total: number;
}

export class ExtensionMarketplaceService {
  private readonly baseUrl: string = 'https://open-vsx.org/api';
  
  async searchExtensions(query: string, size: number = 10, offset: number = 0): Promise<SearchResult> {
    try {
      const response = await axios.get(`${this.baseUrl}/query`, {
        params: {
          query,
          size,
          offset,
        }
      });
      
      const extensions = response.data.extensions.map((ext: any) => ({
        id: `${ext.namespace}.${ext.name}`,
        name: ext.name,
        displayName: ext.displayName || ext.name,
        description: ext.description || '',
        version: ext.version,
        publisher: ext.namespace,
        downloadUrl: ext.files?.download || '',
        iconUrl: ext.files?.icon || '',
        downloadCount: ext.downloadCount,
        timestamp: ext.timestamp
      }));

      return {
        extensions,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error searching extensions:', error);
      throw error;
    }
  }

  async getExtensionDetails(extensionId: string): Promise<Extension> {
    try {
      const [publisher, name] = extensionId.split('.');
      const response = await axios.get(`${this.baseUrl}/${publisher}/${name}/latest`);
      
      return {
        id: extensionId,
        name: response.data.name,
        displayName: response.data.displayName || response.data.name,
        description: response.data.description || '',
        version: response.data.version,
        publisher: response.data.namespace,
        downloadUrl: response.data.files?.download || '',
        iconUrl: response.data.files?.icon || '',
        downloadCount: response.data.downloadCount,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('Error fetching extension details:', error);
      throw error;
    }
  }

  async downloadExtension(extension: Extension): Promise<ArrayBuffer> {
    try {
      const response = await axios.get(extension.downloadUrl, {
        responseType: 'arraybuffer'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading extension:', error);
      throw error;
    }
  }
}

export const extensionMarketplaceService = new ExtensionMarketplaceService();
