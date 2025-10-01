import {ConversionSettings} from "@/components/Types";

export function buildFfmpegArgs(settings: ConversionSettings, videoKbps: number) {
    const args: string[] = [
        '-i', 'input.mp4',

        '-c:v', settings.videoCodec || 'libx264',

        // ВАЖНО: Вместо -crf используем рассчитанный битрейт.
        '-b:v', `${videoKbps}k`,
        // НЕ используем -maxrate и -bufsize, так как они замедляли.

        // СОХРАНЯЕМ ВСЕ УСКОРЯЮЩИЕ ПАРАМЕТРЫ:
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-x264-params', 'keyint=999:min-keyint=999:scenecut=0',

        // АУДИО
        '-c:a', settings.audioCodec || 'aac',
        '-b:a', '96k', // Или '128k', если качество аудио критично

        // ФОРМАТ
        '-movflags', '+faststart',

        // -threads 0 остается удаленным
    ];

    // Добавляем масштабирование если нужно
    if (settings.resolution) {
        const width = parseInt(settings.resolution.split('x')[0], 10);
        args.splice(2, 0, '-vf', `scale='min(${width},iw)':-2`);
    }

    args.push('output.mp4');

    return args;
}