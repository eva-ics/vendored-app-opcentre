export const Frame = ({
  width,
  height,
  title
}: {
  width: number;
  height: number;
  title: string;
}) => {
  return (
    <div className="element-group" style={{ width: width, height: height }}>
      <div className="element-group-inner">
        <div className="element-group-label">{title}</div>
      </div>
    </div>
  );
};
