import { useRef, useEffect } from "react";
import { useEvaState } from "@eva-ics/webengine-react";
import { ValueColorMap } from "idc-core";

export enum PipeStyle {
    Solid = "solid",
    Rings = "rings",
    Segmented = "segmented",
}

export enum PipeEnding {
    Closed = "closed",
    Open = "open",
}

const darkenColor = (color: string, percent: number = 50): string => {
    const div = document.createElement("div");
    div.style.color = color;
    document.body.appendChild(div);

    const computedColor = getComputedStyle(div).color;
    document.body.removeChild(div);

    const amount = percent / 100;

    let [r, g, b] = computedColor.match(/\d+/g)!.map(Number);
    r = Math.max(0, r - r * amount);
    g = Math.max(0, g - g * amount);
    b = Math.max(0, b - b * amount);

    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
};

export const Pipe = ({
    diameter,
    length,
    vertical,
    start,
    end,
    style,
    color,
    value_color,
    oid,
    shadow,
}: {
    diameter: number;
    length: number;
    vertical: boolean;
    start: PipeEnding;
    end: PipeEnding;
    style: PipeStyle;
    color: string;
    value_color: ValueColorMap[];
    oid?: string;
    shadow: number;
}) => {
    const canvasRef = useRef(null);
    const state = useEvaState({ oid }, [oid]);

    let primary_color: string = color;
    if (state.value !== undefined && value_color !== undefined) {
        for (const v of value_color) {
            if (state.value == v.value) {
                primary_color = v.color;
                break;
            }
        }
    }

    useEffect(() => {
        const canvas: any = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const color2 = primary_color;
        const color1 = darkenColor(color2, shadow);

        const x = diameter;
        const y = length;

        if (!vertical) {
            ctx.fillStyle = color1;
            ctx.fillRect(0, 0, y, x / 4);

            const grad = ctx.createLinearGradient(y, x / 20, y, x / 2);
            grad.addColorStop(0.6, color2);
            grad.addColorStop(0, color1);
            grad.addColorStop(0.8, color2);

            ctx.fillStyle = grad;
            ctx.fillRect(0, x / 80, y, x / 2);

            const grad2 = ctx.createLinearGradient(y, x / 2, y, x);
            grad2.addColorStop(0, color2);
            grad2.addColorStop(1, color1);
            ctx.fillStyle = grad2;
            ctx.fillRect(0, x / 2, y, x / 2);

            let ringLineWidth = x / 16;
            if (ringLineWidth < 1) {
                ringLineWidth = 1;
            }

            if (style == PipeStyle.Rings) {
                ctx.strokeStyle = color1;
                ctx.lineWidth = ringLineWidth;
                ctx.beginPath();

                for (const a of [x, x * 1.5, y - x * 1.5, y - x]) {
                    ctx.moveTo(a, 0);
                    ctx.lineTo(a, y);
                    ctx.stroke();
                }
            } else if (style == PipeStyle.Segmented) {
                ctx.strokeStyle = color1;
                ctx.lineWidth = ringLineWidth;

                ctx.beginPath();

                for (let a = x; a < y; a += x * 3) {
                    ctx.moveTo(a, 0);
                    ctx.lineTo(a, y);
                    ctx.stroke();
                }
            }

            if (start == PipeEnding.Closed) {
                const grad = ctx.createLinearGradient(0, y, x / 10, y);
                grad.addColorStop(0, color2);
                grad.addColorStop(1, color1);
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, x / 8, y);
            }
            if (end == PipeEnding.Closed) {
                const grad = ctx.createLinearGradient(y - x / 10, y, y, y);
                grad.addColorStop(0, color1);
                grad.addColorStop(1, color2);
                ctx.fillStyle = grad;
                ctx.fillRect(y - x / 8, 0, x / 8, y);
            }
        } else {
            ctx.fillStyle = color1;
            ctx.fillRect(0, 0, x / 4, y);

            const grad = ctx.createLinearGradient(x / 20, y, x / 2, y);

            grad.addColorStop(0, color1);
            grad.addColorStop(0.6, color2);
            grad.addColorStop(0.6, color2);
            grad.addColorStop(1, color2);

            ctx.fillStyle = grad;
            ctx.fillRect(x / 40, 0, x / 2, y);

            const grad2 = ctx.createLinearGradient(x / 2, y, x, y);
            grad2.addColorStop(0, color2);
            grad2.addColorStop(1, color1);
            ctx.fillStyle = grad2;
            ctx.fillRect(x / 2, 0, x / 2, y);

            let ringLineWidth = x / 16;
            if (ringLineWidth < 1) {
                ringLineWidth = 1;
            }

            if (style == PipeStyle.Rings) {
                ctx.strokeStyle = color1;
                ctx.lineWidth = ringLineWidth;

                ctx.beginPath();

                for (const a of [x, x * 1.5, y - x * 1.5, y - x]) {
                    ctx.moveTo(0, a);
                    ctx.lineTo(y, a);
                    ctx.stroke();
                }
            } else if (style == PipeStyle.Segmented) {
                ctx.strokeStyle = color1;
                ctx.lineWidth = ringLineWidth;
                ctx.beginPath();

                for (let a = x; a < y; a += x * 3) {
                    ctx.moveTo(0, a);
                    ctx.lineTo(y, a);
                    ctx.stroke();
                }
            }

            if (start == PipeEnding.Closed) {
                const grad = ctx.createLinearGradient(y, 0, y, x / 8);
                grad.addColorStop(1, color1);
                grad.addColorStop(0, color2);
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, y, x / 8);
            }
            if (end == PipeEnding.Closed) {
                const grad = ctx.createLinearGradient(x, y - x / 10, x, y);
                grad.addColorStop(0, color1);
                grad.addColorStop(1, color2);
                ctx.fillStyle = grad;
                ctx.fillRect(0, y - x / 8, x, y);
            }
        }
    }, [diameter, length, vertical, start, end, style, primary_color, shadow]);

    const width = vertical ? diameter : length;
    const height = vertical ? length : diameter;

    return <canvas width={width} height={height} ref={canvasRef}></canvas>;
};
