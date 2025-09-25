import { useState, useRef, useEffect } from "react";
import {
    useQueryParams,
    encoderBoolean,
    decoderBoolean,
    encoderFloat,
    decoderFloat,
} from "bmat/hooks";
import { EditSelectOID } from "../components/editors/select_oid.tsx";
import DateTimePickerSelect from "../components/date_time_picker.tsx";
import { Timestamp } from "bmat/time";
import { ButtonStyledText, ButtonStyled, onEvaError } from "../common.tsx";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import FastForwardOutlinedIcon from "@mui/icons-material/FastForwardOutlined";
import SkipNextOutlinedIcon from "@mui/icons-material/SkipNextOutlined";
import SkipPreviousOutlinedIcon from "@mui/icons-material/SkipPreviousOutlined";
import FastRewindOutlinedIcon from "@mui/icons-material/FastRewindOutlined";
import { EditSelectString } from "../components/editors/select_string.tsx";
import { EvaRecPlayer } from "../components/VideoPlayerRec.tsx";
import { EvaLivePlayer, EvaPlayerAutoSize } from "@eva-ics/webengine-multimedia";
import { get_engine } from "@eva-ics/webengine-react";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_FRAME_SEC = 3600;
const FAST_FORWARD_STEP = 30;
const SVC_ID = "eva.videosrv.default";
const FILL_SPEED = ["0.25x", "0.5x", "1x", "2x"];

const defaultTimestamp = (): Timestamp => {
    return new Timestamp().subSec(DEFAULT_FRAME_SEC);
};

const DashboardCCTV = () => {
    const [oid, setOid] = useState<string>("");
    const [active, setActive] = useState<boolean>(false);
    const [live, setLive] = useState<boolean>(true);
    const [timestampUpdater, setTimestampUpdater] = useState<number>(0);
    const [playbackSpeed, setPlaybackSpeed] = useState<string>("1x");
    const timestamp = useRef<Timestamp>(defaultTimestamp());
    const [savedTimestamp, setSavedTimestamp] = useState<Timestamp>(defaultTimestamp());
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoPlayer = useRef<null | EvaLivePlayer | EvaRecPlayer>(null);

    const setPlaybackTimestamp = (t: Timestamp) => {
        setTimestampUpdater(t.t);
        timestamp.current = t;
    };

    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = 1024;
        canvas.height = 600;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !oid) return;
        if (live) {
            const streamName = `${oid}::${uuidv4()}`;
            const player = new EvaLivePlayer({
                canvas: canvas,
                name: streamName,
                engine: get_engine()!,
                onError: onEvaError,
                //onFrame: params.onFrame,
                //onEOS: params.onEOS,
                //onChange: params.onChange,
                decoderHardwareAcceleration: true,
                decoderFallbackToSoftware: true,
                autoSize: EvaPlayerAutoSize.Resize,
            });
            videoPlayer.current = player;
            player.start(oid);
            setActive(true);
        } else {
            const player = new EvaRecPlayer({
                canvas,
                oid,
                t_start: timestamp.current.t,
                svc: SVC_ID,
                engine: get_engine()!,
                onError: onEvaError,
                onNextFrame: (t: number) => {
                    //current_timestamp = t;
                    setPlaybackTimestamp(new Timestamp(t));
                },
                decoderHardwareAcceleration: true,
                decoderFallbackToSoftware: true,
                autoSize: EvaPlayerAutoSize.KeepWidth,
            });
            videoPlayer.current = player;
            player.setPlaybackSpeed(parseFloat(playbackSpeed.replace("x", "")));
            player.start();
            setActive(true);
        }
        return () => {
            videoPlayer.current?.close();
            videoPlayer.current = null;
            resetCanvas();
        };
    }, [live, oid, canvasRef]);
    let controls;
    const loaded = useQueryParams(
        [
            {
                name: "oid",
                value: oid,
                setter: setOid,
            },
            {
                name: "live",
                value: live,
                setter: setLive,
                encoder: encoderBoolean,
                decoder: decoderBoolean,
            },
            {
                name: "speed",
                value: playbackSpeed,
                setter: setPlaybackSpeed,
            },
            {
                name: "speed",
                value: playbackSpeed,
                setter: setPlaybackSpeed,
            },
            {
                name: "t",
                value: savedTimestamp,
                encoder: (v: Timestamp) => {
                    return encoderFloat(v.t);
                },
                decoder: (v: string) => {
                    if (v) {
                        const f = decoderFloat(v);
                        if (f) {
                            return new Timestamp(f);
                        }
                    }
                    return defaultTimestamp();
                },
                setter: setPlaybackTimestamp,
            },
        ],
        [oid, live, playbackSpeed, savedTimestamp]
    );

    if (!loaded) {
        return <></>;
    }

    if (live) {
        controls = (
            <div className="form-list-wrapper-item" style={{ marginTop: -2 }}>
                <ButtonStyled
                    variant="outlined"
                    onClick={() => {
                        if (videoPlayer.current) {
                            videoPlayer.current.togglePause();
                            setActive(videoPlayer.current.isPlaying());
                        }
                    }}
                >
                    {active ? <PauseOutlinedIcon /> : <PlayArrowOutlinedIcon />}
                </ButtonStyled>
            </div>
        );
    } else {
        controls = (
            <>
                <div
                    className="form-list-wrapper-item print-hidden"
                    style={{ marginTop: -2 }}
                >
                    <ButtonStyled
                        variant="outlined"
                        onClick={() => {
                            if (videoPlayer.current && !live) {
                                (videoPlayer.current as EvaRecPlayer).goto(
                                    timestamp.current.t - FAST_FORWARD_STEP
                                );
                                setActive(videoPlayer.current.isPlaying());
                            }
                        }}
                    >
                        <FastRewindOutlinedIcon />
                    </ButtonStyled>
                    <ButtonStyled
                        variant="outlined"
                        onClick={() => {
                            if (videoPlayer.current && !live) {
                                (videoPlayer.current as EvaRecPlayer).stepFrameBackward();
                                setActive(videoPlayer.current.isPlaying());
                            }
                        }}
                    >
                        <SkipPreviousOutlinedIcon />
                    </ButtonStyled>
                    <ButtonStyled
                        variant="outlined"
                        onClick={() => {
                            if (videoPlayer.current) {
                                videoPlayer.current.togglePause();
                                setActive(videoPlayer.current.isPlaying());
                            }
                        }}
                    >
                        {active ? <PauseOutlinedIcon /> : <PlayArrowOutlinedIcon />}
                    </ButtonStyled>
                    <ButtonStyled
                        variant="outlined"
                        onClick={() => {
                            if (videoPlayer.current && !live) {
                                (videoPlayer.current as EvaRecPlayer).stepFrameForward();
                                setActive(videoPlayer.current.isPlaying());
                            }
                        }}
                    >
                        <SkipNextOutlinedIcon />
                    </ButtonStyled>
                    <ButtonStyled
                        variant="outlined"
                        onClick={() => {
                            if (videoPlayer.current && !live) {
                                (videoPlayer.current as EvaRecPlayer).goto(
                                    timestamp.current.t + FAST_FORWARD_STEP
                                );
                                setActive(videoPlayer.current.isPlaying());
                            }
                        }}
                    >
                        <FastForwardOutlinedIcon />
                    </ButtonStyled>
                </div>
                <div className="form-list-wrapper-item">
                    <DateTimePickerSelect
                        enabled={!live}
                        element_id="timestamp"
                        update_key={timestampUpdater}
                        current_value={timestamp.current.toDate()}
                        setParam={(d: Date) => {
                            const t = new Timestamp(d);
                            setPlaybackTimestamp(t);
                            setSavedTimestamp(t);
                            if (videoPlayer.current && !live) {
                                (videoPlayer.current as EvaRecPlayer).goto(t.t);
                                setActive(videoPlayer.current.isPlaying());
                            }
                        }}
                    />
                    <div>
                        <EditSelectString
                            current_value={playbackSpeed}
                            setParam={(n: string) => {
                                setPlaybackSpeed(n);
                                if (videoPlayer.current && !live) {
                                    const speed = parseFloat(n.replace("x", ""));
                                    (
                                        videoPlayer.current as EvaRecPlayer
                                    ).setPlaybackSpeed(speed);
                                }
                            }}
                            params={FILL_SPEED}
                        />
                    </div>
                </div>
            </>
        );
    }
    return (
        <div>
            <div className="dashboard-main-wrapper dashboard-main-wrapper-big">
                <div className="dashboard-main-wrapper-content">
                    <div className="dashboard-main-wrapper-content__side-left">
                        <div className="bmat-dashtable-container">
                            <div className="bmat-dashtable-container-inner">
                                <div className="cctv-container">
                                    <div className="cctv-camera-id">{oid}</div>
                                    <div className="page-title">CCTV</div>
                                    <div className="form-list-wrapper">
                                        <div className="short-form-wrapper-item">
                                            <EditSelectOID
                                                current_value={oid}
                                                params={{ i: ["sensor:#"] }}
                                                setParam={(val) => {
                                                    setOid(val);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <ButtonStyledText
                                                onClick={() => {
                                                    setLive(!live);
                                                }}
                                            >
                                                {live ? "LIVE" : "RECORDED"}
                                            </ButtonStyledText>
                                        </div>
                                        {controls}
                                    </div>
                                </div>
                                <canvas className="cctv-view" ref={canvasRef}></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCCTV;
