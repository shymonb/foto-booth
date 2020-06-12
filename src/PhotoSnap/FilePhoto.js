import React from "react";
import PropTypes from "prop-types";

const FilePhoto = React.forwardRef(
  ({ width, cropTop, cropLeft, cropWidth, cropHeight, cropRatio }, ref) => {
    console.log("File photo");
    return (
      <div
        ref={ref}
        width={width}
        height={0.75 * width}
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
