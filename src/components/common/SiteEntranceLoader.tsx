import React, { useEffect } from "react";

interface SiteEntranceLoaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const SiteEntranceLoader: React.FC<SiteEntranceLoaderProps> = ({
  onComplete,
}) => {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem("pmf_site_entered", "1");
      }
    } catch {}
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  return null;
};

export default SiteEntranceLoader;
