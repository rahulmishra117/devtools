import { Value as ProtocolValue, SourceId } from "@replayio/protocol";
import { RefObject, Suspense, useContext, useEffect, useRef } from "react";

import { SelectedFrameContext } from "replay-next/src/contexts/SelectedFrameContext";
import { useCurrentFocusWindow } from "replay-next/src/hooks/useCurrentFocusWindow";
import { getFrameSuspense } from "replay-next/src/suspense/FrameCache";
import {
  getPointAndTimeForPauseId,
  pauseEvaluationsCache,
} from "replay-next/src/suspense/PauseCache";
import { ReplayClientContext } from "shared/client/ReplayClientContext";
import { isPointInRegion } from "shared/utils/time";

import SourcePreviewInspector from "../inspector/SourcePreviewInspector";
import Popup from "../Popup";
import styles from "./PreviewPopup.module.css";

type Props = {
  clientX?: number | null;
  containerRef: RefObject<HTMLElement>;
  dismiss: () => void;
  expression: string;
  sourceId: SourceId;
  target: HTMLElement;
};

export default function PreviewPopup(props: Props) {
  return (
    <Suspense fallback={null}>
      <SuspendingPreviewPopup {...props} />
    </Suspense>
  );
}

function SuspendingPreviewPopup({
  clientX = null,
  containerRef,
  dismiss,
  expression,
  sourceId,
  target,
}: Props) {
  const client = useContext(ReplayClientContext);
  const focusWindow = useCurrentFocusWindow();

  const popupRef = useRef<HTMLDivElement>(null);

  const { selectedPauseAndFrameId } = useContext(SelectedFrameContext);
  const frameId = selectedPauseAndFrameId?.frameId ?? null;
  const pauseId = selectedPauseAndFrameId?.pauseId ?? null;

  let value: ProtocolValue | null = null;
  if (frameId !== null && pauseId !== null) {
    const [point] = getPointAndTimeForPauseId(pauseId);
    if (focusWindow !== null && point !== null && isPointInRegion(point, focusWindow)) {
      const frame = getFrameSuspense(client, pauseId, frameId);
      if (frame?.location.some(location => location.sourceId === sourceId)) {
        const result = pauseEvaluationsCache.read(client, pauseId, frameId, expression, undefined);
        value = result.returned || null;
      }
    }
  }

  useEffect(() => {
    const onClick = ({ defaultPrevented, target }: MouseEvent) => {
      if (defaultPrevented) {
        return;
      }

      const popupElement = popupRef.current;
      if (popupElement && target) {
        if (popupElement !== target && !popupElement.contains(target as any)) {
          dismiss();
        }
      }
    };

    document.body.addEventListener("click", onClick);

    return () => {
      document.body.removeEventListener("click", onClick);
    };
  });

  if (pauseId !== null && value !== null) {
    return (
      <Popup
        clientX={clientX}
        containerRef={containerRef}
        dismiss={dismiss}
        target={target}
        showTail={true}
      >
        <SourcePreviewInspector
          className={styles.Popup}
          pauseId={pauseId}
          protocolValue={value}
          ref={popupRef}
        />
      </Popup>
    );
  } else {
    return null;
  }
}
