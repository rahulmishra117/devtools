import { ConfigurablePreferences } from "shared/user-data/GraphQL/types";

export type ActiveInspectorTab = "ruleview" | "layoutview" | "computedview" | "eventsview";
export type CommentsFilterByPreference = "current-user" | null;
export type CommentsSortByPreference = "created-at" | "recording-time";
export type ConsoleEventFilterPreferences = {
  keyboard: boolean;
  mouse: boolean;
  navigation: boolean;
};
export type ConsoleEventFilterPreferencesKey = keyof ConsoleEventFilterPreferences;
export type Role = "developer" | "other";
export type Theme = "light" | "dark" | "system";
export type ViewMode = "dev" | "non-dev";

// The UserData service and the useGraphQLUserData() hook both use this configuration;
// Only values explicitly listed below can be managed by those services
//
// This configuration can be used to manage the following types of data:
// * Preferences: Things that are typically managed in a settings dialog
// * Features: New or experimental things that we want to give people a way to opt-in or opt-out from
// * History: Things we remember between sessions, e.g. the most recently selected tab
//
// To simplify TypeScript type-safety checks, all of the above are stored in the same, flat structure
// Prefixes and  alphabetical sorting are used to group similar types of data,
// and to reduce the likelihood of merge conflicts

export const config = {
  backend_disableCache: {
    defaultValue: Boolean(false),
    legacyKey: "devtools.disableCache",
  },
  backend_disableConcurrentControllerLoading: {
    defaultValue: Boolean(false),
    description: "Disable loading regions concurrently at controller startup",
    internalOnly: Boolean(true),
    label: "Disable Concurrent Controller Loading",
    legacyKey: "devtools.features.disableConcurrentControllerLoading",
  },
  backend_disableIncrementalSnapshots: {
    defaultValue: Boolean(false),
    description: "Disable using diffs between snapshots",
    label: "Disable using incremental snapshots",
    legacyKey: "devtools.features.disableIncrementalSnapshots",
  },
  backend_disableRecordingAssetsInDatabase: {
    defaultValue: Boolean(false),
    description:
      "Disable writing to and reading from the backend database when storing or retrieving recording assets",
    internalOnly: Boolean(true),
    label: "Disable tracking recording assets in the database",
    legacyKey: "devtools.features.disableRecordingAssetsInDatabase",
  },
  backend_disableScanDataCache: {
    defaultValue: Boolean(false),
    description: "Do not cache the results of indexing the recording",
    internalOnly: Boolean(true),
    label: "Disable scan data cache",
    legacyKey: "devtools.features.disableScanDataCache",
  },
  backend_disableStableQueryCache: {
    defaultValue: Boolean(false),
    description: "Disable caching of previously generated responses",
    internalOnly: Boolean(true),
    label: "Disable query-level caching for stable request types",
    legacyKey: "devtools.features.disableStableQueryCache",
  },
  backend_enableRoutines: {
    defaultValue: Boolean(false),
    description: "Enable backend support for running processing routines (like React DevTools)",
    label: "Enable backend processing routines",
    legacyKey: "devtools.features.enableRoutines",
  },
  backend_enableUnstableQueryCache: {
    defaultValue: Boolean(false),
    description:
      "Allow the backend to return previously generated responses without re-running the request",
    internalOnly: Boolean(true),
    label: "Enable query-level caching for unstable request types",
    legacyKey: "devtools.features.enableUnstableQueryCache",
  },
  backend_keepAllTraces: {
    defaultValue: Boolean(false),
    legacyKey: "devtools.features.keepAllTraces",
  },
  backend_listenForMetrics: {
    defaultValue: Boolean(false),
    legacyKey: "devtools.listenForMetrics",
  },
  backend_newControllerOnRefresh: {
    defaultValue: Boolean(false),
    label: "Get a new controller upon each page refresh",
    legacyKey: "devtools.features.newControllerOnRefresh",
  },
  backend_profileWorkerThreads: {
    defaultValue: Boolean(false),
    description:
      "Record a performance profile of the source worker and send it to Replay to help diagnose performance issues",
    internalOnly: Boolean(true),
    label: "Profile Source Worker",
    legacyKey: "devtools.features.profileWorkerThreads",
  },
  backend_rerunRoutines: {
    defaultValue: Boolean(false),
    description: "Always re-run routines instead of using cached results",
    internalOnly: Boolean(true),
    label: "Retry backend processing routines",
    legacyKey: "devtools.features.rerunRoutines",
  },

  comments_filterBy: {
    defaultValue: null as CommentsFilterByPreference,
    legacyKey: "Replay:CommentPreferences:Filter",
  },
  comments_showPreview: {
    defaultValue: Boolean(true),
    legacyKey: "Replay:CommentPreferences:ShowPreview",
  },
  comments_sortBy: {
    defaultValue: "recording-time" as CommentsSortByPreference,
    legacyKey: "Replay:CommentPreferences:sortBy",
  },

  console_eventFilters: {
    defaultValue: {
      keyboard: true,
      mouse: true,
      navigation: true,
    } as ConsoleEventFilterPreferences,
    legacyKey: "Replay:EventsPreferences:Filters",
  },
  console_showFiltersByDefault: {
    defaultValue: Boolean(false),
    description:
      "Open the console filter settings by default when opening a Replay for the first time",
    internalOnly: Boolean(false),
    label: "Console filter drawer defaults to open",
    legacyKey: "devtools.features.consoleFilterDrawerDefaultsToOpen",
  },

  debugger_frameworkGroupingOn: {
    defaultValue: Boolean(true),
    legacyKey: "devtools.debugger.ui.framework-grouping-on",
  },

  feature_basicProcessingLoadingBar: {
    defaultValue: Boolean(false),
    description:
      "Split the loading bar's progress between gathering static resources from the recording and indexing runtime information",
    label: "Detailed loading bar",
    legacyKey: "devtools.features.basicProcessingLoadingBar",
  },
  feature_brokenSourcemapWorkaround: {
    defaultValue: Boolean(true),
    description: "Skip locations that are mapped to the beginning of a function body",
    label: "Enable workaround for broken sourcemaps",
    legacyKey: "devtools.features.brokenSourcemapWorkaround",
  },
  feature_chromiumNetMonitor: {
    defaultValue: Boolean(true),
    legacyKey: "devtools.features.chromiumNetMonitor",
  },
  feature_columnBreakpoints: {
    defaultValue: Boolean(false),
    description: "Add breakpoints within a line",
    label: "Column Breakpoints",
    legacyKey: "devtools.features.columnBreakpoints",
  },
  feature_commentAttachments: {
    defaultValue: Boolean(false),
    legacyKey: "devtools.features.commentAttachments",
  },
  feature_logProtocol: {
    defaultValue: Boolean(false),
    label: "View protocol requests and responses in the panel",
    legacyKey: "devtools.features.logProtocol",
  },
  feature_logProtocolEvents: {
    defaultValue: Boolean(false),
    legacyKey: "devtools.features.logProtocolEvents",
  },
  feature_showPassport: {
    defaultValue: Boolean(false),
    label: "Show Replay Passport",
    legacyKey: "devtools.features.showPassport",
  },
  feature_protocolTimeline: {
    defaultValue: Boolean(false),
    label: "Visualize protocol events in the timeline",
    legacyKey: "devtools.features.protocolTimeline",
  },
  feature_reactPanel: {
    defaultValue: Boolean(false),
    description: "Enable experimental React render details panel",
    label: "Enable React Panel",
    legacyKey: "devtools.features.reactPanel",
  },
  // TODO [FE-1646] Should we remove this? Is it still being used?
  feature_resolveRecording: {
    defaultValue: Boolean(false),
    legacyKey: "devtools.features.resolveRecording",
  },

  global_disableLogRocket: {
    defaultValue: Boolean(false),
    label: "Disable LogRocket session replay",
    legacyKey: "devtools.disableLogRocket",
  },
  global_enableLargeText: {
    defaultValue: Boolean(false),
    label: "Enable large text for Editor",
    legacyKey: "devtools.features.enableLargeText",
  },
  global_logTelemetryEvent: {
    defaultValue: Boolean(false),
    label: "Log Mixpanel events to the console",
    legacyKey: "devtools.logTelemetryEvent",
  },
  global_role: {
    defaultValue: "other" as Role,
    legacyKey: null,
  },
  global_theme: {
    defaultValue: "system" as Theme,
    label: "Theme",
    legacyKey: "devtools.theme",
  },
  global_showRedactions: {
    defaultValue: Boolean(false),
    legacyKey: "devtools.showRedactions",
  },

  inspector_activeTab: {
    defaultValue: "ruleview" as ActiveInspectorTab,
    legacyKey: "devtools.inspector.active-tab",
  },
  inspector_collapseAttributes: {
    defaultValue: Boolean(true),
    legacyKey: "devtools.markup.collapseAttributes",
  },
  inspector_collapseAttributeLength: {
    defaultValue: 120,
    legacyKey: "devtools.markup.collapseAttributeLength",
  },
  inspector_inactiveCssEnabled: {
    defaultValue: Boolean(false),
    legacyKey: "devtools.inspector.inactive.css.enabled",
  },
  inspector_showPseudoElements: {
    defaultValue: Boolean(false),
    legacyKey: "devtools.inspector.show_pseudo_elements",
  },

  layout_breakpointsPanelExpanded: {
    defaultValue: Boolean(true),
    legacyKey: "devtools.debugger.breakpoints-visible",
  },
  layout_callStackPanelExpanded: {
    defaultValue: Boolean(true),
    legacyKey: "devtools.debugger.call-stack-visible",
  },
  layout_defaultViewMode: {
    defaultValue: "non-dev" as ViewMode,
    label: "Default Mode",
    legacyKey: "devtools.defaultMode",
  },
  layout_debuggerOutlineExpanded: {
    defaultValue: Boolean(true),
    legacyKey: "devtools.debugger.outline-expanded",
  },
  layout_inspectorBoxModelOpen: {
    defaultValue: Boolean(true),
    legacyKey: "devtools.layout.boxmodel.opened",
  },
  layout_logpointsPanelExpanded: {
    defaultValue: Boolean(true),
    legacyKey: "devtools.debugger.logpoints-visible",
  },
  layout_scopesPanelExpanded: {
    defaultValue: Boolean(true),
    legacyKey: "devtools.debugger.scopes-visible",
  },
  layout_sidePanelCollapsed: {
    defaultValue: Boolean(false),
    legacyKey: "Replay:SidePanelCollapsed",
  },
  layout_sourcesCollapsed: {
    defaultValue: Boolean(false),
    legacyKey: "devtools.debugger.sources-collapsed",
  },

  protocol_chromiumRepaints: {
    defaultValue: Boolean(false),
    label: "Allow DOM.repaintGraphics inside of Chromium recordings",
    legacyKey: "devtools.features.chromiumRepaints",
  },
  protocol_repaintEvaluations: {
    defaultValue: Boolean(false),
    legacyKey: "devtools.features.repaintEvaluations",
  },

  source_showHitCounts: {
    defaultValue: Boolean(true),
    label: "Show hit count numbers for each source line",
    legacyKey: "Replay:ShowHitCounts",
  },
} satisfies ConfigurablePreferences;

export const ENUMS = {
  defaultViewMode: [
    { label: "Viewer", value: "non-dev" },
    { label: "DevTools", value: "dev" },
  ],
  theme: [
    { label: "Dark", value: "dark" },
    { label: "Light", value: "light" },
    { label: "System", value: "system" },
  ],
};
