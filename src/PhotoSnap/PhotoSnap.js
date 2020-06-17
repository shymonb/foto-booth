import React, { useState, useRef, useCallback, useEffect } from "react";
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

const DEFAULT_SNAP = {
  data: null,
  width: 0,
  height: 0,
};

const DEFAULT_SNAP_RATIO = 0.7;

const PhotoSnap = ({
  initialMode,
  width,
  cropTop,
  cropLeft,
  cropWidth,
  cropHeight,
  cropRatio,
  onSnap,
}) => {
  const imageSourceRef = useRef(null);
  const fileUploaderRef = useRef(null);
  const [mode, setMode] = useState(initialMode);
  const [imageFile, setImageFile] = useState(null);
  const [snap, setSnap] = useState(DEFAULT_SNAP);

  const handleTakePicture = useCallback(
    (ev) => {
      if (imageSourceRef.current) {
        const s = imageSourceRef.current.snap();
        setSnap(s);
        if (typeof onSnap === "function") {
          onSnap(s);
        }
      }
      ev.preventDefault();
    },
    [onSnap]
  );

  const handleCameraModeClick = useCallback(() => {
    setMode(MODE_CAMERA);
    setSnap(DEFAULT_SNAP);
  }, [setMode]);

  const handleFileModeClick = useCallback(() => {
    setMode(MODE_FILE);
    setSnap(DEFAULT_SNAP);
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
    <div className="photo-snap d-flex">
      <div className="photo-snap-source">
        <div className="phot-snap-source-inner position-relative">
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
            <div className="text-left align-bottom">
              <Button
                variant="primary"
                className="m-3"
                onClick={handleTakePicture}
              >
                <MdPhotoCamera className="h4 mb-0" />
              </Button>
            </div>
            <div className="flex-grow-1 text-center">
              {mode === MODE_FILE && imageFile?.name ? (
                <span className="d-inline-block mt-4 text-white h6 rounded photo-snap-image-name px-2 py-1">
                  {imageFile?.name}
                </span>
              ) : null}
            </div>
            <div className="w-25"></div>
          </div>
        </div>
      </div>
      <div className="photo-snap-output pl-3 position-relative">
        <img
          alt="The screen capture will appear in this box."
          src={snap?.data}
          width={snap?.previewWidth}
          height={snap?.previewHeight}
          className={`${snap?.data ? "d-inline-block" : "d-none"}`}
        />
        <div
          className={`${
            snap?.data ? "d-none" : "d-block"
          } photo-snap-placeholder`}
          style={{
            width:
              snap?.previewWidth || width * (cropRatio * DEFAULT_SNAP_RATIO),
            height: snap?.previewHeight || "100%",
          }}
        />
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
  onSnap: PropTypes.func,
};

export default PhotoSnap;
