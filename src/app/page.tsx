"use client";
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";

const socket = io("http://localhost:8900"); // Replace with your server URL

type User = {
  id: string;
  username: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [username, setUsername] = useState("");
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);

  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  useEffect(() => {
    console.log(connectedUsers);
  }, [connectedUsers]);

  const handleFileShare = (id: string) => {
    if (file) {
      const chunkSize = 1024 * 914; // 1 MB chunks (adjust as needed)
      const totalChunks = Math.ceil(file.size / chunkSize);

      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = () => {
        const fileBuffer = reader.result as ArrayBuffer;
        const fileName = file.name;

        console.log("file transferring");
        console.log("Files data", fileBuffer, " File Name", fileName);

        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min((i + 1) * chunkSize, file.size);
          const chunk = fileBuffer.slice(start, end);

          console.log("chunk", chunk);
          setTimeout(() => {
            socket.emit(
              "file-share",
              { id, chunk, index: i, totalChunks, fileName },
              (acknowledgment: any) => {
                if (acknowledgment === "success") {
                  console.log(
                    `Chunk ${i + 1}/${totalChunks} sent successfully.`
                  ); // Reset the file input and progress bar
                  setFile(null);
                  setProgress(0);
                } else {
                  console.log(`Failed to send chunk ${i + 1}/${totalChunks}.`);
                }
              }
            );
          }, 3000);
        }
      };
    }
  };

  useEffect(() => {
    socket.on("file-chunk", ({ chunk, index, totalChunks }: any) => {
      // Handle incoming chunks and update the progress bar
      // Here, you can save or display the received chunks as needed
      // Update the progress bar based on the index and totalChunks
      console.log("file chunk", chunk, index, totalChunks);
      const newProgress = ((index + 1) / totalChunks) * 100;
      setProgress(newProgress);
    });

    return () => {
      socket.off("file-chunk");
    };
  }, []);

  useEffect(() => {
    socket.on("newUsers", (users) => {
      setConnectedUsers(users);
    });

    return () => {
      socket.off("newUsers");
    };
  }, []);

  useEffect(() => {
    const prompt_username = prompt("Enter Your username to continue");
    if (!prompt_username) {
      router.push("/nousername");
    } else {
      setUsername(prompt_username);
      console.log("socketid", prompt_username);
      socket.emit("addUser", prompt_username);
    }
  }, []);

  return (
    <main className="flex justify-center items-center">
      {username ? (
        <div className="my-10">
          <h1>Real-Time File Sharing App</h1>
          <input type="file" onChange={handleFileChange} />
          {progress === 0
            ? connectedUsers.map((user) => {
                console.log(socket.id);
                return user.id !== socket.id ? (
                  <div className="my-4 p-4 bg-slate-400 flex justify-between">
                    <span className="text-2xl">{user.username}</span>
                    <button
                      onClick={() => handleFileShare(user.id)}
                      className=" mx-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 hover:text-white"
                    >
                      Share File
                    </button>
                  </div>
                ) : null;
              })
            : null}
          <div>
            {progress > 0 && (
              <div>
                <p>File Transfer Progress: {progress.toFixed(2)}%</p>
                <progress value={progress} max={100} />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
