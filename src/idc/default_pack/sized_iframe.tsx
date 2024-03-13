import { get_engine } from "@eva-ics/webengine-react";
import { Eva } from "@eva-ics/webengine";
import { useEffect, useRef, useState, useCallback } from "react";

export const SizedIFrame = ({
    width,
    height,
    url,
    update,
    disabled_actions,
}: {
    width: number;
    height: number;
    url: string;
    update: number;
    disabled_actions?: boolean;
}) => {
    const [frameUrl, setFrameUrl] = useState(url);
    const visible = useRef(false);
    const update_worker: any = useRef(null);
    const eva = get_engine() as Eva;

    const updateData = useCallback(() => {
        if (url) {
            const framed_url = url
                .replaceAll("${token}", eva.api_token)
                .replaceAll("${ts}", (new Date().getTime() / 1000).toString());
            setFrameUrl(framed_url);
        }
        if (!visible.current || !update) {
            update_worker.current = null;
            return;
        }
        update_worker.current = setTimeout(updateData, update * 1000);
    }, [url, update]);

    useEffect(() => {
        visible.current = true;
        clearTimeout(update_worker.current);
        updateData();
        return () => {
            visible.current = false;
            clearTimeout(update_worker.current);
            update_worker.current = null;
        };
    }, [url, update, updateData]);

    if (frameUrl) {
        return disabled_actions ? (
            <div className="element-iframe-edit" style={{ width: width, height: height }}>
                <div>IFrame source: {url}</div>
                <div>(not displayed in the editor mode)</div>{" "}
            </div>
        ) : (
            <iframe
                className="element-iframe"
                draggable={false}
                style={{
                    width: width,
                    height: height,
                    minWidth: "20px",
                    minHeight: "20px",
                    userSelect: "none",
                }}
                src={frameUrl}
            />
        );
    } else {
        return (
            <div
                className="element-iframe-empty"
                style={{ width: width, height: height }}
            ></div>
        );
    }
};
