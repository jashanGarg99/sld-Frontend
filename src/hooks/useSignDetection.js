import { useState, useCallback, useRef } from 'react';
import { API_CONFIG } from '../config/api';

export function useSignDetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const isDetectingRef = useRef(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const detectSign = useCallback(async (base64Image) => {
    if (isDetectingRef.current) return;
    
    isDetectingRef.current = true;
    setIsDetecting(true);
    setError(null);

    try {
      if (API_CONFIG.USE_MOCK) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.SIMULATED_DELAY));
        
        // Mock a response based on some logic or randomness
        const mockSigns = [
          { sign: 'A', confidence: 0.95 },
          { sign: 'B', confidence: 0.88 },
          { sign: 'Hello', confidence: 0.99 },
          { sign: 'Thank You', confidence: 0.92 }
        ];
        const randomSign = mockSigns[Math.floor(Math.random() * mockSigns.length)];
        
        setResult({
          sign: randomSign.sign,
          confidence: randomSign.confidence,
          timestamp: Date.now()
        });
      } else {
        // Convert base64 data URL to a Blob
        const blobResponse = await fetch(base64Image);
        const blob = await blobResponse.blob();
        
        // Prepare FormData
        const formData = new FormData();
        formData.append('file', blob, 'capture.jpg');

        // Actual API Call
        const response = await fetch(API_CONFIG.ENDPOINT, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        // Assuming the backend returns { sign: "A", confidence: 0.98 }
        setResult({
          sign: data.sign || data.prediction,
          confidence: data.confidence.toFixed(2),
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error("Detection error:", err);
      setError(err.message || 'Failed to connect to detection backend');
      setResult(null);
    } finally {
      isDetectingRef.current = false;
      setIsDetecting(false);
    }
  }, []);

  return { detectSign, isDetecting, result, error };
}