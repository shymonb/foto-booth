import React, { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { MdPhotoCamera, MdCamera } from "react-icons/md";
import { FaRegFileImage, FaUpload } from "react-icons/fa";
import { ButtonGroup, Button } from "react-bootstrap";
import CamPhoto from "./CamPhoto";
import FilePhoto from "./FilePhoto";
import FileUploader from "./FileUploader";

import "./PhotoSnap.css";

const MODE_CAMERA = "camera";
const MODE_FILE = "file";

const PhotoSnap = ({
  initialMode,
  width,
  cropTop,
  cropLeft,
  cropWidth,
  cropHeight,
  cropRatio,
}) => {
  const imageSourceRef = useRef(null);
  const fileUploaderRef = useRef(null);
  const [mode, setMode] = useState(initialMode);
  const [imageFile, setImageFile] = useState(null);
  console.log("PhotoSnap");

  const handleTakePicture = useCallback((ev) => {
    if (imageSourceRef.current) {
      imageSourceRef.current.snap();
    }
    ev.preventDefault();
  }, []);

  const handleCameraModeClick = useCallback(() => {
    setMode(MODE_CAMERA);
  }, [setMode]);

  const handleFileModeClick = useCallback(() => {
    setMode(MODE_FILE);
  }, [setMode]);

  const handleFileSelect = useCallback((ev) => {
    if (ev.target.files.length) {
      setImageFile(ev?.target?.files[0]);
    }
  }, []);

  const triggerInput = (e) => {
    e.persist();
    fileUploaderRef.current.click();
  };

  const renderFileUpload = () => {
    console.log("file upload");
    return (
      <FileUploader
        triggerInput={triggerInput}
        inputRef={fileUploaderRef}
        onChange={handleFileSelect}
      >
        <Button variant="primary" size="sm">
          <FaUpload />
        </Button>
      </FileUploader>
    );
  };

  return (
    <div className="photo-snap position-relative">
      <div className="">
        {mode === MODE_CAMERA ? (
          <CamPhoto
            ref={imageSourceRef}
            width={width}
            cropLeft={cropLeft}
            cropTop={cropTop}
            cropWidth={cropWidth}
            cropHeight={cropHeight}
            cropRatio={cropRatio}
          />
        ) : (
          <FilePhoto
            ref={imageSourceRef}
            width={width}
            cropLeft={cropLeft}
            cropTop={cropTop}
            cropWidth={cropWidth}
            cropHeight={cropHeight}
            cropRatio={cropRatio}
            file={imageFile}
          />
        )}
        <div
          className="photo-snap-top-left text-white d-flex p-3"
          style={{ width }}
        >
          <div className="flex-grow-1 text-left align-bottom">
            {mode === MODE_FILE ? renderFileUpload() : null}
          </div>
          <div className="align-bottom">
            <ButtonGroup toggle>
              <Button
                size="sm"
                variant={mode === MODE_CAMERA ? "primary" : "light"}
                onClick={handleCameraModeClick}
              >
                <MdCamera />
              </Button>
              <Button
                size="sm"
                variant={mode === MODE_FILE ? "primary" : "light"}
                onClick={handleFileModeClick}
              >
                <FaRegFileImage />
              </Button>
            </ButtonGroup>
          </div>
        </div>
        <div
          className="photo-snap-bottom-left text-white d-flex"
          style={{ width }}
        >
          <div className="flex-grow-1 text-left align-bottom">
            <Button
              variant="primary"
              className="m-3"
              onClick={handleTakePicture}
            >
              <MdPhotoCamera className="h4 mb-0" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

PhotoSnap.defaultProps = {
  initialMode: "camera",
  width: 320,
};

PhotoSnap.propTypes = {
  initialMode: PropTypes.oneOf([MODE_CAMERA, MODE_FILE]),
  width: PropTypes.number,
  cropTop: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cropLeft: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cropWidth: PropTypes.number,
  cropHeight: PropTypes.number,
  cropRatio: PropTypes.number,
};

export default PhotoSnap;
