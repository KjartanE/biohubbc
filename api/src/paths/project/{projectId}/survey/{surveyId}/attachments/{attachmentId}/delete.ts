'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { unsecureAttachmentRecordSQL } from '../../../../../../../queries/security/security-queries';
import { getDBConnection, IDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/CustomError';
import {
  deleteSurveyAttachmentSQL,
  deleteSurveyReportAttachmentSQL
} from '../../../../../../../queries/survey/survey-attachments-queries';
import { deleteFileFromS3 } from '../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../utils/logger';
import { attachmentApiDocObject } from '../../../../../../../utils/shared-api-docs';
import { ATTACHMENT_TYPE } from '../../../../../../../constants/attachments';
import { deleteSurveyReportAttachmentAuthors } from '../report/upload';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { PROJECT_ROLE } from '../../../../../../../constants/roles';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/{attachmentId}/delete');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  deleteAttachment()
];

POST.apiDoc = {
  ...attachmentApiDocObject('Delete an attachment of a survey.', 'Row count of successfully deleted attachment record'),
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
      name: 'attachmentId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Current attachment type for survey attachment.',
    content: {
      'application/json': {
        schema: {
          type: 'object'
        }
      }
    }
  }
};

export function deleteAttachment(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete attachment', message: 'params', req_params: req.params });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    if (!req.body || !req.body.attachmentType) {
      throw new HTTP400('Missing required body param `attachmentType`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      // If the attachment record is currently secured, need to unsecure it prior to deleting it
      if (req.body.securityToken) {
        await unsecureSurveyAttachmentRecord(req.body.securityToken, req.body.attachmentType, connection);
      }

      let deleteResult: { key: string };
      if (req.body.attachmentType === ATTACHMENT_TYPE.REPORT) {
        await deleteSurveyReportAttachmentAuthors(Number(req.params.attachmentId), connection);

        deleteResult = await deleteSurveyReportAttachment(Number(req.params.attachmentId), connection);
      } else {
        deleteResult = await deleteSurveyAttachment(Number(req.params.attachmentId), connection);
      }

      await connection.commit();

      const deleteFileResult = await deleteFileFromS3(deleteResult.key);

      if (!deleteFileResult) {
        return res.status(200).json(null);
      }

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteAttachment', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

const unsecureSurveyAttachmentRecord = async (
  securityToken: any,
  attachmentType: string,
  connection: IDBConnection
): Promise<void> => {
  const unsecureRecordSQLStatement =
    attachmentType === 'Report'
      ? unsecureAttachmentRecordSQL('survey_report_attachment', securityToken)
      : unsecureAttachmentRecordSQL('survey_attachment', securityToken);

  if (!unsecureRecordSQLStatement) {
    throw new HTTP400('Failed to build SQL unsecure record statement');
  }

  const unsecureRecordSQLResponse = await connection.query(
    unsecureRecordSQLStatement.text,
    unsecureRecordSQLStatement.values
  );

  if (!unsecureRecordSQLResponse || !unsecureRecordSQLResponse.rowCount) {
    throw new HTTP400('Failed to unsecure record');
  }
};

export const deleteSurveyAttachment = async (
  attachmentId: number,
  connection: IDBConnection
): Promise<{ key: string }> => {
  const sqlStatement = deleteSurveyAttachmentSQL(attachmentId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL delete project attachment statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to delete survey attachment record');
  }

  return response.rows[0];
};

export const deleteSurveyReportAttachment = async (
  attachmentId: number,
  connection: IDBConnection
): Promise<{ key: string }> => {
  const sqlStatement = deleteSurveyReportAttachmentSQL(attachmentId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL delete project report attachment statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to delete survey attachment report record');
  }

  return response.rows[0];
};
