import assert from "assert";
import { useContext, useEffect, useMemo } from "react";

import { SessionContext } from "replay-next/src/contexts/SessionContext";
import { ReplayClientContext } from "shared/client/ReplayClientContext";
import { TestEnvironmentError } from "shared/test-suites/RecordingTestMetadata";
import { getFormattedTime } from "shared/utils/time";
import { getTruncatedRelativeDate } from "ui/components/Library/Team/View/Recordings/RecordingListItem/RecordingListItem";
import LabeledIcon from "ui/components/TestSuite/components/LabeledIcon";
import { TestResultIcon } from "ui/components/TestSuite/components/TestResultIcon";
import { RecordingCache } from "ui/components/TestSuite/suspense/RecordingCache";
import { TestSuiteCache } from "ui/components/TestSuite/suspense/TestSuiteCache";
import { formatTitle } from "ui/components/TestSuite/utils/formatTitle";
import { createTestTree } from "ui/components/TestSuite/views/GroupedTestCases/createTestTree";
import { TestRecordingTree } from "ui/components/TestSuite/views/GroupedTestCases/TestRecordingTree";
import { sendTelemetryEvent } from "ui/utils/telemetry";

import styles from "./Panel.module.css";

export default function Panel() {
  const replayClient = useContext(ReplayClientContext);
  const { recordingId } = useContext(SessionContext);

  const groupedTestCases = TestSuiteCache.read(replayClient, recordingId);
  assert(groupedTestCases != null);

  const { approximateDuration, environment, resultCounts, source, testRecordings } =
    groupedTestCases;
  const { errors } = environment;
  const { filePath, title } = source;

  const durationString = getFormattedTime(approximateDuration);

  const testTree = useMemo(() => createTestTree(testRecordings), [testRecordings]);

  const recording = RecordingCache.read(recordingId);
  const date = new Date(recording.date);

  return (
    <>
      <div className={styles.Header}>
        <div className={styles.SummaryRow}>
          <div className={styles.Title} title={title ?? filePath}>
            {formatTitle(title ?? filePath)}
          </div>
          <div
            className={styles.ResultIconAndLabel}
            data-status="passed"
            data-test-name="TestSuiteResultsPassedCount"
          >
            <TestResultIcon result="passed" /> {resultCounts.passed}
          </div>
          <div
            className={styles.ResultIconAndLabel}
            data-status="failed"
            data-test-name="TestSuiteResultsFailedCount"
          >
            <TestResultIcon result="failed" /> {resultCounts.failed}
          </div>
          {resultCounts.skipped > 0 && (
            <div
              className={styles.ResultIconAndLabel}
              data-status="skipped"
              data-test-name="TestSuiteResultsSkippedCount"
            >
              <TestResultIcon result="skipped" /> {resultCounts.skipped}
            </div>
          )}
        </div>
        <div className={styles.Attributes}>
          <LabeledIcon
            className={styles.Attribute}
            icon="schedule"
            label={getTruncatedRelativeDate(recording.date)}
            title={date.toLocaleString()}
            dataTestName="TestSuiteDate"
          />
          <Source />
          <LabeledIcon
            className={styles.Attribute}
            icon="timer"
            label={durationString}
            dataTestName="TestSuiteDuration"
          />
        </div>
      </div>
      {errors.map((error, index) => (
        <EnvironmentError error={error} key={index} />
      ))}
      <div className={styles.TreeContainer}>
        <TestRecordingTree testTree={testTree} />
      </div>
    </>
  );
}

function EnvironmentError({ error }: { error: TestEnvironmentError }) {
  const { recordingId } = useContext(SessionContext);

  useEffect(() => {
    sendTelemetryEvent("TestSuites-environment-error", {
      error,
      recordingId,
    });
  }, [error, recordingId]);

  return (
    <div className={styles.Error}>
      Something went wrong (error code <strong>{error.code}</strong>).{" "}
      <a className={styles.ErrorLink} href="http://replay.io/discord" target="discord">
        Contact us on Discord
      </a>
      .
    </div>
  );
}

function Source() {
  const { recordingId } = useContext(SessionContext);

  const recording = RecordingCache.read(recordingId);
  const source = recording.metadata?.source;
  if (source == null) {
    return null;
  }

  const { branch = "branch", merge, trigger } = source;

  return (
    <>
      {trigger?.user && (
        <LabeledIcon
          className={styles.Attribute}
          icon="person"
          label={trigger.user}
          dataTestName="TestSuiteUser"
        />
      )}
      {merge != null ? (
        <LabeledIcon
          className={styles.Attribute}
          icon="fork_right"
          label={branch}
          dataTestName="TestSuiteBranch"
        />
      ) : (
        <LabeledIcon
          className={styles.Attribute}
          icon="merge_type"
          label={branch}
          dataTestName="TestSuiteBranch"
        />
      )}
    </>
  );
}
