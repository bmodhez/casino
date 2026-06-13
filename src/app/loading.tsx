export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo/Spinner */}
        <div className="relative mb-8">
          {/* Outer Ring - Spinning border */}
          <div className="w-32 h-32 border-4 border-transparent border-t-blue-500 border-r-red-500 rounded-full animate-spin mx-auto"></div>
          
          {/* Logo in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src="/arenalogo.png" 
              alt="MinesArena" 
              className="w-16 h-16 object-contain animate-pulse"
            />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">
          Loading
        </h2>
        <p className="text-slate-400 text-sm">
          Preparing your gaming experience...
        </p>

        {/* Dots Animation */}
        <div className="flex gap-2 justify-center mt-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
