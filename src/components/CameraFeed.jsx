import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';

export default function CameraFeed({ onCapture, autoCaptureInterval }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const requestRef = useRef(null);
  const lastCaptureTime = useRef(0);
  const onResultsRef = useRef(null);
  const handDetectedStartTime = useRef(null);

  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);

  const captureFrame = useCallback((boxX, boxY, boxSize) => {
    if (videoRef.current && canvasRef.current && isCameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (boxX !== undefined && boxY !== undefined && boxSize !== undefined) {
        canvas.width = boxSize;
        canvas.height = boxSize;
        context.drawImage(video, boxX, boxY, boxSize, boxSize, 0, 0, boxSize, boxSize);
      } else {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      onCapture(base64Image);
    }
  }, [isCameraActive, onCapture]);

  const onResults = useCallback((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const hand = results.multiHandLandmarks[0];
      const video = videoRef.current;
      if (!video) return;

      // Define ROI box in video space (60% of video height square, centered)
      const sizeInVideo = video.videoHeight * 0.6;
      const boxX = (video.videoWidth - sizeInVideo) / 2;
      const boxY = (video.videoHeight - sizeInVideo) / 2;

      // Check if at least some keypoints are in the box
      // MediaPipe landmarks are normalized [0, 1] relative to the video dimensions
      const keypointsInBox = hand.filter(kp => {
        const x = kp.x * video.videoWidth;
        const y = kp.y * video.videoHeight;
        return x >= boxX && x <= boxX + sizeInVideo &&
          y >= boxY && y <= boxY + sizeInVideo;
      });

      // If enough keypoints are inside the box
      if (keypointsInBox.length > 10) {
        const now = Date.now();
        if (!handDetectedStartTime.current) {
          // Hand just entered the box
          handDetectedStartTime.current = now;
        } else if (now - handDetectedStartTime.current > 1000) {
          // Hand has been in the box for > 1 second
          if (now - lastCaptureTime.current > 1500) {
            // Only capture if the Auto-Detect button is ON (autoCaptureInterval is not null)
            if (autoCaptureInterval) {
              captureFrame(boxX, boxY, sizeInVideo);
              lastCaptureTime.current = now;
            }
            // Reset so the user must either remove and re-enter their hand,
            // or wait another 1s + 1.5s cooldown for the next auto-capture.
            handDetectedStartTime.current = null;
          }
        }
      } else {
        // Hand is detected but not inside the box
        handDetectedStartTime.current = null;
      }
    } else {
      // No hand detected at all
      handDetectedStartTime.current = null;
    }
  }, [captureFrame, autoCaptureInterval]);

  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  // Load hand pose model via global window object (from CDN)
  useEffect(() => {
    let hands;
    const loadModel = async () => {
      try {
        hands = new window.Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        hands.onResults((results) => {
          if (onResultsRef.current) {
            onResultsRef.current(results);
          }
        });

        // Test initialization to trigger model loading
        await hands.initialize();

        detectorRef.current = hands;
        setModelLoading(false);
        console.log("MediaPipe Hand detection model loaded!");
      } catch (err) {
        console.error("Failed to load hand pose model", err);
      }
    };

    // Wait for the script to load if it's not ready yet
    const checkReady = setInterval(() => {
      if (window.Hands) {
        clearInterval(checkReady);
        loadModel();
      }
    }, 100);

    return () => {
      clearInterval(checkReady);
      if (hands) hands.close();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
      setError(null);
    } catch (err) {
      console.error("Error accessing webcam", err);
      setError("Unable to access webcam. Please ensure permissions are granted.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Sync stream to video element when it mounts
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isCameraActive]);

  const detectHands = useCallback(async () => {
    if (!videoRef.current || !detectorRef.current || !isCameraActive) return;

    const video = videoRef.current;
    if (video.readyState >= 2) {
      try {
        await detectorRef.current.send({ image: video });
      } catch (err) {
        console.error("Hand detection error:", err);
      }
    }

    requestRef.current = requestAnimationFrame(detectHands);
  }, [isCameraActive]);

  // Start the detection loop
  useEffect(() => {
    if (isCameraActive && !modelLoading) {
      requestRef.current = requestAnimationFrame(detectHands);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isCameraActive, modelLoading, detectHands]);

  // Keep auto-capture interval just in case they still want to use it
  useEffect(() => {
    let intervalId;
    if (autoCaptureInterval && isCameraActive && modelLoading) {
      intervalId = setInterval(() => {
        captureFrame();
      }, autoCaptureInterval);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoCaptureInterval, isCameraActive, captureFrame, modelLoading]);

  return (
    <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Camera size={20} /> Camera Feed
        </h2>
        <button
          onClick={isCameraActive ? stopCamera : startCamera}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          title={isCameraActive ? "Turn off camera" : "Turn on camera"}
        >
          {isCameraActive ? <CameraOff size={20} /> : <RefreshCw size={20} />}
        </button>
      </div>

      <div style={{ position: 'relative', width: '100%', backgroundColor: '#000', aspectRatio: '4/3', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {error ? (
          <div style={{ color: 'var(--error)', padding: '2rem', textAlign: 'center' }}>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={startCamera} style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </div>
        ) : !isCameraActive ? (
          <div style={{ color: 'var(--text-secondary)' }}>Camera is off</div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />

            {/* ROI Box Overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              height: '60%',
              aspectRatio: '1/1',
              border: '2px dashed #4ade80',
              borderRadius: '8px',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}>
              <span style={{
                backgroundColor: 'rgba(74, 222, 128, 0.2)',
                color: '#4ade80',
                padding: '4px 8px',
                fontSize: '12px',
                borderRadius: '4px',
                marginTop: '8px'
              }}>
                {modelLoading ? 'Loading AI...' : 'Place hand here'}
              </span>
            </div>
          </>
        )}

        {/* Hidden canvas for capturing images */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
