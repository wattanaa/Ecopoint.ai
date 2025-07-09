import { useState, useEffect, useCallback } from 'react';
import type * as CocoSsd from '@tensorflow-models/coco-ssd';
import { type DetectedObject } from '../types';

// Declare tf and cocoSsd in the global scope for scripts loaded from CDN
declare const tf: any;
declare const cocoSsd: any;

export const useObjectDetection = () => {
  const [model, setModel] = useState<CocoSsd.ObjectDetection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAndLoadModel = async () => {
      setIsLoading(true);
      try {
        // Attempt to set the WebGL backend first for GPU acceleration.
        await tf.setBackend('webgl');
        await tf.ready();
        console.log('TensorFlow.js backend successfully set to WebGL.');
      } catch (webglError) {
        console.warn(
          'WebGL backend initialization failed. This can happen on some devices. Falling back to CPU backend.',
          webglError
        );
        try {
          // If WebGL fails, fall back to the more compatible CPU backend.
          await tf.setBackend('cpu');
          await tf.ready();
          console.log('TensorFlow.js backend successfully set to CPU.');
        } catch (cpuError) {
          console.error(
            'Fatal: Could not initialize any TensorFlow.js backend. Object detection will not work.',
            cpuError
          );
          setIsLoading(false);
          return; // Stop execution if no backend is available
        }
      }

      try {
        console.log('Loading high-accuracy AI model (mobilenet_v2)...');
        const loadedModel: CocoSsd.ObjectDetection = await cocoSsd.load({ base: 'mobilenet_v2' });
        setModel(loadedModel);
        console.log('High-accuracy AI model loaded successfully.');
      } catch (error) {
        console.error('Error loading AI model:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAndLoadModel();
  }, []);

  const detectObjects = useCallback(async (video: HTMLVideoElement): Promise<DetectedObject[]> => {
    if (!model || !video || video.readyState !== 4) {
      return [];
    }
    try {
      const predictions = await model.detect(video);
      return predictions;
    } catch (error) {
      console.error("Detection error:", error);
      return [];
    }
  }, [model]);

  return { model, isLoading, detectObjects };
};
