/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Maximize,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const InteractiveVirtualGallery = ({
  title = "360° Virtual Gallery Preview",
  subtitle = "Interactive Museum Experience",
  description = "Explore our museum spaces with this interactive 360° viewer. Click and drag to look around, or use the navigation controls.",
  // onLaunch = () => console.log('Launch experience')
}) => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const viewerRef = useRef(null);
  const imageRef = useRef(null);
  const autoRotateRef: any = useRef(null);

  // Museum scenes data
  const scenes = [
    {
      id: 1,
      name: "Traditional Artifacts Gallery",
      image: "/aws-1.jpeg", // Your first panoramic image
      description: "Discover traditional Filipino tools and artifacts that showcase our rich cultural heritage.",
      hotspots: [
        { x: 30, y: 45, title: "Traditional Boats", description: "Historic Filipino watercraft models" },
        { x: 70, y: 35, title: "Farming Tools", description: "Ancient agricultural implements" },
        { x: 85, y: 60, title: "Cultural Artifacts", description: "Traditional household items" }
      ]
    },
    {
      id: 2,
      name: "Heritage Documentation Center",
      image: "/aws-2.jpeg", // Your second panoramic image
      description: "Explore our collection of historical documents, photographs, and memorabilia.",
      hotspots: [
        { x: 25, y: 40, title: "Historical Records", description: "Important documents and manuscripts" },
        { x: 60, y: 50, title: "Photo Collection", description: "Vintage photographs of Rizal" },
        { x: 80, y: 30, title: "Interactive Displays", description: "Digital heritage exhibits" }
      ]
    }
  ];

  const currentSceneData = scenes[currentScene];

  // Auto-rotation effect
  useEffect(() => {
    if (isPlaying && !isDragging) {
      autoRotateRef.current = setInterval(() => {
        setRotation(prev => ({
          ...prev,
          y: prev.y + 0.5
        }));
      }, 50);
    } else {
      clearInterval(autoRotateRef.current);
    }
    
    return () => clearInterval(autoRotateRef.current);
  }, [isPlaying, isDragging]);

  // Handle mouse/touch interactions
  const handleMouseDown = (e: any) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX || e.touches?.[0]?.clientX,
      y: e.clientY || e.touches?.[0]?.clientY
    });
    setIsPlaying(false);
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging) return;
    
    const currentX = e.clientX || e.touches?.[0]?.clientX;
    const currentY = e.clientY || e.touches?.[0]?.clientY;
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    setRotation(prev => ({
      x: Math.max(-45, Math.min(45, prev.x - deltaY * 0.5)),
      y: prev.y + deltaX * 0.5
    }));
    
    setDragStart({ x: currentX, y: currentY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle wheel zoom
  const handleWheel = (e: any) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const resetView = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
    setIsPlaying(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const nextScene = () => {
    setCurrentScene((prev) => (prev + 1) % scenes.length);
    setIsLoading(true);
  };

  const prevScene = () => {
    setCurrentScene((prev) => (prev - 1 + scenes.length) % scenes.length);
    setIsLoading(true);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="py-24 bg-gradient-to-b from-white to-gray-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4"
          >
            {subtitle}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-[#492309] mt-2 mb-4"
          >
            {title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            {description}
          </motion.p>
        </div>

        {/* Viewer Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`relative bg-white shadow-2xl rounded-2xl overflow-hidden ${
            isFullscreen ? 'fixed inset-4 z-50' : 'aspect-video max-w-6xl mx-auto'
          }`}
        >
          {/* Loading State */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10"
              >
                <div className="text-center text-white">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
                  />
                  <p>Loading {currentSceneData.name}...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 360° Image Viewer */}
          <div
            ref={viewerRef}
            className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onWheel={handleWheel}
          >
            <motion.img
              ref={imageRef}
              src={currentSceneData.image}
              alt={currentSceneData.name}
              className="w-full h-full object-cover select-none"
              style={{
                transform: `scale(${zoom}) rotateY(${rotation.y}deg) rotateX(${rotation.x}deg)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
              }}
              onLoad={handleImageLoad}
              onError={() => setIsLoading(false)}
              draggable={false}
            />

            {/* Hotspots */}
            {!isLoading && currentSceneData.hotspots.map((hotspot, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`
                }}
              >
                <div className="w-6 h-6 bg-amber-500 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                    <div className="font-semibold">{hotspot.title}</div>
                    <div className="text-xs opacity-80">{hotspot.description}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <h3 className="text-white font-semibold">{currentSceneData.name}</h3>
              <p className="text-white/80 text-sm">{currentSceneData.description}</p>
            </div>
            
            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="bg-black/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-black/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Scene Navigation */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
            <button
              onClick={prevScene}
              className="bg-black/20 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-black/30 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
            <button
              onClick={nextScene}
              className="bg-black/20 backdrop-blur-sm text-white p-3 rounded-lg hover:bg-black/30 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Control Panel */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl px-6 py-3 flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:text-amber-400 transition-colors p-2"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <button
                onClick={resetView}
                className="text-white hover:text-amber-400 transition-colors p-2"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-white hover:text-amber-400 transition-colors p-2"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-amber-400 transition-colors p-2"
              >
                <Maximize className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="text-white hover:text-amber-400 transition-colors p-2"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scene Indicators */}
          <div className="absolute bottom-4 right-4 z-20">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 flex gap-2">
              {scenes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentScene(index);
                    setIsLoading(true);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentScene ? 'bg-amber-400' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Instructions */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute top-20 left-4 right-4 z-20"
              >
                <div className="bg-black/80 backdrop-blur-sm text-white rounded-lg p-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Navigation className="w-5 h-5" />
                    How to Navigate
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="mb-2"><strong>Mouse/Touch:</strong> Click and drag to look around</p>
                      <p className="mb-2"><strong>Scroll:</strong> Zoom in and out</p>
                      <p><strong>Auto-rotate:</strong> Click play button for automatic rotation</p>
                    </div>
                    <div>
                      <p className="mb-2"><strong>Arrows:</strong> Navigate between gallery sections</p>
                      <p className="mb-2"><strong>Hotspots:</strong> Hover over yellow dots for information</p>
                      <p><strong>Fullscreen:</strong> Expand for immersive experience</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Launch Full Experience Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          {/* <button
            onClick={onLaunch}
            className="bg-[#492309] hover:bg-[#492309]/90 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-3"
          >
            <Eye className="w-6 h-6" />
            Explore Full Virtual Tour
          </button> */}
          <p className="text-gray-600 mt-4 max-w-md mx-auto text-sm">
            Experience all our museum galleries with full navigation, audio guides, and interactive features
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default InteractiveVirtualGallery;
