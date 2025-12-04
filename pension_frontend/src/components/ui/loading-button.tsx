import { forwardRef } from "react";
import { Loader2, Check } from "lucide-react";
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  isSuccess?: boolean;
  loadingText?: string;
  successText?: string;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    children, 
    isLoading, 
    isSuccess, 
    loadingText,
    successText,
    disabled, 
    className, 
    ...props 
  }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative transition-all duration-300",
          isSuccess && "bg-primary",
          className
        )}
        {...props}
      >
        <span className={cn(
          "flex items-center gap-2 transition-opacity",
          (isLoading || isSuccess) && "opacity-0"
        )}>
          {children}
        </span>
        
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingText && <span>{loadingText}</span>}
          </span>
        )}
        
        {isSuccess && (
          <span className="absolute inset-0 flex items-center justify-center gap-2 animate-scale-in">
            <Check className="w-4 h-4" />
            {successText && <span>{successText}</span>}
          </span>
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";
