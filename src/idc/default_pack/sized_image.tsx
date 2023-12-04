import { get_engine } from "@eva-ics/webengine-react";
import { Eva } from "@eva-ics/webengine";
import { useEffect, useRef, useState, useCallback } from "react";

export const SizedImage = ({
  width,
  image,
  update
}: {
  width: number;
  image: string;
  update: number;
}) => {
  const [url, setUrl] = useState(image);
  const visible = useRef(false);
  const update_worker: any = useRef(null);
  const eva = get_engine() as Eva;

  const updateData = useCallback(() => {
    if (image) {
      const url = image
        .replaceAll("${token}", eva.api_token)
        .replaceAll("${ts}", (new Date().getTime() / 1000).toString());
      setUrl(url);
    }
    if (!visible.current || !update) {
      update_worker.current = null;
      return;
    }
    update_worker.current = setTimeout(updateData, update * 1000);
  }, [image, update]);

  useEffect(() => {
    visible.current = true;
    clearTimeout(update_worker.current);
    updateData();
    return () => {
      visible.current = false;
      clearTimeout(update_worker.current);
      update_worker.current = null;
    };
  }, [image, update, updateData]);

  if (url) {
    return (
      <img
        className="element-image"
        draggable={false}
        style={{ width: width, minWidth: "20px", minHeight: "20px", userSelect: "none" }}
        src={url}
      />
    );
  } else {
    return (
      <div
        className="element-image-empty"
        style={{ width: width, height: width }}
      ></div>
    );
  }
};
