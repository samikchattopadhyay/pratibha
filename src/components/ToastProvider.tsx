"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from "react";
import Toast, { ToastProps } from "./Toast";

export interface ShowToastInput {
  type: "success" | "error" | "info" | "warning";
  title: string;
  body?: string;
  duration?: number;
}

interface ToastWithId extends ToastProps {
  id: string;
}

interface ToastContextType {
  showToast: (input: ShowToastInput) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

type ToastAction =
  | { type: "ADD"; toast: ToastWithId }
  | { type: "REMOVE"; id: string };

function toastReducer(state: ToastWithId[], action: ToastAction): ToastWithId[] {
  switch (action.type) {
    case "ADD":
      // Keep only the last 5 toasts
      const newState = [action.toast, ...state].slice(0, 5);
      return newState;
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const showToast = useCallback((input: ShowToastInput) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    dispatch({
      type: "ADD",
      toast: {
        id,
        type: input.type,
        title: input.title,
        body: input.body,
        duration: input.duration ?? 5000,
        onClose: (id: string) => dispatch({ type: "REMOVE", id }),
      },
    });
  }, []);

  const contextValue: ToastContextType = { showToast };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
        <div className="pointer-events-auto">
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
