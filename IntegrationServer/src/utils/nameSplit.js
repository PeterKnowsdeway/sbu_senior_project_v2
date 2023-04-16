
/// /FUNCTIONS////
// Rudimentary splitter for names using spaces - missing case for more than 3 spaces.

async function nameSplit(name) {
  const nameParts = name.trim().split(/\s+/); // Split on one or more whitespace characters

  // Limit the name to at most three parts
  if (nameParts.length > 3) {
    nameParts.splice(3);
  }

  // If there is no middle name, shift the last name to the middle name position
  if (nameParts.length === 2) {
    nameParts.splice(1, 0, '');
  }

  return nameParts;
}

module.exports = nameSplit