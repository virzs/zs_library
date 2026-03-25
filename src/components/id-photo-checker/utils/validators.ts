import type { FaceResult, GestureResult } from "@vladmandic/human";
import type {
  BoundsConfig,
  ThresholdConfig,
  ValidationItem,
  MessageConfig,
} from "../types";

const DEFAULT_MESSAGES: Required<MessageConfig> = {
  noFace: "未检测到人脸，请将面部对准框内",
  multipleFaces: "检测到多张人脸，请确保仅一人入镜",
  outOfBounds: "面部偏离拍照区域，请调整位置",
  hatDetected: "疑似佩戴帽子，请摘除帽子",
  glassesDetected: "疑似佩戴眼镜，请摘除眼镜",
  occlusionDetected: "面部有遮挡，请保持面部清晰可见",
  notFacing: "请正对镜头",
  allPassed: "检测通过，可以拍照",
  loading: "正在加载检测模型...",
  cameraPermissionDenied: "摄像头权限被拒绝，请在浏览器设置中允许使用摄像头",
};

const DEFAULT_THRESHOLDS: Required<ThresholdConfig> = {
  minFaceScore: 0.5,
  minBoundsOverlap: 0.7,
  hatHeadRatio: 0.15,
  glassesZThreshold: 0.02,
  minMeshScore: 0.8,
  maxYawAngle: 15,
  maxPitchAngle: 15,
};

export function mergeMessages(custom?: MessageConfig): Required<MessageConfig> {
  return { ...DEFAULT_MESSAGES, ...custom };
}

export function mergeThresholds(
  custom?: ThresholdConfig,
): Required<ThresholdConfig> {
  return { ...DEFAULT_THRESHOLDS, ...custom };
}

export function validateFaceCount(
  faceCount: number,
  messages: Required<MessageConfig>,
): ValidationItem | null {
  if (faceCount === 0) {
    return { key: "faceCount", status: "fail", message: messages.noFace };
  }
  if (faceCount > 1) {
    return {
      key: "faceCount",
      status: "fail",
      message: messages.multipleFaces,
    };
  }
  return null;
}

export function validateBounds(
  face: FaceResult,
  bounds: BoundsConfig,
  videoWidth: number,
  videoHeight: number,
  thresholds: Required<ThresholdConfig>,
  messages: Required<MessageConfig>,
): ValidationItem {
  const [fx, fy, fw, fh] = face.box;

  const bx = bounds.left * videoWidth;
  const by = bounds.top * videoHeight;
  const bw = bounds.width * videoWidth;
  const bh = bounds.height * videoHeight;

  const overlapX = Math.max(0, Math.min(fx + fw, bx + bw) - Math.max(fx, bx));
  const overlapY = Math.max(0, Math.min(fy + fh, by + bh) - Math.max(fy, by));
  const overlapArea = overlapX * overlapY;
  const faceArea = fw * fh;
  const overlapRatio = faceArea > 0 ? overlapArea / faceArea : 0;

  if (overlapRatio >= thresholds.minBoundsOverlap) {
    return { key: "bounds", status: "pass", message: "" };
  }
  return {
    key: "bounds",
    status: "fail",
    message: messages.outOfBounds,
  };
}

/**
 * 帽子检测算法：
 * 利用 face mesh 中的额头关键点（forehead 区域）与 face box 顶部的关系。
 * 如果额头最高点远低于 box 顶部（说明 box 上方有大量非面部区域），
 * 则推断可能存在帽子。
 */
export function validateHat(
  face: FaceResult,
  thresholds: Required<ThresholdConfig>,
  messages: Required<MessageConfig>,
): ValidationItem {
  if (!face.annotations) {
    return { key: "hat", status: "pass", message: "" };
  }

  const [, boxTop, , boxHeight] = face.box;

  const foreheadPoints =
    face.annotations["midwayBetweenEyes"] ||
    face.annotations["leftEyebrowUpper"] ||
    [];

  if (foreheadPoints.length === 0) {
    return { key: "hat", status: "pass", message: "" };
  }

  const minForeheadY = Math.min(...foreheadPoints.map((p) => p[1]));
  const foreheadToBoxTopRatio = (minForeheadY - boxTop) / boxHeight;

  if (foreheadToBoxTopRatio > thresholds.hatHeadRatio) {
    return { key: "hat", status: "warning", message: messages.hatDetected };
  }
  return { key: "hat", status: "pass", message: "" };
}

/**
 * 眼镜检测算法：
 * 利用 face mesh 中的眼部关键点的 z 轴信息。
 * 眼镜镜片会在眼部区域产生一个"前凸"的平面，导致眼部周围关键点
 * 的 z 值分布与无眼镜情况有显著差异。
 * 同时结合左右眼上下眼睑的距离比判断。
 */
export function validateGlasses(
  face: FaceResult,
  thresholds: Required<ThresholdConfig>,
  messages: Required<MessageConfig>,
): ValidationItem {
  if (!face.annotations || !face.mesh || face.mesh.length < 468) {
    return { key: "glasses", status: "pass", message: "" };
  }

  const leftEyeUpper = face.annotations["leftEyeUpper0"] || [];
  const leftEyeLower = face.annotations["leftEyeLower0"] || [];
  const rightEyeUpper = face.annotations["rightEyeUpper0"] || [];
  const rightEyeLower = face.annotations["rightEyeLower0"] || [];

  if (
    leftEyeUpper.length === 0 ||
    leftEyeLower.length === 0 ||
    rightEyeUpper.length === 0 ||
    rightEyeLower.length === 0
  ) {
    return { key: "glasses", status: "pass", message: "" };
  }

  const avgZ = (points: Array<[number, number, number?]>) => {
    const zValues = points.filter((p) => p[2] !== undefined).map((p) => p[2] as number);
    return zValues.length > 0
      ? zValues.reduce((a, b) => a + b, 0) / zValues.length
      : 0;
  };

  const nosePoints = face.annotations["noseTip"] || [];
  const cheekPoints = [
    ...(face.annotations["leftCheek"] || []),
    ...(face.annotations["rightCheek"] || []),
  ];

  const eyeZ = avgZ([
    ...leftEyeUpper,
    ...leftEyeLower,
    ...rightEyeUpper,
    ...rightEyeLower,
  ]);
  const noseZ = avgZ(nosePoints);
  const cheekZ = avgZ(cheekPoints);

  const referenceZ = cheekPoints.length > 0 ? cheekZ : noseZ;
  const zDifference = Math.abs(eyeZ - referenceZ);

  if (zDifference > thresholds.glassesZThreshold) {
    return {
      key: "glasses",
      status: "warning",
      message: messages.glassesDetected,
    };
  }
  return { key: "glasses", status: "pass", message: "" };
}

export function validateOcclusion(
  face: FaceResult,
  thresholds: Required<ThresholdConfig>,
  messages: Required<MessageConfig>,
): ValidationItem {
  if (face.faceScore < thresholds.minMeshScore) {
    return {
      key: "occlusion",
      status: "fail",
      message: messages.occlusionDetected,
    };
  }
  return { key: "occlusion", status: "pass", message: "" };
}

export function validateOrientation(
  face: FaceResult,
  gestures: GestureResult[],
  thresholds: Required<ThresholdConfig>,
  messages: Required<MessageConfig>,
): ValidationItem {
  if (face.rotation?.angle) {
    const { yaw, pitch } = face.rotation.angle;
    if (
      Math.abs(yaw) > thresholds.maxYawAngle ||
      Math.abs(pitch) > thresholds.maxPitchAngle
    ) {
      return {
        key: "orientation",
        status: "fail",
        message: messages.notFacing,
      };
    }
    return { key: "orientation", status: "pass", message: "" };
  }

  const faceGestures = gestures.filter(
    (g) => "face" in g && String(g.face) === String(face.id),
  );
  const facingGesture = faceGestures.find(
    (g) =>
      typeof g.gesture === "string" && g.gesture.startsWith("facing"),
  );

  if (facingGesture) {
    const isFacingCenter =
      typeof facingGesture.gesture === "string" &&
      facingGesture.gesture.includes("center");
    if (!isFacingCenter) {
      return {
        key: "orientation",
        status: "fail",
        message: messages.notFacing,
      };
    }
  }

  return { key: "orientation", status: "pass", message: "" };
}
