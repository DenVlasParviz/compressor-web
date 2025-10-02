"use client";
import {ChangeEvent, useEffect, useState} from "react";
import axios from "axios";
import {FFmpeg} from '@ffmpeg/ffmpeg'
import {fetchFile, toBlobURL} from '@ffmpeg/util'
import {CopyButton} from "@/components/ui/shadcn-io/copy-button/index";
import {calculateVideoBitrateKbps} from "@/components/compression/bitrate";
import {buildFfmpegArgs} from "@/components/compression/ffmpegArgs";
import {defaultSettings} from "@/components/Types";

export const FileUploader = () => {


    const [file, setFile] = useState<File | null>(null);
    const [link, setLink] = useState("");
    type uploadStatus = "idle" | "uploading" | "compressing" | "success" | "error";
    const [status, setStatus] = useState<uploadStatus>("idle");
    const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [progress, setProgress] = useState(0);

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    }

    useEffect(() => {
        const loadFFmpegModule = async () => {
            if (typeof window !== "undefined") {
                const {FFmpeg} = await import("@ffmpeg/ffmpeg");
                setFFmpeg(new FFmpeg());
            }
        };
        loadFFmpegModule();
    }, []);

    async function loadFFmpeg() {
        if (!ffmpeg) return;

        if (ffmpegLoaded) return;
        await ffmpeg.load({
            coreURL: '/ffmpeg-core.js',
            wasmURL: '/ffmpeg-core.wasm',
        });
        setFfmpegLoaded(true);
    }


    async function getVideoDuration(file: File): Promise<number> {
        return new Promise((resolve) => {
            const url = URL.createObjectURL(file);
            const video = document.createElement("video");
            video.preload = "metadata";
            video.src = url;
            video.onloadedmetadata = () => {
                const d = video.duration || 0;
                URL.revokeObjectURL(url);
                resolve(d);
            };
            video.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(60);
            };
        });
    }

    async function handleCompress() {
        if (!file || !ffmpeg) return;

        try {
            setStatus("compressing");
            setProgress(0);
            await loadFFmpeg();

            ffmpeg.on("progress", ({progress: p}) => {
                setProgress(Math.round(p * 100));
            });
            await ffmpeg.writeFile("input.mp4", await fetchFile(file));
            const duration = await getVideoDuration(file);
            const videoKbps = calculateVideoBitrateKbps({
                targetMb: 9,
                durationSec: duration,
                audioKbps: 128,
                safetyMargin: 0.95,
                minVideoKbps: 200,
            });
            const args = buildFfmpegArgs(defaultSettings, videoKbps);
            await ffmpeg.exec(args)

            const data = await ffmpeg.readFile("output.mp4");
            const compressedFile = new File(
                [data.slice()],
                `compressed-${Date.now()}.mp4`,
                {type: "video/mp4"}
            );
            const sizeBytes = compressedFile.size;
            const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
            const sizeKB = (sizeBytes / 1024).toFixed(0);
            console.log(`✅ Compressed File Size: ${sizeMB} MB`);
            await ffmpeg.deleteFile("input.mp4");
            await ffmpeg.deleteFile("output.mp4");
            setStatus("uploading");
            const formData = new FormData();
            formData.append("video", compressedFile);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BOT_URL}/api/send-video`, formData, {});
            const fileUrl: string = response.data.fileUrl;
            setLink(fileUrl)
            setStatus("success");
        } catch (err) {
            console.error(err);
            setStatus("error");
        }
    }

    async function handleFileUpload() {
        if (!file) return;
        setStatus("uploading");
        setUploadProgress(0);
        const formData = new FormData();
        formData.append("file", file);
        const targetSize = "9";
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/compressor?targetSize=${targetSize}`,
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        const progress = progressEvent.total
                            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                            : 0;
                        setUploadProgress(progress);
                    },
                },
            );
            setStatus("success");
            setLink(response.data.videoLink);
            setUploadProgress(100);
        } catch (e) {
            setStatus("error");
            setUploadProgress(0);
            console.log("error uploading:", e);
        }
    }

    return (
        <div className="mt-20 flex flex-col items-center gap-4">
            {/* File Drop Zone */}
            <label htmlFor="fileInput" className="relative group cursor-pointer">
                <input
                    id="fileInput"
                    type="file"
                    accept="video/mp4,video/avi,video/mov,video/mkv"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div
                    className="relative w-80 h-80 border-2 border-dashed border-[#4f545c] rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br from-[#2f3136]/60 to-[#36393f]/60 backdrop-blur-sm cursor-pointer hover:border-[#5865f2]/70 hover:bg-[#5865f2]/5 transition-all duration-300 group-hover:scale-105">
                    <div className="text-center px-6">
                        {!file && (
                            <>
                                <p className="text-xl font-semibold mb-2 text-white group-hover:text-[#5865f2] transition-colors duration-300">
                                    Drag and drop a video file here
                                </p>
                                <p className="text-[#b9bbbe] text-sm font-medium">
                                    or click to select
                                </p>
                            </>
                        )}
                        {file && (
                            <>
                                <p
                                    className="text-xl font-semibold mb-2 text-white group-hover:text-[#5865f2] transition-colors duration-300 truncate text-center max-w-[calc(320px-1.5rem)] overflow-hidden"
                                    title={file.name}
                                >
                                    {file.name}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </label>

            {/* Compress Button */}
            {file && status !== "uploading" && (
                <button
                    onClick={handleCompress}
                    className="px-12 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-lg transform transition-all rounded-xl duration-300 hover:shadow-xl overflow-hidden hover:scale-105"
                >
                    <div className="relative flex items-center justify-center gap-3">
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                            />
                        </svg>
                        <span>Compress</span>
                    </div>
                </button>
            )}
            {status === "uploading" && (
                <div className="space-y-2">
                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                        <div
                            className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
                            style={{width: `${uploadProgress}%`}}
                        ></div>
                        <p className="text-sm text-gray-600">{uploadProgress}% uploaded</p>
                    </div>
                </div>
            )}
            {status === "compressing" && (
                <div className="space-y-2">
                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                        <div
                            className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
                            style={{width: `${progress}%`}}
                        ></div>
                        <p className="text-sm text-gray-600">{progress}% compressed</p>
                    </div>
                </div>

            )}
            {link && (
                <div className="flex flex-col items-center ">
                    <div className=" flex gap-1 items-end">

                    <span className="px-3 py-2 bg-blue-600  text-gray-200 rounded-xl">
                {link.slice(0, 40)}...
              </span>

                        <CopyButton size="md"
                            className=""
                            content={link}
                        />
                    </div>

                </div>
            )}
            <div>
                {status === "success" && (
                    <p className="text-[#b9bbbe] text-sm font-medium">success</p>
                )}
                {status === "error" && (
                    <p className="text-[#b9bbbe] text-sm font-medium">error</p>
                )}
            </div>

            <div>

            </div>
        </div>
    );
};
