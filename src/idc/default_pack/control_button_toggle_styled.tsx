import { Eva, EvaError, EvaErrorKind, ActionResult } from "@eva-ics/webengine";
import { ControlButtonToggle, useEvaState, get_engine } from "@eva-ics/webengine-react";
import ConnectImage from "./relay/connect.svg";
import ContactImage from "./relay/contact.svg";
import ConnectOn from "./relay/connect_on.svg";
import ContactOn from "./relay/contact_on.svg";
import "./relay/relay.scss";

export enum ControlButtonToggleStyle {
    Button = "button",
    Relay = "relay",
    Valve = "valve",
}

export const ControlButtonToggleStyled = ({ style, ...params }: { style?: string }) => {
    switch (style) {
        case ControlButtonToggleStyle.Relay:
            return <Relay {...(params as any)} />;
        case ControlButtonToggleStyle.Valve:
            return <Valve {...(params as any)} />;
        default:
            return <ControlButtonToggle {...(params as any)} />;
    }
};

const Relay = ({
    oid,
    label,
    on_success,
    on_fail,
    disabled_actions,
}: {
    oid: string;
    label: string;
    on_success?: (result: ActionResult) => void;
    on_fail?: (err: EvaError) => void;
    disabled_actions: boolean;
}) => {
    const state = useEvaState({ oid }, []);
    const toggleOn = state?.value > 0;

    const handle_action_finished = (
        result: ActionResult,
        on_success?: (result: ActionResult) => void,
        on_fail?: (err: EvaError) => void
    ) => {
        if (result.exitcode === 0) {
            if (on_success) on_success(result);
        } else if (on_fail) {
            on_fail(new EvaError(EvaErrorKind.FUNC_FAILED, result.err || undefined));
        }
    };

    const handle_action_error = (err: EvaError, on_fail?: (err: EvaError) => void) => {
        if (on_fail) {
            on_fail(err);
        }
    };

    const handle_action = (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled_actions) {
            return;
        }
        e.preventDefault();
        const eva_engine = get_engine() as Eva;
        eva_engine.action
            .toggle(oid, true)
            .then((result: any) => handle_action_finished(result, on_success, on_fail))
            .catch((err: EvaError) => handle_action_error(err, on_fail));
    };

    return (
        <div
            className={`relay-button-wrapper ${
                toggleOn ? "relay-button-wrapper relay-wrapper_on" : ""
            }`}
            onClick={handle_action}
        >
            {toggleOn ? (
                <div className="relay-switch-container">
                    <div className="relay-connect-left">
                        <img className="relay-connect-image" src={ConnectOn} />
                    </div>
                    <div className="relay-connect-right">
                        <img className="relay-connect-image" src={ConnectOn} />
                    </div>
                    <div className="relay-contact">
                        <img className="relay-connect-image" src={ContactOn} />
                    </div>
                </div>
            ) : (
                <div className="relay-switch-container">
                    <div className="relay-connect-left">
                        <img className="relay-connect-image" src={ConnectImage} />
                    </div>
                    <div className="relay-connect-right">
                        <img className="relay-connect-image" src={ConnectImage} />
                    </div>
                    <div className="relay-contact-off">
                        <img className="relay-connect-image" src={ContactImage} />
                    </div>
                </div>
            )}{" "}
            {label ? <div className="relay-label">{label}</div> : null}
        </div>
    );
};

const Valve = ({
    oid,
    label,
    on_success,
    on_fail,
    disabled_actions,
}: {
    oid: string;
    label: string;
    on_success?: (result: ActionResult) => void;
    on_fail?: (err: EvaError) => void;
    disabled_actions: boolean;
}) => {
    const state = useEvaState({ oid }, []);
    const isOpen = state?.value > 0;
    const strokeColor = isOpen ? "#02CA2E" : "#F19F00";

    const pathD = isOpen
        ? "M46.129 43.9993L58.2051 50.3472V27.433L46.129 34.4701M29.1811 34.4701L17.7959 27.433V50.3472L29.1811 43.6248"
        : "M46.1281 43.9993L58.2041 50.3472V27.433L17.7949 50.3472V27.433L29.1801 34.4701";

    const handle_action_finished = (
        result: ActionResult,
        on_success?: (result: ActionResult) => void,
        on_fail?: (err: EvaError) => void
    ) => {
        if (result.exitcode === 0) {
            if (on_success) on_success(result);
        } else if (on_fail) {
            on_fail(new EvaError(EvaErrorKind.FUNC_FAILED, result.err || undefined));
        }
    };

    const handle_action_error = (err: EvaError, on_fail?: (err: EvaError) => void) => {
        if (on_fail) {
            on_fail(err);
        }
    };

    const handle_action = (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled_actions) {
            return;
        }
        e.preventDefault();
        const eva_engine = get_engine() as Eva;
        eva_engine.action
            .toggle(oid, true)
            .then((result: any) => handle_action_finished(result, on_success, on_fail))
            .catch((err: EvaError) => handle_action_error(err, on_fail));
    };
    return (
        <div className="valve-container" onClick={handle_action}>
            <svg
                width="38"
                height="34"
                viewBox="0 0 76 68"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M75.001 63.4774L75.001 4.52262C75.001 2.57713 73.4238 1 71.4783 1L4.5236 1C2.57811 1 1.00098 2.57713 1.00098 4.52262L1.00097 63.4774C1.00097 65.4229 2.57811 67 4.52359 67L71.4784 67C73.4238 67 75.001 65.4229 75.001 63.4774Z"
                    stroke={strokeColor}
                    strokeWidth="1.7"
                    className={`valve-stripe ${isOpen ? "open" : "close"}`}
                />
                <path
                    d={pathD}
                    stroke={strokeColor}
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    className={`valve-stripe ${isOpen ? "open" : "close"}`}
                />
                <circle
                    cx="38.0005"
                    cy="38.8901"
                    r="9.01221"
                    stroke={strokeColor}
                    strokeWidth="1.7"
                    className={`valve-stripe circle ${isOpen ? "open" : "close"}`}
                />
                <path
                    d="M37.9101 29.6232V17.6528M24.5986 17.6528H51.2124"
                    stroke={strokeColor}
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    className={`valve-stripe ${isOpen ? "open" : "close"}`}
                />
            </svg>{" "}
            {label ? <div className="valve-label">{label}</div> : null}
        </div>
    );
};
