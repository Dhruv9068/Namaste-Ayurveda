import { GoogleGenerativeAI } from '@google/generative-ai';
import keywordMapping from '../data/keywordMapping.json';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface MappingSuggestion {
  namasteCode: string;
  namasteTerm: string;
  englishTerm: string;
  system: string;
  icd11Code: string;
  icd11Term: string;
  confidence: number;
  description: string;
  lexicalScore?: number;
  semanticScore?: number;
  combinedScore?: number;
}

export interface AIExplanation {
  rationale: string;
  laymanExplanation: string;
  comparison: string;
  confidence: number;
  recommendations: string[];
}

export class GeminiMappingService {
  private model = genAI ? genAI.getGenerativeModel({ model: 'gemini-pro' }) : null;

  async mapDiagnosisToNAMASTE(clinicalText: string): Promise<MappingSuggestion[]> {
    try {
      // First try keyword-based mapping from JSON
      const keywordSuggestions = this.getKeywordBasedSuggestions(clinicalText);
      
      if (keywordSuggestions.length > 0) {
        return keywordSuggestions;
      }

      // Fallback to Gemini AI if available
      if (this.model && API_KEY) {
        return await this.getGeminiSuggestions(clinicalText);
      }

      // Final fallback to mock data
      return this.getMockSuggestions(clinicalText);
    } catch (error) {
      console.error('Error in mapping service:', error);
      return this.getMockSuggestions(clinicalText);
    }
  }

  async explainMapping(
    namasteData: any, 
    icd11Data: any, 
    mappingConfidence: number
  ): Promise<AIExplanation> {
    try {
      if (this.model && API_KEY) {
        return await this.getAIExplanation(namasteData, icd11Data, mappingConfidence);
      }
      
      return this.getMockExplanation(namasteData, icd11Data, mappingConfidence);
    } catch (error) {
      console.error('Error generating AI explanation:', error);
      return this.getMockExplanation(namasteData, icd11Data, mappingConfidence);
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      if (this.model && API_KEY) {
        const prompt = `Generate embeddings for the following medical text: "${text}". Return as a JSON array of numbers.`;
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        
        try {
          const embeddings = JSON.parse(textResponse);
          if (Array.isArray(embeddings)) {
            return embeddings;
          }
        } catch (parseError) {
          console.error('Error parsing embeddings:', parseError);
        }
      }
      
      // Fallback to simple word-based embeddings
      return this.generateSimpleEmbeddings(text);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      return this.generateSimpleEmbeddings(text);
    }
  }

  calculateLexicalSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\W+/));
    const words2 = new Set(text2.toLowerCase().split(/\W+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  async calculateCombinedScore(namasteTerm: string, icd11Term: string): Promise<{
    lexicalScore: number;
    semanticScore: number;
    combinedScore: number;
  }> {
    const lexicalScore = this.calculateLexicalSimilarity(namasteTerm, icd11Term);
    
    let semanticScore = 0.5; // Default semantic score
    try {
      const embeddings1 = await this.generateEmbeddings(namasteTerm);
      const embeddings2 = await this.generateEmbeddings(icd11Term);
      
      if (embeddings1.length > 0 && embeddings2.length > 0) {
        semanticScore = this.calculateCosineSimilarity(embeddings1, embeddings2);
      }
    } catch (error) {
      console.error('Error calculating semantic score:', error);
    }
    
    const combinedScore = (lexicalScore * 0.3) + (semanticScore * 0.7);
    
    return {
      lexicalScore: Math.round(lexicalScore * 100),
      semanticScore: Math.round(semanticScore * 100),
      combinedScore: Math.round(combinedScore * 100)
    };
  }

  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private generateSimpleEmbeddings(text: string): number[] {
    // Simple word frequency-based embeddings
    const words = text.toLowerCase().split(/\W+/);
    const wordCounts: { [key: string]: number } = {};
    
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    // Convert to vector (first 100 dimensions)
    const embedding = new Array(100).fill(0);
    const sortedWords = Object.keys(wordCounts).sort();
    
    sortedWords.forEach((word, index) => {
      if (index < 100) {
        embedding[index] = wordCounts[word];
      }
    });
    
    return embedding;
  }

  private getKeywordBasedSuggestions(clinicalText: string): MappingSuggestion[] {
    const suggestions: MappingSuggestion[] = [];
    const lowerText = clinicalText.toLowerCase();

    Object.entries(keywordMapping).forEach(([category, mapping]) => {
      const matchedKeywords = mapping.keywords.filter(keyword => 
        lowerText.includes(keyword.toLowerCase())
      );

      if (matchedKeywords.length > 0) {
        suggestions.push({
          namasteCode: mapping.namasteCode,
          namasteTerm: mapping.namasteTerm,
          englishTerm: mapping.englishTerm,
          system: mapping.system,
          icd11Code: mapping.icd11Code,
          icd11Term: mapping.icd11Term,
          confidence: mapping.confidence,
          description: `Matched keywords: ${matchedKeywords.join(', ')}`
        });
      }
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private async getGeminiSuggestions(clinicalText: string): Promise<MappingSuggestion[]> {
    const prompt = `
      Analyze this traditional medicine diagnosis and provide NAMASTE to ICD-11 mapping suggestions:
      
      Clinical Text: "${clinicalText}"
      
      Please provide 2-3 mapping suggestions in the following JSON format:
      [
        {
          "namasteCode": "AAA-X.X",
          "namasteTerm": "Traditional term in original language",
          "englishTerm": "English translation",
          "system": "Ayurveda/Siddha/Unani",
          "icd11Code": "XMXXXX",
          "icd11Term": "ICD-11 equivalent term",
          "confidence": 85,
          "description": "Brief explanation of the mapping logic"
        }
      ]
      
      Focus on Ayurveda, Siddha, and Unani medicine systems. Ensure confidence scores are realistic (70-95%).
    `;

    const result = await this.model!.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
    }
    
    return this.getMockSuggestions(clinicalText);
  }

  private getMockSuggestions(clinicalText: string): MappingSuggestion[] {
    return [{
      namasteCode: 'GEN-1.1',
      namasteTerm: 'सामान्य विकार',
      englishTerm: 'General health condition',
      system: 'Ayurveda',
      icd11Code: 'XM0000',
      icd11Term: 'General health condition',
      confidence: 75,
      description: 'General traditional medicine condition based on clinical text'
    }];
  }

  private async getAIExplanation(
    namasteData: any, 
    icd11Data: any, 
    mappingConfidence: number
  ): Promise<AIExplanation> {
    const prompt = `
      Analyze this traditional medicine to ICD-11 mapping and provide a comprehensive explanation:
      
      NAMASTE Term: ${namasteData.term_english || namasteData.namasteTerm}
      Original Language: ${namasteData.term_original || namasteData.namasteTerm}
      System: ${namasteData.system}
      Description: ${namasteData.description || 'No description available'}
      
      ICD-11 Code: ${icd11Data.code}
      ICD-11 Term: ${icd11Data.title || icd11Data.term}
      Mapping Confidence: ${mappingConfidence}%
      
      Please provide:
      1. RATIONALE: Explain why this mapping makes medical sense
      2. LAYMAN EXPLANATION: Simple explanation of the ICD-11 condition for non-medical users
      3. COMPARISON: Compare the traditional medicine concept with the ICD-11 equivalent
      4. RECOMMENDATIONS: Suggest next steps or considerations
      
      Format as JSON:
      {
        "rationale": "Medical rationale for the mapping",
        "laymanExplanation": "Simple explanation for general users",
        "comparison": "Comparison between traditional and modern medicine",
        "confidence": ${mappingConfidence},
        "recommendations": ["recommendation1", "recommendation2"]
      }
    `;

    try {
      const result = await this.model!.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing AI explanation:', error);
    }
    
    return this.getMockExplanation(namasteData, icd11Data, mappingConfidence);
  }

  private getMockExplanation(
    namasteData: any, 
    icd11Data: any, 
    mappingConfidence: number
  ): AIExplanation {
    return {
      rationale: `This mapping connects the traditional medicine concept "${namasteData.term_english || namasteData.namasteTerm}" from ${namasteData.system} system with the ICD-11 code ${icd11Data.code}. The mapping is based on clinical similarity and diagnostic criteria alignment.`,
      laymanExplanation: `The traditional medicine condition "${namasteData.term_english || namasteData.namasteTerm}" is similar to the modern medical condition "${icd11Data.title || icd11Data.term}". Both describe related health issues that affect similar body systems.`,
      comparison: `Traditional medicine focuses on holistic approaches and energy balance (like doshas in Ayurveda), while ICD-11 provides standardized diagnostic codes for international healthcare communication. This mapping bridges both systems for comprehensive patient care.`,
      confidence: mappingConfidence,
      recommendations: [
        'Consider consulting both traditional and modern medicine practitioners',
        'Review patient history for both traditional and conventional treatments',
        'Ensure proper documentation for insurance and regulatory compliance'
      ]
    };
  }
}

export const geminiService = new GeminiMappingService();