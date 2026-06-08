import fs from "node:fs";
import path from "node:path";

const CONFIG_RELATIVE_PATH = path.join(".mikusoft", "miku-grep.json");
const CONFIG_VERSION = 1;
const MERGEABLE_TOP_LEVEL_FIELDS = new Set([
  "search",
  "output",
  "encoding",
  "ignore"
]);
const ALLOWED_TOP_LEVEL_FIELDS = new Set([
  "version",
  ...MERGEABLE_TOP_LEVEL_FIELDS
]);

export function loadMikuGrepRepoConfig({
  root = ".",
  cwd = process.cwd(),
  configPath
} = {}) {
  const resolvedRoot = path.resolve(cwd, root);
  const resolvedConfigPath = configPath
    ? path.resolve(cwd, configPath)
    : path.join(resolvedRoot, CONFIG_RELATIVE_PATH);

  if (!fs.existsSync(resolvedConfigPath)) {
    return {
      found: false,
      path: resolvedConfigPath,
      config: null
    };
  }

  const text = fs.readFileSync(resolvedConfigPath, "utf8");
  let config;
  try {
    config = JSON.parse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`failed to parse ${CONFIG_RELATIVE_PATH}: ${message}`);
  }

  validateMikuGrepRepoConfig(config);

  return {
    found: true,
    path: resolvedConfigPath,
    config
  };
}

export function applyMikuGrepRepoConfig(request, {
  cwd = process.cwd(),
  configPath
} = {}) {
  if (!isPlainObject(request)) {
    throw new Error("miku-grep request must be an object before applying repo config");
  }

  const loaded = loadMikuGrepRepoConfig({
    root: request.root ?? ".",
    cwd,
    configPath
  });

  if (!loaded.found) {
    return {
      request,
      configPath: loaded.path,
      applied: false,
      appliedFields: []
    };
  }

  const effectiveRequest = { ...request };
  const appliedFields = [];

  for (const field of MERGEABLE_TOP_LEVEL_FIELDS) {
    if (Object.hasOwn(loaded.config, field) && !Object.hasOwn(request, field)) {
      effectiveRequest[field] = loaded.config[field];
      appliedFields.push(field);
      continue;
    }

    if (
      Object.hasOwn(loaded.config, field) &&
      Object.hasOwn(request, field) &&
      isPlainObject(request[field])
    ) {
      effectiveRequest[field] = {
        ...loaded.config[field],
        ...request[field]
      };
      appliedFields.push(field);
    }
  }

  return {
    request: effectiveRequest,
    configPath: loaded.path,
    applied: appliedFields.length > 0,
    appliedFields
  };
}

function validateMikuGrepRepoConfig(config) {
  if (!isPlainObject(config)) {
    throw new Error(`${CONFIG_RELATIVE_PATH} must contain a JSON object`);
  }

  if (config.version !== CONFIG_VERSION) {
    throw new Error(`${CONFIG_RELATIVE_PATH} must use version ${CONFIG_VERSION}`);
  }

  for (const field of Object.keys(config)) {
    if (!ALLOWED_TOP_LEVEL_FIELDS.has(field)) {
      throw new Error(`${CONFIG_RELATIVE_PATH} contains unsupported field: ${field}`);
    }
  }

  for (const field of MERGEABLE_TOP_LEVEL_FIELDS) {
    if (Object.hasOwn(config, field) && !isPlainObject(config[field])) {
      throw new Error(`${CONFIG_RELATIVE_PATH}.${field} must be an object`);
    }
  }
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
