import { toast } from "react-toastify";

export default function send_notify(message, type) {
    const settings = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
    };

    switch (type) {
        case "success":
            toast.success(message, settings);
            break;
        case "error":
            toast.error(message, settings);
            break;

        default:
            toast.info(message, settings);
            break;
    }
}
