# Real-Time Sign Language Detection Web Application

This document outlines the implementation plan for building a real-time Sign Language Detection web application using React, Vite, and Google's MediaPipe Tasks Vision.

## Background & Goal

The user wants a web application for sign language detection. Since browser-based machine learning has advanced significantly, we can use **MediaPipe Tasks API (`@mediapipe/tasks-vision`)** to run a highly optimized Gesture Recognizer directly in the browser using the user's webcam. 

This plan will create a visually stunning, responsive web app that:
1. Accesses the user's webcam.
2. Runs a pre-trained machine learning model to detect hand landmarks.
3. Recognizes core sign language gestures (e.g., the ASL "I Love You" sign, Victory/Peace, Thumbs Up, Open Palm, Closed Fist).
4. Displays the live video feed with an overlay of the detected hand skeleton and the predicted gesture with its confidence score.

> [!NOTE]
> The default MediaPipe Gesture Recognizer recognizes 7 basic classes (`Closed_Fist`, `Open_Palm`, `Pointing_Up`, `Thumb_Down`, `Thumb_Up`, `Victory`, `ILoveYou`). If you have a custom trained model (e.g., `.task` or `.tflite` file) that detects the full ASL alphabet or other specific signs, we can easily plug that in!

## User Review Required

> [!IMPORTANT]
> **Machine Learning Model Scope:** 
> The application will use the default MediaPipe gesture model which covers 7 basic gestures (including the ASL 'I Love You' sign). Please confirm if this is sufficient for a starting point, or if you already have a custom-trained model for specific sign languages (like full ASL alphabet) that you want to use.

> [!WARNING]
> **Webcam Permissions:**
> The app will require webcam permissions from the browser to function.

## Proposed Changes

### Configuration & Dependencies
- Install `@mediapipe/tasks-vision` for ML inference.
- Install `lucide-react` for beautiful UI icons.
- Add the pre-trained `gesture_recognizer.task` model file to the `public` directory.

### Core Application (React + Vite)

#### [MODIFY] `package.json`
- Add dependencies.

#### [NEW] `public/gesture_recognizer.task`
- Download the official MediaPipe gesture recognizer model.

#### [MODIFY] `src/index.css`
- Implement a premium, modern dark-mode aesthetic with CSS variables, glowing effects, and smooth animations.

#### [NEW] `src/components/CameraFeed.jsx`
- Component responsible for requesting webcam access and rendering the `<video>` element.

#### [NEW] `src/components/GestureOverlay.jsx`
- Component containing the `<canvas>` element that draws the hand landmarks and displays the detected sign/gesture using data from MediaPipe.

#### [NEW] `src/hooks/useGestureRecognizer.js`
- Custom React hook to initialize the MediaPipe `GestureRecognizer`, handle the frame-by-frame processing of the webcam video stream, and return the detection results.

#### [MODIFY] `src/App.jsx`
- The main entry point assembling the components. It will feature a sleek header, the central camera/detection area, and a side panel showing real-time metrics (detected gesture, confidence score, handedness).

## Verification Plan

### Automated / Manual Verification
- **Run the Dev Server:** Start the Vite dev server.
- **Webcam Access:** Verify that the browser prompts for camera access and successfully displays the video feed.
- **Gesture Detection:** Perform various gestures (e.g., "I Love You", "Victory", "Thumbs Up") in front of the camera.
- **UI Validation:** Ensure the UI correctly displays the recognized gesture, the confidence percentage, and smoothly draws the hand skeleton over the live feed.
- **Aesthetic Check:** Ensure the app looks premium, uses a high-quality dark theme, and has appropriate micro-animations.
