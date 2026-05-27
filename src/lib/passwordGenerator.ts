/**
 * Secure password generator for internal use.
 *
 * Generates a random password with:
 * - Length: 12-20 characters (randomized)
 * - Special characters: 2-4 (randomized count)
 * - Mix of uppercase, lowercase, numbers, and special chars
 */

export function generateSecurePassword(): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specialChars = "@#$%&*_+=!?";

  // Random password length between 12 and 20
  const passwordLength = 12 + Math.floor(Math.random() * 9);

  // Random number of special characters between 2 and 4
  const specialCharCount = 2 + Math.floor(Math.random() * 3);

  let password = "";

  // Ensure at least one of each required character type
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));

  // Add the random number of special characters
  for (let i = 0; i < specialCharCount; i++) {
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  }

  // Fill the rest with random characters from all sets
  const allChars = lowercase + uppercase + numbers + specialChars;
  const remainingLength = passwordLength - password.length;

  for (let i = 0; i < remainingLength; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password to avoid predictable patterns
  const passwordArray = password.split("");
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join("");
}
