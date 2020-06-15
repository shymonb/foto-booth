import React, { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { MdPhotoCamera } from "react-icons/md";
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
      const arrFiles = Array.from(ev.target.files);
      const files = arrFiles.map((file, index) => {
        const src = window.URL.createObjectURL(file);
        return { file, id: index, src };
      });
      console.log("File selected", files);
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
      // <Form.File
      //   id="custom-file"
      //   label="Wybierz"
      //   variant="primary"
      //   size="sm"
      //   custom
      //   data-browse="Wybierz obraz"
      //   accept="image/*"
      //   onChange={handleFileSelect}
      // />
      // <Form.File id="photoSnapFileUpload">
      //   <Form.File.Label>
      //     <Button variant="primary">OOO</Button>
      //   </Form.File.Label>
      // </Form.File>
    );
  };

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
      <div
        className="photo-snap-top-left text-white d-flex p-3"
        style={{ width }}
      >
        {mode === MODE_FILE ? renderFileUpload() : null}
      </div>
      <div
        className="photo-snap-bottom-left text-white d-flex"
        style={{ width }}
      >
        <div className="flex-grow-1 text-left align-bottom">
          <Button variant="primary" className="m-3" onClick={handleTakePicture}>
            <MdPhotoCamera className="h4 mb-0" />
          </Button>
        </div>
        <div className="align-bottom mr-3">
          <ButtonGroup size="sm" toggle className="mt-4">
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
