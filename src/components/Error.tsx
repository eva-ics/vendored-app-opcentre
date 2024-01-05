const ErrorStatus = ({ message }: { message: string }) => {
    return <div className="error-visualization">{message}</div>;
};

export default ErrorStatus;
