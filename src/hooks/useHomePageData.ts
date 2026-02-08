import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { CarouselService, CarouselSlide } from '@/services/carousel.service';
import { ArtistService, Artist } from '@/services/artist.service';
import { equipmentPackagesService, EquipmentPackage } from '@/services/equipment-packages.service';
import { eventService, Event, EventsResponse } from '@/services/event.service';
import { SponsorService, Sponsor } from '@/services/sponsor.service';
import { TestimonialService, Testimonial } from '@/services/testimonial.service';
import { CACHE_TIMES } from '@/lib/query-client';

export const queryKeys = {
  carousel: {
    all: ['carousel'] as const,
    active: ['carousel', 'active'] as const,
  },
  artists: {
    all: ['artists'] as const,
    public: ['artists', 'public'] as const,
  },
  packages: {
    all: ['packages'] as const,
    public: ['packages', 'public'] as const,
  },
  events: {
    all: ['events'] as const,
    public: (limit?: number) => ['events', 'public', limit] as const,
    byType: (type: string, limit?: number) => ['events', 'type', type, limit] as const,
  },
  sponsors: {
    all: ['sponsors'] as const,
    active: ['sponsors', 'active'] as const,
  },
  testimonials: {
    all: ['testimonials'] as const,
    active: ['testimonials', 'active'] as const,
  },
};

export function useActiveCarouselSlides(
  options?: Omit<UseQueryOptions<CarouselSlide[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.carousel.active,
    queryFn: () => CarouselService.getActiveSlides(),
    staleTime: CACHE_TIMES.carousel,
    gcTime: CACHE_TIMES.carousel * 2,
    ...options,
  });
}


export function usePublicArtists(
  options?: Omit<UseQueryOptions<Artist[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.artists.public,
    queryFn: () => ArtistService.getAllArtists(),
    staleTime: CACHE_TIMES.artists,
    gcTime: CACHE_TIMES.artists * 2,
    select: (data) => {
      return data.filter(
        (artist) => artist.user.isActive && artist.user.role === 'ARTIST'
      );
    },
    ...options,
  });
}

export function usePublicPackages(
  limit?: number,
  options?: Omit<UseQueryOptions<EquipmentPackage[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...queryKeys.packages.public, limit],
    queryFn: async () => {
      const data = await equipmentPackagesService.getPublicPackages();
      return limit ? data.slice(0, limit) : data;
    },
    staleTime: CACHE_TIMES.packages,
    gcTime: CACHE_TIMES.packages * 2,
    ...options,
  });
}

export function usePublicEvents(
  limit?: number,
  options?: Omit<UseQueryOptions<EventsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.events.public(limit),
    queryFn: () => eventService.getPublicEvents({ limit }),
    staleTime: CACHE_TIMES.events,
    gcTime: CACHE_TIMES.events * 2,
    ...options,
  });
}



export function useEventsByType(
  performanceType: string,
  limit?: number,
  options?: Omit<UseQueryOptions<EventsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.events.byType(performanceType, limit),
    queryFn: () => eventService.getEventsByPerformanceType(performanceType, { limit }),
    staleTime: CACHE_TIMES.events,
    gcTime: CACHE_TIMES.events * 2,
    enabled: !!performanceType,
    ...options,
  });
}

/**
 * Hook to fetch active sponsors with caching
 */
export function useActiveSponsors(
  options?: Omit<UseQueryOptions<Sponsor[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.sponsors.active,
    queryFn: () => SponsorService.getActiveSponsors(),
    staleTime: CACHE_TIMES.sponsors,
    gcTime: CACHE_TIMES.sponsors * 2,
    ...options,
  });
}

// ==================== TESTIMONIALS HOOKS ====================

/**
 * Hook to fetch active testimonials with caching
 */
export function useActiveTestimonials(
  options?: Omit<UseQueryOptions<Testimonial[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.testimonials.active,
    queryFn: () => TestimonialService.getActiveTestimonials(),
    staleTime: CACHE_TIMES.testimonials,
    gcTime: CACHE_TIMES.testimonials * 2,
    ...options,
  });
}
