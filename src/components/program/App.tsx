import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import { useDropzone } from 'react-dropzone';


export default function ImageConverter() {
  const [quality, setQuality] = useState(80);
  const [convertedURL, setConvertedURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

const options = {
  maxSizeMB: 5,
  maxWidthOrHeight: 1920, // erzwingt Resize
  useWebWorker: true,
  fileType: 'image/webp',
  initialQuality: quality / 100,
  alwaysKeepResolution: false, // wichtig
};


    try {
      setIsLoading(true);
      const compressedFile = await imageCompression(file, options);
      const url = URL.createObjectURL(compressedFile);
      setConvertedURL(url);
    } catch (err) {
      console.error('Fehler beim Komprimieren:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png'] },
  });

  return (
    <div className='w-full h-screen bg-black'>
      <p className='text-[#5c5c5c] font-bold text-[2rem] text-center pt-10'>Cottbusverkehr Picture Converter</p>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 max-w-xl mx-auto  text-white"
    >
      <motion.div
        {...getRootProps({ refKey: 'ref' })}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${isDragActive
            ? 'border-orange-400 bg-orange-900/20'
            : 'border-gray-600 bg-gray-800 hover:bg-gray-700/50'
          }`}
      >
        <input {...getInputProps()} />
        <p className="text-orange-300 font-medium">
          {isDragActive ? '📂 Datei hier ablegen …' : 'Ziehe dein Bild hierher oder klicke zum Hochladen'}
        </p>
        <p className="text-xs text-gray-400 mt-2">Unterstützt: .jpg, .jpeg, .png → .webp</p>
      </motion.div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Kompressionsrate: <span className="font-bold text-orange-400">{quality}%</span>
        </label>

        
        <p className=''></p>
        <motion.input
          type="range"
          min="10"
          max="100"
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          whileHover={{ scale: 1.01 }}
          className="w-full accent-orange-500"
        />
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 text-center text-sm text-gray-400"
          >
            ⏳ Bild wird konvertiert …
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {convertedURL && !isLoading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="mt-6 text-center"
          >
            <p className="text-orange-400 font-semibold">✅ Bild erfolgreich konvertiert!</p>
            <a
              href={convertedURL}
              download="converted.webp"
              className="mt-3 inline-block bg-orange-500 hover:bg-orange-600 transition-colors text-white font-semibold py-2 px-5 rounded-xl shadow-lg"
            >
              WebP herunterladen
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </div>
  );
}
