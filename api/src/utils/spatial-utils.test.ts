import { expect } from 'chai';
import { describe } from 'mocha';
import { parseUTMString } from './spatial-utils';

describe('parseUTMString', () => {
  it('returns null when no UTM string provided', async () => {
    expect(parseUTMString((null as unknown) as string)).to.be.null;
    expect(parseUTMString('')).to.be.null;
  });

  it('returns null when provided UTM string has invalid format', () => {
    expect(parseUTMString('invalid format')).to.be.null;
    expect(parseUTMString('123 123 123')).to.be.null;
    expect(parseUTMString('573674 6114170')).to.be.null;
    expect(parseUTMString('9N 573674 6114170 Extra')).to.be.null;
    expect(parseUTMString('9NN 573674 6114170')).to.be.null;
  });

  it('returns null when UTM easting is too small', async () => {
    const result = parseUTMString('9N 0 6114170');

    expect(result).to.be.null;
  });

  it('returns null when UTM easting is too large', async () => {
    const result = parseUTMString('9N 99999999 6114170');

    expect(result).to.be.null;
  });

  it('returns null when UTM northing is too small', async () => {
    const result = parseUTMString('9N 573674 0');

    expect(result).to.be.null;
  });

  it('returns null when UTM northing is too large', async () => {
    const result = parseUTMString('9N 573674 99999999');

    expect(result).to.be.null;
  });

  it('returns null when UTM zone number is too small', async () => {
    const result = parseUTMString('0N 573674 6114170');

    expect(result).to.be.null;
  });

  it('returns null when UTM zone number is too large', async () => {
    const result = parseUTMString('61N 573674 6114170');

    expect(result).to.be.null;
  });

  it('returns parsed UTM when UTM string is valid, but zone letter is missing', async () => {
    const result = parseUTMString('9 573674 6114170');

    expect(result).to.eql({
      easting: 573674,
      northing: 6114170,
      zone_letter: undefined,
      zone_number: 9,
      zone_srid: 32609
    });
  });

  it('returns parsed UTM when UTM string is valid, but zone letter is lowercase', async () => {
    const result = parseUTMString('9n 573674 6114170');

    expect(result).to.eql({ easting: 573674, northing: 6114170, zone_letter: 'N', zone_number: 9, zone_srid: 32609 });
  });

  it('returns parsed UTM when UTM string is valid for northern hemisphere', async () => {
    const result = parseUTMString('9N 573674 6114170');

    expect(result).to.eql({ easting: 573674, northing: 6114170, zone_letter: 'N', zone_number: 9, zone_srid: 32609 });
  });

  it('returns parsed UTM when UTM string is valid for southern hemisphere', async () => {
    const result = parseUTMString('18C 573674 6114170');

    expect(result).to.eql({ easting: 573674, northing: 6114170, zone_letter: 'C', zone_number: 18, zone_srid: 32718 });
  });
});
