import { EvaLivePlayer } from "@eva-ics/webengine-react";
import { useState } from "react";
import {
    EvaLivePlayer as EvaLivePlayerC,
    EvaPlayerAutoSize,
} from "@eva-ics/webengine-multimedia";

export const LiveVideoPlayer = ({
    oid,
    width,
    height,
    on_click,
    disabled_actions,
}: {
    oid: string;
    width: number;
    height: number;
    on_click: string;
    disabled_actions: boolean;
}) => {
    const [player, setPlayer] = useState<EvaLivePlayerC | null>(null);
    const [playing, setPlaying] = useState(true);

    if (!oid) {
        return <div style={{ width, height, backgroundColor: "black" }} />;
    }

    return (
        <>
            <div
                style={{ position: "relative" }}
                onClick={() => {
                    if (on_click === "pause") {
                        if (player && !disabled_actions) {
                            player.togglePause();
                            setPlaying(player.isPlaying());
                        }
                        return;
                    }
                    if (on_click === "cctv") {
                        const url =
                            document.location.pathname +
                            `?d=cctv&oid=${encodeURIComponent(oid)}&live=Y`;
                        // if Ctrl or Cmd key is pressed, open in new tab
                        if (
                            window.event &&
                            ((window.event as any).ctrlKey ||
                                (window.event as any).metaKey ||
                                (window.event as any).shiftKey)
                        ) {
                            window.open(url, "_blank");
                            return;
                        }
                        document.location = url;
                    }
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        right: 40,
                        fontWeight: "bold",
                        fontSize: playing ? 24 : 50,
                        textShadow: "0 0 2px #000;",
                        color: "orange",
                        top: playing ? 10 : 0,
                        textAlign: "right",
                        display: "inline-block",
                    }}
                >
                    {player && (playing ? "" : "⏸")}
                </div>
                <EvaLivePlayer
                    width={width}
                    height={height}
                    oid={oid}
                    style={{ backgroundColor: "black" }}
                    setPlayer={setPlayer}
                    autoSize={EvaPlayerAutoSize.None}
                />
            </div>
        </>
    );
};
