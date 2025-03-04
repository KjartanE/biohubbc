import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as surveys from './surveys';
import * as db from '../../../database/db';
import * as survey_view_queries from '../../../queries/survey/survey-view-queries';
import SQL from 'sql-template-strings';
import { COMPLETION_STATUS } from '../../../constants/status';
import { getMockDBConnection } from '../../../__mocks__/db';
import { CustomError } from '../../../errors/CustomError';

chai.use(sinonChai);

describe('getSurveyList', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    params: {
      projectId: 1
    }
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  it('should throw a 400 error when no project id path param', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    try {
      const result = surveys.getSurveyList();

      await result(
        { ...sampleReq, params: { ...sampleReq.params, projectId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing required path param `projectId`');
    }
  });

  it('should throw a 400 error when no sql statement returned', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });

    sinon.stub(survey_view_queries, 'getSurveyListSQL').returns(null);

    try {
      const result = surveys.getSurveyList();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return the surveys on success (unpublished and active)', async () => {
    const survey = {
      id: 1,
      name: 'name',
      species: 'species',
      start_date: '2020/04/04',
      end_date: '2099/05/05',
      publish_timestamp: null
    };

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [survey] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_view_queries, 'getSurveyListSQL').returns(SQL`some query`);

    const result = surveys.getSurveyList();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql([
      {
        id: 1,
        name: 'name',
        start_date: '2020/04/04',
        end_date: '2099/05/05',
        species: ['species'],
        publish_status: 'Unpublished',
        completion_status: COMPLETION_STATUS.ACTIVE
      }
    ]);
  });

  it('should return the surveys on success (published and completed)', async () => {
    const survey = {
      id: 1,
      name: 'name',
      species: 'species',
      start_date: '2020/04/04',
      end_date: '2020/05/05',
      publish_timestamp: '2020/04/04'
    };

    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [survey] });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_view_queries, 'getSurveyListSQL').returns(SQL`some query`);

    const result = surveys.getSurveyList();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql([
      {
        id: 1,
        name: 'name',
        start_date: '2020/04/04',
        end_date: '2020/05/05',
        species: ['species'],
        publish_status: 'Published',
        completion_status: COMPLETION_STATUS.COMPLETED
      }
    ]);
  });

  it('should return empty array when response has no rows (no surveys found)', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: null });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    sinon.stub(survey_view_queries, 'getSurveyListSQL').returns(SQL`some query`);

    const result = surveys.getSurveyList();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql([]);
  });
});
