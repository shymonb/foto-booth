import React, { useEffect, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

import './CameraSnap.css';

const CameraSnap = ({ width = 320 }) => {
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
    <>
      <div className="camera">
        <video id="video" ref={videoRef} onCanPlay={handleCanPlay}>Video stream not available.</video>
        <button id="startbutton" onClick={handleTakePicture}>Take photo</button>
      </div>
      <canvas id="canvas" ref={canvasRef}>
      </canvas>
      <div className="output">
        <img id="photo" alt="The screen capture will appear in this box." ref={photoRef} />
      </div>
    </>
  )
}

CameraSnap.propTypes = {
  width: PropTypes.number,
}

export default CameraSnap
