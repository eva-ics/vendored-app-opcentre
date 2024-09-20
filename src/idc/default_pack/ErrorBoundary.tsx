import React, { Component, ErrorInfo } from "react";

interface Props {
    children: React.ReactNode;
    errorMessage?: string;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Error caught by ErrorBoundary:", error, errorInfo);

        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }

    render() {
        if (this.state.hasError) {
            return (
                <p style={{ fontSize: "18px", color: "red", paddingTop: "20px" }}>
                    {this.props.errorMessage || "Something went wrong..."}
                </p>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
