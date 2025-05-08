import { useState } from 'react';
import { motion } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import { useDropzone } from 'react-dropzone';


type ImageItem = {
  file: File;
  id: string;
  originalSize: number;
  compressedSize?: number;
  convertedURL?: string;
  progress: number;
  status: 'idle' | 'compressing' | 'done' | 'error';
};

export default function ImageConverter() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState(80);
  const [history, setHistory] = useState<any[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    const newItems: ImageItem[] = acceptedFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
      originalSize: file.size,
      progress: 0,
      status: 'idle',
    }));
    setImages((prev) => [...prev, ...newItems]);
  };

  const clearAll = () => {
    setImages([]);
    setHistory([]);
  }



  const compressAllImages = async () => {
    const updated = [...images];

    await Promise.all(
      updated.map(async (img, index) => {
        img.status = 'compressing';
        setImages([...updated]);

        const options = {
          maxSizeMB: 5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp',
          initialQuality: quality / 100,
          alwaysKeepResolution: false,
          onProgress: (progress: number) => {
            updated[index].progress = progress;
            setImages([...updated]);
          },
        };

        try {
          const compressed = await imageCompression(img.file, options);
          const url = URL.createObjectURL(compressed);
          const savings = 100 - (compressed.size / img.originalSize) * 100;

          updated[index] = {
            ...img,
            compressedSize: compressed.size,
            convertedURL: url,
            progress: 100,
            status: 'done',
          };

          setHistory((prev) => [
            ...prev,
            {
              name: img.file.name,
              originalSize: img.originalSize,
              compressedSize: compressed.size,
              savings: savings.toFixed(1) + '%',
              url,
            },
          ]);
        } catch (error) {
          console.error('Fehler:', error);
          updated[index].status = 'error';
        }
        setImages([...updated]);
      })
    );
  };

  const formatSize = (bytes: number | undefined) => {
    return bytes !== undefined ? (bytes / 1024).toFixed(2) + ' KB' : '–';
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png'] },
    multiple: true,
  });

  return (
    <div className='w-full min-h-screen bg-black text-white'>
      <p className='text-[#5c5c5c] font-bold text-[2rem] text-center pt-10'>Cottbusverkehr Bildkonverter</p>

      <div className="p-6 max-w-4xl mx-auto">
        <div {...getRootProps()}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${isDragActive
              ? 'border-orange-400 bg-orange-900/20'
              : 'border-gray-600 bg-gray-800 hover:bg-gray-700/50'
              }`}
          >
            <input {...getInputProps()} /> 

            <p className="text-orange-300 font-medium">
              {isDragActive ? '📂 Dateien hier ablegen …' : 'Ziehe deine Bilder hierher oder klicke zum Hochladen'}
            </p>
            <p className="text-xs text-gray-400 mt-2">Mehrfachauswahl möglich. Unterstützt: .jpg, .jpeg, .png → .webp</p>
          </motion.div>
        </div>

        {images.length > 0 ? (
          <>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Qualität: <span className="font-bold text-orange-400">{quality}%</span>
              </label>
              <motion.input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <motion.button
              onClick={compressAllImages}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-6 w-full bg-orange-600 hover:cursor-pointer hover:bg-orange-700 text-white py-2 rounded-xl font-semibold shadow-lg"
            >
              Alle Bilder komprimieren
            </motion.button>

            {/*clear button*/}
            <div className='w-full mt-5 flex justify-center items-center'>
            <motion.button
              onClick={clearAll}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-6 w-[10rem] bg-orange-600 hover:cursor-pointer hover:bg-orange-700 text-white py-2 rounded-xl font-semibold shadow-lg"
            >
              Säubern
            </motion.button>
            </div>
          </>
        ):<p className='w-full text-center mt-10 text-gray-500 font-bold'>Keine Bilder erkannt</p>}

        {images.map((img) => (
          <div key={img.id} className="mt-6 border border-gray-700 rounded-lg p-4 bg-gray-800">
            <p><strong>Dateiname:</strong> {img.file.name}</p>
            <p><strong>Originalgröße:</strong> {formatSize(img.originalSize)}</p>
            {img.compressedSize && (
              <>
                <p><strong>Neue Größe:</strong> {formatSize(img.compressedSize)}</p>
                <p><strong>Ersparnis:</strong> {(100 - (img.compressedSize / img.originalSize) * 100).toFixed(1)}%</p>
              </>
            )}
            <div className="h-2 bg-gray-700 rounded mt-2">
              <div
                className={`h-2 rounded ${img.status === 'done' ? 'bg-green-500' : img.status === 'error' ? 'bg-red-500' : 'bg-orange-500'
                  }`}
                style={{ width: `${img.progress}%` }}
              />
            </div>
            {img.status === 'done' && img.convertedURL && (
              <a
                href={img.convertedURL}
                download={`converted-${img.file.name.replace(/\.[^/.]+$/, '')}.webp`}

                className="mt-3 inline-block bg-orange-500 hover:bg-orange-600 transition-colors text-white font-semibold py-2 px-5 rounded-xl shadow-lg"
              >
                WebP herunterladen
              </a>
            )}
            {img.status === 'error' && (
              <p className="text-red-400 mt-2">❌ Fehler bei der Komprimierung</p>
            )}
          </div>
        ))}

        {/* Historie */}
        {history.length > 0 && (
          <div className="mt-10">
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
                          download={`converted-${entry.name.replace(/\.[^/.]+$/, '')}.webp`}
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
    </div>
  );
}
