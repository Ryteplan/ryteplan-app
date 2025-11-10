/**
 * Composable for formatting and processing stat values
 */
export function useValueFormatter() {
  /**
   * Process a value based on its type for display
   * @param {*} value - The value to process
   * @param {string} valueType - The type of value (string, percentage, etc.)
   * @returns {object} - Formatted value and whether to show percentage symbol
   */
  const processValue = (value, valueType) => {
    const numberValue = Number(value);
    const isEmptyValue = numberValue === -1 || 
                         numberValue === 0 || 
                         value === null || 
                         value === undefined || 
                         value === '-';

    if (isEmptyValue) {
      return { formatted: '—', showPercentage: false };
    }

    const formatters = {
      string: () => ({ formatted: value || '—', showPercentage: false }),
      numberNoComma: () => ({ formatted: value || '—', showPercentage: false }),
      date: () => ({ formatted: value || '—', showPercentage: false }),
      percentage: () => ({
        formatted: Math.round(numberValue * 100)?.toLocaleString() || '—',
        showPercentage: true
      }),
      percentageWholeNumbers: () => ({
        formatted: Math.round(numberValue)?.toLocaleString() || '—',
        showPercentage: true
      }),
      default: () => ({
        formatted: numberValue?.toLocaleString() || '—',
        showPercentage: false
      })
    };

    const formatter = formatters[valueType] || formatters.default;
    return formatter();
  };

  /**
   * Normalize a value for comparison
   * @param {*} value - Value to normalize
   * @returns {string} - Normalized string value
   */
  const normalizeValue = (value) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    if (typeof value === 'number') {
      return value.toString().trim();
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value)
        .map(normalizeValue)
        .join('')
        .trim();
    }
    return '';
  };

  return {
    processValue,
    normalizeValue
  };
}
