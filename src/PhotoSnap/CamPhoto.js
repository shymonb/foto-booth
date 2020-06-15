import React, {
  useEffect,
  useRef,
  useCallback,
  useReducer,
  useImperativeHandle,
} from "react";
import PropTypes from "prop-types";

const ACTION_VIEWPORT_CHANGED = "viewport_changed";
const ACTION_STREAMING_STARTED = "streaming_started";
const ACTION_SNAP_TAKEN = "snap_taken";
const ACTION_SNAP_CLEARED = "snap_cleared";

const isNumber = (value) =>
  typeof value === "number" &&
  value === value &&
  value !== Infinity &&
  value !== -Infinity;

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

    const calculateCrop = useCallback(
      (vw, vh) => {
        let cw = 0,
          ch = 0;
        if (isNumber(cropWidth) && isNumber(cropHeight)) {
          cw = cropWidth * vw;
          ch = cropHeight * vh;
        } else if (
          isNumber(cropRatio) &&
          (isNumber(cropWidth) || isNumber(cropHeight))
        ) {
          cw = isNumber(cropWidth)
            ? cropWidth * vw
            : cropRatio * (cropHeight * vh);
          ch = isNumber(cropHeight)
            ? cropHeight * vh
            : cropRatio * (cropWidth * vw);
        }

        let cx = 0;
        if (isNumber(cropLeft)) {
          cx = cropLeft * vw;
        } else {
          const xvals = {
            left: 0,
            center: vw / 2 - cw / 2,
            right: vw - cw,
          };
          cx = xvals[cropLeft?.toLowerCase()] || 0;
        }

        let cy = 0;
        if (isNumber(cropTop)) {
          cy = cropTop * vh;
        } else {
          const yvals = {
            top: 0,
            center: vh / 2 - ch / 2,
            bottom: vh - ch,
          };
          cy = yvals[cropTop?.toLowerCase()] || 0;
        }

        return { x: cx, y: cy, w: cw, h: ch };
      },
      [cropWidth, cropHeight, cropRatio, cropLeft, cropTop]
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
        const { x, y, w, h } = calculateCrop(video.w, video.h);

        const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
        canvas.width = Math.floor(w * scale);
        canvas.height = Math.floor(h * scale);

        // Normalize coordinate system to use css pixels.
        context.scale(scale, scale);
        context.drawImage(videoRef.current, x, y, w, h, 0, 0, w, h);

        const data = canvas.toDataURL("image/jpeg");
        dispatch({ type: ACTION_SNAP_TAKEN, data });
      } else {
        // clearPhoto();
        dispatch({ type: ACTION_SNAP_CLEARED });
      }
    }, [state, calculateCrop]);

    useImperativeHandle(ref, () => ({
      snap,
    }));

    // draw overlay
    useEffect(() => {
      console.log("effect draw overlay");
      const canvas = overlayCanvasRef.current;
      const context = canvas.getContext("2d");

      const { viewport } = state;
      const crop = calculateCrop(viewport.w, viewport.h);

      context.clearRect(0, 0, viewport.w, viewport.h);
      context.fillStyle = "rgba(0,0,0,0.5)";
      context.fillRect(0, 0, viewport.w, viewport.h);
      context.clearRect(crop.x, crop.y, crop.w, crop.h);

      context.strokeStyle = "white";
      context.strokeRect(crop.x + 0.5, crop.y + 0.5, crop.w - 1, crop.h - 1);
    }, [calculateCrop, state, state.viewport]);

    const handleCanPlay = useCallback(() => {
      if (!state.isStreaming) {
        const videoWidth = videoRef.current?.videoWidth;
        const videoHeight = videoRef.current?.videoHeight;
        console.log("video size: ", videoWidth, videoHeight);
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
      console.log("effect start streaming");
      const startStreaming = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: 1920,
              height: 1080,
            },
            audio: false,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } catch (err) {
          console.error("Failed to get user media", err);
        }
      };
      startStreaming();
    }, []);

    const { viewport, video } = state;
    const crop = calculateCrop(viewport.w, viewport.h);
    console.log("Render ", state);
    return (
      <div className="d-flex justify-content-center photo-snap" ref={ref}>
        <div className="camera position-relative">
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
          />
        </div>
        <canvas
          className="d-none"
          ref={canvasRef}
          width={video.w}
          height={video.h}
        ></canvas>
        <div className="photo-snap-output pl-3">
          <img
            alt="The screen capture will appear in this box."
            src={state.snapData}
            width={crop.w}
            height={crop.h}
            className={`${state.snapData ? "d-inline-block" : "d-none"}`}
          />
          <div
            className={`${
              state.snapData ? "d-none" : "d-inline-block"
            } bg-white`}
            style={{ width: crop.w, height: crop.h }}
          />
        </div>
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
