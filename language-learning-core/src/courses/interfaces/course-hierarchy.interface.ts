/**
 * Response interface for course hierarchy with nested units and levels.
 * Matches the JSON structure returned by getCourseHierarchy raw SQL query.
 */
export interface CourseHierarchyResponse {
  /** Course ID */
  id: bigint;

  /** Course title */
  title: string;

  /** Course description */
  description: string | null;

  /** Nested curriculum structure (units with levels) */
  curriculum: Array<{
    /** Unit ID */
    id: bigint;

    /** Unit title */
    title: string;

    /** Order within the course */
    order_index: number;

    /** Color theme hex code */
    color_theme: string | null;

    /** Nested levels */
    levels: Array<{
      /** Level ID */
      id: bigint;

      /** Order within the unit */
      order_index: number;

      /** Total lessons in this level */
      total_lessons: number;
    }>;
  }>;
}
