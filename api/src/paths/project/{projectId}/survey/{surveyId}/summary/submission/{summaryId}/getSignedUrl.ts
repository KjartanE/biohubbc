'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { HTTP400 } from '../../../../../../../../errors/CustomError';
import { getLogger } from '../../../../../../../../utils/logger';
import { getDBConnection } from '../../../../../../../../database/db';
import { getS3SignedURL } from '../../../../../../../../utils/file-utils';
import { attachmentApiDocObject } from '../../../../../../../../utils/shared-api-docs';
import { getSurveySummarySubmissionSQL } from '../../../../../../../../queries/survey/survey-summary-queries';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/summary/submission/{summaryId}/getSignedUrl');

export const GET: Operation = [getSingleSummarySubmissionURL()];

GET.apiDoc = {
  ...attachmentApiDocObject(
    'Retrieves the signed url of summary submission in a survey by its summary id.',
    'GET response containing the signed url of a summary submission.'
  ),
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'number'
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number'
      },
      required: true
    },
    {
      in: 'path',
      name: 'summaryId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ]
};

export function getSingleSummarySubmissionURL(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get single summary submission url', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.summaryId) {
      throw new HTTP400('Missing required path param `summaryId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getSurveySummarySubmissionSQLStatement = getSurveySummarySubmissionSQL(Number(req.params.summaryId));

      if (!getSurveySummarySubmissionSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const result = await connection.query(
        getSurveySummarySubmissionSQLStatement.text,
        getSurveySummarySubmissionSQLStatement.values
      );

      await connection.commit();

      const s3Key = result && result.rows.length && result.rows[0].key;
      const s3SignedUrl = await getS3SignedURL(s3Key);

      if (!s3SignedUrl) {
        return res.status(200).json(null);
      }

      return res.status(200).json(s3SignedUrl);
    } catch (error) {
      defaultLog.error({ label: 'getSingleSummarySubmissionURL', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
