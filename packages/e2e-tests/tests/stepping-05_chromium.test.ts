import test from "@playwright/test";

import { openDevToolsTab, startTest } from "../helpers";
import {
  addEventListenerLogpoints,
  openConsolePanel,
  warpToMessage,
} from "../helpers/console-panel";
import {
  resumeToLine,
  rewindToLine,
  stepInToLine,
  stepOutToLine,
  stepOverToLine,
} from "../helpers/pause-information-panel";
import { addBreakpoint } from "../helpers/source-panel";

const url = "doc_minified_chromium.html";

test(`stepping-05_chromium: Test stepping in pretty-printed code`, async ({ page }) => {
  page.setDefaultTimeout(120000);
  await startTest(page, url);
  await openDevToolsTab(page);

  await addBreakpoint(page, { url: "bundle_input.js", lineNumber: 4 });
  await rewindToLine(page, 4);
  await stepInToLine(page, 1);

  // Add a breakpoint in minified.html and resume to there
  await addBreakpoint(page, { url, lineNumber: 8 });
  await resumeToLine(page, 8);
  await stepOverToLine(page, 8);

  // TODO Stepping here hangs
  // await stepOverToLine(page, 9);

  await openConsolePanel(page);
  await addEventListenerLogpoints(page, [{ eventType: "click", categoryKey: "mouse" }]);
  await warpToMessage(page, "PointerEvent", 14);

  await stepInToLine(page, 2);
  await stepOutToLine(page, 15);

  // TODO Stepping here hangs
  // await stepInToLine(page, 10);
  // await stepOutToLine(page, 15);
  // await stepInToLine(page, 5);
  // await stepOutToLine(page, 15);
});
