import React, { useEffect, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

import './PhotoBooth.css';

const PhotoBooth = ({ width = 320 }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const photoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [height, setHeight] = useState(0);

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
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(videoRef.current, 0, 0, width, height);

      const data = canvas.toDataURL('image/png');
      photo.setAttribute('src', data);
    } else {
      clearPhoto();
    }
  }, [width, height, clearPhoto]);

  const handleCanPlay = useCallback(() => {
    if (!isStreaming) {
      const h = videoRef.current?.videoHeight / (videoRef.current?.videoWidth / width);
      if (videoRef.current) {
        videoRef.current.setAttribute('width', width);
        videoRef.current.setAttribute('height', h);
      }
      if (canvasRef.current) {
        canvasRef.current.setAttribute('width', width);
        canvasRef.current.setAttribute('height', h);
      }
      setIsStreaming(true);
      setHeight(h);
    }
  }, [width, isStreaming, setIsStreaming, setHeight]);

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
      <div className="camera  position-relative">
        <video ref={videoRef} onCanPlay={handleCanPlay}>Video stream not available.</video>
        <canvas className="photo-booth-overlay">Ala ma kota</canvas>
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
  width: PropTypes.number,

}

export default PhotoBooth;

