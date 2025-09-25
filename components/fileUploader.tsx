"use client";
import { ChangeEvent, useState } from "react";
import axios from "axios";

export const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);

  type uploadStatus = "idle" | "uploading" | "success" | "error";
  const [status,setStatus] = useState<uploadStatus>('idle');
  const [uploadProgress,setUploadProgress] = useState(0);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  }
  async function handleFileUpload() {
      if (!file) return;
      setStatus('uploading');
      setUploadProgress(0);
      const formData = new FormData();
      formData.append('file', file);
      try{
          await axios.post(`${process.env.REACT_APP_API_URL}/upload`, formData,{
             headers:{

                 'Content-type': ' multipart/form-data',
             },
              onUploadProgress:(progressEvent)=>{
                 const progress = progressEvent.total ?
                     Math.round((progressEvent.loaded*100)/progressEvent.total)
                     : 0;
                 setUploadProgress(progress)
              }
          });
          setStatus('success');
          setUploadProgress(100);
      }catch(e){
          setStatus('error');
          setUploadProgress(0);
          console.log("error uploading:",e)
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

        <div className="relative w-80 h-80 border-2 border-dashed border-[#4f545c] rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br from-[#2f3136]/60 to-[#36393f]/60 backdrop-blur-sm cursor-pointer hover:border-[#5865f2]/70 hover:bg-[#5865f2]/5 transition-all duration-300 group-hover:scale-105">
          <div className="text-center px-6">
            {!file && (
              <>
                <p className="text-xl font-semibold mb-2 text-white group-hover:text-[#5865f2] transition-colors duration-300">
                  Перетащи файл сюда
                </p>
                <p className="text-[#b9bbbe] text-sm font-medium">
                  или нажми для выбора
                </p>
                <p className="text-[#72767d] text-xs mt-2">
                  MP4, AVI, MOV, MKV • до 2GB
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
                onClick={handleFileUpload}
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
        {status === 'uploading'&&(
            <div className='space-y-2'>
<div className='h-2.5 w-full rounded-full bg-gray-200'>
 <div className='h-2.5 rounded-full bg-blue-600 transition-all duration-300' style={{width:`${uploadProgress}%`}}>

 </div>
    <p className='text-sm text-gray-600'>
        {uploadProgress}% uploaded
    </p>
</div>
            </div>
        )}
<div>
    {status === "success" && (
        <p className="text-[#b9bbbe] text-sm font-medium">
            success
        </p>
    )}
    {status === "error" && (
        <p className="text-[#b9bbbe] text-sm font-medium">
            error
        </p>
    )}
</div>
    </div>
  );
};

