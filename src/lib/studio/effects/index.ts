import { isFfmpegInstalled } from "./ffmpeg";
import { trimVideo } from "./trim";
import { speedRampVideo } from "./speed-ramp";
import { reframeVideo, type ReframeMode } from "./reframe";
import { recaptionVideo, type CaptionStyle, type WordTimestamp } from "./recaption";

export { isFfmpegInstalled, trimVideo, speedRampVideo, reframeVideo, recaptionVideo };
export type { ReframeMode, CaptionStyle, WordTimestamp };
