import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import { useDropzone } from 'react-dropzone';

type HistoryEntry = {
  name: string;
  originalSize: number;
  compressedSize: number;
  savings: string;
  url: string;
};

export default function ImageConverter() {
  const [quality, setQuality] = useState(80);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [convertedURL, setConvertedURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setOriginalFile(file);
    setOriginalSize(file.size);
    setConvertedURL(null);
    setCompressedSize(null);
  };

  const compressImage = async () => {
    if (!originalFile) return;

    const options = {
      maxSizeMB: 5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: quality / 100,
      alwaysKeepResolution: false,
    };

    try {
      setIsLoading(true);
      const compressed = await imageCompression(originalFile, options);
      const savings = 100 - (compressed.size / originalFile.size) * 100;
      const compressedURL = URL.createObjectURL(compressed);

      setCompressedSize(compressed.size);
      setConvertedURL(compressedURL);

      setHistory((prev) => [
        ...prev,
        {
          name: originalFile.name,
          originalSize: originalFile.size,
          compressedSize: compressed.size,
          savings: savings.toFixed(1) + '%',
          url: compressedURL,
        },
      ]);
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

  const formatSize = (bytes: number | null) => {
    return bytes !== null ? (bytes / 1024).toFixed(2) + ' KB' : '–';
  };

  const calculateSavings = () => {
    if (originalSize && compressedSize) {
      const savings = 100 - (compressedSize / originalSize) * 100;
      return savings.toFixed(1) + '%';
    }
    return null;
  };

  return (
    <div className='w-full min-h-screen bg-black'>
      <p className='text-[#5c5c5c] font-bold text-[2rem] text-center pt-10'>Cottbusverkehr Picture Converter</p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 max-w-xl mx-auto text-white"
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

        {originalFile && (
          <div className="mt-6 text-sm text-gray-300">
            <p><strong>Dateiname:</strong> {originalFile.name}</p>
            <p><strong>Originalgröße:</strong> {formatSize(originalSize)}</p>
          </div>
        )}

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Kompressionsrate: <span className="font-bold text-orange-400">{quality}%</span>
          </label>
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

        {originalFile && (
          <motion.button
            onClick={compressImage}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-xl font-semibold shadow-lg"
          >
            Bild komprimieren
          </motion.button>
        )}

        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-center text-sm text-gray-400"
            >
              ⏳ Bild wird komprimiert …
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
              <p className="text-orange-400 font-semibold">✅ Bild erfolgreich komprimiert!</p>
              <p className="text-sm text-gray-400 mt-2">
                Neue Größe: <strong>{formatSize(compressedSize)}</strong>
                {calculateSavings() && ` (Ersparnis: ${calculateSavings()})`}
              </p>
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
      {/* Upload-Historie */}
      {history.length > 0 && (
        <div className="mt-10 max-w-5xl mx-auto px-6">
          <h2 className="text-orange-400 text-lg font-semibold mb-4 text-center">🕓 Upload-Historie</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400 border border-gray-700">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-4 py-2">Dateiname</th>
                  <th className="px-4 py-2">Original</th>
                  <th className="px-4 py-2">Komprimiert</th>
                  <th className="px-4 py-2">Ersparnis</th>
                  <th className="px-4 py-2">Download</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => (
                  <tr key={index} className="border-t border-gray-700 hover:bg-gray-800 transition">
                    <td className="px-4 py-2">{entry.name}</td>
                    <td className="px-4 py-2">{formatSize(entry.originalSize)}</td>
                    <td className="px-4 py-2">{formatSize(entry.compressedSize)}</td>
                    <td className="px-4 py-2">{entry.savings}</td>
                    <td className="px-4 py-2">
                      <a
                        href={entry.url}
                        download={`converted-${index}.webp`}
                        className="text-orange-400 hover:underline"
                      >
                        ⬇️
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
