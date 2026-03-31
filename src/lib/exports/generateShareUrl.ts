import { Curriculum } from "@/types/curriculum";

/**
 * Generates a shareable URL for a curriculum
 * Encodes the curriculum as base64 JSON in the query params
 */
export function generateShareableUrl(curriculum: Curriculum): string {
  try {
    // Stringify and encode the curriculum
    const jsonString = JSON.stringify(curriculum);
    const encoded = Buffer.from(jsonString).toString("base64");

    // Build the shareable URL
    if (typeof window !== "undefined") {
      return `${window.location.origin}/share?data=${encoded}`;
    } else {
      // Fallback for server-side calls
      return `/share?data=${encoded}`;
    }
  } catch (error) {
    console.error("Failed to generate shareable URL:", error);
    return "/share";
  }
}

/**
 * Decodes a curriculum from a base64-encoded query param
 */
export function decodeCurriculumFromUrl(encodedData: string): Curriculum | null {
  try {
    const jsonString = Buffer.from(encodedData, "base64").toString("utf-8");
    return JSON.parse(jsonString) as Curriculum;
  } catch (error) {
    console.error("Failed to decode curriculum:", error);
    return null;
  }
}
