import React, { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";

import "./PhotoBooth.css";

const isNumber = (value) =>
  typeof value === "number" &&
  value === value &&
  value !== Infinity &&
  value !== -Infinity;

const PhotoBooth = ({
  viewportWidth = 320,
  cropTop,
  cropLeft,
  cropWidth,
  cropHeight,
  cropRatio,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const photoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const clearPhoto = useCallback(() => {
    const canvas = canvasRef.current;
    const photo = photoRef.current;
    if (!canvas || !photo) {
      console.error("Ref for canvas or photo are not set", canvas, photo);
      return;
    }
    const context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }, []);

  const takePicture = useCallback(() => {
    const canvas = canvasRef.current;
    const photo = photoRef.current;
    if (!canvas || !photo) {
      console.error("Ref for canvas or photo are not set", canvas, photo);
      return;
    }

    const context = canvas.getContext("2d");
    if (viewportWidth && viewportHeight) {
      canvas.width = viewportWidth;
      canvas.height = viewportHeight;
      context.drawImage(videoRef.current, 0, 0, viewportWidth, viewportHeight);

      const data = canvas.toDataURL("image/png");
      photo.setAttribute("src", data);
    } else {
      clearPhoto();
    }
  }, [viewportWidth, viewportHeight, clearPhoto]);

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

      setCrop({ x: cx, y: cy, w: cw, h: ch });
    },
    [cropWidth, cropHeight, cropRatio, cropLeft, cropTop, setCrop]
  );

  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    const context = canvas.getContext("2d");

    context.fillStyle = "rgba(0,0,0,0.4)";
    context.fillRect(0, 0, viewportWidth, viewportHeight);
    context.clearRect(crop.x, crop.y, crop.w, crop.h);

    context.strokeStyle = "black";
    context.strokeRect(0.5, 0.5, viewportWidth, viewportHeight);

    context.strokeStyle = "white";
    context.strokeRect(crop.x + 0.5, crop.y + 0.5, crop.w - 1, crop.h - 1);
  }, [crop, viewportHeight, viewportWidth]);

  const handleCanPlay = useCallback(() => {
    if (!isStreaming) {
      const h =
        videoRef.current?.videoHeight /
        (videoRef.current?.videoWidth / viewportWidth);
      if (videoRef.current) {
        videoRef.current.setAttribute("width", viewportWidth);
        videoRef.current.setAttribute("height", h);
      }
      if (canvasRef.current) {
        canvasRef.current.setAttribute("width", viewportWidth);
        canvasRef.current.setAttribute("height", h);
      }
      setIsStreaming(true);
      setViewportHeight(h);
    }
  }, [isStreaming, viewportWidth]);

  const handleTakePicture = useCallback(
    (ev) => {
      takePicture();
      ev.preventDefault();
    },
    [takePicture]
  );

  useEffect(() => {
    if (isStreaming && viewportWidth > 0 && viewportHeight > 0) {
      calculateCrop(viewportWidth, viewportHeight);
    }
  }, [viewportWidth, viewportHeight, isStreaming, calculateCrop]);

  useEffect(() => {
    const startStreaming = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
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

  console.log("Render ", viewportWidth, viewportHeight);
  return (
    <div className="d-flex justify-content-center photo-booth">
      <div className="camera position-relative">
        <video ref={videoRef} onCanPlay={handleCanPlay}>
          Video stream not available.
        </video>
        <canvas
          className="photo-booth-overlay"
          width={viewportWidth}
          height={viewportHeight}
          ref={overlayCanvasRef}
        />
        <div className="photo-booth-tools">
          <button className="m-3 btn btn-primary" onClick={handleTakePicture}>
            Take photo
          </button>
        </div>
      </div>
      <canvas className="d-none" ref={canvasRef}></canvas>
      <div className="photo-booth-output">
        <img
          alt="The screen capture will appear in this box."
          ref={photoRef}
          width={crop.w}
          height={crop.h}
          className="d-inline-block"
        />
      </div>
    </div>
  );
};

PhotoBooth.propTypes = {
  viewportWidth: PropTypes.number,
  width: PropTypes.number,
  cropTop: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cropLeft: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cropWidth: PropTypes.number,
  cropHeight: PropTypes.number,
  cropRatio: PropTypes.number,
};

export default PhotoBooth;
