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

    if (guideShape !== "bust" && guideShape !== "oval") {
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

    if (guideShape === "oval") {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const rx = w / 2;
      const ry = h / 2;
      return (
        <svg
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke={borderColor}
            strokeWidth="0.6"
            style={{ transition: "stroke 0.3s ease" }}
          />
        </svg>
      );
    }

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
  const cx = x + w / 2;

  const headH = h * 0.42;
  const headW = w * 0.52;
  const headCy = y + headH * 0.54;
  const headRx = headW / 2;
  const headRy = headH / 2;

  const neckW = w * 0.14;
  const neckTop = headCy + headRy * 0.75;
  const neckBot = y + h * 0.62;

  const shoulderY = y + h * 0.72;
  const bustBotY = y + h;

  const shoulderSpread = w * 0.72;
  const bustW = w * 0.96;

  const neckL = cx - neckW / 2;
  const neckR = cx + neckW / 2;
  const shoulderL = cx - shoulderSpread / 2;
  const shoulderR = cx + shoulderSpread / 2;
  const bustL = cx - bustW / 2;
  const bustR = cx + bustW / 2;

  const cp1Lx = neckL - w * 0.04;
  const cp1Ly = neckBot + (shoulderY - neckBot) * 0.3;
  const cp2Lx = shoulderL + w * 0.04;
  const cp2Ly = shoulderY - h * 0.02;

  const cp1Rx = neckR + w * 0.04;
  const cp1Ry = cp1Ly;
  const cp2Rx = shoulderR - w * 0.04;
  const cp2Ry = cp2Ly;

  const bustPath = [
    `M ${neckL} ${neckTop}`,
    `C ${cp1Lx} ${cp1Ly}, ${cp2Lx} ${cp2Ly}, ${shoulderL} ${shoulderY}`,
    `L ${bustL} ${bustBotY}`,
    `L ${bustR} ${bustBotY}`,
    `L ${shoulderR} ${shoulderY}`,
    `C ${cp2Rx} ${cp2Ry}, ${cp1Rx} ${cp1Ry}, ${neckR} ${neckTop}`,
  ].join(" ");

  const headPath = `
    M ${cx - headRx} ${headCy}
    A ${headRx} ${headRy} 0 1 1 ${cx + headRx} ${headCy}
    A ${headRx} ${headRy} 0 1 1 ${cx - headRx} ${headCy}
  `;

  return (
    <svg
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        d={bustPath}
        fill="none"
        stroke={color}
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "stroke 0.3s ease" }}
      />
      <path
        d={headPath}
        fill="none"
        stroke={color}
        strokeWidth="0.6"
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
} from "./types";

export default IdPhotoChecker;
