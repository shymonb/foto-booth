import React, {
  useEffect,
  useRef,
  useCallback,
  useReducer,
  useImperativeHandle,
} from "react";
import PropTypes from "prop-types";
import useCrop from "./useCrop";

const ACTION_VIEWPORT_CHANGED = "viewport_changed";
const ACTION_STREAMING_STARTED = "streaming_started";
const ACTION_SNAP_TAKEN = "snap_taken";
const ACTION_SNAP_CLEARED = "snap_cleared";

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION_STREAMING_STARTED:
      return {
        ...state,
        isStreaming: true,
        viewport: action.viewport,
        video: action.video,
      };
    case ACTION_VIEWPORT_CHANGED:
      return {
        ...state,
        viewport: {
          width: action.width,
          height: action.height,
        },
      };
    case ACTION_SNAP_TAKEN:
      return {
        ...state,
        snapData: action.data,
      };
    case ACTION_SNAP_CLEARED:
      return {
        ...state,
        snapData: null,
      };
    default:
      throw new Error("Unknown action");
  }
};

const CamPhoto = React.forwardRef(
  ({ width, cropTop, cropLeft, cropWidth, cropHeight, cropRatio }, ref) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);

    const initialCropWidth = width / 3;
    const initialHeight = initialCropWidth * 1.7;

    const [state, dispatch] = useReducer(reducer, {
      isStreaming: false,
      snapData: null,
      viewport: { w: width, h: initialHeight },
      video: { w: width, h: 0 },
    });

    const { viewport, video } = state;
    const crop = useCrop(
      viewport.w,
      viewport.h,
      cropLeft,
      cropTop,
      cropWidth,
      cropHeight,
      cropRatio
    );
    const videoCrop = useCrop(
      video.w,
      video.h,
      cropLeft,
      cropTop,
      cropWidth,
      cropHeight,
      cropRatio
    );

    const snap = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Ref for canvas or photo are not set", canvas);
        return;
      }

      const { video } = state;
      const context = canvas.getContext("2d");
      if (video.w && video.h) {
        const { x, y, w, h } = videoCrop;

        const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
        canvas.width = Math.floor(w * scale);
        canvas.height = Math.floor(h * scale);

        // Normalize coordinate system to use css pixels.
        context.scale(scale, scale);
        context.drawImage(videoRef.current, x, y, w, h, 0, 0, w, h);

        const data = canvas.toDataURL("image/jpeg");
        dispatch({ type: ACTION_SNAP_TAKEN, data });
        return {
          width: w,
          height: h,
          previewWidth: crop.w,
          previewHeight: crop.h,
          data,
        };
      } else {
        dispatch({ type: ACTION_SNAP_CLEARED });
      }
    }, [crop.h, crop.w, state, videoCrop]);

    useImperativeHandle(ref, () => ({
      snap,
    }));

    // draw overlay
    useEffect(() => {
      const canvas = overlayCanvasRef.current;
      const context = canvas.getContext("2d");

      // const { viewport } = state;

      context.clearRect(0, 0, viewport.w, viewport.h);
      context.fillStyle = "rgba(0,0,0,0.5)";
      context.fillRect(0, 0, viewport.w, viewport.h);
      context.clearRect(crop.x, crop.y, crop.w, crop.h);

      context.strokeStyle = "white";
      context.strokeRect(crop.x + 0.5, crop.y + 0.5, crop.w - 1, crop.h - 1);
    }, [
      crop.h,
      crop.w,
      crop.x,
      crop.y,
      state,
      state.viewport,
      viewport.h,
      viewport.w,
    ]);

    const handleCanPlay = useCallback(() => {
      if (!state.isStreaming) {
        const videoWidth = videoRef.current?.videoWidth;
        const videoHeight = videoRef.current?.videoHeight;
        const h = Math.floor(videoHeight / (videoWidth / width));
        dispatch({
          type: ACTION_STREAMING_STARTED,
          viewport: { w: width, h },
          video: {
            w: videoWidth,
            h: videoHeight,
          },
        });
      }
    }, [state.isStreaming, width]);

    useEffect(() => {
      const videoElement = videoRef?.current;
      const startStreaming = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: 1920,
              height: 1080,
            },
            audio: false,
          });
          if (videoElement) {
            videoElement.srcObject = stream;
            videoElement.play();
          }
        } catch (err) {
          console.error("Failed to get user media", err);
        }
      };
      startStreaming();

      return () => {
        if (videoElement?.srcObject) {
          videoElement.srcObject.getTracks().forEach((track) => {
            track.stop();
          });
        }
      };
    }, []);

    return (
      <div className="position-relative" ref={ref}>
        <video
          ref={videoRef}
          onCanPlay={handleCanPlay}
          width={viewport.w}
          height={viewport.h}
        >
          Video stream not available.
        </video>
        <canvas
          className="photo-snap-overlay"
          ref={overlayCanvasRef}
          width={viewport.w}
          height={viewport.h}
        ></canvas>
        <canvas
          className="d-none"
          ref={canvasRef}
          width={video.w}
          height={video.h}
        ></canvas>
      </div>
    );
  }
);

CamPhoto.propTypes = {
  width: PropTypes.number,
  cropTop: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cropLeft: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cropWidth: PropTypes.number,
  cropHeight: PropTypes.number,
  cropRatio: PropTypes.number,
};

export default CamPhoto;
