import React from "react";
import Link from "next/link";
function NoUsername() {
  return (
    <div className="flex justify-center items-center h-[100vh] w-[100vw] flex-col">
      <span>You should provide username to continue, Ready to provide</span>
      <Link
        href={"/"}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 hover:text-white"
      >
        Click Here
      </Link>
    </div>
  );
}

export default NoUsername;
