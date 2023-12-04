import { fontWeight } from "idc-core";

export const Label = ({
  text,
  color,
  font_size,
  font_bold
}: {
  text: string;
  color: string;
  font_size: number;
  font_bold: boolean;
}) => {
  return (
    <div
      style={{
        color: color,
        fontSize: font_size,
        fontWeight: fontWeight(font_bold)
      }}
    >
      {text}
    </div>
  );
};
