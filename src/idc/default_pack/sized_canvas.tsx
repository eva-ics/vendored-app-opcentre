export const SizedCanvas = ({
  width,
  height,
  image
}: {
  width: number;
  height: number;
  image: string;
}) => {
  return (
    <div className="element-canvas" style={{ width: width, height: height }}>
      <img
        draggable={false}
        style={{ zIndex: 1, width: "100%", height: "100%", userSelect: "none" }}
        src={image}
      />
    </div>
  );
};
