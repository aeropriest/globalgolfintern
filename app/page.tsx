import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import Hero from "./components/Hero";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-800">
                Global Golf Intern
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/apply" 
                className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-6 rounded-lg transition-colors inline-flex items-center"
              >
                Apply Now
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg transition-colors inline-flex items-center"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-purple-900 text-white py-24">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Launch Your Career in Golf Management</h1>
            <p className="text-xl md:text-2xl mb-8">Join our prestigious internship program at world-class golf clubs</p>
            <Link 
              href="/apply" 
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all transform hover:scale-105"
            >
              Apply for Summer 2026
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Features Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose Our Internship Program?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-14 w-14 bg-pink-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-pink-600 text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Professional Development</h3>
              <p className="text-gray-600">
                Receive mentorship from industry professionals and build your network with leaders in the golf industry.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-14 w-14 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-purple-600 text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Global Experience</h3>
              <p className="text-gray-600">
                Gain international experience at prestigious golf clubs across multiple countries and continents.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-blue-600 text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Hands-on Learning</h3>
              <p className="text-gray-600">
                Get real-world experience in golf operations, marketing, events, and hospitality management.
              </p>
            </div>
          </div>
        </div>
        
        {/* About Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">About Our Program</h2>
            <p className="text-lg text-gray-600 mb-6">
              The Global Golf Intern program connects talented individuals with prestigious golf clubs worldwide. 
              Our comprehensive internship offers hands-on experience in all aspects of golf club management.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Interns gain valuable skills in customer service, event planning, marketing, and operations while 
              working alongside industry professionals at some of the world's most renowned golf destinations.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-300 border-2 border-white"></div>
                <div className="h-12 w-12 rounded-full bg-gray-300 border-2 border-white"></div>
                <div className="h-12 w-12 rounded-full bg-gray-300 border-2 border-white"></div>
              </div>
              <p className="text-gray-600">Join our network of 25+ prestigious golf clubs</p>
            </div>
          </div>
          <div className="bg-gray-200 h-96 rounded-xl flex items-center justify-center">
            <p className="text-gray-500 text-lg">Golf Course Image Placeholder</p>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Applications for our summer 2026 internship program are now open! Limited positions available at our partner clubs.
          </p>
          <Link 
            href="/apply" 
            className="bg-white text-pink-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg inline-block transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Global Golf Intern</h3>
              <p className="text-gray-400">Connecting talented individuals with prestigious golf clubs worldwide.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/apply" className="hover:text-white transition-colors">Apply</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <p className="text-gray-400">Email: info@globalgolfintern.com</p>
              <p className="text-gray-400">Phone: +1 (555) 123-4567</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Global Golf Intern. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
