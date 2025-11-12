declare global {
  interface Window {
    cv?: any;
  }
}

declare module '@mediapipe/face_mesh' {
  export class FaceMesh {
    constructor(config: any);
    setOptions(options: any): void;
    onResults(callback: (results: any) => void): void;
    send(config: { image: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement }): Promise<void>;
    initialize(): Promise<void>;
    close(): void;
  }
}

declare module '@mediapipe/camera_utils' {
  export class Camera {
    constructor(videoElement: HTMLVideoElement, config: any);
    start(): Promise<void>;
    stop(): void;
  }
}

export {};