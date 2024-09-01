// Function to tokenize reason text
function tokenizeReason(reason) {
  const stopWords = new Set([
    "the",
    "and",
    "is",
    "to",
    "in",
    "of",
    "that",
    "it",
    "on",
    "for",
    "with",
    "as",
    "by",
    "this",
    "at",
    "but",
    "from",
    "they",
    "an",
    "which",
    "or",
    "we",
    "be",
    "was",
    "not",
    "are",
    "have",
    "had",
    "a",
    "if",
  ]);

  // Convert the reason to lowercase and split on non-word characters
  const words = reason.toLowerCase().split(/\W+/);

  // Use a Set to collect unique words that are not stop words and have length > 2
  const uniqueWords = new Set(
    words.filter((word) => word.length > 2 && !stopWords.has(word))
  );

  // Convert the Set back to an array and join with commas
  return Array.from(uniqueWords).join(", ");
}

module.exports = { tokenizeReason };
