export const levenshteinDistance = (str1: string, str2: string): number => {
  const rows = str2.length + 1;
  const cols = str1.length + 1;
  
  const dp: number[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(0));

  for (let i = 0; i < cols; i++) {
    dp[0][i] = i;
  }

  for (let j = 0; j < rows; j++) {
    dp[j][0] = j;
  }

  for (let j = 1; j < rows; j++) {
    for (let i = 1; i < cols; i++) {
      const char1 = str1[i - 1];
      const char2 = str2[j - 1];

      if (char1 === char2) {
        dp[j][i] = dp[j - 1][i - 1];
      } else {
        dp[j][i] = Math.min(
          dp[j][i - 1] + 1,     
          dp[j - 1][i] + 1,     
          dp[j - 1][i - 1] + 1  
        );
      }
    }
  }

  return dp[str2.length][str1.length];
};

export const calculateAccuracy = (spoken: string, expected: string): number => {
  const normalize = (text: string): string => 
    text.toLowerCase().trim().replace(/[.,!?;:]+$/g, "").replace(/[^\p{L}]+/gu, ""); ;

  const spokenNorm = normalize(spoken);
  const expectedNorm = normalize(expected);

  if (spokenNorm === expectedNorm) {
    return 100;
  }

  if (!spokenNorm || !expectedNorm) {
    return 0;
  }

  const distance = levenshteinDistance(spokenNorm, expectedNorm);
  const maxLength = Math.max(spokenNorm.length, expectedNorm.length);
  const accuracy = Math.round(
    ((maxLength - distance) / maxLength) * 100
  );

  return Math.max(0, accuracy);
};