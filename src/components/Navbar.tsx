import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">Lifelong Pathway</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/career-paths" className="text-gray-600 hover:text-gray-900">Career Paths</Link>
            <Link to="/assessment" className="text-gray-600 hover:text-gray-900">Assessment</Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 