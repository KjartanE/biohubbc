import { render } from '@testing-library/react';
import { Formik } from 'formik';
import GeneralInformationForm, {
  GeneralInformationInitialValues,
  GeneralInformationYupSchema
} from 'features/surveys/components/GeneralInformationForm';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';

const handleSaveAndNext = jest.fn();

const generalInformationFilledValues = {
  survey_name: 'survey name',
  start_date: '2000-04-09 11:53:53',
  end_date: '2020-05-10 11:53:53',
  species: [1],
  survey_purpose: 'purpose',
  biologist_first_name: 'first',
  biologist_last_name: 'last',
  common_survey_methodology_id: 1
};

describe('General Information Form', () => {
  it('renders correctly the empty component correctly', () => {
    const { asFragment } = render(
      <Formik
        initialValues={GeneralInformationInitialValues}
        validationSchema={GeneralInformationYupSchema()}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => (
          <GeneralInformationForm
            species={
              codes?.species?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            common_survey_methodologies={
              codes?.common_survey_methodologies?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            permit_numbers={[
              { value: '123', label: '123 - Scientific' },
              { value: '456', label: '123 - Wildlife' }
            ]}
            funding_sources={[
              {
                value: 1,
                label: 'agency | $ 100 | 2000/04/09 - 2000/05/10'
              }
            ]}
            projectStartDate={getProjectForViewResponse.project.start_date}
            projectEndDate={getProjectForViewResponse.project.end_date}
          />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly the filled component correctly', () => {
    const { asFragment } = render(
      <Formik
        initialValues={generalInformationFilledValues}
        validationSchema={GeneralInformationYupSchema()}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => (
          <GeneralInformationForm
            species={
              codes?.species?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            common_survey_methodologies={
              codes?.common_survey_methodologies?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            permit_numbers={[
              { value: '123', label: '123 - Scientific' },
              { value: '456', label: '123 - Wildlife' }
            ]}
            funding_sources={[
              {
                value: 1,
                label: 'agency | $ 100 | 2000/04/09 - 2000/05/10'
              }
            ]}
            projectStartDate={getProjectForViewResponse.project.start_date}
            projectEndDate={getProjectForViewResponse.project.end_date}
          />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly when errors exist', () => {
    const { asFragment } = render(
      <Formik
        initialValues={generalInformationFilledValues}
        validationSchema={GeneralInformationYupSchema()}
        validateOnBlur={true}
        initialErrors={{
          survey_name: 'error on survey name field',
          start_date: 'error on start date field',
          end_date: 'error on end date field',
          species: 'error on species field',
          survey_purpose: 'error on survey purpose field',
          biologist_first_name: 'error on biologist first name field',
          biologist_last_name: 'error on biologist last name field'
        }}
        initialTouched={{
          survey_name: true,
          start_date: true,
          end_date: true,
          species: true,
          survey_purpose: true,
          biologist_first_name: true,
          biologist_last_name: true
        }}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => (
          <GeneralInformationForm
            species={
              codes?.species?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            common_survey_methodologies={
              codes?.common_survey_methodologies?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            permit_numbers={[
              { value: '123', label: '123 - Scientific' },
              { value: '456', label: '123 - Wildlife' }
            ]}
            funding_sources={[
              {
                value: 1,
                label: 'agency | $ 100 | 2000/04/09 - 2000/05/10'
              }
            ]}
            projectStartDate={getProjectForViewResponse.project.start_date}
            projectEndDate={getProjectForViewResponse.project.end_date}
          />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
