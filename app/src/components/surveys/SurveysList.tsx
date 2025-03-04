import Chip from '@material-ui/core/Chip';
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { SurveyStatusType } from 'constants/misc';
import clsx from 'clsx';
import { IGetSurveysListResponse } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { getFormattedDateRangeString } from 'utils/Utils';
import { handleChangeRowsPerPage, handleChangePage } from 'utils/tablePaginationUtils';
import { useHistory } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    color: '#ffffff'
  },
  chipUnpublished: {
    backgroundColor: theme.palette.text.disabled
  },
  chipActive: {
    backgroundColor: theme.palette.success.main
  },
  chipPublishedCompleted: {
    backgroundColor: theme.palette.success.main
  }
}));

export interface ISurveysListProps {
  surveysList: IGetSurveysListResponse[];
  projectId: number;
}

const SurveysList: React.FC<ISurveysListProps> = (props) => {
  const classes = useStyles();
  const history = useHistory();

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const getChipIcon = (status_name: string) => {
    let chipLabel;
    let chipStatusClass;

    if (SurveyStatusType.UNPUBLISHED === status_name) {
      chipLabel = 'Unpublished';
      chipStatusClass = classes.chipUnpublished;
    } else if (SurveyStatusType.PUBLISHED === status_name) {
      chipLabel = 'Published';
      chipStatusClass = classes.chipPublishedCompleted;
    } else if (SurveyStatusType.ACTIVE === status_name) {
      chipLabel = 'Active';
      chipStatusClass = classes.chipActive;
    } else if (SurveyStatusType.COMPLETED === status_name) {
      chipLabel = 'Completed';
      chipStatusClass = classes.chipPublishedCompleted;
    }

    return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
  };

  return (
    <>
      <TableContainer>
        <Table aria-label="surveys-list-table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Species</TableCell>
              <TableCell>Timeline</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Published</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.surveysList.length > 0 &&
              props.surveysList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    <Link
                      underline="always"
                      component="button"
                      variant="body2"
                      onClick={() => history.push(`/admin/projects/${props.projectId}/surveys/${row.id}/details`)}>
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.species?.join(', ')}</TableCell>
                  <TableCell>
                    {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, row.start_date, row.end_date)}
                  </TableCell>
                  <TableCell>{getChipIcon(row.completion_status)}</TableCell>
                  <TableCell>{getChipIcon(row.publish_status)}</TableCell>
                </TableRow>
              ))}
            {!props.surveysList.length && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No Surveys
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {props.surveysList.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 15, 20]}
          component="div"
          count={props.surveysList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={(event: unknown, newPage: number) => handleChangePage(event, newPage, setPage)}
          onChangeRowsPerPage={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleChangeRowsPerPage(event, setPage, setRowsPerPage)
          }
        />
      )}
    </>
  );
};

export default SurveysList;
