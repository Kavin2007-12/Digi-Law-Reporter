import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, FileText, Users, Library, Type } from 'lucide-react';

export default function SearchDashboard() {
  const navigate = useNavigate();
  
  const TILES = [
    { id: 1, title: 'Keyword Search', icon: Search, color: 'from-blue-600 to-blue-800', path: '/search/keyword?tab=keyword' },
    { id: 2, title: 'Find Content by Section', icon: BookOpen, color: 'from-blue-500 to-blue-700', path: '/search/keyword?tab=section' },
    { id: 3, title: 'Find by Citation', icon: FileText, color: 'from-blue-600 to-blue-800', path: '/search/keyword?tab=citation' },
    { id: 4, title: 'Find by Party Name', icon: Users, color: 'from-blue-700 to-blue-900', path: '/search/keyword?tab=party' },
    { id: 5, title: 'Find by Topic', icon: Library, color: 'from-blue-500 to-blue-700', path: '/search/keyword?tab=topic' },
    { id: 6, title: 'Words and Phrases', icon: Type, color: 'from-blue-600 to-blue-800', path: '/search/keyword?tab=phrase' },
  ];

  const handleTileClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center pt-12 md:pt-16 lg:pt-20 pb-12 md:pb-20 px-4 md:px-6 w-full min-h-[calc(100vh-64px)] overflow-hidden font-jakarta bg-slate-50">
      
      {/* Exact User Uploaded Legal Search Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100 pointer-events-none"
        style={{ backgroundImage: "url('/legal_search_bg.png')" }}
      ></div>

      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center my-auto">
        
        {/* Dashboard Header */}
        <div className="text-center mb-6 md:mb-8 w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-1.5 tracking-tight font-cinzel">
            Legal Research Dashboard
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm font-medium">
            Select a search method to begin your research
          </p>
        </div>

        {/* Grid Layout Pushed Down Vertically */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4 md:gap-5 w-full max-w-3xl mx-auto mt-2 sm:mt-4">
          {TILES.map((tile, index) => (
            <motion.div
              key={tile.id}
              onClick={() => handleTileClick(tile.path)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
              className={`
                relative overflow-hidden cursor-pointer group
                rounded-xl shadow-md hover:shadow-xl
                bg-gradient-to-br ${tile.color}
                flex flex-col items-center justify-center p-3.5 sm:p-4 text-center
                min-h-[110px] sm:min-h-[125px] md:min-h-[135px]
                border border-white/20 transition-all duration-300
              `}
              whileTap={{ scale: 0.98 }}
            >
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
              
              {/* Compact Icon Badge */}
              <div className="bg-white/20 p-2 sm:p-2.5 rounded-full mb-2 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <tile.icon size={19} className="text-white" strokeWidth={2.2} />
              </div>
              
              {/* Title */}
              <h3 className="text-white font-extrabold text-xs sm:text-sm leading-snug drop-shadow-xs px-1">
                {tile.title}
              </h3>
            </motion.div>
          ))}
        </div>
        
      </div>

    </div>
  );
}
