/**
 * Logs command output fixtures for testing
 */

// ─── log show NDJSON output ─────────────────────────────────────────

export const LOG_SHOW_SUCCESS = {
  stdout: `{"timestamp":"2025-01-15 10:30:01.123","processImagePath":"/Applications/MyApp.app/Contents/MacOS/MyApp","subsystem":"com.example.myapp","category":"networking","messageType":"Info","eventMessage":"Request started: GET /api/users"}
{"timestamp":"2025-01-15 10:30:01.456","processImagePath":"/Applications/MyApp.app/Contents/MacOS/MyApp","subsystem":"com.example.myapp","category":"networking","messageType":"Info","eventMessage":"Response received: 200 OK (145ms)"}
{"timestamp":"2025-01-15 10:30:02.789","processImagePath":"/Applications/MyApp.app/Contents/MacOS/MyApp","subsystem":"com.example.myapp","category":"ui","messageType":"Default","eventMessage":"View controller presented: UsersViewController"}`,
  stderr: "",
  code: 0,
};

export const LOG_SHOW_EMPTY = {
  stdout: "",
  stderr: "",
  code: 0,
};

export const LOG_SHOW_ERROR = {
  stdout: "",
  stderr: "log: invalid predicate",
  code: 1,
};

export const LOG_SHOW_MANY_ENTRIES = {
  stdout: Array.from({ length: 100 }, (_, i) =>
    JSON.stringify({
      timestamp: `2025-01-15 10:30:${String(i).padStart(2, "0")}.000`,
      processImagePath: "/Applications/MyApp.app/Contents/MacOS/MyApp",
      subsystem: "com.example.myapp",
      category: "general",
      messageType: "Info",
      eventMessage: `Log entry number ${i}`,
    }),
  ).join("\n"),
  stderr: "",
  code: 0,
};

// ─── xcresulttool build-results JSON output ─────────────────────────

export const BUILD_RESULTS_WITH_ERRORS = {
  stdout: JSON.stringify({
    diagnostics: [
      {
        severity: "error",
        message: "Cannot find 'nonexistentFunction' in scope",
        sourceLocation: {
          path: "/path/to/ViewController.swift",
          line: 42,
          column: 5,
        },
      },
      {
        severity: "error",
        message: "Type 'Foo' has no member 'bar'",
        sourceLocation: {
          path: "/path/to/Model.swift",
          line: 18,
          column: 10,
        },
      },
      {
        severity: "warning",
        message: "Variable 'unused' was never used",
        sourceLocation: {
          path: "/path/to/Utils.swift",
          line: 7,
          column: 9,
        },
      },
    ],
  }),
  stderr: "",
  code: 0,
};

export const BUILD_RESULTS_CLEAN = {
  stdout: JSON.stringify({
    diagnostics: [],
  }),
  stderr: "",
  code: 0,
};

export const BUILD_RESULTS_WARNINGS_ONLY = {
  stdout: JSON.stringify({
    diagnostics: [
      {
        severity: "warning",
        message: "Deprecated API 'oldMethod()' was used",
        sourceLocation: {
          path: "/path/to/Legacy.swift",
          line: 33,
          column: 1,
        },
      },
      {
        severity: "warning",
        message: "Result of call to 'doSomething()' is unused",
        sourceLocation: {
          path: "/path/to/Service.swift",
          line: 55,
          column: 9,
        },
      },
    ],
  }),
  stderr: "",
  code: 0,
};

export const BUILD_RESULTS_INVALID_JSON = {
  stdout: "not valid json {{{",
  stderr: "",
  code: 0,
};

export const BUILD_RESULTS_COMMAND_FAILURE = {
  stdout: "",
  stderr: "xcresulttool error: unable to open result bundle",
  code: 1,
};

// ─── xcresulttool test-results summary/tests JSON output ────────────

export const TEST_SUMMARY_ALL_PASS = {
  stdout: JSON.stringify({
    passed: 15,
    failed: 0,
    skipped: 2,
    totalDuration: 4.523,
  }),
  stderr: "",
  code: 0,
};

export const TEST_SUMMARY_WITH_FAILURES = {
  stdout: JSON.stringify({
    passed: 12,
    failed: 3,
    skipped: 1,
    totalDuration: 6.789,
  }),
  stderr: "",
  code: 0,
};

export const TEST_SUMMARY_EMPTY = {
  stdout: JSON.stringify({
    passed: 0,
    failed: 0,
    skipped: 0,
    totalDuration: 0,
  }),
  stderr: "",
  code: 0,
};

export const TEST_SUMMARY_COMMAND_FAILURE = {
  stdout: "",
  stderr: "xcresulttool error: no test results found",
  code: 1,
};

export const TEST_TESTS_WITH_FAILURES = {
  stdout: JSON.stringify([
    {
      name: "MyAppTests",
      children: [
        {
          name: "AuthTests",
          subtests: [
            { name: "testLoginSuccess", status: "passed", duration: 0.5 },
            {
              name: "testLoginFailure",
              status: "failed",
              duration: 1.2,
              failureMessage: "Expected status 401 but got 200",
            },
            {
              name: "testTokenRefresh",
              status: "failed",
              duration: 0.8,
              failureMessage: "Token was nil after refresh",
            },
          ],
        },
        {
          name: "NetworkTests",
          subtests: [
            { name: "testFetchUsers", status: "passed", duration: 0.3 },
            {
              name: "testTimeout",
              status: "failed",
              duration: 5.0,
              failureMessage: "Timed out waiting for response",
            },
          ],
        },
      ],
    },
  ]),
  stderr: "",
  code: 0,
};

export const TEST_TESTS_ALL_PASS = {
  stdout: JSON.stringify([
    {
      name: "MyAppTests",
      children: [
        {
          name: "MathTests",
          subtests: [
            { name: "testAddition", status: "passed", duration: 0.01 },
            { name: "testSubtraction", status: "passed", duration: 0.01 },
          ],
        },
      ],
    },
  ]),
  stderr: "",
  code: 0,
};

export const TEST_TESTS_EMPTY = {
  stdout: "[]",
  stderr: "",
  code: 0,
};

// ─── .ips crash report content ──────────────────────────────────────

export const CRASH_REPORT_IPS = JSON.stringify({
  procName: "MyApp",
  captureTime: "2025-01-15T10:30:00Z",
  exception: {
    type: "EXC_BAD_ACCESS",
    message: "Attempted to dereference null pointer",
  },
  faultingThread: 0,
  threads: [
    {
      frames: [
        {
          imageName: "MyApp",
          imageOffset: "0x1234",
          symbol: "-[ViewController viewDidLoad]",
        },
        {
          imageName: "UIKitCore",
          imageOffset: "0x5678",
          symbol: "-[UIViewController loadView]",
        },
        {
          imageName: "UIKitCore",
          imageOffset: "0x9abc",
          symbol: "-[UIApplication _run]",
        },
        { imageName: "libdyld.dylib", imageOffset: "0xdef0", symbol: "start" },
      ],
    },
    {
      frames: [
        {
          imageName: "libsystem_kernel.dylib",
          imageOffset: "0x1111",
          symbol: "__workq_kernreturn",
        },
      ],
    },
  ],
});

export const CRASH_REPORT_IPS_WITH_HEADER = `{"bug_type":"309","os_version":"iPhone OS 17.0"}
${JSON.stringify({
  procName: "CrashyApp",
  captureTime: "2025-01-14T08:00:00Z",
  termination: {
    signal: "SIGABRT",
    reason: "Assertion failed: index out of range",
  },
  faultingThread: 1,
  threads: [
    {
      frames: [{ imageName: "libsystem_pthread.dylib", imageOffset: "0xaaaa" }],
    },
    {
      frames: [
        {
          imageName: "CrashyApp",
          imageOffset: "0xbbbb",
          symbol: "specialized Array.subscript.getter",
        },
        {
          imageName: "CrashyApp",
          imageOffset: "0xcccc",
          symbol: "DataManager.processItems()",
        },
      ],
    },
  ],
})}`;

export const CRASH_REPORT_IPS_MINIMAL = JSON.stringify({
  procName: "SimpleApp",
  captureTime: "2025-01-13T12:00:00Z",
  faultingThread: 0,
  threads: [],
});
