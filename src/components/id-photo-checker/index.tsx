import React, { useCallback, useMemo } from "react";
import { useIdPhotoChecker } from "./hooks/use-id-photo-checker";
import type {
  IdPhotoCheckerProps,
  ValidationResult,
  BoundsConfig,
} from "./types";

const DEFAULT_BOUNDS: BoundsConfig = {
  left: 0.2,
  top: 0.05,
  width: 0.6,
  height: 0.85,
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
    if (!isCameraReady) return null;

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

    const x = bounds.left * 100;
    const y = bounds.top * 100;
    const w = bounds.width * 100;
    const h = bounds.height * 100;

    return (
      <BustGuide
        x={x}
        y={y}
        w={w}
        h={h}
        color={borderColor}
      />
    );
  }, [isCameraReady, guideShape, bounds, borderColor]);

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
}

const BustGuide: React.FC<BustGuideProps> = ({ x, y, w, h, color }) => {
  const vw = 100;
  const vh = 130;

  const top = y;
  const left = x;

  const scaleX = (v: number) => (v / vw) * 100;
  const scaleY = (v: number) => (v / vh) * 100;

  const toX = (px: number) => left + scaleX(px) * (w / 100);
  const toY = (py: number) => top + scaleY(py) * (h / 100);

  const outline = [
    `M ${toX(50)} ${toY(2)}`,
    `C ${toX(72)} ${toY(2)}, ${toX(84)} ${toY(14)}, ${toX(84)} ${toY(30)}`,
    `C ${toX(84)} ${toY(46)}, ${toX(74)} ${toY(55)}, ${toX(62)} ${toY(58)}`,
    `C ${toX(60)} ${toY(62)}, ${toX(60)} ${toY(66)}, ${toX(62)} ${toY(68)}`,
    `C ${toX(72)} ${toY(70)}, ${toX(90)} ${toY(78)}, ${toX(98)} ${toY(92)}`,
    `L ${toX(100)} ${toY(130)}`,
    `L ${toX(0)} ${toY(130)}`,
    `L ${toX(2)} ${toY(92)}`,
    `C ${toX(10)} ${toY(78)}, ${toX(28)} ${toY(70)}, ${toX(38)} ${toY(68)}`,
    `C ${toX(40)} ${toY(66)}, ${toX(40)} ${toY(62)}, ${toX(38)} ${toY(58)}`,
    `C ${toX(26)} ${toY(55)}, ${toX(16)} ${toY(46)}, ${toX(16)} ${toY(30)}`,
    `C ${toX(16)} ${toY(14)}, ${toX(28)} ${toY(2)}, ${toX(50)} ${toY(2)}`,
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
