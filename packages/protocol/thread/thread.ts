// ThreadFront is the main interface used to interact with the singleton
// WRP session. This interface is based on the one normally used when the
// devtools interact with a thread: at any time the thread is either paused
// at a particular point, or resuming on its way to pause at another point.
//
// This model is different from the one used in the WRP, where queries are
// performed on the state at different points in the recording. This layer
// helps with adapting the devtools to the WRP.

import {
  ExecutionPoint,
  Frame,
  FrameId,
  PauseId,
  RecordingId,
  SessionId,
  Value,
} from "@replayio/protocol";

import { recordingCapabilitiesCache } from "replay-next/src/suspense/BuildIdCache";
import { cachePauseData, pauseIdCache } from "replay-next/src/suspense/PauseCache";
import { sourcesByIdCache } from "replay-next/src/suspense/SourcesCache";
import { ReplayClientInterface } from "shared/client/types";

import { client } from "../socket";
import { EventEmitter, assert, defer } from "../utils";

export interface Pause {
  point: ExecutionPoint;
  time: number;
  pauseId: PauseId | null;
}

export interface PauseEventArgs {
  point: ExecutionPoint;
  time: number;
  openSource: boolean;
}

type ThreadFrontEvent = "paused" | "resumed";

// Temporary experimental feature flag
interface Features {
  chromiumRepaints: boolean;
  repaintEvaluations: boolean;
}
export let features: Features = {
  chromiumRepaints: false,
  repaintEvaluations: false,
};
export function setFeatures(f: Features): void {
  features = f;
}

class _ThreadFront {
  currentPoint: ExecutionPoint = "0";
  currentTime: number = 0;
  private currentPauseId: PauseId | null = null;

  // Recording ID being examined.
  recordingId: RecordingId | null = null;

  // Waiter for the associated session ID.
  sessionId: SessionId | null = null;
  sessionWaiter = defer<SessionId>();

  // Waiter which resolves when all sources have been loaded.
  private allSourcesWaiter = defer<void>();

  // added by EventEmitter.decorate(ThreadFront)
  eventListeners!: Map<ThreadFrontEvent, ((value?: any) => void)[]>;
  on!: (name: ThreadFrontEvent, handler: (value?: any) => void) => void;
  off!: (name: ThreadFrontEvent, handler: (value?: any) => void) => void;
  emit!: (name: ThreadFrontEvent, value?: any) => void;

  /**
   * This may be null if the pauseId for the current execution point hasn't been
   * received from the backend yet. Use `await getCurrentPauseId()` instead if possible.
   */
  get currentPauseIdUnsafe() {
    return (
      this.currentPauseId ??
      pauseIdCache.getValueIfCached(null as any, this.currentPoint, this.currentTime) ??
      null
    );
  }

  async getCurrentPauseId(replayClient: ReplayClientInterface): Promise<PauseId> {
    return (
      this.currentPauseId ??
      (await pauseIdCache.readAsync(replayClient, this.currentPoint, this.currentTime))
    );
  }

  async setSessionId(sessionId: SessionId) {
    this.sessionId = sessionId;
    assert(sessionId, "there should be a sessionId");
    this.sessionWaiter.resolve(sessionId);
    // This helps when trying to debug logRocket sessions and the like
    console.debug({ sessionId });
  }

  waitForSession() {
    return this.sessionWaiter.promise;
  }

  _accessToken: string | null = null;

  getAccessToken(): string | null {
    return this._accessToken;
  }

  setAccessToken(accessToken: string) {
    this._accessToken = accessToken;

    return client.Authentication.setAccessToken({ accessToken });
  }

  timeWarp(point: ExecutionPoint, time: number, openSource: boolean, frame?: Frame) {
    this.currentPoint = point;
    this.currentTime = time;
    this.currentPauseId = null;
    this.emit("paused", { point, time, openSource, frame });
  }

  timeWarpToPause(pause: Pause, openSource: boolean) {
    const { point, time, pauseId } = pause;
    assert(point && time, "point or time not set on pause");
    this.currentPoint = point;
    this.currentTime = time;
    this.currentPauseId = pauseId;
    this.emit("paused", { point, time, openSource });
  }

  async ensureAllSources() {
    await this.allSourcesWaiter.promise;
  }

  public markSourcesLoaded() {
    // Called by `debugger/src/client/index`, in `setupDebugger()`.
    // Sources are now fetched via `SourcesCache`.
    this.allSourcesWaiter.resolve();
  }

  // Same as evaluate, but returns the result without wrapping a ValueFront around them.
  // TODO Replace usages of evaluate with this.
  async evaluate({
    replayClient,
    pauseId,
    text,
    frameId,
    pure = false,
  }: {
    replayClient: ReplayClientInterface;
    pauseId?: PauseId;
    text: string;
    frameId?: FrameId;
    pure?: boolean;
  }) {
    if (!pauseId) {
      pauseId = await this.getCurrentPauseId(replayClient);
    }
    const abilities = await recordingCapabilitiesCache.readAsync(replayClient);
    const { result } = frameId
      ? await client.Pause.evaluateInFrame(
          {
            frameId,
            expression: text,
            useOriginalScopes: true,
            pure: abilities.supportsPureEvaluation && pure,
          },
          this.sessionId!,
          pauseId
        )
      : await client.Pause.evaluateInGlobal(
          {
            expression: text,
            pure: abilities.supportsPureEvaluation && pure,
          },
          this.sessionId!,
          pauseId
        );
    const sources = await sourcesByIdCache.readAsync(replayClient);
    cachePauseData(replayClient, sources, pauseId, result.data);

    if (features.repaintEvaluations) {
      const { repaint } = await import("protocol/graphics");
      // Fire and forget
      repaint(true);
    }

    if (result.returned) {
      return { exception: null, returned: result.returned as unknown as Value };
    } else if (result.exception) {
      return { exception: result.exception as unknown as Value, returned: null };
    } else {
      return { exception: null, returned: null };
    }
  }
}

export const ThreadFront = new _ThreadFront();
EventEmitter.decorate<any, ThreadFrontEvent>(ThreadFront);
