import { StatusType } from "../types";

const StatusMessage = ({ message, type }: { message: string; type: StatusType }) => {
    const statusClass = type === StatusType.Error ? "error-status" : "success-status";

    return <div className={statusClass}>{message}</div>;
};

export default StatusMessage;
