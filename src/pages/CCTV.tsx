import { useState } from "react";
import { EditSelectOID } from "../components/editors/select_oid.tsx";
import DateTimePickerSelect from "../components/date_time_picker.tsx";
import { Timestamp } from "bmat/time";
import { ButtonStyledText, ButtonStyled } from "../common.tsx";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import FastForwardOutlinedIcon from "@mui/icons-material/FastForwardOutlined";
import SkipNextOutlinedIcon from "@mui/icons-material/SkipNextOutlined";
import SkipPreviousOutlinedIcon from "@mui/icons-material/SkipPreviousOutlined";
import FastRewindOutlinedIcon from "@mui/icons-material/FastRewindOutlined";
import { EditSelectString } from "../components/editors/select_string.tsx";

const DEFAULT_FRAME_SEC = 3600;
const SVC_ID = "eva.vidosrv.default";
const FILL_SPEED = ["0.25x", "0.5x", "1x", "2x", "4x", "8x"];

const DashboardCCTV = () => {
    const [oid, setOid] = useState<string>("");
    const [active, setActive] = useState<boolean>(false);
    const [live, setLive] = useState<boolean>(true);
    const [playbackSpeed, setPlaybackSpeed] = useState<string>("1x");
    const [timestamp, setTimestamp] = useState<Timestamp>(
        new Timestamp().subSec(DEFAULT_FRAME_SEC)
    );
    let controls;
    if (live) {
        controls = (
            <div className="form-list-wrapper-item">
                <ButtonStyled variant="outlined" onClick={() => {}}>
                    {active ? <PauseOutlinedIcon /> : <PlayArrowOutlinedIcon />}
                </ButtonStyled>
            </div>
        );
    } else {
        controls = (
            <div className="form-list-wrapper-item">
                <div>
                    <EditSelectString
                        current_value={playbackSpeed}
                        setParam={(n: string) => {
                            setPlaybackSpeed(n);
                        }}
                        params={FILL_SPEED}
                    />
                </div>
                <ButtonStyled variant="outlined" onClick={() => {}}>
                    <FastRewindOutlinedIcon />
                </ButtonStyled>
                <ButtonStyled variant="outlined" onClick={() => {}}>
                    <SkipPreviousOutlinedIcon />
                </ButtonStyled>
                <ButtonStyled variant="outlined" onClick={() => {}}>
                    {active ? <PauseOutlinedIcon /> : <PlayArrowOutlinedIcon />}
                </ButtonStyled>
                <ButtonStyled variant="outlined" onClick={() => {}}>
                    <SkipNextOutlinedIcon />
                </ButtonStyled>
                <ButtonStyled variant="outlined" onClick={() => {}}>
                    <FastForwardOutlinedIcon />
                </ButtonStyled>
            </div>
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
                                        <div className="short-form-wrapper-item">
                                            <ButtonStyledText
                                                onClick={() => {
                                                    setLive(!live);
                                                }}
                                            >
                                                {live ? "LIVE" : "REC"}
                                            </ButtonStyledText>
                                            <DateTimePickerSelect
                                                enabled={!live}
                                                element_id="timestamp"
                                                current_value={timestamp.toDate()}
                                                setParam={(d: Date) => {
                                                    setTimestamp(new Timestamp(d));
                                                }}
                                            />
                                        </div>
                                        {controls}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCCTV;
