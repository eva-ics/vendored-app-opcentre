import {
  Eva,
  SerializationKind,
  EvaError
} from "@eva-ics/webengine";

import {
  EvaVideoDecoder,
  EvaPlayerAutoSize
} from "@eva-ics/webengine-multimedia";
import type { EvaVideoStreamInfo } from "@eva-ics/webengine-multimedia";

interface RecVideoFrame {
  t: number; // Timestamp in seconds
  data: ArrayBuffer; // Video frame data
  key_unit?: boolean; // Optional flag for key frames
}

export interface EvaLivePlayerParameters {
  canvas: HTMLCanvasElement;
  oid: string;
  t_start: number;
  svc?: string;
  engine?: Eva;
  onError?: (error: EvaError) => void;
  onActiveChange?: (active: boolean) => void;
  onEOS?: () => void;
  onNextFrame?: (t: number) => void;
  onChange?: (info: EvaVideoStreamInfo) => void;
  decoderHardwareAcceleration?: boolean;
  decoderFallbackToSoftware?: boolean;
  fetchSecInitial?: number;
  fetchSecNext?: number;
  fps?: number;
  playbackSpeed?: number; // Playback speed multiplier
  autoSize?: EvaPlayerAutoSize; // Optional auto-size configuration
}

const DEFAULT_FPS = 30; // Default frames per second if not provided

export class EvaRecPlayer {
  decoder?: EvaVideoDecoder;
  engine: Eva;
  svc: string;
  frame_duration_ms?: number;
  canvas: HTMLCanvasElement;
  onError?: (error: EvaError) => void;
  onEOS?: () => void;
  onNextFrame?: (t: number) => void;
  onActiveChange?: (active: boolean) => void;
  onChange?: (info: EvaVideoStreamInfo) => void;
  fps?: number;
  private playbackSpeed: number = 1; // Playback speed multiplier
  private paused: boolean;
  private frames: Array<RecVideoFrame> = [];
  private prev_frames_t: Array<number> = [];
  private tNext: number;
  private t_start: number;
  private oid: string;
  private displayFrameWorker: any = null;
  private fetchActive: boolean = false;
  private fetchSecInitial: number;
  private fetchSecNext: number;
  private decoderHardwareAcceleration: boolean;
  private decoderFallbackToSoftware: boolean;
  private autoSize: EvaPlayerAutoSize;
  constructor(params: EvaLivePlayerParameters) {
    this.svc = params.svc || "eva.videosrv.default";
    this.canvas = params.canvas;
    const eva_engine: Eva | undefined = params.engine;
    if (!eva_engine) {
      throw new Error("EVA ICS WebEngine not set");
    }
    this.fetchSecInitial = params.fetchSecInitial || 5;
    this.fetchSecNext = params.fetchSecNext || 2;
    this.engine = eva_engine;
    this.onError = params.onError;
    this.onEOS = params.onEOS;
    this.onChange = params.onChange;
    this.onNextFrame = params.onNextFrame;
    this.onActiveChange = params.onActiveChange;
    this.t_start = params.t_start;
    this.tNext = params.t_start;
    this.oid = params.oid;
    this.fps = params.fps;
    this.autoSize = params.autoSize || EvaPlayerAutoSize.None;
    this.playbackSpeed = params.playbackSpeed || 1; // Default playback speed is 1x
    this.decoderHardwareAcceleration =
      params.decoderHardwareAcceleration ?? true;
    this.decoderFallbackToSoftware = params.decoderFallbackToSoftware ?? true;

    this.paused = false;
    this.init();
  }
  init(keep_prev_frames: boolean = false) {
    this.frames = [];
    if (!keep_prev_frames) {
      this.prev_frames_t = [];
    }
    if (this.displayFrameWorker) {
      clearInterval(this.displayFrameWorker);
    }
    this.displayFrameWorker = null;
    this.decoder = new EvaVideoDecoder();
    this.decoder.setPreferredHardwareAcceleration(
      this.decoderHardwareAcceleration ?? true
    );
    this.decoder.fallbackToSoftware = this.decoderFallbackToSoftware;
    this.decoder.onChange = (info: EvaVideoStreamInfo) => {
      switch (this.autoSize) {
        case EvaPlayerAutoSize.KeepWidth:
          this.canvas.height = (this.canvas.width * info.height) / info.width;
          break;
        case EvaPlayerAutoSize.KeepHeight:
          this.canvas.width = (this.canvas.height * info.width) / info.height;
          break;
        case EvaPlayerAutoSize.Resize:
          this.canvas.width = info.width;
          this.canvas.height = info.height;
          break;
        case EvaPlayerAutoSize.None:
          // Do nothing
          break;
      }
      if (this.onChange) {
        this.onChange(info);
      }
    };

    this.decoder.onError = (error: EvaError) => {
      console.error(error);
      console.error(`Error in decoder: ${error.message} (${error.code})`);
      if (this.onError) {
        this.onError(error);
      }
      this.messageError(error);
      this.close();
    };
    this.decoder.onOutput = (frame: VideoFrame) => {
      //console.log("decoded");
      let t = frame.timestamp;
      if (t < 0) {
        t *= -1; // negative timestamps are used to skip frame display
      }
      this.prev_frames_t.push(t / 1000);
      if (this.prev_frames_t.length > 10000) {
        this.prev_frames_t.shift(); // Keep memory usage in check
      }
      if (frame.timestamp > 0) {
        const ctx = this.canvas.getContext("2d");
        ctx?.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height);
        if (this.onNextFrame) {
          this.onNextFrame(frame.timestamp / 1000);
        }
      }
    };
  }
  goto(t: number, keep_prev_frames: boolean = false) {
    //console.log("requested to go to", t);
    this.close();
    this.t_start = t;
    this.tNext = t;
    this.init(keep_prev_frames);
    this.start();
  }
  private message(text: string, width: number, color: string = "white") {
    const ctx = this.canvas.getContext("2d")!;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = color;
    ctx.font = `bold ${width}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
  }
  pause() {
    this.paused = true;
    if (this.onActiveChange) {
      this.onActiveChange(false);
    }
  }
  resume() {
    this.paused = false;
    if (this.onActiveChange) {
      this.onActiveChange(true);
    }
  }
  togglePause() {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.resume();
    }
  }
  isPlaying() {
    return !this.paused;
  }
  private messageEOS() {
    this.message("EOS", 50);
  }
  private messageError(error: EvaError) {
    if (!this.paused) {
      this.message(`Error: ${error.message} (${error.code})`, 12, "red");
    }
  }
  stepFrameBackward() {
    this.pause();
    this.prev_frames_t.pop(); // current frame is not needed
    const t = this.prev_frames_t.pop();
    if (!t) {
      return;
    }
    //console.log(t);
    this.goto(t, true);
  }
  stepFrameForward() {
    this.pause();
    this.displayNextFrame();
  }
  private displayNextFrame() {
    const frame = this.frames.shift();
    if (this.frames.length < (this.fps || DEFAULT_FPS) * 3) {
      this.fetchNext(false);
    }
    if (!frame) {
      this.messageEOS();
      return;
    }
    //console.log("frame_t=", frame?.t, "t_start=", this.t_start);
    let m = 1;
    if (frame.t < this.t_start) {
      m = -1;
    }
    this.decoder!.decode(frame.data, frame.t * 1000 * m);
    if (frame.t < this.t_start) {
      this.displayNextFrame();
      return;
    }
  }
  private fetchNext(initial: boolean) {
    if (this.fetchActive) {
      return; // Avoid fetching if already fetching
    }
    this.fetchActive = true;
    this.engine
      .api_call({
        method: `x::${this.svc}::rec.segmented`,
        params: {
          i: this.oid,
          t: this.tNext,
          limit_min:
            (this.fps || DEFAULT_FPS) *
            (initial ? this.fetchSecInitial : this.fetchSecNext)
        },
        serialization_kind: SerializationKind.MsgPack
      })
      .then((response) => {
        if (response.length === 0) {
          if (initial) {
            this.fetchActive = false;
            this.messageEOS();
            return;
          }
        }
        //console.log("t=", response[0].t);
        const frames = response.map((item: any) => {
          return {
            t: item.t,
            data: new Uint8Array(item.data).buffer,
            key_unit: item.key_unit || false
          };
        });
        if (response.length > 0) {
          const last_t = response[response.length - 1].t;
          if (last_t < this.tNext) {
            this.fetchActive = false;
            this.messageEOS();
            this.pause();
            return;
          }
          this.tNext = last_t + 1;
        }
        this.frames.push(...frames);
        this.fetchActive = false;
        if (initial) {
          this.displayNextFrame();
          this.startDisplayFrameWorker();
        }
      })
      .catch((error) => {
        this.fetchActive = false;
        if (this.onError) {
          this.onError(error);
        }
        this.pause();
      });
  }
  private startDisplayFrameWorker() {
    clearInterval(this.displayFrameWorker);
    this.displayFrameWorker = setInterval(
      () => {
        if (!this.paused) {
          //console.log("tick");
          this.displayNextFrame();
        }
      },
      (this.frame_duration_ms || 1000 / 30) / this.playbackSpeed
    ); // Default to 30 FPS if not set
  }
  setPlaybackSpeed(speed: number) {
    if (speed <= 0) {
      throw new Error("Playback speed must be greater than 0");
    }
    if (this.playbackSpeed === speed) {
      return; // No change in playback speed
    }
    this.playbackSpeed = speed;
    this.startDisplayFrameWorker();
  }
  start() {
    this.tNext = this.t_start;
    if (this.fps) {
      this.frame_duration_ms = (1 / this.fps) * 1000; // Convert FPS to milliseconds
      this.fetchNext(true);
      return;
    }
    this.start_player();
  }
  private async start_player() {
    let fps;
    try {
      const res_item = await (this.engine.api_call({
        method: "item.state",
        params: { i: this.oid, full: true }
      }) as any);
      fps = res_item[0]?.meta?.fps;
      const res_info = await (this.engine.api_call({
        method: `x::${this.svc}::rec.info`,
        params: { i: this.oid, t: this.t_start, limit: 100 }
      }) as any);
      if (!fps) {
        fps = res_info?.fps;
      }
    } catch (e: any) {
      if (this.onError) {
        this.onError(new EvaError(e.message, e.code || 500));
      }
      return;
    }
    //console.log("fps=", fps);
    if (!fps) {
      this.messageEOS();
      return;
    }
    //console.log("fps=", fps);
    this.fps = fps;
    this.frame_duration_ms = (1 / fps) * 1000; // Convert FPS to milliseconds
    this.fetchNext(true);
  }
  close() {
    this.decoder!.close();
    clearInterval(this.displayFrameWorker);
    this.displayFrameWorker = null;
    this.frames = [];
  }
}
