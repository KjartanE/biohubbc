import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-view-queries');

/**
 * SQL query to get all permits applicable for a survey
 *
 * These are permits that are associated to a project but have not been used by any
 * other surveys under that project
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getAllAssignablePermitsForASurveySQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getAllAssignablePermitsForASurveySQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      number,
      type
    FROM
      permit
    WHERE
      project_id = ${projectId}
    AND
      survey_id IS NULL;
  `;

  defaultLog.debug({
    label: 'getAllAssignablePermitsForASurveySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get all survey ids for a given project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyIdsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyIdsSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      survey_id as id
    FROM
      survey
    WHERE
      project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getSurveyIdsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get all surveys for list view.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyListSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyListSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      s.survey_id as id,
      s.name,
      s.start_date,
      s.end_date,
      s.publish_timestamp,
      CONCAT_WS(' - ', wtu.english_name, CONCAT_WS(' ', wtu.unit_name1, wtu.unit_name2, wtu.unit_name3)) as species
    FROM
      wldtaxonomic_units as wtu
    LEFT OUTER JOIN
      study_species as ss
    ON
      ss.wldtaxonomic_units_id = wtu.wldtaxonomic_units_id
    LEFT OUTER JOIN
      survey as s
    ON
      s.survey_id = ss.survey_id
    WHERE
      s.project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getSurveyListSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to retrieve a survey row for viewing purposes.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyForViewSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyForViewSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      s.survey_id as id,
      s.name,
      s.objectives,
      s.start_date,
      s.end_date,
      s.lead_first_name,
      s.lead_last_name,
      s.location_name,
      s.geojson as geometry,
      per.number,
      per.type,
      csm.name as common_survey_methodology,
      sfs.project_funding_source_id as pfs_id,
      pfs.funding_amount::numeric::int,
      pfs.funding_start_date,
      pfs.funding_end_date,
      fs.name as agency_name,
      s.revision_count,
      s.publish_timestamp as publish_date,
      os.occurrence_submission_id,
      sss.survey_summary_submission_id,
      CASE
        WHEN ss.is_focal = TRUE
        THEN CONCAT_WS(' - ', wtu.english_name, CONCAT_WS(' ', wtu.unit_name1, wtu.unit_name2, wtu.unit_name3))
      END as focal_species,
      CASE
        WHEN ss.is_focal = FALSE
        THEN CONCAT_WS(' - ', wtu.english_name, CONCAT_WS(' ', wtu.unit_name1, wtu.unit_name2, wtu.unit_name3))
      END as ancillary_species
    FROM
      wldtaxonomic_units as wtu
    LEFT OUTER JOIN
      study_species as ss
    ON
      ss.wldtaxonomic_units_id = wtu.wldtaxonomic_units_id
    LEFT OUTER JOIN
      survey as s
    ON
      s.survey_id = ss.survey_id
    LEFT OUTER JOIN
      permit as per
    ON
      per.survey_id = s.survey_id
    LEFT OUTER JOIN
      survey_funding_source as sfs
    ON
      sfs.survey_id = s.survey_id
    LEFT OUTER JOIN
      project_funding_source as pfs
    ON
      pfs.project_funding_source_id = sfs.project_funding_source_id
    LEFT OUTER JOIN
      investment_action_category as iac
    ON
      pfs.investment_action_category_id = iac.investment_action_category_id
    LEFT OUTER JOIN
      funding_source as fs
    ON
      iac.funding_source_id = fs.funding_source_id
    LEFT OUTER JOIN
      common_survey_methodology as csm
    ON
      csm.common_survey_methodology_id = s.common_survey_methodology_id
    LEFT OUTER JOIN
      occurrence_submission as os
    ON
      os.survey_id = s.survey_id
    LEFT OUTER JOIN
      survey_summary_submission sss
    ON
    	sss.survey_id = s.survey_id
    WHERE
      s.survey_id = ${surveyId}
    ORDER BY
      os.event_timestamp DESC
    LIMIT 1;
  `;

  defaultLog.debug({
    label: 'getSurveyForViewSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
