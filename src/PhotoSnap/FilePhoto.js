import React, { useImperativeHandle } from "react";
import PropTypes from "prop-types";

const DEFAULT_RATIO = 0.75;

const FilePhoto = React.forwardRef(
  ({ width, cropTop, cropLeft, cropWidth, cropHeight, cropRatio }, ref) => {
    console.log("File photo");

    const snap = () => {
      console.log("Snap from file image");
    };

    useImperativeHandle(ref, () => ({
      snap,
    }));

    return (
      <div
        ref={ref}
        style={{ width, height: Math.floor(width * DEFAULT_RATIO) }}
        className="bg-white text-dark"
      >
        File Photo component
      </div>
    );
  }
);

FilePhoto.propTypes = {
  width: PropTypes.number,
  cropTop: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cropLeft: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  cropWidth: PropTypes.number,
  cropHeight: PropTypes.number,
  cropRatio: PropTypes.number,
};

export default FilePhoto;
