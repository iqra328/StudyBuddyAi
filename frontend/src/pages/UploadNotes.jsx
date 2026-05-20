import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import '../css/upload.css'

// ✅ API URL - Production
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
        
        // ✅ FIXED: Using production API URL
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
          console.log('✅ Uploaded:', response.data)
        }
        
      } catch (error) {
        console.error('❌ Upload error for file:', fileItem.name, error)
        
        let errorMessage = 'Upload failed'
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }
        
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'failed', error: errorMessage, progress: 0 } : f
        ))
        failedCount++
        toast.error(`${fileItem.name}: ${errorMessage}`)
      }
    }
    
    if (uploadedCount > 0) {
      toast.success(`✅ ${uploadedCount} file(s) uploaded successfully!`)
    }
    if (failedCount > 0) {
      toast.error(`❌ ${failedCount} file(s) failed to upload`)
    }
    
    setUploading(false)
    
    setTimeout(() => {
      setFiles(prev => prev.filter(f => f.status !== 'completed'))
    }, 3000)
  }

  return (
    <div className="upload-container">
      <Sidebar />
      
      <div className="ml-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Upload Study Notes</h1>
          <p className="text-white/70 mt-2">Upload PDFs, DOC files, and study materials</p>
        </motion.div>
        
        <div {...getRootProps()} className={`upload-area ${isDragActive ? 'dragging' : ''}`}>
          <input {...getInputProps()} />
          <div className="text-white">
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
        
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="file-list"
          >
            <h3 className="text-white text-lg font-semibold mb-3">Files to upload ({files.length})</h3>
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-white/50 text-sm">{file.size} KB</p>
                      {file.status === 'failed' && (
                        <p className="text-red-400 text-xs mt-1">{file.error}</p>
                      )}
                      {file.status === 'completed' && (
                        <p className="text-green-400 text-xs mt-1">✓ Uploaded successfully</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-white/70">{Math.round(file.progress)}%</span>
                      {file.status === 'completed' && (
                        <span className="text-green-400 ml-2">✓</span>
                      )}
                      {file.status === 'failed' && (
                        <span className="text-red-400 ml-2">✗</span>
                      )}
                    </div>
                  </div>
                  <div className="progress-bar mt-2">
                    <div 
                      className={`progress-fill ${file.status === 'failed' ? 'bg-red-500' : ''}`} 
                      style={{ width: `${file.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex gap-3 mt-4">
              <button 
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : `Upload ${files.length} File(s)`}
              </button>
              
              {!uploading && files.some(f => f.status === 'pending') && (
                <button 
                  onClick={() => setFiles([])}
                  className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-all"
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