const isNumber = (value) =>
  typeof value === "number" &&
  value === value &&
  value !== Infinity &&
  value !== -Infinity;

const useCrop = (
  viewportWidth,
  viewportHeight,
  cropLeft,
  cropTop,
  cropWidth,
  cropHeight,
  cropRatio
) => {
  const vw = viewportWidth;
  const vh = viewportHeight;
  let cw = 0,
    ch = 0;
  if (isNumber(cropWidth) && isNumber(cropHeight)) {
    cw = cropWidth * vw;
    ch = cropHeight * vh;
  } else if (
    isNumber(cropRatio) &&
    (isNumber(cropWidth) || isNumber(cropHeight))
  ) {
    cw = isNumber(cropWidth) ? cropWidth * vw : cropRatio * (cropHeight * vh);
    ch = isNumber(cropHeight) ? cropHeight * vh : cropRatio * (cropWidth * vw);
  }

  let cx = 0;
  if (isNumber(cropLeft)) {
    cx = cropLeft * vw;
  } else {
    const xvals = {
      left: 0,
      center: vw / 2 - cw / 2,
      right: vw - cw,
    };
    cx = xvals[cropLeft?.toLowerCase()] || 0;
  }

  let cy = 0;
  if (isNumber(cropTop)) {
    cy = cropTop * vh;
  } else {
    const yvals = {
      top: 0,
      center: vh / 2 - ch / 2,
      bottom: vh - ch,
    };
    cy = yvals[cropTop?.toLowerCase()] || 0;
  }

  const crop = { x: cx, y: cy, w: cw, h: ch };

  return crop;
};

export default useCrop;
