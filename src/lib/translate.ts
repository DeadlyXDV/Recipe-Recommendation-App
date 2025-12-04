// Translation utility menggunakan MyMemory Translation API
// API gratis tanpa perlu API key dengan limit 1000 request/hari

// Cache untuk menyimpan hasil translate agar tidak request berulang
const translationCache: Map<string, string> = new Map();

interface TranslateResponse {
  responseData: {
    translatedText: string;
  };
  responseStatus: number;
}

/**
 * Translate single text dari bahasa Inggris ke Indonesia
 */
export async function translateToIndonesian(text: string): Promise<string> {
  if (!text || text.trim() === '') return text;

  // Cek cache terlebih dahulu
  const cacheKey = `en-id:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|id`
    );

    if (!response.ok) {
      console.warn('Translation API error:', response.status);
      return text; // Return original jika error
    }

    const data: TranslateResponse = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      
      // Simpan ke cache
      translationCache.set(cacheKey, translated);
      
      return translated;
    }

    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original jika error
  }
}

/**
 * Translate array of strings dengan delay untuk menghindari rate limit
 */
export async function translateArray(items: string[]): Promise<string[]> {
  const results: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const translated = await translateToIndonesian(items[i]);
    results.push(translated);

    // Tambah delay 200ms antar request untuk menghindari rate limit
    // Kecuali jika dari cache (tidak perlu delay)
    if (i < items.length - 1 && !translationCache.has(`en-id:${items[i]}`)) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
}

/**
 * Translate text panjang dengan memecah per kalimat
 * Lebih akurat untuk instruksi memasak
 */
export async function translateLongText(text: string): Promise<string> {
  if (!text || text.trim() === '') return text;

  // Cek cache untuk full text
  const cacheKey = `en-id:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    // Pecah text menjadi kalimat-kalimat (split by . ! ?)
    // Tetap pertahankan tanda baca
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    if (sentences.length === 1) {
      // Jika hanya 1 kalimat, translate langsung
      return await translateToIndonesian(text);
    }

    const translatedSentences: string[] = [];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      
      if (sentence) {
        const translated = await translateToIndonesian(sentence);
        translatedSentences.push(translated);

        // Delay antar kalimat
        if (i < sentences.length - 1 && !translationCache.has(`en-id:${sentence}`)) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }

    const fullTranslation = translatedSentences.join(' ');
    
    // Simpan hasil full text ke cache
    translationCache.set(cacheKey, fullTranslation);
    
    return fullTranslation;
  } catch (error) {
    console.error('Long text translation error:', error);
    return text;
  }
}

/**
 * Clear cache jika diperlukan (misal untuk menghemat memory)
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Get cache size untuk monitoring
 */
export function getTranslationCacheSize(): number {
  return translationCache.size;
}
