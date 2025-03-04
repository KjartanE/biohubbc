/**
 * System level roles.
 *
 * @export
 * @enum {number}
 */
export enum SYSTEM_ROLE {
  SYSTEM_ADMIN = 'System Administrator',
  PROJECT_ADMIN = 'Project Administrator'
}

/**
 * Project level roles.
 *
 * @export
 * @enum {number}
 */
export enum PROJECT_ROLE {
  PROJECT_LEAD = 'Project Lead',
  PROJECT_TEAM_MEMBER = 'Project Team Member',
  PROJECT_REVIEWER = 'Project Reviewer'
}

/**
 * Used when adding/updating an object in S3 storage to mark the object as requiring authentication.
 *
 * Note: All objects in S3 should be marked as requiring authentication, as all access to the objects should be
 * governed/proxied by the BioHub API.
 *
 * @export
 * @enum {number}
 */
export enum S3_ROLE {
  AUTH_READ = 'authenticated-read'
}
