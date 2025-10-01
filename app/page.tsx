import Image from "next/image";
import { FileUploader } from "@/components/fileUploader";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#202225] via-[#2f3136] to-[#334534] relative overflow-hidden">
      <header className="text-center mb-16 mt-15">
        <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
          Video Compressor
        </h1>
        <p className="text-[#b9bbbe] text-lg font-medium">
          Compress video for discord and get a link
        </p>
      </header>

      {/*Loading section*/}
      <FileUploader />
    </div>
  );
}
