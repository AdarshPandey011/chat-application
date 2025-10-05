'use client'

import { useState, useRef } from 'react'
import { PaperAirplaneIcon, PaperClipIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'
import { formatFileSize } from '@/lib/utils'
import { AISuggestions } from './AISuggestions'

interface MessageInputProps {
  onSendMessage: (content: string, type?: string, fileData?: any) => void
  onTyping: (text: string) => void
}

export function MessageInput({ onSendMessage, onTyping }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/*': ['.pdf', '.doc', '.docx', '.txt']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file) {
        setSelectedFile(file)
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file)
          setPreviewUrl(url)
        }
      }
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() && !selectedFile) return

    if (selectedFile) {
      // In a real app, you'd upload the file first
      // For now, we'll simulate it
      const fileData = {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileUrl: previewUrl || '#'
      }
      
      const type = selectedFile.type.startsWith('image/') ? 'IMAGE' : 'FILE'
      onSendMessage(message || selectedFile.name, type, fileData)
      
      // Reset file state
      setSelectedFile(null)
      setPreviewUrl(null)
    } else {
      onSendMessage(message, 'TEXT')
    }
    
    setMessage('')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      }
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      {/* File preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-12 w-12 object-cover rounded"
                />
              ) : (
                <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                  <PaperClipIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Message input */}
      <form onSubmit={handleSubmit}>
        <div
          {...getRootProps()}
          className={`relative border rounded-lg ${
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
          }`}
        >
          {/* AI Suggestions */}
          <AISuggestions
            inputText={message}
            onSuggestionClick={(suggestion) => {
              setMessage(suggestion)
              onTyping(suggestion)
            }}
            enabled={!selectedFile}
          />
          <input {...getInputProps()} className="hidden" />
          
          <div className="flex items-end space-x-2 p-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            >
              <PaperClipIcon className="h-5 w-5" />
            </button>

            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  onTyping(e.target.value)
                }}
                placeholder="Type a message..."
                className="w-full resize-none border-0 focus:ring-0 focus:outline-none text-sm placeholder-gray-500"
                rows={1}
                style={{ minHeight: '20px', maxHeight: '120px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!message.trim() && !selectedFile}
              className="flex-shrink-0 p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>

          {isDragActive && (
            <div className="absolute inset-0 bg-primary-50 bg-opacity-90 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <PhotoIcon className="mx-auto h-8 w-8 text-primary-600" />
                <p className="mt-1 text-sm text-primary-600">Drop file here</p>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt"
          className="hidden"
        />
      </form>
    </div>
  )
}
