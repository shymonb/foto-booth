import React, {
  useImperativeHandle,
  useReducer,
  useRef,
  useEffect,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import useCrop from "./useCrop";

const DEFAULT_RATIO = 0.75;

const ACTION_IMAGE_LOADED = "image_loaded";
const ACTION_SNAP_TAKEN = "snap_taken";
const ACTION_SNAP_CLEARED = "snap_cleared";

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION_IMAGE_LOADED:
      return {
        ...state,
        image: {
          url: action.url,
          w: action.width,
          h: action.height,
          pw: action.previewWidth,
          ph: action.previewHeight,
          px: action.previewLeft,
          py: action.previewTop,
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

const FilePhoto = React.forwardRef(
  (
    {
      width,
      height,
      cropTop,
      cropLeft,
      cropWidth,
      cropHeight,
      cropRatio,
      file,
    },
    ref
  ) => {
    const imageRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const [state, dispatch] = useReducer(reducer, {
      snapData: null,
      viewport: { w: width, h: height || Math.floor(width * DEFAULT_RATIO) },
      image: { w: 0, h: 0, url: "", pw: 0, ph: 0 },
    });

    const { viewport, image } = state;
    const crop = useCrop(
      viewport.w,
      viewport.h,
      cropLeft,
      cropTop,
      cropWidth,
      cropHeight,
      cropRatio
    );
    const imageCrop = useCrop(
      image.w,
      image.h,
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

      const { image } = state;
      const context = canvas.getContext("2d");
      if (image.w && image.h) {
        const { x, y, w, h } = imageCrop;

        const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
        canvas.width = Math.floor(w * scale);
        canvas.height = Math.floor(h * scale);

        // Normalize coordinate system to use css pixels.
        context.scale(scale, scale);
        context.drawImage(imageRef.current, x, y, w, h, 0, 0, w, h);

        const data = canvas.toDataURL("image/jpeg");
        dispatch({ type: ACTION_SNAP_TAKEN, data });
      } else {
        dispatch({ type: ACTION_SNAP_CLEARED });
      }
    }, [imageCrop, state]);

    useImperativeHandle(ref, () => ({
      snap,
    }));

    useEffect(() => {
      if (!file) {
        return;
      }

      const canvas = canvasRef?.current;
      if (!canvas) {
        console.error("Canvas ref is not set");
        return;
      }
      console.log("image file has changed", file);

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const viewportRatio = viewport.h / viewport.w;
        const xres = img.naturalWidth;
        const yres = img.naturalHeight;

        const ih = yres;
        const iw = yres * (1 / viewportRatio);

        const context = canvas.getContext("2d");
        canvas.width = iw;
        canvas.height = ih;
        context.clearRect(0, 0, iw, ih);
        context.drawImage(
          img,
          Math.floor((iw - xres) / 2),
          Math.floor((ih - yres) / 2)
        );
        const imageUrl = canvas.toDataURL("image/png");
        dispatch({
          type: ACTION_IMAGE_LOADED,
          url: imageUrl,
          width: iw,
          height: ih,
          previewLeft: 0,
          previewTop: 0,
          previewWidth: viewport.w,
          previewHeight: viewport.h,
        });
      };
      img.src = url;
    }, [file, viewport, viewport.h, viewport.w]);

    // draw overlay
    useEffect(() => {
      console.log("effect draw overlay");
      const canvas = overlayCanvasRef.current;
      const context = canvas.getContext("2d");

      context.clearRect(0, 0, viewport.w, viewport.h);
      context.fillStyle = "rgba(0,0,0,0.5)";
      context.fillRect(0, 0, viewport.w, viewport.h);
      context.clearRect(crop.x, crop.y, crop.w, crop.h);

      context.strokeStyle = "white";
      context.strokeRect(crop.x + 0.5, crop.y + 0.5, crop.w - 1, crop.h - 1);
    }, [
      crop,
      crop.h,
      crop.w,
      crop.x,
      crop.y,
      state,
      state.viewport,
      viewport.h,
      viewport.w,
    ]);

    console.log("filePhoto: ", state);
    return (
      <div className="d-flex">
        <div
          ref={ref}
          style={{ width: viewport.w, height: viewport.h }}
          className="text-dark photo-snap-filebg "
        >
          <img
            ref={imageRef}
            src={image.url}
            width={image.pw}
            height={image.ph}
            alt="obrazek"
            className="position-relative"
            style={{ top: image.py, left: image.px }}
          />
          <canvas
            className="photo-snap-overlay"
            ref={overlayCanvasRef}
            width={viewport.w}
            height={viewport.h}
          />
        </div>
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
        <canvas className="border d-none" ref={canvasRef}></canvas>
      </div>
    );
  }
);

FilePhoto.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  cropTop: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cropLeft: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cropWidth: PropTypes.number,
  cropHeight: PropTypes.number,
  cropRatio: PropTypes.number,
  file: PropTypes.object,
};

export default FilePhoto;
