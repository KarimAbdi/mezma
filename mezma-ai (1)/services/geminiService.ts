import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates a cartoon-style image from a base64 encoded image.
 * @param base64ImageData The base64 encoded image data (without the 'data:image/png;base64,' prefix).
 * @returns A promise that resolves to a data URL (e.g., 'data:image/png;base64,...') of the generated cartoon image.
 */
export const generateCartoonImage = async (base64ImageData: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: 'image/png',
            },
          },
          { text: 'Turn this image into a cartoon. Maintain the overall structure and composition.' },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (imagePart?.inlineData) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }
    throw new Error('No cartoon image was generated.');
  } catch (error) {
    console.error('Error generating cartoon image:', error);
    throw new Error('Failed to generate cartoon. The AI may have refused the request due to safety settings.');
  }
};

/**
 * Swaps faces between a source image and a reference face image.
 * @param sourceBase64 Base64 of the main image.
 * @param referenceFaceBase64 Base64 of the image containing the face to swap in.
 * @returns A promise resolving to the data URL of the resulting image.
 */
export const swapFaces = async (sourceBase64: string, referenceFaceBase64: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: sourceBase64, mimeType: 'image/png' } },
                    { text: 'Take the face from the next image and swap it onto the face in the first image.' },
                    { inlineData: { data: referenceFaceBase64, mimeType: 'image/png' } },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            return `data:image/png;base64,${imagePart.inlineData.data}`;
        }
        throw new Error('No face-swapped image was generated.');
    } catch (error) {
        console.error('Error swapping faces:', error);
        throw new Error('Failed to swap faces. The AI may have refused the request due to safety settings.');
    }
};

/**
 * Enhances an image by subtly improving lighting, color, and sharpness.
 * @param base64ImageData The base64 encoded image data.
 * @returns A promise resolving to the data URL of the enhanced image.
 */
export const enhanceImage = async (base64ImageData: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType: 'image/png' } },
          { text: 'Professionally retouch this photo. Subtly improve lighting, color, and sharpness. Make it look more polished and vibrant, but keep it realistic.' },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (imagePart?.inlineData) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }
    throw new Error('No enhanced image was generated.');
  } catch (error) {
    console.error('Error enhancing image:', error);
    throw new Error('Failed to enhance the image.');
  }
};


/**
 * Simulates removing an object from a video based on a text prompt.
 * @param videoUrl The URL of the video to process.
 * @param prompt A text description of the object to remove.
 * @returns A promise that resolves to the original video URL after a delay.
 */
export const removeObjectFromVideo = async (videoUrl: string, prompt: string): Promise<string> => {
    console.log(`AI task started: Remove "${prompt}" from video.`);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate AI processing time
    console.log("AI task finished: Object removal (simulated).");
    return videoUrl; // In a real implementation, this would be a new URL
};

/**
 * Simulates replacing the background of a video based on a text prompt.
 * @param videoUrl The URL of the video to process.
 * @param prompt A text description of the new background.
 * @returns A promise that resolves to the original video URL after a delay.
 */
export const replaceBackgroundInVideo = async (videoUrl: string, prompt: string): Promise<string> => {
    console.log(`AI task started: Replace background with "${prompt}".`);
    await new Promise(resolve => setTimeout(resolve, 4000)); // Simulate AI processing time
    console.log("AI task finished: Background replacement (simulated).");
    return videoUrl; // In a real implementation, this would be a new URL
};

/**
 * Simulates removing the background of a video and replacing it based on a text prompt.
 * @param videoUrl The URL of the video to process.
 * @param prompt A text description of the desired background.
 * @returns A promise that resolves to the original video URL after a delay.
 */
export const removeBackgroundFromVideo = async (videoUrl: string, prompt: string): Promise<string> => {
    console.log(`AI task started: Removing background, replacing with "${prompt}".`);
    await new Promise(resolve => setTimeout(resolve, 4000)); // Simulate AI processing time
    console.log("AI task finished: Background removal (simulated).");
    return videoUrl; // In a real implementation, this would be a new URL
};


/**
 * Transforms a video into a cartoon animation using AI frame-by-frame.
 * @param videoUrl The URL of the video to process.
 * @param onProgress A callback to report progress.
 * @returns A promise that resolves to a new URL for the cartoonified video.
 */
export const cartoonifyVideo = async (videoUrl: string, onProgress?: (progress: { percent: number, message: string }) => void): Promise<string> => {
    onProgress?.({ percent: 0, message: 'Loading video...'});
    const video = document.createElement('video');
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.src = videoUrl;

    await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error("Failed to load video metadata."));
    });

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not create canvas context.");

    const FRAME_RATE = 10;
    const duration = video.duration;
    const numFrames = Math.floor(duration * FRAME_RATE);
    const cartoonFrames: string[] = [];

    for (let i = 0; i < numFrames; i++) {
        const progressPercent = (i / numFrames) * 0.8; // 80% of time for processing frames
        onProgress?.({ percent: progressPercent, message: `Processing frame ${i + 1} of ${numFrames}...` });

        video.currentTime = i / FRAME_RATE;
        await new Promise<void>((resolve, reject) => {
            video.onseeked = () => resolve();
            video.onerror = () => reject(new Error("Failed to seek video."));
        });

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frameDataUrl = canvas.toDataURL('image/png');
        const base64Data = frameDataUrl.split(',')[1];
        
        try {
            const newFrameUrl = await generateCartoonImage(base64Data);
            cartoonFrames.push(newFrameUrl);
        } catch (error) {
            console.error(`Error generating cartoon for frame ${i}:`, error);
            cartoonFrames.push(frameDataUrl); // Fallback to original frame on error
        }
    }
    
    if (cartoonFrames.length === 0) {
        throw new Error("No frames were processed.");
    }

    onProgress?.({ percent: 0.8, message: 'Reassembling video...'});

    const reassemblyCanvas = document.createElement('canvas');
    const firstFrame = new Image();
    firstFrame.crossOrigin = "anonymous";
    firstFrame.src = cartoonFrames[0];
    await new Promise<void>(resolve => { firstFrame.onload = () => resolve(); });

    reassemblyCanvas.width = firstFrame.width;
    reassemblyCanvas.height = firstFrame.height;
    const reassemblyCtx = reassemblyCanvas.getContext('2d');
    if (!reassemblyCtx) throw new Error("Could not create reassembly canvas context.");
    
    const tempVideoForAudio = document.createElement('video');
    tempVideoForAudio.src = videoUrl;
    tempVideoForAudio.crossOrigin = 'anonymous';
    tempVideoForAudio.muted = true;

    const videoStream = reassemblyCanvas.captureStream(FRAME_RATE);
    let combinedStream: MediaStream = videoStream;

    try {
        await new Promise<void>(res => tempVideoForAudio.onloadedmetadata = () => res());
        const audioStream = (tempVideoForAudio as any).captureStream ? (tempVideoForAudio as any).captureStream() : (tempVideoForAudio as any).mozCaptureStream ? (tempVideoForAudio as any).mozCaptureStream() : null;

        if (audioStream && audioStream.getAudioTracks().length > 0) {
            const audioTrack = audioStream.getAudioTracks()[0];
            combinedStream = new MediaStream([videoStream.getVideoTracks()[0], audioTrack]);
        }
    } catch (e) {
        console.warn("Could not process and add audio track.", e);
    }
    
    const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    const recordingPromise = new Promise<Blob>(resolve => recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' })));
    recorder.start();
    
    if (combinedStream.getAudioTracks().length > 0) {
        tempVideoForAudio.play();
    }
    
    for (let i = 0; i < cartoonFrames.length; i++) {
        const frameUrl = cartoonFrames[i];
        const progressPercent = 0.8 + (i / cartoonFrames.length) * 0.2; // 20% for reassembly
        onProgress?.({ percent: progressPercent, message: `Assembling frame ${i + 1} of ${cartoonFrames.length}...`});
        
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = frameUrl;
        await new Promise<void>(resolve => { img.onload = () => resolve(); });
        reassemblyCtx.drawImage(img, 0, 0, reassemblyCanvas.width, reassemblyCanvas.height);
        await new Promise(resolve => setTimeout(resolve, 1000 / FRAME_RATE));
    }

    recorder.stop();
    if (combinedStream.getAudioTracks().length > 0) {
        tempVideoForAudio.pause();
    }

    const videoBlob = await recordingPromise;
    onProgress?.({ percent: 1, message: 'Done!' });
    
    console.log("AI task finished: Cartoonify video (real).");
    return URL.createObjectURL(videoBlob);
};


/**
 * Asks a complex, general-purpose question to a powerful AI model.
 * @param question The user's question.
 * @returns A promise resolving to the AI's text response.
 */
export const askComplexQuestion = async (question: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ parts: [{ text: question }] }],
        });
        return response.text;
    } catch (error) {
        console.error('Error asking complex question:', error);
        throw new Error('Failed to get a response from the AI.');
    }
};