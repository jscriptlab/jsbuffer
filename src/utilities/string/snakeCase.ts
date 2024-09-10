export default function snakeCase(inputString: string): string {
  // Remove leading and trailing whitespace
  inputString = inputString.trim();

  // Replace all non-alphanumeric characters with a space
  inputString = inputString.replace(/[^a-zA-Z0-9]/g, ' ');

  // Convert camel case to snake case by inserting underscores before uppercase letters
  inputString = inputString.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Convert the string to lowercase and replace spaces with underscores
  const snakeCaseString = inputString.toLowerCase().replace(/\s+/g, '_');

  return snakeCaseString;
}
