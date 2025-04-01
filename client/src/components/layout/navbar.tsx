import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-purple-600 via-primary to-purple-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex-shrink-0 flex items-center cursor-pointer">
                <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 10 7 10zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
                <span className="ml-2 text-xl font-bold text-white">DeepFake Detector</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition duration-200 ease-in-out hover:bg-white/10">
                Documentation
              </div>
            </Link>
            <Link href="/">
              <div className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition duration-200 ease-in-out hover:bg-white/10">
                API
              </div>
            </Link>
            <Link href="/">
              <div className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition duration-200 ease-in-out hover:bg-white/10">
                About
              </div>
            </Link>
            <Link href="/">
              <Button variant="secondary" className="font-medium hover:scale-105 transition duration-200 ease-in-out">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
