// utils/ffmpegLoader.ts
// utils/ffmpegLoader.ts
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

export async function convertVideo(file: File, outputFormat = 'webm'): Promise<{ url: string; name: string }> {
  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  const inputName = file.name;
  const outputName = `output.${outputFormat}`;

  ffmpeg.FS('writeFile', inputName, await fetchFile(file));
  await ffmpeg.run('-i', inputName, outputName);

  const data = ffmpeg.FS('readFile', outputName);
  const url = URL.createObjectURL(new Blob([data.buffer], { type: `video/${outputFormat}` }));

  return { url, name: outputName };
}
