import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import '../css/dashboard.css'   // ✅ main styles – includes gradient
import '../css/upload.css'      // only extra upload styles

const API_URL = 'https://studybuddyai-1.onrender.com/api'

const UploadNotes = () => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles.map(file => ({
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(2),
      progress: 0,
      status: 'pending'
    })))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    }
  })

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    setUploading(true)
    const token = localStorage.getItem('token')
    
    if (!token) {
      toast.error('Please login first')
      setUploading(false)
      return
    }

    let uploadedCount = 0
    let failedCount = 0

    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i]
      const formData = new FormData()
      
      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, progress: 10, status: 'uploading' } : f
      ))
      
      try {
        formData.append('file', fileItem.file)
        formData.append('title', fileItem.name.replace(/\.[^/.]+$/, ''))
        formData.append('category', 'Study Notes')
        formData.append('fileName', fileItem.name)
        formData.append('fileType', fileItem.file.type)
        
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, progress: 50 } : f
        ))
        
        const response = await axios.post(`${API_URL}/notes`, formData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              setFiles(prev => prev.map((f, idx) => 
                idx === i ? { ...f, progress: 50 + (percentCompleted / 2) } : f
              ))
            }
          }
        })
        
        if (response.status === 201) {
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, progress: 100, status: 'completed' } : f
          ))
          uploadedCount++
        }
        
      } catch (error) {
        let errorMessage = error.response?.data?.message || 'Upload failed'
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'failed', error: errorMessage, progress: 0 } : f
        ))
        failedCount++
        toast.error(`${fileItem.name}: ${errorMessage}`)
      }
    }
    
    if (uploadedCount > 0) toast.success(`✅ ${uploadedCount} file(s) uploaded!`)
    if (failedCount > 0) toast.error(`❌ ${failedCount} file(s) failed`)
    
    setUploading(false)
    setTimeout(() => setFiles(prev => prev.filter(f => f.status !== 'completed')), 3000)
  }

  // ✅ Same structure as Dashboard
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Upload Study Notes</h1>
          <p className="text-white/70 mt-2">Upload PDFs, DOC files, and study materials</p>
        </motion.div>
        
        {/* Dropzone */}
        <div {...getRootProps()} className={`upload-area ${isDragActive ? 'dragging' : ''}`}>
          <input {...getInputProps()} />
          <div className="text-white text-center">
            <div className="text-6xl mb-4">📤</div>
            {isDragActive ? (
              <p>Drop your files here...</p>
            ) : (
              <>
                <p className="text-xl mb-2">Drag & drop files here</p>
                <p className="text-white/60">or click to select files</p>
                <p className="text-white/40 text-sm mt-4">Supports: PDF, DOC, DOCX, TXT</p>
              </>
            )}
          </div>
        </div>
        
        {/* File list */}
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="file-list mt-6"
          >
            <h3 className="text-white text-lg font-semibold mb-3">Files to upload ({files.length})</h3>
            {files.map((file, index) => (
              <div key={index} className="file-item glass-card p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-white/50 text-sm">{file.size} KB</p>
                    {file.status === 'failed' && <p className="text-red-400 text-xs mt-1">{file.error}</p>}
                    {file.status === 'completed' && <p className="text-green-400 text-xs mt-1">✓ Uploaded</p>}
                  </div>
                  <div className="text-right">
                    <span className="text-white/70">{Math.round(file.progress)}%</span>
                    {file.status === 'completed' && <span className="text-green-400 ml-2">✓</span>}
                    {file.status === 'failed' && <span className="text-red-400 ml-2">✗</span>}
                  </div>
                </div>
                <div className="progress-bar mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className={`progress-fill h-full ${file.status === 'failed' ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'} transition-all duration-300`}
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>
            ))}
            
            <div className="flex gap-3 mt-4">
              <button 
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
              </button>
              {!uploading && files.some(f => f.status === 'pending') && (
                <button 
                  onClick={() => setFiles([])}
                  className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all"
                >
                  Clear All
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default UploadNotes