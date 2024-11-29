import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { useEvaAPICall } from "@eva-ics/webengine-react";
import useSound from "use-sound";
import beep from "./sounds/beep.mp3";

const ALARM_SVC = "eva.alarm.default";

export const AlarmBell = ({
    size,
    sound,
    disabled_actions,
}: {
    size: number;
    sound: boolean;
    disabled_actions: boolean;
}) => {
    const [play] = useSound(beep);
    const method = `x::${ALARM_SVC}::summary`;
    const summary = useEvaAPICall(
        {
            method,
            update: 1.5,
        },
        [method]
    );
    if (summary?.data) {
        let class_name = "alarm-count";
        if (summary.data.active == 0) {
            class_name += " alarm-count-zero";
        } else if (sound && !disabled_actions) {
            play();
        }
        const url = `${document.location.pathname}?d=alarm_state`;
        const button = (
            <>
                <NotificationsActiveIcon style={{ fontSize: size }} />
                {summary.data.active}
            </>
        );
        const block = disabled_actions ? <>{button}</> : <a href={url}>{button}</a>;
        return <div className={class_name}>{block}</div>;
    } else if (summary.error) {
        return (
            <>
                <div className="eva-error">
                    error {summary.error?.message} ({summary.error?.code})
                </div>
            </>
        );
    }
};
