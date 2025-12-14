function toCamelCase(str) {
  return str
    .replace(/[\n?]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, i) =>
      i === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, "");
}

module.exports = function parseFormData(formData) {
  const parsed = {};
  for (const key in formData) {
    parsed[toCamelCase(key)] = formData[key];
  }
  return parsed;
};
