// utils/sanitize.js

/**
 * sanitize(obj, fieldsToRemove)
 *
 * @param {Object} obj - آبجکتی که میخوای sanitize کنی
 * @param {Array<string>} fieldsToRemove - فیلدهای حساس که نباید برگرده
 * @returns {Object} آبجکت بدون فیلدهای حساس
 */
function sanitize(obj, fieldsToRemove = []) {
  if (!obj) return null;

  // کلیدهای آبجکت رو فیلتر می‌کنیم
  const sanitized = Object.keys(obj)
    .filter((key) => !fieldsToRemove.includes(key))
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});

  return sanitized;
}

module.exports = sanitize;
