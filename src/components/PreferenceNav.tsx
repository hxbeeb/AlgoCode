'use client';
import { AiOutlineSetting } from "react-icons/ai";
import { BiExitFullscreen, BiFullscreen } from "react-icons/bi";
import { useState } from "react";

export default function PreferenceNav() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const elem = document.documentElement;
    if (!isFullscreen) {
      elem.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="flex items-center justify-between bg-dark-layer-2 h-11 w-full px-4">
      {/* LEFT SIDE */}
      <div className="flex items-center text-white">
        <button
          className="flex items-center cursor-pointer rounded text-left focus:outline-none 
          bg-dark-label-2 hover:bg-dark-fill-2 px-3 py-1.5 font-medium
          bg-[#2C2C2E]  border border-gray-700"
        >
          <span className="text-xs text-dark-label-2">JavaScript</span>
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center space-x-4 text-white">
        {/* Fullscreen Button */}
        <div className="relative group cursor-pointer">
          <button onClick={toggleFullscreen} className="p-2">
            {isFullscreen?<BiExitFullscreen className="text-xl text-dark-label-2 hover:text-white transition"/>:<BiFullscreen className="text-xl text-dark-label-2 hover:text-white transition" />}
          </button>
          <div className="absolute top-full right-0 mt-1 scale-0 group-hover:scale-100 transition-all 
            duration-200 bg-dark-layer-1 text-white text-xs px-2 py-1 rounded shadow-lg z-20 whitespace-nowrap">
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </div>
        </div>

        {/* Settings Button */}
        {/* <div className="relative group cursor-pointer">
          <button className="p-2">
            <AiOutlineSetting className="text-xl text-dark-label-2 hover:text-white transition" />
          </button>
          <div className="absolute top-full right-0 mt-1 scale-0 group-hover:scale-100 transition-all 
            duration-200 bg-dark-layer-1 text-white text-xs px-2 py-1 rounded shadow-lg z-20 whitespace-nowrap">
            Settings
          </div>
        </div> */}
      </div>
    </div>
  );
}
