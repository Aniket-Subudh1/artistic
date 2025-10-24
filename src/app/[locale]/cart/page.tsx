"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/main/Navbar';
import { Footer } from '@/components/main/Footer';
import Image from 'next/image';
import { CartService, CartItemResponse } from '@/services/cart.service';
import { APIError } from '@/lib/api-config';
import { Link, useRouter } from '@/i18n/routing';
import { AlertCircle, CheckCircle, ShoppingCart, Trash2 } from 'lucide-react';

export default function CartPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [checkingOut, setCheckingOut] = useState(false);
	const [cartItems, setCartItems] = useState<CartItemResponse[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [conflicts, setConflicts] = useState<any[]>([]);

	const loadCart = async () => {
		setLoading(true);
		try {
			const res = await CartService.getCart();
			setCartItems(res.items || []);
		} catch (e: any) {
			setError(e?.message || 'Failed to load cart');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadCart();
		const handler = () => loadCart();
		window.addEventListener('cart:updated', handler as EventListener);
		return () => window.removeEventListener('cart:updated', handler as EventListener);
	}, []);

	// Artist + equipment total using populated packages/custom packages
	// Group items by combo (artist + eq packages + custom + venue) to avoid double-counting equipment across days
	const groups = useMemo(() => {
		const map = new Map<string, any>();
		(cartItems as any[]).forEach((it) => {
			const artist: any = it.artistId as any;
			const artistProfileId = artist?._id || (typeof it.artistId === 'string' ? it.artistId : '');
			const eqIds = (it.selectedEquipmentPackages || []).map((p: any) => p?._id || p).sort();
			const customIds = (it.selectedCustomPackages || []).map((p: any) => p?._id || p).sort();
			const venueKey = it?.venueDetails ? `${it.venueDetails.address || ''}|${it.venueDetails.city || ''}|${it.venueDetails.state || ''}|${it.venueDetails.country || ''}` : 'no-venue';
			const key = [artistProfileId, eqIds.join(','), customIds.join(','), venueKey].join('#');
			if (!map.has(key)) {
				map.set(key, {
					key,
					artist,
					artistProfileId,
					eqPkgs: it.selectedEquipmentPackages || [],
					customPkgs: it.selectedCustomPackages || [],
					venueDetails: it.venueDetails || null,
					userDetails: it.userDetails || null,
					isEquipmentMultiDay: !!it.isEquipmentMultiDay,
					equipmentEventDates: it.equipmentEventDates || [],
					dates: [] as Array<{ date: string; startTime: string; endTime: string }>,
					artistPrice: 0,
				});
			}
			const g = map.get(key);
			const date = it.bookingDate ? new Date(it.bookingDate).toISOString().split('T')[0] : '';
			g.dates.push({ date, startTime: it.startTime, endTime: it.endTime });
			g.artistPrice += Number(it.totalPrice || 0);
		});
		// Sort dates within groups
		const arr = Array.from(map.values());
		arr.forEach((g) => g.dates.sort((a: any, b: any) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)));
		return arr;
	}, [cartItems]);

	// Grand total over groups: artist sum + equipment packages multiplied by days (multi-day aware)
	const total = useMemo(() => {
		return groups.reduce((sum: number, g: any) => {
			const equipmentDays = g.isEquipmentMultiDay && Array.isArray(g.equipmentEventDates) && g.equipmentEventDates.length > 0
				? g.equipmentEventDates.length
				: g.dates.length || 1;
			const listedPackagesTotal = (g.eqPkgs || []).reduce((s: number, p: any) => s + Number(p?.totalPrice || 0), 0) * equipmentDays;
			const customPackagesTotal = (g.customPkgs || []).reduce((s: number, p: any) => s + Number(p?.totalPricePerDay || 0), 0) * equipmentDays;
			return sum + Number(g.artistPrice || 0) + listedPackagesTotal + customPackagesTotal;
		}, 0);
	}, [groups]);

	const handleCheckout = async () => {
		setError(null);
		setConflicts([]);
		setCheckingOut(true);
		try {
			const validation = await CartService.validate();
			if (validation?.conflicts && validation.conflicts.length > 0) {
				setConflicts(validation.conflicts);
				setCheckingOut(false);
				return;
			}
			const res = await CartService.checkout();
			// Success: clear local count and navigate to bookings
			if (typeof window !== 'undefined') {
				localStorage.setItem('artistCartCount', '0');
				window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: 0 } }));
			}
			router.push('/dashboard/user/bookings');
		} catch (e: any) {
			if (e instanceof APIError && e.status === 409) {
				const data = (e as any).data || {}; 
				const conf = data.conflicts || data?.message || [];
				setConflicts(Array.isArray(conf) ? conf : []);
			} else {
				setError(e?.message || 'Checkout failed');
			}
		} finally {
			setCheckingOut(false);
		}
	};

	const handleClear = async () => {
		try {
			await CartService.clearCart();
			setCartItems([]);
		} catch (e) {}
	};

	return (
		<div className="min-h-screen relative">
			{/* Background */}
			<div className="fixed inset-0 z-0">
				<Image src="/design.png" alt="Background" fill className="object-cover" priority />
				<div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/50 to-pink-50/80"></div>
			</div>
			<Navbar />

			<div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-8">
				<div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
					<div className="flex items-center gap-3 mb-6">
						<div className="bg-gradient-to-br from-[#391C71] to-[#5B2C87] rounded-full p-2">
							<ShoppingCart className="w-6 h-6 text-white" />
						</div>
						<h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
					</div>

					{loading ? (
						<div className="flex justify-center py-12">
							<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#391C71]"></div>
						</div>
					) : cartItems.length === 0 ? (
						<div className="text-center py-16">
							<p className="text-gray-600">Your cart is empty.</p>
							<Link href="/artists" className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-[#391C71] to-[#5B2C87] text-white rounded-xl shadow-md hover:shadow-lg">Browse Artists</Link>
						</div>
					) : (
						<>
							{error && (
								<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
									<AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
									<div>
										<p className="text-red-800 font-medium">{error}</p>
									</div>
								</div>
							)}

							{conflicts.length > 0 && (
								<div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
									<p className="font-semibold text-yellow-800 mb-2">Some items are no longer available:</p>
									<ul className="list-disc pl-6 text-sm text-yellow-800 space-y-1">
										{conflicts.map((c, idx) => (
											<li key={idx}>
												{c?.date ? new Date(c.date).toISOString().split('T')[0] : ''} {c.startTime}-{c.endTime}: {c.message || 'Conflict'}
												{c.artistId && (
													<>
														{' '}• <Link href={`/book-artist/${c.artistId}`} className="underline">Change time</Link>
													</>
												)}
											</li>
										))}
									</ul>
								</div>
							)}

							<div className="space-y-4">
								{groups.map((g: any) => {
									const hasEquipment = (g.eqPkgs && g.eqPkgs.length > 0) || (g.customPkgs && g.customPkgs.length > 0);
									const equipmentDays = g.isEquipmentMultiDay && Array.isArray(g.equipmentEventDates) && g.equipmentEventDates.length > 0 ? g.equipmentEventDates.length : g.dates.length || 1;
									const listedPackagesTotal = (g.eqPkgs || []).reduce((s: number, p: any) => s + Number(p?.totalPrice || 0), 0) * equipmentDays;
									const customPackagesTotal = (g.customPkgs || []).reduce((s: number, p: any) => s + Number(p?.totalPricePerDay || 0), 0) * equipmentDays;
									const equipmentPrice = listedPackagesTotal + customPackagesTotal;
									return (
										<div key={g.key} className="p-4 bg-white/80 border border-gray-200 rounded-2xl">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-4">
													<div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100">
														{g.artist?.profileImage ? (
															// eslint-disable-next-line @next/next/no-img-element
															<img src={g.artist.profileImage} alt={g.artist?.stageName} className="w-full h-full object-cover" />
														) : (
															<div className="w-full h-full flex items-center justify-center text-gray-400">🎤</div>
														)}
													</div>
													<div>
														<div className="font-semibold text-gray-900 flex items-center gap-2">
															{g.artist?.stageName || 'Artist'}
															{hasEquipment && (
																<span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 border border-purple-200">with equipment</span>
															)}
														</div>
														<div className="text-sm text-gray-600">
															{g.dates.map((d: any, idx: number) => (
																<span key={idx} className="mr-3">{d.date} • {d.startTime}-{d.endTime}</span>
															))}
														</div>
													</div>
												</div>
												<div className="text-right">
													<div className="text-sm text-gray-600">Artist: <span className="font-semibold text-gray-800">{g.artistPrice} KWD</span></div>
													{hasEquipment && (
														<div className="text-sm text-gray-600">Equipment: <span className="font-semibold text-gray-800">{equipmentPrice} KWD</span></div>
													)}
													<div className="text-base font-bold mt-1">Total: <span className="text-purple-700">{g.artistPrice + equipmentPrice} KWD</span></div>
												</div>
											</div>
											{hasEquipment && (
												<div className="mt-3 border-t pt-3">
													{(g.eqPkgs || []).length > 0 && (
														<div className="mb-2">
															<div className="font-semibold text-gray-900 text-sm">Packages</div>
															<ul className="mt-1 space-y-1">
																{(g.eqPkgs || []).map((pkg: any) => (
																	<li key={pkg._id} className="text-sm text-gray-700">
																		<span className="font-medium">{pkg.name}</span> — {pkg.totalPrice} KWD/day
																		{Array.isArray(pkg.items) && pkg.items.length > 0 && (
																			<ul className="ml-4 list-disc text-xs text-gray-600">
																				{pkg.items.map((it: any, idx: number) => (
																					<li key={idx}>{it?.equipmentId?.name || 'Item'}{it?.quantity ? ` x${it.quantity}` : ''}</li>
																				))}
																			</ul>
																		)}
																	</li>
																))}
															</ul>
														</div>
													)}
													{(g.customPkgs || []).length > 0 && (
														<div>
															<div className="font-semibold text-gray-900 text-sm">Custom Packages</div>
															<ul className="mt-1 space-y-1">
																{(g.customPkgs || []).map((pkg: any) => (
																	<li key={pkg._id} className="text-sm text-gray-700">
																		<span className="font-medium">{pkg.name}</span> — {pkg.totalPricePerDay} KWD/day
																		{Array.isArray(pkg.items) && pkg.items.length > 0 && (
																			<ul className="ml-4 list-disc text-xs text-gray-600">
																				{pkg.items.map((it: any, idx: number) => (
																					<li key={idx}>{it?.equipmentId?.name || 'Item'}{it?.quantity ? ` x${it.quantity}` : ''}</li>
																				))}
																			</ul>
																		)}
																	</li>
																))}
															</ul>
														</div>
													)}
													{equipmentDays > 1 && (
														<div className="text-xs text-gray-500 mt-2">Equipment charges multiplied by {equipmentDays} day(s).</div>
													)}
												</div>
											)}
										</div>
									);
								})}
							</div>

							<div className="mt-6 flex items-center justify-between">
								<div className="text-lg font-bold">Total: <span className="text-purple-700">{total} KWD</span></div>
								<div className="flex gap-3">
									<button onClick={handleClear} className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center gap-2">
										<Trash2 className="w-4 h-4" /> Clear Cart
									</button>
									<button onClick={handleCheckout} disabled={checkingOut} className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-500 shadow-md disabled:opacity-50">
										{checkingOut ? 'Processing…' : 'Checkout'}
									</button>
								</div>
							</div>
						</>
					)}
				</div>
			</div>

			<Footer />
		</div>
	);
}

