import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

export const createFaceDetector = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
  );

  return FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/models/blaze_face_short_range.tflite",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
  });
};
