export default function dashCase(value: string) {
  return (
    value
      .normalize('NFD')
      // Insert dashes before any uppercase letters that follow a lowercase letter or a number
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      // Convert spaces, underscores, and multiple dashes to a single dash
      .replace(/[\s_]+|[-]+/g, '-')
      // Convert to lowercase
      .toLowerCase()
      // Remove any non-alphanumeric characters except for dashes
      .replace(/[^a-z0-9-]/gi, '')
      // Ensure it doesn't start or end with a dash
      .replace(/^-|-$/g, '')
  );
}
