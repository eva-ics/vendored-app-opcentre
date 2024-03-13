const DEFAULT_TEXT = "Click me";

export const Button = ({
    text,
    action,
    disabled_actions,
}: {
    text: string;
    action: string;
    disabled_actions?: boolean;
}) => {
    const handleClick = () => {
        window.open(action, "_blank");
    };
    return disabled_actions ? (
        <div className="element-button">{text || DEFAULT_TEXT}</div>
    ) : (
        <button className="element-button" onClick={handleClick}>
            {text || DEFAULT_TEXT}
        </button>
    );
};
