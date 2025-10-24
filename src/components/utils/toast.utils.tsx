import { toast } from "react-hot-toast";

export const showToastSuccess = (message: string) => {
  toast.success(message, {
    style: {
      borderRadius: "12px",
      background: "#FBF8F2",
      color: "#4A3325",
      border: "1px solid #D38B43",
    },
    iconTheme: {
      primary: "#D38B43",
      secondary: "#FBF8F2",
    },
  });
};

export const showToastError = (message: string) => {
  toast.error(message, {
    style: {
      borderRadius: "12px",
      background: "#FBF8F2",
      color: "#4A3325",
      border: "1px solid #D38B43",
    },
    iconTheme: {
      primary: "#D38B43",
      secondary: "#FBF8F2",
    },
  });
};
