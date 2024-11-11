import { Toaster } from "react-hot-toast";

const ToasterProvider = () => {
  return (
    <Toaster
      position={"bottom-right"}
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
