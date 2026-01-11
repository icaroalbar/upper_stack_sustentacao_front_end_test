import React, { useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Icon, { IconNames } from "../ui/icons";

interface DialogConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  icon: IconNames;
  className?: string;
}

export function DialogConfirmation({
  open,
  onOpenChange,
  message,
  icon,
  className,
}: DialogConfirmationProps) {
  const handleClose = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setTimeout(() => {
      onOpenChange(false);
    }, 0);
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [handleClose, open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-w-2xl flex-col items-center justify-center gap-y-4 border-none">
        <DialogHeader className="flex flex-col items-center justify-center gap-4">
          <Icon name={icon} className={className} size={55} />
          <DialogTitle className="text-center text-lg">{message}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">{message}</DialogDescription>
        <DialogFooter>
          <Button onClick={handleClose} className="px-10">
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
