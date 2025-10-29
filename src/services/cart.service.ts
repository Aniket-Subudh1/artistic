import { API_CONFIG, apiRequest } from '@/lib/api-config';

export interface CartItemDTO {
	artistId: string; // artist profile id
	bookingDate: string; // YYYY-MM-DD
	startTime: string; // HH:mm
	endTime: string; // HH:mm
	hours: number;
	totalPrice: number;
	// Optional combined booking payload
	selectedEquipmentPackages?: string[];
	selectedCustomPackages?: string[];
	isEquipmentMultiDay?: boolean;
	equipmentEventDates?: Array<{ date: string; startTime: string; endTime: string }>;
	userDetails?: { name: string; email: string; phone: string };
	venueDetails?: {
		address: string;
		city: string;
		state: string;
		country: string;
		postalCode?: string;
		venueType?: string;
		additionalInfo?: string;
	};
}

export interface CartItemResponse {
	_id: string;
	userId: string;
	artistId: {
		_id: string;
		stageName: string;
		profileImage?: string;
		user?: string;
	} | string;
	bookingDate: string;
	startTime: string;
	endTime: string;
	hours: number;
	totalPrice: number;
	selectedEquipmentPackages?: any[];
	selectedCustomPackages?: any[];
}

export interface CartResponse {
	_id?: string;
	userId?: string;
	items?: CartItemResponse[];
	message?: string;
}

export class CartService {
	static async getCart(): Promise<CartResponse> {
		try {
			return apiRequest<CartResponse>('/cart', { method: 'GET' });
		} catch (error: any) {
			// If user is not authenticated, return empty cart
			if (error.status === 401) {
				return { items: [] };
			}
			throw error;
		}
	}

	static async addToCart(item: CartItemDTO): Promise<CartItemResponse> {
		const res = await apiRequest<CartItemResponse>('/cart/add', {
			method: 'POST',
			body: JSON.stringify(item),
		});
		// Notify listeners
		if (typeof window !== 'undefined') {
			try {
				const current = await CartService.getCart();
				const count = current.items?.length || 0;
				localStorage.setItem('artistCartCount', String(count));
				window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count } }));
			} catch {}
		}
		return res;
	}

	static async clearCart(): Promise<void> {
		await apiRequest<void>('/cart/clear', { method: 'POST' });
		if (typeof window !== 'undefined') {
			localStorage.setItem('artistCartCount', '0');
			window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: 0 } }));
		}
	}

	static async validate(): Promise<{ conflicts: any[] }> {
		return apiRequest<{ conflicts: any[] }>('/cart/validate', { method: 'POST' });
	}

	static async checkout(): Promise<any> {
		return apiRequest<any>('/cart/checkout', { method: 'POST' });
	}
}
