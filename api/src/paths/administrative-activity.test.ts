import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as administrative_activity from './administrative-activity';
import * as administrative_queries from '../queries/administrative-activity/administrative-activity-queries';
import * as db from '../database/db';
import { getMockDBConnection } from '../__mocks__/db';
import SQL from 'sql-template-strings';
import * as keycloak_utils from '../utils/keycloak-utils';
import { CustomError } from '../errors/CustomError';

chai.use(sinonChai);

describe('updateAccessRequest', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {}
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

  it('should throw a 400 error when no system user id', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return null;
      }
    });

    try {
      const result = administrative_activity.createAdministrativeActivity();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(500);
      expect((actualError as CustomError).message).to.equal('Failed to identify system user ID');
    }
  });

  it('should throw a 400 error when failed to build postAdministrativeActivitySQL statement', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });
    sinon.stub(administrative_queries, 'postAdministrativeActivitySQL').returns(null);

    try {
      const result = administrative_activity.createAdministrativeActivity();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(500);
      expect((actualError as CustomError).message).to.equal('Failed to build SQL insert statement');
    }
  });

  it('should throw a 400 error when failed to submit administrative activity due to rows being null', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [null]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });
    sinon.stub(administrative_queries, 'postAdministrativeActivitySQL').returns(SQL`some`);

    try {
      const result = administrative_activity.createAdministrativeActivity();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(500);
      expect((actualError as CustomError).message).to.equal('Failed to submit administrative activity');
    }
  });

  it('should throw a 400 error when failed to submit administrative activity due to row id being null', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [
        {
          id: null,
          create_date: null
        }
      ]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });
    sinon.stub(administrative_queries, 'postAdministrativeActivitySQL').returns(SQL`some`);

    try {
      const result = administrative_activity.createAdministrativeActivity();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(500);
      expect((actualError as CustomError).message).to.equal('Failed to submit administrative activity');
    }
  });

  it('should throw a 400 error when failed to submit administrative activity due to row id being null', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [
        {
          id: 1,
          create_date: '2020/04/04'
        }
      ]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });
    sinon.stub(administrative_queries, 'postAdministrativeActivitySQL').returns(SQL`some`);

    const result = administrative_activity.createAdministrativeActivity();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({
      id: 1,
      date: '2020/04/04'
    });
  });
});

describe('getPendingAccessRequestsCount', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {}
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

  it('should throw a 400 error when no user identifier', async () => {
    sinon.stub(keycloak_utils, 'getUserIdentifier').returns(null);

    try {
      const result = administrative_activity.getPendingAccessRequestsCount();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing required userIdentifier');
    }
  });

  it('should throw a 400 error when failed to build countPendingAdministrativeActivitiesSQL statement', async () => {
    sinon.stub(keycloak_utils, 'getUserIdentifier').returns('identifier');
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });
    sinon.stub(administrative_queries, 'countPendingAdministrativeActivitiesSQL').returns(null);

    try {
      const result = administrative_activity.getPendingAccessRequestsCount();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should return 0 on success (no rowCount)', async () => {
    sinon.stub(keycloak_utils, 'getUserIdentifier').returns('identifier');

    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rowCount: null
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });
    sinon.stub(administrative_queries, 'countPendingAdministrativeActivitiesSQL').returns(SQL`something`);

    const result = administrative_activity.getPendingAccessRequestsCount();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(0);
  });

  it('should return rowCount on success', async () => {
    sinon.stub(keycloak_utils, 'getUserIdentifier').returns('identifier');

    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rowCount: 23
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });
    sinon.stub(administrative_queries, 'countPendingAdministrativeActivitiesSQL').returns(SQL`something`);

    const result = administrative_activity.getPendingAccessRequestsCount();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.equal(23);
  });
});

describe('getUpdateAdministrativeActivityHandler', () => {
  afterEach(() => {
    sinon.restore();
  });

  const sampleReq = {
    keycloak_token: {},
    body: {
      id: null,
      status: null
    }
  } as any;

  it('should throw a 400 error when no administrativeActivityId', async () => {
    try {
      const result = administrative_activity.getUpdateAdministrativeActivityHandler();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing required body parameter: id');
    }
  });

  it('should throw a 400 error when no administrativeActivityStatusTypeId', async () => {
    try {
      const result = administrative_activity.getUpdateAdministrativeActivityHandler();

      await result(
        { ...sampleReq, body: { ...sampleReq.body, id: 2 } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Missing required body parameter: status');
    }
  });
});

describe('updateAdministrativeActivity', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  it('should throw a 400 error when failed to build putAdministrativeActivitySQL statement', async () => {
    sinon.stub(administrative_queries, 'putAdministrativeActivitySQL').returns(null);

    try {
      await administrative_activity.updateAdministrativeActivity(1, 2, {
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        }
      });

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(400);
      expect((actualError as CustomError).message).to.equal('Failed to build SQL put statement');
    }
  });

  it('should throw a 500 error when failed to update administrative activity', async () => {
    sinon.stub(administrative_queries, 'putAdministrativeActivitySQL').returns(SQL`some`);

    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rowCount: null
    });

    try {
      await administrative_activity.updateAdministrativeActivity(1, 2, {
        ...dbConnectionObj,
        systemUserId: () => {
          return 20;
        },
        query: mockQuery
      });

      expect.fail();
    } catch (actualError) {
      expect((actualError as CustomError).status).to.equal(500);
      expect((actualError as CustomError).message).to.equal('Failed to update administrative activity');
    }
  });
});
