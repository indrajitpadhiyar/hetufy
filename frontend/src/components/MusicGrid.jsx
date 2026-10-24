import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MusicCard from './MusicCard';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import { SearchX } from 'lucide-react';

export default function MusicGrid({
  songs,
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  setSearchQuery,
  currentSong,
  isPlaying,
  onPlaySong,
  onTogglePlay,
  onDownload,
  favorites,
  onToggleFavorite,
  playlists = [],
  onOpenAddToPlaylist,
  theme = 'light'
}) {
  const isDark = theme === 'dark';

  // Filter songs based on search query, category, or active custom playlist
  const filteredSongs = songs.filter((song) => {
    let matchesCategory = false;
    if (activeCategory.startsWith('Playlist: ')) {
      const plName = activeCategory.replace('Playlist: ', '');
      const targetPl = playlists.find(p => p.name === plName);
      matchesCategory = targetPl ? targetPl.songIds.includes(song.id) : false;
    } else {
      matchesCategory = activeCategory === 'All' || song.genre.toLowerCase() === activeCategory.toLowerCase();
    }

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.genre.toLowerCase().includes(query) ||
      song.album.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="library" className="py-12 px-6 md:px-12 max-w-[1400px] mx-auto">
      <div>
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className={`font-serif-editorial text-3xl sm:text-4xl tracking-tight mb-2 font-normal transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-[#1c1b18]'
          }`}>
            Music Archive
          </h2>
          <p className={`text-xs sm:text-sm font-normal transition-colors duration-300 ${
            isDark ? 'text-zinc-400' : 'text-[#7d776f]'
          }`}>
            {activeCategory.startsWith('Playlist: ') 
              ? `Showing tracks in ${activeCategory}`
              : 'Explore recordings, stream high-definition audio, and download original tracks.'}
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          resultCount={filteredSongs.length}
          theme={theme}
        />

        {/* Category Pills */}
        <div className="mb-8 flex justify-center">
          <CategoryFilter 
            categories={categories} 
            activeCategory={activeCategory} 
            onSelectCategory={onSelectCategory} 
            theme={theme}
          />
        </div>

        {/* Music Cards Grid */}
        {filteredSongs.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredSongs.map((song) => (
                <MusicCard
                  key={song.id}
                  song={song}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  onPlaySong={onPlaySong}
                  onTogglePlay={onTogglePlay}
                  onDownload={onDownload}
                  isFavorite={favorites.includes(song.id)}
                  onToggleFavorite={onToggleFavorite}
                  onOpenAddToPlaylist={onOpenAddToPlaylist}
                  theme={theme}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Empty Search State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`editorial-card rounded-2xl p-12 text-center max-w-md mx-auto border ${
              isDark ? 'bg-[#1a1b24] border-white/10 text-white' : 'border-[#d6cfc4]'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDark ? 'bg-white/10 text-zinc-400' : 'bg-[#eee9df] border border-[#d6cfc4] text-[#7d776f]'
            }`}>
              <SearchX className="w-6 h-6" />
            </div>
            <h3 className={`font-serif-editorial text-xl mb-2 font-medium ${isDark ? 'text-white' : 'text-[#1c1b18]'}`}>No compositions found</h3>
            <p className={`text-xs mb-6 font-normal leading-relaxed ${isDark ? 'text-zinc-400' : 'text-[#7d776f]'}`}>
              We couldn't find any songs matching "{searchQuery}". Try adjusting your search keywords or resetting filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                onSelectCategory('All');
              }}
              className={`px-6 py-2.5 rounded-full text-xs font-bold cursor-pointer transition-all shadow-sm ${
                isDark 
                  ? 'bg-amber-400 text-black hover:bg-amber-300' 
                  : 'bg-[#1c1b18] text-[#f6f3eb] hover:bg-black'
              }`}
            >
              Reset Archive Filters
            </button>
          </motion.div>
        )}

      </div>
    </section>
  );
}



