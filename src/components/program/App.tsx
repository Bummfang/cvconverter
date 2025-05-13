import { useState } from 'react';
import { motion } from 'framer-motion';
import PictureMode from '../PictureMode';
import VideoMode from '../VideoMode';

export default function ImageConverter() {
  const [mode, setMode] = useState<'none' | 'image' | 'video'>('video');
  const backToMenu = () => setMode('none');

// Hauptkomponent wird in 3 Sequencen unterteilt und anhand eines states evalluiert welcher komponent gerendert werden soll. 
// es existieren die zustände 'none' | 'image' | 'video'
// bei image wird nur der Bildkonverter gerendert aber nicht der video konverter
// bei video wird nur der Videokonverter gerendert aber nicht der bild konverter
// bei none wird werder der eine noch der andere komponent gerendert 
// sondern eine schlichte auswahlt mit 2 möglichkeiten gerendert. entwerder schaltet man das programm damit in den video oder in den bildmodes.
// man kommt aus beiden zuständen wieder zurück zur Auswahl wo man sich jeweils für einen modi entscheiden kann
  return (
    <div className='w-full min-h-screen bg-black text-white'>
      {mode === 'none' && (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6">
          <p className="text-[2rem] font-bold text-orange-400">Was möchtest du konvertieren?</p>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode('image')}
              className="bg-orange-600 hover:bg-orange-700 min-w-[12rem] hover:cursor-pointer text-white py-3 px-6 rounded-xl font-semibold shadow-lg"
            >
              Ein Bild
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode('video')}
              className="bg-purple-600 hover:bg-purple-700 min-w-[12rem] hover:cursor-pointer text-white py-3 px-6 rounded-xl font-semibold shadow-lg"
            >
              Ein Video
            </motion.button>
          </div>
        </div>
      )}
      {mode === 'image' && (<PictureMode mode={backToMenu}></PictureMode>)}
      {mode === 'video' && (<VideoMode mode={backToMenu}></VideoMode>)}
    </div>
  );
}
