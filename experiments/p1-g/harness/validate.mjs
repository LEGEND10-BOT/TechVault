// Minimal JSON-Schema subset validator (no dependencies, per AGENTS.md section 6).
// Supports: type (incl. ["string","null"]), enum, required, properties, items,
// additionalProperties:false, minLength/maxLength, minimum/maximum, maxItems.
// Returns { ok: true } or { ok: false, errors: string[] }.

function typeOk(value, t) {
  if (Array.isArray(t)) return t.some((one) => typeOk(value, one));
  switch (t) {
    case "object": return typeof value === "object" && value !== null && !Array.isArray(value);
    case "array": return Array.isArray(value);
    case "string": return typeof value === "string";
    case "number": return typeof value === "number" && Number.isFinite(value);
    case "boolean": return typeof value === "boolean";
    case "null": return value === null;
    default: return false;
  }
}

export function validate(value, schema, path = "$") {
  const errors = [];
  walk(value, schema, path, errors);
  return { ok: errors.length === 0, errors };
}

function walk(value, schema, path, errors) {
  if (!schema || typeof schema !== "object") return;
  if ("type" in schema && !typeOk(value, schema.type)) {
    errors.push(`${path}: expected type ${JSON.stringify(schema.type)}, got ${value === null ? "null" : typeof value}${Array.isArray(value) ? "(array)" : ""}`);
    return;
  }
  if ("enum" in schema && !schema.enum.some((v) => JSON.stringify(v) === JSON.stringify(value))) {
    errors.push(`${path}: value ${JSON.stringify(value)} not in enum [${schema.enum.map((v) => JSON.stringify(v)).join(", ")}]`);
    return;
  }
  if (typeof value === "string") {
    if ("minLength" in schema && value.length < schema.minLength) errors.push(`${path}: string shorter than ${schema.minLength}`);
    if ("maxLength" in schema && value.length > schema.maxLength) errors.push(`${path}: string longer than ${schema.maxLength}`);
  }
  if (typeof value === "number") {
    if ("minimum" in schema && value < schema.minimum) errors.push(`${path}: number < ${schema.minimum}`);
    if ("maximum" in schema && value > schema.maximum) errors.push(`${path}: number > ${schema.maximum}`);
  }
  if (Array.isArray(value) && schema.items) {
    if ("maxItems" in schema && value.length > schema.maxItems) errors.push(`${path}: array longer than ${schema.maxItems}`);
    value.forEach((item, i) => walk(item, schema.items, `${path}[${i}]`, errors));
  }
  if (typeOk(value, "object") && schema.properties) {
    for (const req of schema.required || []) {
      if (!(req in value)) errors.push(`${path}: missing required property "${req}"`);
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in schema.properties)) errors.push(`${path}: unexpected property "${key}"`);
      }
    }
    for (const [key, sub] of Object.entries(schema.properties)) {
      if (key in value) walk(value[key], sub, `${path}.${key}`, errors);
    }
  }
}
