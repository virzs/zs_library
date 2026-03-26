import { useState, useRef, useCallback, useEffect } from "react";
import { Human } from "@vladmandic/human";
import type { Result as HumanResult } from "@vladmandic/human";
import { createHumanConfig } from "../utils/human-config";
import { getHumanInstance, resolveToImageElement } from "../utils/validate-image";
import {
  mergeMessages,
  mergeThresholds,
  validateFaceCount,
  validateBounds,
  validateHat,
  validateGlasses,
  validateOcclusion,
  validateOrientation,
} from "../utils/validators";
import type {
  ValidationResult,
  ValidationRuleConfig,
  BoundsConfig,
  ThresholdConfig,
  CameraConfig,
  MessageConfig,
  UseIdPhotoCheckerReturn,
  ValidatableImage,
} from "../types";

const DEFAULT_RULES: Required<ValidationRuleConfig> = {
  checkBounds: true,
  checkHat: true,
  checkGlasses: true,
  checkOcclusion: true,
  checkOrientation: true,
};

const DEFAULT_BOUNDS: BoundsConfig = {
  left: 0.2,
  top: 0.1,
  width: 0.6,
  height: 0.75,
};

const EMPTY_VALIDATION: ValidationResult = {
  isValid: false,
  items: [],
  faceCount: 0,
  faceScore: 0,
};

interface UseIdPhotoCheckerOptions {
  rules?: ValidationRuleConfig;
  bounds?: BoundsConfig;
  thresholds?: ThresholdConfig;
  camera?: CameraConfig;
  messages?: MessageConfig;
  modelBasePath?: string;
  detectInterval?: number;
  autoStart?: boolean;
  onValidationChange?: (result: ValidationResult) => void;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

export function useIdPhotoChecker(
  options: UseIdPhotoCheckerOptions = {},
): UseIdPhotoCheckerReturn {
  const {
    rules: customRules,
    bounds: customBounds,
    thresholds: customThresholds,
    camera,
    messages: customMessages,
    modelBasePath,
    detectInterval = 200,
    autoStart = true,
    onValidationChange,
    onReady,
    onError,
  } = options;

  const rules = { ...DEFAULT_RULES, ...customRules };
  const bounds = { ...DEFAULT_BOUNDS, ...customBounds };
  const mergedMessages = mergeMessages(customMessages);
  const mergedThresholds = mergeThresholds(customThresholds);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const humanRef = useRef<Human | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastDetectTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const [validation, setValidation] =
    useState<ValidationResult>(EMPTY_VALIDATION);
  const [isLoading, setIsLoading] = useState(autoStart);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const runValidation = useCallback(
    (result: HumanResult, videoWidth: number, videoHeight: number) => {
      const faces = result.face;
      const gestures = result.gesture;

      const faceCountItem = validateFaceCount(faces.length, mergedMessages);
      if (faceCountItem) {
        return {
          isValid: false,
          items: [faceCountItem],
          faceCount: faces.length,
          faceScore: 0,
        };
      }

      const face = faces[0];
      const items = [];

      if (rules.checkBounds) {
        items.push(
          validateBounds(
            face,
            bounds,
            videoWidth,
            videoHeight,
            mergedThresholds,
            mergedMessages,
          ),
        );
      }

      if (rules.checkOrientation) {
        items.push(
          validateOrientation(face, gestures, mergedThresholds, mergedMessages),
        );
      }

      if (rules.checkHat) {
        items.push(validateHat(face, mergedThresholds, mergedMessages));
      }

      if (rules.checkGlasses) {
        items.push(validateGlasses(face, mergedThresholds, mergedMessages));
      }

      if (rules.checkOcclusion) {
        items.push(
          validateOcclusion(face, mergedThresholds, mergedMessages),
        );
      }

      const isValid = items.every(
        (item) => item.status === "pass",
      );

      return {
        isValid,
        items,
        faceCount: 1,
        faceScore: face.score,
      };
    },
    [bounds, mergedMessages, mergedThresholds, rules],
  );

  const detectLoop = useCallback(async () => {
    const human = humanRef.current;
    const video = videoRef.current;

    if (!human || !video || video.paused || video.ended) {
      animFrameRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const now = performance.now();
    if (now - lastDetectTimeRef.current < detectInterval) {
      animFrameRef.current = requestAnimationFrame(detectLoop);
      return;
    }
    lastDetectTimeRef.current = now;

    try {
      const result = await human.detect(video);
      const newValidation = runValidation(
        result,
        video.videoWidth,
        video.videoHeight,
      );
      setValidation(newValidation);
      onValidationChange?.(newValidation);
    } catch {
      /* noop */
    }

    animFrameRef.current = requestAnimationFrame(detectLoop);
  }, [detectInterval, onValidationChange, runValidation]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      const unsupportedError = new Error(
        "当前浏览器不支持摄像头访问，请使用 Chrome / Firefox / Safari 等现代浏览器",
      );
      setError(unsupportedError);
      onError?.(unsupportedError);
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: camera?.facingMode || "user",
          width: { ideal: camera?.width || 640 },
          height: { ideal: camera?.height || 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraReady(true);
      }
      return true;
    } catch (err) {
      const original = err instanceof DOMException ? err.message : "";
      let message = mergedMessages.cameraPermissionDenied;
      if (err instanceof DOMException) {
        if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          message = "未找到可用的摄像头设备";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          message = "摄像头已被其他程序占用，请关闭后重试";
        } else if (err.name === "OverconstrainedError") {
          message = "摄像头不满足要求的分辨率配置";
        }
      }
      const detail = original ? ` (${original})` : "";
      const cameraError = new Error(`${message}${detail}`);
      setError(cameraError);
      onError?.(cameraError);
      return false;
    }
  }, [camera, mergedMessages.cameraPermissionDenied, onError]);

  const initHuman = useCallback(async () => {
    let progressTimer: ReturnType<typeof setInterval> | null = null;
    try {
      setIsLoading(true);
      setLoadingProgress(0);

      const config = createHumanConfig(modelBasePath);
      const human = new Human(config);

      progressTimer = setInterval(() => {
        const stats = human.models.stats();
        const pct = Math.round(stats.percentageLoaded * 100);
        setLoadingProgress((prev) => Math.max(prev, pct));
      }, 200);

      await human.load();
      setLoadingProgress(90);
      await human.warmup();

      clearInterval(progressTimer);
      progressTimer = null;
      setLoadingProgress(100);
      humanRef.current = human;
      setIsLoading(false);
      onReady?.();
      return true;
    } catch (err) {
      if (progressTimer) clearInterval(progressTimer);
      const original = err instanceof Error ? err.message : String(err);
      const initError = new Error(`模型加载失败 (${original})`);
      setError(initError);
      setIsLoading(false);
      onError?.(initError);
      return false;
    }
  }, [modelBasePath, onError, onReady]);

  const start = useCallback(async () => {
    const cameraOk = await startCamera();
    if (!cameraOk) return;

    const modelOk = await initHuman();
    if (!modelOk) return;

    detectLoop();
  }, [initHuman, startCamera, detectLoop]);

  const stop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraReady(false);
    setValidation(EMPTY_VALIDATION);
  }, []);

  const capture = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !isCameraReady) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.95);
  }, [isCameraReady]);

  const validateImage = useCallback(
    async (image: ValidatableImage): Promise<ValidationResult> => {
      const input = await resolveToImageElement(image);

      let imageWidth: number;
      let imageHeight: number;
      if (input instanceof HTMLImageElement) {
        imageWidth = input.naturalWidth || input.width;
        imageHeight = input.naturalHeight || input.height;
      } else if (input instanceof HTMLCanvasElement) {
        imageWidth = input.width;
        imageHeight = input.height;
      } else {
        imageWidth = input.width;
        imageHeight = input.height;
      }

      let human = humanRef.current;
      if (!human) {
        setIsLoading(true);
        try {
          human = await getHumanInstance(modelBasePath);
          humanRef.current = human;
        } finally {
          setIsLoading(false);
        }
      }

      const result = await (human as NonNullable<typeof human>).detect(input);
      const faces = result.face;
      const gestures = result.gesture;

      const faceCountItem = validateFaceCount(faces.length, mergedMessages);
      if (faceCountItem) {
        return {
          isValid: false,
          items: [faceCountItem],
          faceCount: faces.length,
          faceScore: 0,
        };
      }

      const face = faces[0];
      const items = [];

      if (rules.checkBounds) {
        items.push(
          validateBounds(face, bounds, imageWidth, imageHeight, mergedThresholds, mergedMessages),
        );
      }
      if (rules.checkOrientation) {
        items.push(validateOrientation(face, gestures, mergedThresholds, mergedMessages));
      }
      if (rules.checkHat) {
        items.push(validateHat(face, mergedThresholds, mergedMessages));
      }
      if (rules.checkGlasses) {
        items.push(validateGlasses(face, mergedThresholds, mergedMessages));
      }
      if (rules.checkOcclusion) {
        items.push(validateOcclusion(face, mergedThresholds, mergedMessages));
      }

      return {
        isValid: items.every((item) => item.status === "pass"),
        items,
        faceCount: 1,
        faceScore: face.score,
      };
    },
    [bounds, mergedMessages, mergedThresholds, rules, resolveToImageElement],
  );

  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    videoRef,
    canvasRef,
    validation,
    isLoading,
    loadingProgress,
    isCameraReady,
    error,
    start,
    stop,
    capture,
    validateImage,
  };
}
