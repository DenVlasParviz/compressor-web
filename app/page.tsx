import Image from "next/image";
import {FileUploader} from "@/components/fileUploader";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#202225] via-[#2f3136] to-[#36393f] relative overflow-hidden">
      <header className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#5865f2] to-[#7289da] rounded-2xl mb-6 shadow-2xl">
          <svg
            className="w-8 h-8 text-white"
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
        </div>
        <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
          Video Compressor
        </h1>
        <p className="text-[#b9bbbe] text-lg font-medium">
          Сжимайте видео быстро и качественно
        </p>
      </header>

      {/*Loading section*/}
      <FileUploader />
    </div>
  );
}
