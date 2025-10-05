import * as tf from '@tensorflow/tfjs'

interface TextSuggestionModel {
  model: tf.LayersModel | null
  tokenizer: any
  isLoaded: boolean
}

class TextSuggestionService {
  private modelState: TextSuggestionModel = {
    model: null,
    tokenizer: null,
    isLoaded: false
  }

  async loadModel() {
    try {
      console.log('Loading text suggestion model...')
      
      // In a real implementation, you would load a pre-trained text generation model
      // For this demo, we'll create a simple transformer-like model
      const model = tf.sequential({
        layers: [
          tf.layers.embedding({
            inputDim: 10000, // vocabulary size
            outputDim: 256,
            inputLength: 50
          }),
          tf.layers.lstm({
            units: 128,
            returnSequences: true
          }),
          tf.layers.lstm({
            units: 64,
            returnSequences: false
          }),
          tf.layers.dense({
            units: 32,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 10000, // vocabulary size
            activation: 'softmax'
          })
        ]
      })

      // Compile the model
      model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      })

      this.modelState.model = model
      this.modelState.isLoaded = true

      console.log('Model loaded successfully')
      return true
    } catch (error) {
      console.error('Failed to load model:', error)
      return false
    }
  }

  // Simple tokenizer for demo purposes
  private tokenize(text: string): number[] {
    // In a real implementation, you would use a proper tokenizer
    // This is a simplified version for demo
    const words = text.toLowerCase().split(/\s+/)
    const vocab = this.getVocabulary()
    return words.map(word => {
      const index = vocab.indexOf(word)
      return index !== -1 ? index : vocab.indexOf('<UNK>')
    })
  }

  private detokenize(tokens: number[]): string {
    const vocab = this.getVocabulary()
    return tokens.map(token => vocab[token] || '<UNK>').join(' ')
  }

  private getVocabulary(): string[] {
    // In a real implementation, this would be the actual vocabulary from the model
    const commonWords = [
      '<PAD>', '<UNK>', '<START>', '<END>',
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
      'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
      'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
      'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
      'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
      'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
      'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
      'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
      'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'each',
      'which', 'their', 'said', 'each', 'which', 'she', 'do', 'how', 'its', 'if',
      'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'can', 'only',
      'other', 'new', 'some', 'come', 'its', 'now', 'find', 'any', 'new', 'work',
      'part', 'take', 'get', 'place', 'made', 'live', 'where', 'after', 'back',
      'little', 'only', 'round', 'man', 'year', 'came', 'show', 'every', 'good',
      'me', 'give', 'our', 'under', 'name', 'very', 'through', 'just', 'form',
      'sentence', 'great', 'think', 'say', 'help', 'low', 'line', 'differ',
      'turn', 'cause', 'much', 'mean', 'before', 'move', 'right', 'boy', 'old',
      'too', 'same', 'she', 'all', 'there', 'when', 'up', 'use', 'word', 'how',
      'said', 'an', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'will',
      'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so',
      'some', 'her', 'would', 'make', 'like', 'into', 'him', 'time', 'has',
      'two', 'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been',
      'call', 'who', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get',
      'come', 'made', 'may', 'part'
    ]
    return commonWords
  }

  async generateSuggestions(inputText: string, maxSuggestions: number = 3): Promise<string[]> {
    if (!this.modelState.isLoaded || !this.modelState.model) {
      console.warn('Model not loaded, returning fallback suggestions')
      return this.getFallbackSuggestions(inputText)
    }

    try {
      // Tokenize input text
      const tokens = this.tokenize(inputText)
      
      // Pad or truncate to fixed length
      const maxLength = 50
      const paddedTokens = tokens.length > maxLength 
        ? tokens.slice(-maxLength) 
        : [...tokens, ...new Array(maxLength - tokens.length).fill(0)]

      // Convert to tensor
      const inputTensor = tf.tensor2d([paddedTokens], [1, maxLength])

      // Generate predictions
      const predictions = this.modelState.model.predict(inputTensor) as tf.Tensor
      const probabilities = await predictions.data() as Float32Array

      // Get top predictions
      const topIndices = this.getTopKIndices(probabilities, maxSuggestions)
      
      // Convert back to text
      const suggestions = topIndices.map(index => {
        const nextTokens = [...tokens, index]
        return this.detokenize(nextTokens)
      })

      // Clean up tensors
      inputTensor.dispose()
      predictions.dispose()

      return suggestions.filter(suggestion => suggestion !== inputText)
    } catch (error) {
      console.error('Error generating suggestions:', error)
      return this.getFallbackSuggestions(inputText)
    }
  }

  private getTopKIndices(probabilities: Float32Array, k: number): number[] {
    // Create array of {index, probability} pairs
    const indexed = Array.from(probabilities).map((prob, index) => ({ index, prob }))
    
    // Sort by probability (descending)
    indexed.sort((a, b) => b.prob - a.prob)
    
    // Return top k indices
    return indexed.slice(0, k).map(item => item.index)
  }

  private getFallbackSuggestions(inputText: string): string[] {
    // Simple fallback suggestions based on common patterns
    const text = inputText.toLowerCase().trim()
    
    if (text.endsWith('how')) {
      return [
        'how are you doing?',
        'how was your day?',
        'how can I help you?'
      ]
    }
    
    if (text.endsWith('what')) {
      return [
        'what are you up to?',
        'what do you think?',
        'what is your plan?'
      ]
    }
    
    if (text.endsWith('where')) {
      return [
        'where are you from?',
        'where are you going?',
        'where did you go?'
      ]
    }
    
    if (text.endsWith('when')) {
      return [
        'when are you coming?',
        'when did this happen?',
        'when will you be back?'
      ]
    }
    
    if (text.endsWith('why')) {
      return [
        'why did you do that?',
        'why is this happening?',
        'why are you asking?'
      ]
    }
    
    // Default suggestions
    return [
      'That sounds interesting!',
      'I agree with you.',
      'Tell me more about that.'
    ]
  }

  isModelLoaded(): boolean {
    return this.modelState.isLoaded
  }
}

export const textSuggestionService = new TextSuggestionService()
