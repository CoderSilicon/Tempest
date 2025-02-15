import Link from "next/link";
import { FiHome, FiSearch } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="h-screen fixed top-0 left-0 w-full flex items-center justify-center bg-[#2E3440] text-[#D8DEE9] ">
      <div className="max-w-md w-full px-6 py-8 bg-[#3B4252] rounded-lg shadow-xl mx-8">
        <h1 className="text-4xl font-bold text-[#88C0D0] mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-lg mb-6">
          Oops! It seems like you've ventured into uncharted territory.
        </p>
        <div className="bg-[#4C566A] p-4 rounded-md mb-6">
          <p className="text-sm font-mono">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col space-y-4">
          <Link
            href="/"
            className="flex items-center justify-center bg-[#5E81AC] hover:bg-[#81A1C1] text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            <FiHome className="mr-2" />
            Go back home
          </Link>
          <Link
            href="/search"
            className="flex items-center justify-center bg-[#A3BE8C] hover:bg-[#B48EAD] text-[#2E3440] font-bold py-2 px-4 rounded transition duration-300"
          >
            <FiSearch className="mr-2" />
            Search our site
          </Link>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-[#81A1C1]">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
