import { useEffect, useState } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

// https://www.youtube.com/watch?v=a4rstx9Pz2o&list=PLDZ4p-ENjbiPo4WH7KdHjh_EMI7Ic8b2B&index=7
const useResizeObserver = (ref) => {
  const [dimensions, setDimensions] = useState(null);
  useEffect(() => {
    const observeTarget = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setDimensions(entry.contentRect);
      });
    });
    resizeObserver.observe(observeTarget);
    return () => {
      resizeObserver.unobserve(observeTarget);
    };
  }, [ref]);
  return dimensions;
};

export default useResizeObserver;
