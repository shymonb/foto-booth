import React, { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { MdPhotoCamera } from "react-icons/md";
import { FaRegFileImage } from "react-icons/fa";
import { ButtonGroup, Button } from "react-bootstrap";
import CamPhoto from "./CamPhoto";
import FilePhoto from "./FilePhoto";

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
  const [mode, setMode] = useState(initialMode);
  console.log("PhotoSnap");

  const handleTakePicture = () => {
    console.log("Take picture!");
  };

  const handleCameraModeClick = useCallback(() => {
    setMode(MODE_CAMERA);
  }, [setMode]);

  const handleFileModeClick = useCallback(() => {
    setMode(MODE_FILE);
  }, [setMode]);

  return (
    <div className="photo-snap position-relative">
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
        />
      )}
      <div className="photo-snap-tools text-white d-flex" style={{ width }}>
        <div className="flex-grow-1 text-left">
          <button className="m-3 btn btn-primary" onClick={handleTakePicture}>
            <MdPhotoCamera className="h4 mb-0" />
          </button>
        </div>
        <div className="align-bottom mr-3">
          <ButtonGroup size="sm" toggle>
            <Button
              variant={mode === MODE_CAMERA ? "primary" : "light"}
              onClick={handleCameraModeClick}
            >
              <MdPhotoCamera />
            </Button>
            <Button
              variant={mode === MODE_FILE ? "primary" : "light"}
              onClick={handleFileModeClick}
            >
              <FaRegFileImage />
            </Button>
          </ButtonGroup>
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
