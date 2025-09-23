/**
 * Format Firebase timestamp to human-readable format
 * @param {Object} timestamp - Firebase timestamp object
 * @returns {string} Formatted timestamp as "Month Date, Year Hours:Minutes AM/PM"
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) {
    return '—';
  }
  
  // Convert Firebase timestamp to JavaScript Date
  let date;
  if (timestamp.toDate) {
    // Firebase Timestamp object
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    // Timestamp object with seconds and nanoseconds
    date = new Date(timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000));
  } else {
    // Already a Date object or timestamp number
    date = new Date(timestamp);
  }
  
  // Format as "Month Date, Year Hours:Minutes AM/PM"
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  
  return date.toLocaleDateString('en-US', options);
}
