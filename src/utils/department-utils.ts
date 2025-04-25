/**
 * Department utilities for managing department emails and related functionality
 */

// Map department names to their official email addresses
export const DEPARTMENT_EMAILS: Record<string, string> = {
  // Traffic and transportation departments
  "traffic": "traffic.department@punecorp.gov.in",
  "traffic department": "traffic.department@punecorp.gov.in",
  "transportation": "traffic.department@punecorp.gov.in",
  
  // Construction and development departments
  "construction": "construction.control@punecorp.gov.in",
  "construction department": "construction.control@punecorp.gov.in",
  "building": "construction.control@punecorp.gov.in",
  "development": "construction.control@punecorp.gov.in",
  
  // Industrial departments
  "industrial": "industrial.compliance@punecorp.gov.in",
  "industrial department": "industrial.compliance@punecorp.gov.in",
  "factory": "industrial.compliance@punecorp.gov.in",
  "manufacturing": "industrial.compliance@punecorp.gov.in",
  
  // Event and entertainment departments
  "events": "entertainment.permits@punecorp.gov.in",
  "entertainment": "entertainment.permits@punecorp.gov.in",
  "music": "entertainment.permits@punecorp.gov.in",
  "festivals": "entertainment.permits@punecorp.gov.in",
  
  // Environment department (catch-all for other noise types)
  "environment": "environment.noise@punecorp.gov.in",
  "environment department": "environment.noise@punecorp.gov.in",
  "pollution control": "environment.noise@punecorp.gov.in",
  
  // Police department
  "police": "police.noise@punecorp.gov.in",
  "law enforcement": "police.noise@punecorp.gov.in",
  
  // Health department
  "health": "public.health@punecorp.gov.in",
  "health department": "public.health@punecorp.gov.in",
};

/**
 * Gets the official email address for a department
 * @param department Department name (case-insensitive)
 * @returns The email address or undefined if not found
 */
export function getDepartmentEmail(department: string): string {
  // Normalize department name to lowercase for case-insensitive matching
  const normalizedDept = department.toLowerCase();
  
  // Check for exact match
  if (DEPARTMENT_EMAILS[normalizedDept]) {
    return DEPARTMENT_EMAILS[normalizedDept];
  }
  
  // Check for partial matches
  for (const [key, email] of Object.entries(DEPARTMENT_EMAILS)) {
    if (normalizedDept.includes(key) || key.includes(normalizedDept)) {
      return email;
    }
  }
  
  // Default to environment department if no match found
  return DEPARTMENT_EMAILS["environment"];
}

/**
 * Gets a list of all department names (full formal names)
 * @returns Array of department names
 */
export function getAllDepartments(): string[] {
  return [
    "Traffic Department",
    "Construction Department",
    "Industrial Department",
    "Entertainment Department",
    "Environment Department",
    "Police Department",
    "Health Department"
  ];
} 