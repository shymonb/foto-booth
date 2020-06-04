import React, { useEffect, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

import './PhotoBooth.css';

const isNumber = value => typeof value === 'number' && value === value && value !== Infinity && value !== -Infinity;

const PhotoBooth = ({ viewportWidth = 320, cropTop, cropLeft, cropWidth, cropHeight, cropBottom, cropRight, cropRatio }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const photoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  const clearPhoto = useCallback(() => {
    const canvas = canvasRef.current;
    const photo = photoRef.current;
    if (!canvas || !photo) {
      console.error('Ref for canvas or photo are not set', canvas, photo);
      return;
    }
    const context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
  }, [])

  const takePicture = useCallback(() => {
    const canvas = canvasRef.current;
    const photo = photoRef.current;
    if (!canvas || !photo) {
      console.error('Ref for canvas or photo are not set', canvas, photo);
      return;
    }

    const context = canvas.getContext('2d');
    if (viewportWidth && viewportHeight) {
      canvas.width = viewportWidth;
      canvas.height = viewportHeight;
      context.drawImage(videoRef.current, 0, 0, viewportWidth, viewportHeight);

      const data = canvas.toDataURL('image/png');
      photo.setAttribute('src', data);
    } else {
      clearPhoto();
    }
  }, [viewportWidth, viewportHeight, clearPhoto]);

  const createOverlay = useCallback((vw, vh) => {
    const canvas = overlayCanvasRef.current;
    const context = canvas.getContext('2d');

    const w = (isNumber(cropWidth) && cropWidth)
      || (isNumber(cropRight) && isNumber(cropLeft) && (cropRight - cropLeft))
      || (isNumber(cropHeight) && isNumber(cropRatio) && (cropHeight * cropRatio));

    const h = (isNumber(cropHeight) && cropHeight)
      || (isNumber(cropBottom) && isNumber(cropTop) && (cropBottom - cropTop))
      || (isNumber(cropWidth) && isNumber(cropRatio) && (cropWidth * cropRatio));


    const x = (isNumber(cropLeft) && cropLeft)
      || (isNumber(cropRight) && isNumber(w) && (cropRight - w));

    const y = (isNumber(cropTop) && cropTop)
      || (isNumber(cropBottom) && isNumber(h) && (cropBottom - h));

    // const y = cropTop || (cropBottom - h);
    console.log(x, y, w, h);
    console.log(vw * x, vh * y, vw * w, vh * h);
    // const r = viewportHeight / viewportWidth;
    // context.clearRect(viewportWidth * x, viewportHeight * y, viewportWidth * w, viewportHeight * h);
    context.strokeStyle = 'green';
    context.strokeRect(viewportWidth * x, viewportHeight * y, viewportWidth * w, viewportHeight * h);
    // context.strokeRect(20, 10, 160, 100);
  }, [cropLeft, cropRight, cropTop, cropBottom, cropWidth, cropHeight, cropRatio]);

  const handleCanPlay = useCallback(() => {
    if (!isStreaming) {
      const h = videoRef.current?.videoHeight / (videoRef.current?.videoWidth / viewportWidth);
      if (videoRef.current) {
        videoRef.current.setAttribute('width', viewportWidth);
        videoRef.current.setAttribute('height', h);
      }
      if (canvasRef.current) {
        canvasRef.current.setAttribute('width', viewportWidth);
        canvasRef.current.setAttribute('height', h);
      }
      setIsStreaming(true);
      setViewportHeight(h);
      createOverlay(viewportWidth, h);
    }
  }, [viewportWidth, isStreaming, setIsStreaming, setViewportHeight]);

  const handleTakePicture = useCallback((ev) => {
    takePicture();
    ev.preventDefault();
  }, [takePicture]);

  useEffect(() => {
    const startStreaming = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error('Failed to get user media', err);
      }
    }
    startStreaming();
  }, []);

  return (
    <div className="d-flex justify-content-center photo-booth">
      <div className="camera position-relative">
        <video ref={videoRef} onCanPlay={handleCanPlay}>Video stream not available.</video>
        <canvas className="photo-booth-overlay" ref={overlayCanvasRef} />
        <div className="photo-booth-tools">
          <button className="m-3 btn btn-primary" onClick={handleTakePicture}>Take photo</button>
        </div>
      </div>
      <canvas className="d-none" ref={canvasRef}>
      </canvas>
      <div className="photo-booth-output">
        <img alt="The screen capture will appear in this box." ref={photoRef} />
      </div>
    </div>
  )
}

PhotoBooth.propTypes = {
  viewportWidth: PropTypes.number,
  width: PropTypes.number,
  cropTop: PropTypes.number,
  cropLeft: PropTypes.number,
  cropBottom: PropTypes.number,
  cropRight: PropTypes.number,
  cropWidth: PropTypes.number,
  cropHeight: PropTypes.number,
  cropRatio: PropTypes.number,
}

export default PhotoBooth;

