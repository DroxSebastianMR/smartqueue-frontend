import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CinemaSearchFilters } from '@/features/home/types/home.types';

interface HomeSelectionState extends CinemaSearchFilters {
  appliedFilters: CinemaSearchFilters | null;
  setMovieSlug: (movieSlug: string) => void;
  setCity: (city: string) => void;
  setCinemaSlug: (cinemaSlug: string) => void;
  setDate: (date: string) => void;
  applyFilters: () => void;
}

export const useHomeSelectionStore = create<HomeSelectionState>()(
  persist(
    (set, get) => ({
      movieSlug: '',
      city: '',
      cinemaSlug: '',
      date: '',
      appliedFilters: null,
      setMovieSlug: (movieSlug) => set({ movieSlug }),
      setCity: (city) => set({ city, cinemaSlug: '' }),
      setCinemaSlug: (cinemaSlug) => set({ cinemaSlug }),
      setDate: (date) => set({ date }),
      applyFilters: () => {
        const { movieSlug, city, cinemaSlug, date } = get();
        set({ appliedFilters: { movieSlug, city, cinemaSlug, date } });
      },
    }),
    { name: 'cinetrux.home-selection', partialize: (state) => ({ cinemaSlug: state.cinemaSlug, city: state.city }) },
  ),
);
