'use client'

import { useState, useEffect } from 'react'
import { textSuggestionService } from '@/lib/ai/textSuggestions'
import { LightBulbIcon } from '@heroicons/react/24/outline'

interface AISuggestionsProps {
  inputText: string
  onSuggestionClick: (suggestion: string) => void
  enabled?: boolean
}

export function AISuggestions({ inputText, onSuggestionClick, enabled = true }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModelLoaded, setIsModelLoaded] = useState(false)

  useEffect(() => {
    // Initialize the AI model
    const initModel = async () => {
      if (enabled && !isModelLoaded) {
        setIsLoading(true)
        try {
          await textSuggestionService.loadModel()
          setIsModelLoaded(true)
        } catch (error) {
          console.error('Failed to load AI model:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    initModel()
  }, [enabled, isModelLoaded])

  useEffect(() => {
    if (!enabled || !isModelLoaded || inputText.length < 3) {
      setSuggestions([])
      return
    }

    const generateSuggestions = async () => {
      setIsLoading(true)
      try {
        const newSuggestions = await textSuggestionService.generateSuggestions(inputText)
        setSuggestions(newSuggestions.slice(0, 3)) // Limit to 3 suggestions
      } catch (error) {
        console.error('Error generating suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce the suggestion generation
    const timeoutId = setTimeout(generateSuggestions, 500)
    return () => clearTimeout(timeoutId)
  }, [inputText, enabled, isModelLoaded])

  if (!enabled || suggestions.length === 0) {
    return null
  }

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
      <div className="flex items-center space-x-2 mb-2">
        <LightBulbIcon className="h-4 w-4 text-yellow-500" />
        <span className="text-xs font-medium text-gray-600">AI Suggestions</span>
        {isLoading && (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600"></div>
        )}
      </div>
      
      <div className="space-y-1">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
