import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification } = useAuth();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const handleVerification = useCallback(async () => {
    try {
      setStatus("verifying");
      const result = await verifyEmail(userId, secret);

      if (result.success) {
        setStatus("success");
        setMessage(
          "Your email has been verified successfully! You can now sign in to your account."
        );
      } else {
        setStatus("error");
        setMessage(
          result.error || "Email verification failed. Please try again."
        );
      }
    } catch {
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again.");
    }
  }, [userId, secret, verifyEmail]);

  useEffect(() => {
    if (userId && secret) {
      handleVerification();
    } else {
      setStatus("error");
      setMessage("Invalid verification link. Please try again.");
    }
  }, [userId, secret, handleVerification]);

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const result = await resendVerification();
      if (result.success) {
        setMessage(result.message);
      } else {
        setMessage(result.error || "Failed to resend verification email.");
      }
    } catch {
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        );
      case "success":
        return (
          <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mx-auto">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">{getStatusIcon()}</div>
          <CardTitle className={`text-2xl ${getStatusColor()}`}>
            {status === "verifying" && "Verifying Email"}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription className="mt-2">
            {status === "verifying" &&
              "Please wait while we verify your email address..."}
            {status === "success" && "Your account is now ready to use"}
            {status === "error" && "There was a problem verifying your email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div
              className={`p-4 rounded-md text-sm ${
                status === "success"
                  ? "bg-green-50 border border-green-200 text-green-600"
                  : status === "error"
                  ? "bg-red-50 border border-red-200 text-red-600"
                  : "bg-blue-50 border border-blue-200 text-blue-600"
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-2">
            {status === "success" && (
              <Button onClick={() => navigate("/login")} className="w-full">
                Go to Sign In
              </Button>
            )}

            {status === "error" && (
              <>
                <Button
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Sending..." : "Resend Verification Email"}
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
