import sinon from 'sinon';
import { IDBConnection } from '../database/db';

/**
 * Returns a mock `IDBConnection` with empty methods.
 *
 * @param {Partial<IDBConnection>} [config] Initial method overrides
 * @return {*}  {IDBConnection}
 */
export const getMockDBConnection = (config?: Partial<IDBConnection>): IDBConnection => {
  return {
    systemUserId: () => {
      return null;
    },
    open: async () => {
      // do nothing
    },
    release: () => {
      // do nothing
    },
    commit: async () => {
      // do nothing
    },
    rollback: async () => {
      // do nothing
    },
    query: async () => {
      // do nothing
    },
    ...config
  };
};

/**
 * Returns several mocks for testing RequestHandler responses.
 *
 * @return {*}
 */
export const getMockResponse = () => {
  const mockSend = sinon.fake();
  const mockJson = sinon.fake();
  const mockStatus = sinon.fake(() => {
    return {
      send: mockSend,
      json: mockJson
    };
  });

  const mockRes = {
    status: mockStatus
  };

  return { mockRes, mockStatus, mockSend, mockJson };
};
