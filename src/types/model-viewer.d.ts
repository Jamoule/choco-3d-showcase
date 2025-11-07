import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        poster?: string;
        "camera-controls"?: boolean;
        "auto-rotate"?: boolean;
        autoplay?: boolean;
        "shadow-intensity"?: string | number;
        exposure?: string | number;
        "environment-image"?: string;
        "camera-orbit"?: string;
        "field-of-view"?: string;
        "auto-rotate-delay"?: string | number;
        "interaction-prompt"?: string;
      };
    }
  }
}

export {};
