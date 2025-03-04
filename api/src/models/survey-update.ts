import { COMPLETION_STATUS } from '../constants/status';
import { Feature } from 'geojson';
import moment from 'moment';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/survey-update');

/**
 * Pre-processes GET /project/{projectId}/survey/{surveyId} survey details data for update
 *
 * @export
 * @class GetUpdateSurveyDetailsData
 */
export class GetUpdateSurveyDetailsData {
  id: number;
  survey_name: string;
  survey_purpose: string;
  focal_species: (string | number)[];
  ancillary_species: (string | number)[];
  common_survey_methodology_id: number;
  start_date: string;
  end_date: string;
  biologist_first_name: string;
  biologist_last_name: string;
  survey_area_name: string;
  geometry: Feature[];
  revision_count: number;
  permit_number: string;
  permit_type: string;
  funding_sources: number[];
  completion_status: string;
  publish_date: string;

  constructor(surveyDetailsData?: any) {
    defaultLog.debug({
      label: 'GetUpdateSurveyDetailsData',
      message: 'params',
      surveyDetailsData: {
        ...surveyDetailsData,
        geometry: surveyDetailsData?.geometry?.map((item: any) => {
          return { ...item, geometry: 'Too big to print' };
        })
      }
    });

    const surveyDataItem = surveyDetailsData && surveyDetailsData.length && surveyDetailsData[0];

    const focalSpeciesList: string[] = [];
    const seenFocalSpecies: string[] = [];

    const ancillarySpeciesList: string[] = [];
    const seenAncillarySpecies: string[] = [];

    const fundingSourcesList: number[] = [];
    const seenFundingSourceIds: number[] = [];

    surveyDetailsData &&
      surveyDetailsData.map((item: any) => {
        if (!seenFundingSourceIds.includes(item.pfs_id)) {
          fundingSourcesList.push(item.pfs_id);
        }
        seenFundingSourceIds.push(item.pfs_id);

        if (!seenFocalSpecies.includes(item.focal_species)) {
          focalSpeciesList.push(item.focal_species);
        }
        seenFocalSpecies.push(item.focal_species);

        if (!seenAncillarySpecies.includes(item.ancillary_species)) {
          ancillarySpeciesList.push(item.ancillary_species);
        }
        seenAncillarySpecies.push(item.ancillary_species);
      });

    this.id = surveyDataItem?.id ?? null;
    this.survey_name = surveyDataItem?.name || '';
    this.survey_purpose = surveyDataItem?.objectives || '';
    this.focal_species = (focalSpeciesList.length && focalSpeciesList.filter((item: string | number) => !!item)) || [];
    this.ancillary_species =
      (ancillarySpeciesList.length && ancillarySpeciesList.filter((item: string | number) => !!item)) || [];
    this.start_date = surveyDataItem?.start_date || '';
    this.end_date = surveyDataItem?.end_date || '';
    this.common_survey_methodology_id = surveyDataItem?.common_survey_methodology_id ?? null;
    this.biologist_first_name = surveyDataItem?.lead_first_name || '';
    this.biologist_last_name = surveyDataItem?.lead_last_name || '';
    this.survey_area_name = surveyDataItem?.location_name || '';
    this.geometry = (surveyDataItem?.geometry?.length && surveyDataItem.geometry) || [];
    this.permit_number = surveyDataItem?.number || '';
    this.permit_type = surveyDataItem?.type || '';
    this.funding_sources = (fundingSourcesList.length && fundingSourcesList.filter((item: number) => !!item)) || [];
    this.revision_count = surveyDataItem?.revision_count ?? null;
    this.completion_status =
      (surveyDataItem &&
        surveyDataItem.end_date &&
        moment(surveyDataItem.end_date).endOf('day').isBefore(moment()) &&
        COMPLETION_STATUS.COMPLETED) ||
      COMPLETION_STATUS.ACTIVE;
    this.publish_date = surveyDataItem?.publish_date || '';
  }
}

/**
 * Pre-processes PUT /project/{projectId}/survey/{surveyId} survey data for update
 *
 * @export
 * @class PutSurveyDetailsData
 */
export class PutSurveyDetailsData {
  name: string;
  objectives: string;
  focal_species: number[];
  ancillary_species: number[];
  common_survey_methodology_id: number;
  start_date: string;
  end_date: string;
  lead_first_name: string;
  lead_last_name: string;
  location_name: string;
  geometry: Feature[];
  permit_number: string;
  permit_type: string;
  funding_sources: number[];
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({
      label: 'PutSurveyDetailsData',
      message: 'params',
      obj: {
        ...obj,
        geometry: obj?.geometry?.map((item: any) => {
          return { ...item, geometry: 'Too big to print' };
        })
      }
    });

    this.name = obj?.survey_details?.survey_name || null;
    this.objectives = obj?.survey_details?.survey_purpose || null;
    this.focal_species = (obj?.survey_details?.focal_species?.length && obj.survey_details?.focal_species) || [];
    this.ancillary_species =
      (obj?.survey_details?.ancillary_species?.length && obj.survey_details?.ancillary_species) || [];
    this.start_date = obj?.survey_details?.start_date || null;
    this.end_date = obj?.survey_details?.end_date || null;
    this.common_survey_methodology_id = obj?.survey_details?.common_survey_methodology_id || null;
    this.lead_first_name = obj?.survey_details?.biologist_first_name || null;
    this.lead_last_name = obj?.survey_details?.biologist_last_name || null;
    this.location_name = obj?.survey_details?.survey_area_name || null;
    this.geometry = obj?.survey_details?.geometry || null;
    this.permit_number = obj?.survey_details.permit_number || null;
    this.permit_type = obj?.survey_details.permit_type || null;
    this.funding_sources = (obj?.survey_details?.funding_sources?.length && obj.survey_details?.funding_sources) || [];
    this.revision_count = obj?.survey_details?.revision_count ?? null;
  }
}

/**
 * Pre-processes PUT /project/{projectId}/survey/{surveyId} survey proprietor data for update
 *
 * @export
 * @class PutSurveyProprietorData
 */
export class PutSurveyProprietorData {
  id: number;
  prt_id: number;
  fn_id: number;
  rationale: string;
  proprietor_name: string;
  survey_data_proprietary: boolean;
  disa_required: boolean;
  revision_count: number;

  constructor(obj?: any) {
    defaultLog.debug({ label: 'PutSurveyProprietorData', message: 'params', obj });

    this.id = obj?.id ?? null;
    this.prt_id = obj?.proprietary_data_category || null;
    this.fn_id = obj?.first_nations_id || null;
    this.rationale = obj?.category_rationale || null;
    this.proprietor_name = (!obj?.first_nations_id && obj?.proprietor_name) || null;
    this.survey_data_proprietary = obj?.survey_data_proprietary === 'true' || false;
    this.disa_required = obj?.data_sharing_agreement_required === 'true' || false;
    this.revision_count = obj?.revision_count ?? null;
  }
}
