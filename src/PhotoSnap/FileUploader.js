import React from "react";

const FileUploader = ({ children, triggerInput, inputRef, onChange }) => {
  let hiddenInputStyle = {};
  // If user passes in children, display children and hide input.
  if (children) {
    hiddenInputStyle = {
      position: "absolute",
      top: "-9999px",
    };
  }

  return (
    <div className="cursor-pointer d-inline-block" onClick={triggerInput}>
      <input
        style={hiddenInputStyle}
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onChange}
      />
      <div className="photo-snap-uploader">{children}</div>
    </div>
  );
};

export default FileUploader;
