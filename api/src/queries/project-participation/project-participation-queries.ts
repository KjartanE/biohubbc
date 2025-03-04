import SQL, { SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/permit/permit-create-queries');

/**
 * SQL query to add a single project role to a user.
 *
 * @param {number} projectId
 * @param {number} systemUserId
 * @param {string} projectParticipantRole
 * @return {*}  {(SQLStatement | null)}
 */
export const getProjectParticipationBySystemUserSQL = (
  projectId: number,
  systemUserId: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'getProjectParticipationBySystemUserSQL',
    message: 'params',
    projectId,
    systemUserId
  });

  if (!projectId || !systemUserId) {
    return null;
  }

  const sqlStatement = SQL`
  SELECT
    pp.project_id,
    pp.system_user_id,
    su.record_end_date,
    array_remove(array_agg(pr.project_role_id), NULL) AS project_role_ids,
    array_remove(array_agg(pr.name), NULL) AS project_role_names
  FROM
    project_participation pp
  LEFT JOIN
    project_role pr
  ON
    pp.project_role_id = pr.project_role_id
  LEFT JOIN
    system_user su
  ON
    pp.system_user_id = su.system_user_id
  WHERE
    pp.project_id = ${projectId}
  AND
    pp.system_user_id = ${systemUserId}
  AND
    su.record_end_date is NULL
  GROUP BY
    pp.project_id,
    pp.system_user_id,
    su.record_end_date ;
  `;

  defaultLog.info({
    label: 'getProjectParticipationBySystemUserSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get all project participants.
 *
 * @param {projectId} projectId
 * @returns {SQLStatement} sql query object
 */
export const getAllProjectParticipants = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getAllProjectParticipants',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      pp.project_participation_id,
      pp.project_id,
      pp.system_user_id,
      pp.project_role_id,
      su.user_identifier,
      su.user_identity_source_id
    FROM
      project_participation pp
    LEFT JOIN
      system_user su
    ON
      pp.system_user_id = su.system_user_id
    WHERE
      pp.project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getAllProjectParticipants',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to add a single project role to a user.
 *
 * @param {number} projectId
 * @param {number} systemUserId
 * @param {string} projectParticipantRole
 * @return {*}  {(SQLStatement | null)}
 */
export const addProjectRoleByRoleNameSQL = (
  projectId: number,
  systemUserId: number,
  projectParticipantRole: string
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectRoleSQL',
    message: 'params',
    projectId,
    systemUserId,
    projectParticipantRole
  });

  if (!projectId || !systemUserId || !projectParticipantRole) {
    return null;
  }

  const sqlStatement = SQL`
    INSERT INTO project_participation (
      project_id,
      system_user_id,
      project_role_id
    )
    (
      SELECT
        ${projectId},
        ${systemUserId},
        project_role_id
      FROM
        project_role
      WHERE
        name = ${projectParticipantRole}
    )
    RETURNING
      *;
  `;

  defaultLog.info({
    label: 'postProjectRoleSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to add a single project role to a user.
 *
 * @param {number} projectId
 * @param {number} systemUserId
 * @param {string} projectParticipantRole
 * @return {*}  {(SQLStatement | null)}
 */
export const addProjectRoleByRoleIdSQL = (
  projectId: number,
  systemUserId: number,
  projectParticipantRoleId: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'addProjectRoleByRoleIdSQL',
    message: 'params',
    projectId,
    systemUserId,
    projectParticipantRoleId
  });

  if (!projectId || !systemUserId || !projectParticipantRoleId) {
    return null;
  }

  const sqlStatement = SQL`
    INSERT INTO project_participation (
      project_id,
      system_user_id,
      project_role_id
    ) VALUES (
      ${projectId},
      ${systemUserId},
      ${projectParticipantRoleId}
    )
    RETURNING
      *;
  `;

  defaultLog.info({
    label: 'addProjectRoleByRoleIdSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete a single project participation record.
 *
 * @param {number} projectParticipationId
 * @return {*}  {(SQLStatement | null)}
 */
export const deleteProjectParticipationSQL = (projectParticipationId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteProjectParticipantSQL',
    message: 'params',
    projectParticipationId
  });

  if (!projectParticipationId) {
    return null;
  }

  const sqlStatement = SQL`
    DELETE FROM
      project_participation
    WHERE
      project_participation_id = ${projectParticipationId}
    RETURNING
      *;
  `;

  defaultLog.info({
    label: 'deleteProjectParticipantSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
