'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/CustomError';
import { getLogger } from '../../../utils/logger';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { deleteDraftSQL } from '../../../queries/draft-queries';
import { authorizeRequestHandler } from '../../../request-handlers/security/authorization';

const defaultLog = getLogger('/api/draft/{draftId}/delete');

export const DELETE: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          validSystemRoles: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  deleteDraft()
];

DELETE.apiDoc = {
  description: 'Delete a draft record.',
  tags: ['attachment'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'draftId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Row count of successfully deleted draft record',
      content: {
        'text/plain': {
          schema: {
            type: 'number'
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function deleteDraft(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete draft', message: 'params', req_params: req.params });

    if (!req.params.draftId) {
      throw new HTTP400('Missing required path param `draftId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const deleteDraftSQLStatement = deleteDraftSQL(Number(req.params.draftId));

      if (!deleteDraftSQLStatement) {
        throw new HTTP400('Failed to build SQL delete statement');
      }

      const result = await connection.query(deleteDraftSQLStatement.text, deleteDraftSQLStatement.values);

      await connection.commit();

      return res.status(200).json(result && result.rowCount);
    } catch (error) {
      defaultLog.error({ label: 'deleteDraft', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
