import React, { useCallback, useMemo } from "react";
import { useIdPhotoChecker } from "./hooks/use-id-photo-checker";
import type {
  IdPhotoCheckerProps,
  ValidationResult,
  BoundsConfig,
} from "./types";

const DEFAULT_BOUNDS: BoundsConfig = {
  left: 0,
  top: 0,
  width: 1,
  height: 1,
};

const IdPhotoChecker: React.FC<IdPhotoCheckerProps> = ({
  className,
  width = 400,
  height = 500,
  rules,
  bounds = DEFAULT_BOUNDS,
  thresholds,
  camera,
  messages,
  modelBasePath,
  detectInterval = 200,
  debug = false,
  autoStart = true,
  guideBorderPassColor = "#4ade80",
  guideBorderFailColor = "#f87171",
  guideShape = "bust",
  loadingComponent,
  errorComponent,
  value,
  onChange,
  onValidationChange,
  onCapture,
  onReady,
  onError,
}) => {
  const {
    videoRef,
    validation,
    isLoading,
    loadingProgress,
    isCameraReady,
    error,
    capture,
  } = useIdPhotoChecker({
    rules,
    bounds,
    thresholds,
    camera,
    messages,
    modelBasePath,
    detectInterval,
    autoStart,
    onValidationChange,
    onReady,
    onError,
  });

  const borderColor = validation.isValid
    ? guideBorderPassColor
    : guideBorderFailColor;

  const containerStyle: React.CSSProperties = useMemo(
    () => ({
      position: "relative",
      width: `${width}px`,
      height: `${height}px`,
      overflow: "hidden",
      backgroundColor: "#000",
      borderRadius: "8px",
    }),
    [width, height],
  );

  const videoStyle: React.CSSProperties = useMemo(
    () => ({
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transform: "scaleX(-1)",
    }),
    [],
  );

  const overlayStyle: React.CSSProperties = useMemo(
    () => ({
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: "12px",
      background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
      color: "#fff",
      fontSize: "14px",
    }),
    [],
  );

  const handleCapture = useCallback(() => {
    const imageData = capture();
    if (imageData) {
      onChange?.(imageData);
      onCapture?.(imageData, validation);
    }
  }, [capture, onChange, onCapture, validation]);

  const handleRetake = useCallback(() => {
    onChange?.(undefined);
  }, [onChange]);

  const activeMessages = validation.items
    .filter((item) => item.status !== "pass" && item.message)
    .map((item) => item.message);

  const displayMessage =
    activeMessages.length > 0
      ? activeMessages[0]
      : validation.isValid
        ? (messages?.allPassed ?? "检测通过，可以拍照")
        : "";

  const guideOverlay = useMemo(() => {
    if (guideShape !== "bust") {
      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          {guideShape}
        </div>
      );
    }

    return (
      <BustGuide
        x={bounds.left}
        y={bounds.top}
        w={bounds.width}
        h={bounds.height}
        color={borderColor}
        containerWidth={width}
        containerHeight={height}
      />
    );
  }, [guideShape, bounds, borderColor]);

  if (value) {
    return (
      <div style={containerStyle} className={className}>
        <img
          src={value}
          alt="证件照预览"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div style={overlayStyle}>
          <button
            onClick={handleRetake}
            style={{
              display: "block",
              width: "100%",
              padding: "10px 0",
              border: "none",
              borderRadius: "6px",
              backgroundColor: "#6b7280",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            重新拍照
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    if (errorComponent) {
      return (
        <div style={containerStyle} className={className}>
          {typeof errorComponent === "function"
            ? errorComponent(error)
            : errorComponent}
        </div>
      );
    }
    return (
      <div style={containerStyle} className={className}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#f87171",
            fontSize: "14px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          {error.message}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <div style={containerStyle} className={className}>
        <video
          ref={videoRef}
          style={{ ...videoStyle, position: "absolute", opacity: 0 }}
          autoPlay
          playsInline
          muted
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#fff",
            fontSize: "14px",
            gap: "16px",
            padding: "0 40px",
          }}
        >
          <span>{messages?.loading ?? "正在加载检测模型..."}</span>
          <div
            style={{
              width: "100%",
              height: "6px",
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${loadingProgress}%`,
                height: "100%",
                backgroundColor: "#4ade80",
                borderRadius: "3px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <span style={{ fontSize: "12px", opacity: 0.7 }}>
            {loadingProgress}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle} className={className}>
      <video
        ref={videoRef}
        style={videoStyle}
        autoPlay
        playsInline
        muted
      />

      {guideOverlay}

      <div style={overlayStyle}>
        <div
          style={{
            textAlign: "center",
            marginBottom: (onCapture || onChange) ? "8px" : "0",
          }}
        >
          {displayMessage && (
            <span
              style={{
                color: validation.isValid ? guideBorderPassColor : "#fbbf24",
              }}
            >
              {displayMessage}
            </span>
          )}
        </div>

        {(onCapture || onChange) && isCameraReady && (
          <button
            onClick={handleCapture}
            disabled={!validation.isValid}
            style={{
              display: "block",
              width: "100%",
              padding: "10px 0",
              border: "none",
              borderRadius: "6px",
              backgroundColor: validation.isValid ? "#4ade80" : "#6b7280",
              color: "#fff",
              fontSize: "16px",
              fontWeight: 600,
              cursor: validation.isValid ? "pointer" : "not-allowed",
              transition: "background-color 0.3s",
            }}
          >
            拍照
          </button>
        )}
      </div>

      {debug && isCameraReady && (
        <DebugPanel validation={validation} />
      )}
    </div>
  );
};

interface BustGuideProps {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  containerWidth: number;
  containerHeight: number;
}

const BustGuide: React.FC<BustGuideProps> = ({ x, y, w, h, color, containerWidth, containerHeight }) => {
  const vw = 100;
  const vh = 100;

  const pxLeft = x * containerWidth;
  const pxTop = y * containerHeight;
  const pxW = w * containerWidth;
  const pxH = h * containerHeight;

  const toX = (px: number) => pxLeft + (px / vw) * pxW;
  const toY = (py: number) => pxTop + (py / vh) * pxH;

  const outline = [
    `M ${toX(50)} ${toY(5)}`,
    `C ${toX(70)} ${toY(4)}, ${toX(86)} ${toY(16)}, ${toX(86)} ${toY(36)}`,
    `C ${toX(86)} ${toY(55)}, ${toX(74)} ${toY(63)}, ${toX(66)} ${toY(65)}`,
    `C ${toX(76)} ${toY(67)}, ${toX(90)} ${toY(72)}, ${toX(100)} ${toY(78)}`,
    `L ${toX(100)} ${toY(100)}`,
    `L ${toX(0)} ${toY(100)}`,
    `L ${toX(0)} ${toY(78)}`,
    `C ${toX(10)} ${toY(72)}, ${toX(24)} ${toY(67)}, ${toX(34)} ${toY(65)}`,
    `C ${toX(26)} ${toY(63)}, ${toX(14)} ${toY(55)}, ${toX(14)} ${toY(36)}`,
    `C ${toX(14)} ${toY(16)}, ${toX(30)} ${toY(4)}, ${toX(50)} ${toY(5)}`,
    `Z`,
  ].join(" ");

  return (
    <svg
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      width="100%"
      height="100%"
    >
      <path
        d={outline}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "stroke 0.3s ease" }}
      />
    </svg>
  );
};

const DebugPanel: React.FC<{ validation: ValidationResult }> = ({
  validation,
}) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      right: 0,
      padding: "8px",
      background: "rgba(0,0,0,0.7)",
      color: "#fff",
      fontSize: "11px",
      fontFamily: "monospace",
      maxWidth: "200px",
      pointerEvents: "none",
    }}
  >
    <div>faces: {validation.faceCount}</div>
    <div>score: {validation.faceScore.toFixed(2)}</div>
    <div>valid: {String(validation.isValid)}</div>
    {validation.items.map((item) => (
      <div
        key={item.key}
        style={{
          color:
            item.status === "pass"
              ? "#4ade80"
              : item.status === "warning"
                ? "#fbbf24"
                : "#f87171",
        }}
      >
        {item.key}: {item.status}
      </div>
    ))}
  </div>
);

export { IdPhotoChecker };
export { useIdPhotoChecker } from "./hooks/use-id-photo-checker";

export type {
  IdPhotoCheckerProps,
  UseIdPhotoCheckerReturn,
  ValidationResult,
  ValidationItem,
  ValidationStatus,
  ValidationRuleConfig,
  BoundsConfig,
  ThresholdConfig,
  CameraConfig,
  MessageConfig,
  ValidatableImage,
} from "./types";

export default IdPhotoChecker;
