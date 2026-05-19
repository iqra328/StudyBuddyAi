import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Heroicons v2 imports (no /outline/ path needed)
import { 
  HomeIcon, 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  ClipboardDocumentListIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline'

const Sidebar = () => {
  const { logout } = useAuth()
  
  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Dashboard' },
    { path: '/upload', icon: CloudArrowUpIcon, label: 'Upload Notes' },
    { path: '/summaries', icon: DocumentTextIcon, label: 'Summaries' },
    { path: '/quizzes', icon: ClipboardDocumentListIcon, label: 'Quizzes' },
    { path: '/history', icon: ClockIcon, label: 'History' },
    { path: '/profile', icon: UserCircleIcon, label: 'Profile' },
  ]
  
  return (
    <div className="dashboard-sidebar">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-white">EduMate AI</h1>
        <p className="text-white/60 text-sm mt-2">Study Smarter</p>
      </div>
      
      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
        
        <button onClick={logout} className="nav-item w-full mt-10 text-red-300 hover:text-red-200">
          <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-3" />
          Logout
        </button>
      </nav>
    </div>
  )
}

export default Sidebar