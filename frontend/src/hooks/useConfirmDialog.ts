import { useState, useCallback } from "react";
import type { ConfirmDialogVariant } from "../components/ui/ConfirmDialog";
import type { ElementType } from "react";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  isVolunteer?: boolean;
  icon?: ElementType;
}

export interface ConfirmDialogState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

export const useConfirmDialog = () => {
  const [state, setState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    variant: "danger",
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel || "Confirm",
        cancelLabel: options.cancelLabel || "Cancel",
        variant: options.variant || "danger",
        icon: options.icon,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    setState((prev) => {
      if (prev.resolve) {
        prev.resolve(false);
      }
      return {
        ...prev,
        isOpen: false,
        resolve: null,
      };
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState((prev) => {
      if (prev.resolve) {
        prev.resolve(true);
      }
      return {
        ...prev,
        isOpen: false,
        resolve: null,
      };
    });
  }, []);

  return {
    confirm,
    dialogProps: {
      isOpen: state.isOpen,
      onClose: handleClose,
      onConfirm: handleConfirm,
      title: state.title,
      message: state.message,
      confirmLabel: state.confirmLabel,
      cancelLabel: state.cancelLabel,
      variant: state.variant,
      icon: state.icon,
    },
  };
};
