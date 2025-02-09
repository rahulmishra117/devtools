import test, { expect } from "@playwright/test";

import { openDevToolsTab, startTest } from "../helpers";
import {
  getErrorRows,
  getSelectedTestCase,
  getTestCaseSteps,
  getTestRecordingBackButton,
  getTestRecordingTrees,
  getTestRowChevron,
  getTestRows,
  getTestSections,
  getTestSuiteBranch,
  getTestSuiteDate,
  getTestSuiteDuration,
  getTestSuitePanel,
  getTestSuiteResultsFailedCount,
  getTestSuiteResultsPassedCount,
  getTestSuiteResultsSkippedCount,
  getTestSuiteUser,
  openCypressTestPanel,
} from "../helpers/testsuites";
import { debugPrint, delay, waitFor } from "../helpers/utils";

const url = "flake/adding-spec.ts";

test("cypress-01: Basic Test Suites panel functionality", async ({ page }) => {
  await startTest(page, url);
  await openDevToolsTab(page);

  await openCypressTestPanel(page);

  const testPanel = getTestSuitePanel(page);

  const isVisible = await testPanel.isVisible();
  expect(isVisible).toBe(true);

  // These are nested, but at least one should exist
  // on the test suites panel
  let initialRecordingTreesCount = 0;
  const initialRecordingTrees = getTestRecordingTrees(page);
  await waitFor(async () => {
    initialRecordingTreesCount = await initialRecordingTrees.count();
    expect(initialRecordingTreesCount).toBeGreaterThanOrEqual(1);
  });

  // has 9 tests
  const rows = getTestRows(page);
  await waitFor(async () => {
    await expect(rows).toHaveCount(9);
  });

  const firstTest = rows.first();

  // displays the nav chevron on hover
  const chevron = getTestRowChevron(firstTest);
  await chevron.isHidden();
  await firstTest.hover();
  await chevron.isVisible();

  // This recording has 8 passing, 1 failing, 0 skipped tests
  const passedCount = await getTestSuiteResultsPassedCount(page);
  expect(passedCount).toBe(8);

  const failedCount = await getTestSuiteResultsFailedCount(page);
  expect(failedCount).toBe(1);

  const skippedCount = await getTestSuiteResultsSkippedCount(page);
  expect(skippedCount).toBe(null);

  // Test suite metadata

  // These icons have hidden text content.
  // Simplest way to check is just see if the text exists.

  // Relative dates can change over time.
  // Check for either the "X units ago" text, or the literal date.
  expect(await getTestSuiteDate(page).textContent()).toMatch(/ ago|(6\/5\/2023)/);
  expect(await getTestSuiteUser(page).textContent()).toMatch("ryanjduffy");
  expect(await getTestSuiteBranch(page).textContent()).toMatch("ryan/metadata-v2");
  expect(await getTestSuiteDuration(page).textContent()).toMatch("0:15");

  // can open tests
  await firstTest.click();
  const selectedRow = getSelectedTestCase(page);
  await waitFor(async () => {
    expect(await selectedRow.isVisible()).toBe(true);
    expect(selectedRow).toHaveCount(1);
  });

  // This recording has a "beforeEach" and a body,
  // but not "after" hooks
  const sections = getTestSections(selectedRow);
  await expect(sections).toHaveCount(2);
  // These are CSS-transformed to uppercase
  expect(await sections.nth(0).textContent()).toMatch(/before each/i);
  expect(await sections.nth(1).textContent()).toMatch(/test body/i);

  const steps = getTestCaseSteps(selectedRow);
  await expect(steps).toHaveCount(17);

  const backButton = getTestRecordingBackButton(page);
  await backButton.click();

  // Check if we're back on the main tests panel
  const secondRecordingTrees = getTestRecordingTrees(page);
  await waitFor(async () => {
    const secondRecordingTreesCount = await secondRecordingTrees.count();
    expect(secondRecordingTreesCount).toBeGreaterThanOrEqual(1);
    expect(initialRecordingTreesCount).toBe(secondRecordingTreesCount);
  });

  // Can show error rows
  await rows.filter({ hasText: "should fail on this test" }).first().click();
  const errorRows = getErrorRows(page);
  await waitFor(async () => {
    expect(await errorRows.count()).toBe(1);
  });
  const text = await errorRows.first().textContent();
  expect(text).toMatch(/Sorry, something went wrong/);
});
