import { MuiColorInput } from "mui-color-input";

export const EditSelectColor = ({
  current_value,
  width,
  setParam
}: {
  current_value: string;
  width?: number;
  setParam: (a: any) => void;
  }): JSX.Element => {
 
  
  return (
    <>
      <MuiColorInput
        sx={{ width: width}}
        format="hex8"
        value={current_value}
        onChange={setParam}
      />
    </>
  );
};
