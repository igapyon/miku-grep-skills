import fs from "node:fs";
import path from "node:path";

export function formatSearchResultSummary(result, {
  cwd,
  includeRoot = true,
  maxFiles = 5,
  maxSnippetsPerFile = 2
} = {}) {
  if (!result || typeof result !== "object") {
    throw new Error("result object is required");
  }

  const lines = [];
  const summary = result.summary ?? {};

  if (result.ok === false) {
    const error = result.error ?? {};
    lines.push(`miku-grep failed: ${error.code ?? "unknown_error"}`);
    if (error.message) {
      lines.push(error.message);
    }
    appendDiagnostics(lines, result.diagnostics);
    return lines.join("\n");
  }

  lines.push(
    [
      "miku-grep result:",
      `${summary.filesMatched ?? 0} files matched`,
      `${summary.matches ?? 0} matches`,
      `${summary.filesVisited ?? 0} files visited`
    ].join(" ")
  );

  if (includeRoot) {
    appendRootResolution(lines, result, { cwd });
  }

  if (summary.truncated) {
    lines.push(`Warning: result truncated${summary.truncatedReason ? ` (${summary.truncatedReason})` : ""}.`);
  }

  const matches = Array.isArray(result.matches) ? result.matches : [];
  for (const match of matches.slice(0, maxFiles)) {
    lines.push(formatMatch(match, { maxSnippetsPerFile }));
  }

  if (matches.length > maxFiles) {
    lines.push(`... ${matches.length - maxFiles} more matched files omitted from summary.`);
  }

  appendDiagnostics(lines, result.diagnostics);
  return lines.join("\n");
}

function formatMatch(match, { maxSnippetsPerFile }) {
  if (match?.type === "filepath") {
    return `- ${match.file} (filepath match)`;
  }

  if (match?.type === "directory") {
    return `- ${match.path ?? "(unknown directory)"} (directory match)`;
  }

  if (match?.type === "content") {
    const location = match.line ? `:${match.line}` : "";
    return `- ${match.file}${location}: ${trimSnippet(match.text)}`;
  }

  const parts = [`- ${match?.file ?? "(unknown file)"}`];
  if (Array.isArray(match?.lines) && match.lines.length > 0) {
    parts.push(`lines ${match.lines.slice(0, 5).join(", ")}`);
  }
  if (typeof match?.matchCount === "number") {
    parts.push(`${match.matchCount} matches`);
  }

  const snippets = Array.isArray(match?.snippets) ? match.snippets : [];
  const snippetText = snippets
    .slice(0, maxSnippetsPerFile)
    .map((snippet) => {
      const line = snippet.line ? `:${snippet.line}` : "";
      return `    ${match.file}${line}: ${trimSnippet(snippet.text)}`;
    });

  return [parts.join(" - "), ...snippetText].join("\n");
}

function trimSnippet(text) {
  const value = typeof text === "string" ? text.trim() : "";
  if (value.length <= 160) {
    return value;
  }
  return `${value.slice(0, 157)}...`;
}

function appendDiagnostics(lines, diagnostics) {
  if (!Array.isArray(diagnostics) || diagnostics.length === 0) {
    return;
  }

  const warnings = diagnostics.filter((diagnostic) => diagnostic?.severity !== "error");
  const errors = diagnostics.filter((diagnostic) => diagnostic?.severity === "error");
  if (errors.length > 0) {
    lines.push(`Errors: ${errors.length}`);
  }
  if (warnings.length > 0) {
    lines.push(`Warnings: ${warnings.length}`);
  }

  for (const diagnostic of diagnostics.slice(0, 5)) {
    const severity = diagnostic?.severity ?? "info";
    const code = diagnostic?.code ?? "diagnostic";
    const message = diagnostic?.message ? `: ${diagnostic.message}` : "";
    lines.push(`- ${severity} ${code}${message}`);
  }

  if (diagnostics.length > 5) {
    lines.push(`... ${diagnostics.length - 5} more diagnostics omitted from summary.`);
  }
}

function appendRootResolution(lines, result, { cwd }) {
  const root = result?.effectiveRequest?.root;
  if (typeof root !== "string" || root.length === 0) {
    return;
  }

  if (!path.isAbsolute(root) && !cwd) {
    return;
  }

  const resolvedRoot = path.resolve(cwd ?? process.cwd(), root);
  const realRoot = safeRealpath(resolvedRoot);
  if (!realRoot || realRoot === resolvedRoot) {
    lines.push(`Root: ${root}`);
    return;
  }

  lines.push(`Root: ${root} (real path: ${realRoot})`);
}

function safeRealpath(value) {
  try {
    return fs.realpathSync(value);
  } catch {
    return null;
  }
}
