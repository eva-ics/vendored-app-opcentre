import { get_engine } from "@eva-ics/webengine-react";
import { Eva } from "@eva-ics/webengine";
import { useEffect, useRef, useState, useCallback } from "react";

export const SizedImage = ({
    width,
    height_p,
    rotate,
    hflip,
    vflip,
    blur,
    brightness,
    contrast,
    grayscale,
    hue_rotate,
    invert,
    opacity,
    saturate,
    sepia,
    image,
    update,
}: {
    width: number;
    height_p: number;
    rotate: number;
    hflip: boolean;
    vflip: boolean;
    blur: number;
    brightness: number;
    contrast: number;
    grayscale: number;
    hue_rotate: number;
    invert: number;
    opacity: number;
    saturate: number;
    sepia: number;
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

    let filter = "";
    if (blur !== undefined) {
        filter += `blur(${blur}px) `;
    }
    if (brightness !== undefined) {
        filter += `brightness(${brightness}%) `;
    }
    if (contrast !== undefined) {
        filter += `contrast(${contrast}%) `;
    }
    if (grayscale !== undefined) {
        filter += `grayscale(${grayscale}%) `;
    }
    if (hue_rotate !== undefined) {
        filter += `hue-rotate(${hue_rotate}deg) `;
    }
    if (invert !== undefined) {
        filter += `invert(${invert}%) `;
    }
    if (opacity !== undefined) {
        filter += `opacity(${opacity}%) `;
    }
    if (saturate !== undefined) {
        filter += `saturate(${saturate}%) `;
    }
    if (sepia !== undefined) {
        filter += `sepia(${sepia}%) `;
    }
    let transform = "";
    if (rotate !== undefined) {
        transform += `rotate(${rotate}deg) `;
    }
    if (hflip) {
        transform += `scaleX(-1) `;
    }
    if (vflip) {
        transform += `scaleY(-1) `;
    }

    const height = height_p === undefined ? width : width * (height_p / 100);

    if (url) {
        return (
            <img
                className="element-image"
                draggable={false}
                style={{
                    width,
                    height,
                    minWidth: "20px",
                    minHeight: "20px",
                    userSelect: "none",
                    filter,
                    transform
                }}
                src={url}
            />
        );
    } else {
        return (
            <div
                className="element-image-empty"
                style={{
                    width,
                    height
                }}
            ></div>
        );
    }
};
