import { Toaster } from "react-hot-toast";

const ToasterProvider = () => {
  return (
    <Toaster
      position={"bottom-left"}
      toastOptions={{
        style: {
          maxWidth: "100%",
          wordBreak: "break-all"
        }
      }}
    />
  );
};

export default ToasterProvider;
