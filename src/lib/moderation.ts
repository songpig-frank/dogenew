// Simple profanity filter - extend this list as needed
const profanityList = [
  "badword1",
  "badword2",
  // Add more words
];

// Check if text contains profanity
export const containsProfanity = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return profanityList.some(
    (word) =>
      lowerText.includes(word) ||
      // Check for common letter substitutions
      lowerText.replace(/[\d@$!%*#?&]/g, "").includes(word),
  );
};

// Clean text by replacing profanity with asterisks
export const cleanText = (text: string): string => {
  let cleanedText = text;
  profanityList.forEach((word) => {
    const regex = new RegExp(word, "gi");
    cleanedText = cleanedText.replace(regex, "*".repeat(word.length));
  });
  return cleanedText;
};

// Moderate comment before saving
export const moderateComment = async (content: string) => {
  // Check for profanity
  if (containsProfanity(content)) {
    throw new Error("Comment contains inappropriate language");
  }

  // Add more moderation rules here
  if (content.length > 1000) {
    throw new Error("Comment is too long");
  }

  // Clean the text as a precaution
  return cleanText(content);
};
