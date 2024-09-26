import React, { Component, ErrorInfo } from "react";

interface Props {
    children: React.ReactNode;
    errorMessage?: string;
    setError: (error: string | null) => void;
}

interface State {
    hasError: boolean;
    errorMessage: string | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, errorMessage: null };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(error, errorInfo);

        this.setState({ errorMessage: error.message });
        this.props.setError(error.message);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div>
                    <p style={{ fontSize: "18px", color: "red", paddingTop: "20px" }}>
                        Please select another option.
                    </p>
                    <p style={{ fontSize: "14px", color: "red", paddingTop: "20px" }}>
                        {this.state.errorMessage || this.props.errorMessage}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
