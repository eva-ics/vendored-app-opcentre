const DEFAULT_BACKGROUND_COLOR = "#191919";
const DEFAULT_BORDER_COLOR = "#555";
const DEFAULT_TITLE_COLOR = "#EEEEEE";

export const Frame = ({
    width,
    height,
    title,
    title_color,
    background_color,
    border_color,
}: {
    width: number;
    height: number;
    title: string;
    title_color?: string;
    background_color?: string;
    border_color?: string;
}) => {
    return (
        <div
            className="element-group"
            style={{
                width: width,
                height: height,
                backgroundColor: background_color || DEFAULT_BACKGROUND_COLOR,
            }}
        >
            <div
                className="element-group-inner"
                style={{ borderTop: `2px solid ${border_color || DEFAULT_BORDER_COLOR}` }}
            >
                <div
                    className="element-group-label"
                    style={{
                        backgroundColor: background_color || DEFAULT_BACKGROUND_COLOR,
                        color: title_color || DEFAULT_TITLE_COLOR,
                    }}
                >
                    {title}
                </div>
            </div>
        </div>
    );
};
