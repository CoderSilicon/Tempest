"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiRefreshCcw, FiHome } from "react-icons/fi";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#2E3440] text-[#D8DEE9]">
      <div className="max-w-md w-full px-6 py-8 bg-[#3B4252] rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-[#88C0D0] mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-lg mb-6">
          We're sorry, but it seems like we've encountered an unexpected error.
        </p>
        <div className="bg-[#4C566A] p-4 rounded-md mb-6">
          <p className="text-sm font-mono">
            {error.message || "An unexpected error occurred"}
          </p>
          {error.digest && (
            <p className="text-xs mt-2 text-[#81A1C1]">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center bg-[#5E81AC] hover:bg-[#81A1C1] text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            <FiRefreshCcw className="mr-2" />
            Try again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center bg-[#A3BE8C] hover:bg-[#B48EAD] text-[#2E3440] font-bold py-2 px-4 rounded transition duration-300"
          >
            <FiHome className="mr-2" />
            Go back home
          </Link>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-[#81A1C1]">
            If the problem persists, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
