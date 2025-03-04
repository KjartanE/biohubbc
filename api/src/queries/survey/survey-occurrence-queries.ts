import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';
import {
  AppendSQLColumn,
  appendSQLColumns,
  AppendSQLColumnsEqualValues,
  appendSQLColumnsEqualValues,
  AppendSQLValue,
  appendSQLValues
} from '../../utils/sql-utils';

const defaultLog = getLogger('queries/survey/survey-occurrence-queries');

/**
 * SQL query to insert a survey occurrence submission row.
 *
 * @param {number} surveyId
 * @param {string} source
 * @param {string} inputFileName
 * @param {(number | null)} templateMethodologyId
 * @return {*}  {(SQLStatement | null)}
 */
export const insertSurveyOccurrenceSubmissionSQL = (data: {
  surveyId: number;
  source: string;
  templateMethodologyId: number | null;
  inputFileName?: string;
  inputKey?: string;
  outputFileName?: string;
  outputKey?: string;
}): SQLStatement | null => {
  defaultLog.debug({
    label: 'insertSurveyOccurrenceSubmissionSQL',
    message: 'params',
    data
  });

  if (!data || !data.surveyId || !data.source) {
    return null;
  }

  const dataKeys = Object.keys(data);

  const columnItems: AppendSQLColumn[] = [];
  const valueItems: AppendSQLValue[] = [];

  if (dataKeys.includes('inputFileName')) {
    columnItems.push({ columnName: 'input_file_name' });
    valueItems.push({ columnValue: data.inputFileName });
  }

  if (dataKeys.includes('inputKey')) {
    columnItems.push({ columnName: 'input_key' });
    valueItems.push({ columnValue: data.inputKey });
  }

  if (dataKeys.includes('outputFileName')) {
    columnItems.push({ columnName: 'output_file_name' });
    valueItems.push({ columnValue: data.outputFileName });
  }

  if (dataKeys.includes('outputKey')) {
    columnItems.push({ columnName: 'output_key' });
    valueItems.push({ columnValue: data.outputKey });
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO occurrence_submission (
      survey_id,
      source,
      template_methodology_species_id,
      event_timestamp,
  `;

  appendSQLColumns(sqlStatement, columnItems);

  sqlStatement.append(SQL`
    ) VALUES (
      ${data.surveyId},
      ${data.source},
      ${data.templateMethodologyId},
      now(),
  `);

  appendSQLValues(sqlStatement, valueItems);

  sqlStatement.append(SQL`
    )
    RETURNING
      occurrence_submission_id as id;
  `);

  defaultLog.debug({
    label: 'insertSurveyOccurrenceSubmissionSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to update a survey occurrence submission row.
 *
 * @param {{
 *   submissionId: number;
 *   inputKey?: string;
 *   outputFileName?: string;
 *   outputKey?: string;
 * }} data
 * @return {*}  {(SQLStatement | null)}
 */
export const updateSurveyOccurrenceSubmissionSQL = (data: {
  submissionId: number;
  inputFileName?: string;
  inputKey?: string;
  outputFileName?: string;
  outputKey?: string;
}): SQLStatement | null => {
  defaultLog.debug({
    label: 'updateSurveyOccurrenceSubmissionSQL',
    message: 'params',
    data
  });

  if (!data.submissionId || (!data.inputFileName && !data.inputKey && !data.outputFileName && !data.outputKey)) {
    return null;
  }

  const dataKeys = Object.keys(data);

  const items: AppendSQLColumnsEqualValues[] = [];

  if (dataKeys.includes('inputFileName')) {
    items.push({ columnName: 'input_file_name', columnValue: data.inputFileName });
  }

  if (dataKeys.includes('inputKey')) {
    items.push({ columnName: 'input_key', columnValue: data.inputKey });
  }

  if (dataKeys.includes('outputFileName')) {
    items.push({ columnName: 'output_file_name', columnValue: data.outputFileName });
  }

  if (dataKeys.includes('outputKey')) {
    items.push({ columnName: 'output_key', columnValue: data.outputKey });
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE occurrence_submission
    SET
  `;

  appendSQLColumnsEqualValues(sqlStatement, items);

  sqlStatement.append(SQL`
    WHERE
      occurrence_submission_id = ${data.submissionId}
    RETURNING occurrence_submission_id as id;
  `);

  defaultLog.debug({
    label: 'updateSurveyOccurrenceSubmissionSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get latest occurrence submission for a survey.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getLatestSurveyOccurrenceSubmissionSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getLatestSurveyOccurrenceSubmissionSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      os.occurrence_submission_id as id,
      os.survey_id,
      os.source,
      os.delete_timestamp,
      os.event_timestamp,
      os.input_key,
      os.input_file_name,
      ss.submission_status_id,
      ss.submission_status_type_id,
      sst.name as submission_status_type_name,
      sm.submission_message_id,
      sm.submission_message_type_id,
      sm.message,
      smt.name as submission_message_type_name
    FROM
      occurrence_submission as os
    LEFT OUTER JOIN
      submission_status as ss
    ON
      os.occurrence_submission_id = ss.occurrence_submission_id
    LEFT OUTER JOIN
      submission_status_type as sst
    ON
      sst.submission_status_type_id = ss.submission_status_type_id
    LEFT OUTER JOIN
      submission_message as sm
    ON
      sm.submission_status_id = ss.submission_status_id
    LEFT OUTER JOIN
      submission_message_type as smt
    ON
      smt.submission_message_type_id = sm.submission_message_type_id
    WHERE
      os.survey_id = ${surveyId}
    ORDER BY
      os.event_timestamp DESC
    LIMIT 1
    ;
  `;

  defaultLog.debug({
    label: 'getLatestSurveyOccurrenceSubmission',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete occurrence records by occurrence submission id.
 *
 * @param {number} occurrenceSubmissionId
 * @return {*}  {(SQLStatement | null)}
 */
export const deleteSurveyOccurrencesSQL = (occurrenceSubmissionId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteSurveyOccurrencesSQL',
    message: 'params',
    occurrenceSubmissionId
  });

  if (!occurrenceSubmissionId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE FROM
      occurrence
    WHERE
      occurrence_submission_id = ${occurrenceSubmissionId};
  `;

  defaultLog.debug({
    label: 'deleteSurveyOccurrencesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get the record for a single occurrence submission.
 *
 * @param {number} submissionId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyOccurrenceSubmissionSQL = (occurrenceSubmissionId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getSurveyOccurrenceSubmissionSQL', message: 'params', occurrenceSubmissionId });

  if (!occurrenceSubmissionId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      *
    FROM
      occurrence_submission
    WHERE
      occurrence_submission_id = ${occurrenceSubmissionId};
  `;

  defaultLog.debug({
    label: 'getSurveyOccurrenceSubmissionSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to soft delete the occurrence submission entry by ID
 *
 * @param {number} occurrenceSubmissionId
 * @returns {SQLStatement} sql query object
 */
export const deleteOccurrenceSubmissionSQL = (occurrenceSubmissionId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteOccurrenceSubmissionSQL',
    message: 'params',
    occurrenceSubmissionId
  });

  if (!occurrenceSubmissionId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE occurrence_submission
    SET delete_timestamp = now()
    WHERE occurrence_submission_id = ${occurrenceSubmissionId};
  `;

  defaultLog.debug({
    label: 'deleteOccurrenceSubmissionSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert the occurrence submission status.
 *
 * @param {number} occurrenceSubmissionId
 * @param {string} submissionStatusType
 * @returns {SQLStatement} sql query object
 */
export const insertOccurrenceSubmissionStatusSQL = (
  occurrenceSubmissionId: number,
  submissionStatusType: string
): SQLStatement | null => {
  defaultLog.debug({
    label: 'insertSurveySubmissionStatusSQL',
    message: 'params',
    occurrenceSubmissionId,
    submissionStatusType
  });

  if (!occurrenceSubmissionId || !submissionStatusType) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO submission_status (
      occurrence_submission_id,
      submission_status_type_id,
      event_timestamp
    ) VALUES (
      ${occurrenceSubmissionId},
      (
        SELECT
          submission_status_type_id
        FROM
          submission_status_type
        WHERE
          name = ${submissionStatusType}
      ),
      now()
    )
    RETURNING
      submission_status_id as id;
  `;

  defaultLog.debug({
    label: 'insertSurveySubmissionStatusSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert the occurrence submission message.
 *
 * @param {number} occurrenceSubmissionId
 * @param {string} submissionStatusType
 * @param {string} submissionMessage
 * @returns {SQLStatement} sql query object
 */
export const insertOccurrenceSubmissionMessageSQL = (
  submissionStatusId: number,
  submissionMessageType: string,
  submissionMessage: string,
  errorCode: string
): SQLStatement | null => {
  defaultLog.debug({
    label: 'insertOccurrenceSubmissionMessageSQL',
    message: 'params',
    submissionStatusId,
    submissionMessageType,
    submissionMessage,
    errorCode
  });

  if (!submissionStatusId || !submissionMessageType || !submissionMessage || !errorCode) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO submission_message (
      submission_status_id,
      submission_message_type_id,
      event_timestamp,
      message
    ) VALUES (
      ${submissionStatusId},
      (
        SELECT
          submission_message_type_id
        FROM
          submission_message_type
        WHERE
          name = ${errorCode}
      ),
      now(),
      ${submissionMessage}
    )
    RETURNING
      submission_message_id;
  `;

  defaultLog.debug({
    label: 'insertSurveySubmissionMessageSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get the list of messages for an occurrence submission.
 *
 * @param {number} occurrenceSubmissionId
 * @returns {SQLStatement} sql query object
 */
export const getOccurrenceSubmissionMessagesSQL = (occurrenceSubmissionId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getOccurrenceSubmissionMessagesSQL',
    message: 'params',
    occurrenceSubmissionId
  });

  if (!occurrenceSubmissionId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      sm.submission_message_id as id,
      smt.name as type,
      sst.name as status,
      smc.name as class,
      sm.message
    FROM
      occurrence_submission as os
    LEFT OUTER JOIN
      submission_status as ss
    ON
      os.occurrence_submission_id = ss.occurrence_submission_id
    LEFT OUTER JOIN
      submission_status_type as sst
    ON
      sst.submission_status_type_id = ss.submission_status_type_id
    LEFT OUTER JOIN
      submission_message as sm
    ON
      sm.submission_status_id = ss.submission_status_id
    LEFT OUTER JOIN
      submission_message_type as smt
    ON
      smt.submission_message_type_id = sm.submission_message_type_id
    LEFT OUTER JOIN
      submission_message_class smc
    ON
      smc.submission_message_class_id = smt.submission_message_class_id
    WHERE
      os.occurrence_submission_id = ${occurrenceSubmissionId}
    ORDER BY sm.submission_message_id;
  `;

  defaultLog.debug({
    label: 'getOccurrenceSubmissionMessagesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get a template_methodology_species record for a submission based on the occurrence_submission_id.
 *
 * @param {number} occurrenceId
 * @returns {SQLStatement} sql query object
 */
export const getTemplateMethodologySpeciesSQL = (occurrenceId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getTemplateMethodologySpeciesSQL',
    message: 'params',
    occurrenceId
  });

  if (!occurrenceId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      tms.*
    FROM
      occurrence_submission os
    LEFT OUTER JOIN
      template_methodology_species tms on os.template_methodology_species_id = tms.template_methodology_species_id
    LEFT OUTER JOIN
      template t on tms.template_id = t.template_id
    WHERE
      os.occurrence_submission_id = ${occurrenceId};
  `;

  defaultLog.debug({
    label: 'getTemplateMethodologySpeciesSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get a template methodology species id.
 *
 * @param {number} surveyId
 * @param {string} source
 * @param {string} inputKey
 * @return {*}  {(SQLStatement | null)}
 */
export const getTemplateMethodologySpeciesIdSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getTemplateMethodologySpeciesIdSQLStatement',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      tms.template_methodology_species_id
    FROM
      template_methodology_species tms
    LEFT OUTER JOIN
      template t on tms.template_id = t.template_id
    LEFT OUTER JOIN
      common_survey_methodology csm  on tms.common_survey_methodology_id = csm.common_survey_methodology_id
    LEFT OUTER JOIN
      survey s on csm.common_survey_methodology_id = s.common_survey_methodology_id
    WHERE
      s.survey_id = ${surveyId};
    `;

  defaultLog.debug({
    label: 'getTemplateMethodologySpeciesIdSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
