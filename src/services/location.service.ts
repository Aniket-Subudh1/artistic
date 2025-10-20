// Location detection service
export interface LocationInfo {
  country: string;
  countryCode: string;
  flag: string;
  city?: string;
  region?: string;
}

// Function to generate flag emoji from country code
function getFlagEmoji(countryCode: string): string {
  // Try direct mapping first
  const directFlags: Record<string, string> = {
    'US': '🇺🇸', 'GB': '🇬🇧', 'KW': '🇰🇼', 'AE': '🇦🇪', 'SA': '🇸🇦',
    'QA': '🇶🇦', 'BH': '🇧🇭', 'OM': '🇴🇲', 'IN': '🇮🇳', 'EG': '🇪🇬',
    'JO': '🇯🇴', 'LB': '🇱🇧', 'SY': '🇸🇾', 'IQ': '🇮🇶', 'CA': '🇨🇦',
    'AU': '🇦🇺', 'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸',
    'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮',
    'BR': '🇧🇷', 'MX': '🇲🇽', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴',
    'PE': '🇵🇪', 'JP': '🇯🇵', 'KR': '🇰🇷', 'CN': '🇨🇳', 'TH': '🇹🇭',
    'VN': '🇻🇳', 'MY': '🇲🇾', 'SG': '🇸🇬', 'PH': '🇵🇭', 'ID': '🇮🇩',
    'PK': '🇵🇰', 'BD': '🇧🇩', 'LK': '🇱🇰', 'NP': '🇳🇵', 'ZA': '🇿🇦',
    'NG': '🇳🇬', 'KE': '🇰🇪', 'MA': '🇲🇦', 'TN': '🇹🇳', 'DZ': '🇩🇿'
  };
  
  if (directFlags[countryCode]) {
    return directFlags[countryCode];
  }
  
  // Generate flag using Regional Indicator Symbols
  if (countryCode && countryCode.length === 2) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
  
  return '🌍'; // Default globe emoji
}

// Fallback location data
const FALLBACK_LOCATION: LocationInfo = {
  country: 'Kuwait',
  countryCode: 'KW',
  flag: getFlagEmoji('KW'),
  city: 'Kuwait City',
  region: 'Kuwait'
};

class LocationService {
  private static instance: LocationService;
  private cachedLocation: LocationInfo | null = null;
  private isLoading = false;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Get location using multiple fallback methods
  async getLocation(): Promise<LocationInfo> {
    // Return cached location if available
    if (this.cachedLocation) {
      return this.cachedLocation;
    }

    // Prevent multiple simultaneous requests
    if (this.isLoading) {
      // Wait for ongoing request to complete
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.cachedLocation || FALLBACK_LOCATION;
    }

    this.isLoading = true;

    try {
      // Try multiple IP geolocation services
      const location = await this.tryMultipleServices();
      this.cachedLocation = location;
      return location;
    } catch (error) {
      console.warn('Failed to detect location, using fallback:', error);
      this.cachedLocation = FALLBACK_LOCATION;
      return FALLBACK_LOCATION;
    } finally {
      this.isLoading = false;
    }
  }

  private async tryMultipleServices(): Promise<LocationInfo> {
    const services = [
      () => this.tryIPAPI(),
      () => this.tryIPInfo(),
      () => this.tryCloudflare(),
    ];

    for (const service of services) {
      try {
        const result = await service();
        if (result) {
          return result;
        }
      } catch (error) {
        console.warn('Location service failed:', error);
        continue;
      }
    }

    throw new Error('All location services failed');
  }

  // Primary service: ip-api.com (free, no key required)
  private async tryIPAPI(): Promise<LocationInfo | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://ip-api.com/json/?fields=status,country,countryCode,region,city', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('IP-API request failed');
      
      const data = await response.json();
      
      if (data.status !== 'success') throw new Error('IP-API returned error status');

      return {
        country: data.country,
        countryCode: data.countryCode,
        flag: getFlagEmoji(data.countryCode),
        city: data.city,
        region: data.region
      };
    } catch (error) {
      throw new Error(`IP-API failed: ${error}`);
    }
  }

  // Secondary service: ipinfo.io (free tier available)
  private async tryIPInfo(): Promise<LocationInfo | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://ipinfo.io/json', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('IPInfo request failed');
      
      const data = await response.json();

      return {
        country: data.country_name || data.country,
        countryCode: data.country,
        flag: getFlagEmoji(data.country),
        city: data.city,
        region: data.region
      };
    } catch (error) {
      throw new Error(`IPInfo failed: ${error}`);
    }
  }

  // Tertiary service: Cloudflare (if available)
  private async tryCloudflare(): Promise<LocationInfo | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://cloudflare.com/cdn-cgi/trace', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Cloudflare request failed');
      
      const text = await response.text();
      const lines = text.split('\n');
      const data: Record<string, string> = {};
      
      lines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          data[key] = value;
        }
      });

      if (!data.loc) throw new Error('No location data from Cloudflare');

      return {
        country: this.getCountryName(data.loc),
        countryCode: data.loc,
        flag: getFlagEmoji(data.loc),
        city: undefined,
        region: undefined
      };
    } catch (error) {
      throw new Error(`Cloudflare failed: ${error}`);
    }
  }

  // Helper to get country name from country code
  private getCountryName(countryCode: string): string {
    const countryNames: Record<string, string> = {
      'US': 'United States',
      'GB': 'United Kingdom', 
      'KW': 'Kuwait',
      'AE': 'United Arab Emirates',
      'SA': 'Saudi Arabia',
      'QA': 'Qatar',
      'BH': 'Bahrain',
      'OM': 'Oman',
      'IN': 'India',
      'EG': 'Egypt',
      'JO': 'Jordan',
      'LB': 'Lebanon',
      'SY': 'Syria',
      'IQ': 'Iraq',
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France',
      'IT': 'Italy',
      'ES': 'Spain',
      'NL': 'Netherlands',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'BR': 'Brazil',
      'MX': 'Mexico',
      'AR': 'Argentina',
      'CL': 'Chile',
      'CO': 'Colombia',
      'PE': 'Peru',
      'JP': 'Japan',
      'KR': 'South Korea',
      'CN': 'China',
      'TH': 'Thailand',
      'VN': 'Vietnam',
      'MY': 'Malaysia',
      'SG': 'Singapore',
      'PH': 'Philippines',
      'ID': 'Indonesia',
      'PK': 'Pakistan',
      'BD': 'Bangladesh',
      'LK': 'Sri Lanka',
      'NP': 'Nepal',
      'ZA': 'South Africa',
      'NG': 'Nigeria',
      'KE': 'Kenya',
      'MA': 'Morocco',
      'TN': 'Tunisia',
      'DZ': 'Algeria',
      'LY': 'Libya'
    };
    
    return countryNames[countryCode] || countryCode;
  }

  // Clear cached location (useful for testing)
  clearCache(): void {
    this.cachedLocation = null;
  }

  // Get cached location without making new request
  getCachedLocation(): LocationInfo | null {
    return this.cachedLocation;
  }
}

export const locationService = LocationService.getInstance();