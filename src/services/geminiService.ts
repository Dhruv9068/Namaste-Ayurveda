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
}

export const geminiService = new GeminiMappingService();