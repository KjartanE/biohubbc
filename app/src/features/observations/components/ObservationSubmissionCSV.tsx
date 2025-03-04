import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Tab from '@material-ui/core/Tab';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import { IGetSubmissionCSVForViewItem, IGetSubmissionCSVForViewResponse } from 'interfaces/useObservationApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';

const useStyles = makeStyles({
  table: {
    '& th': {
      whiteSpace: 'nowrap'
    },
    '& td': {
      whiteSpace: 'nowrap'
    }
  }
});

const a11yProps = (index: number) => {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  };
};

export interface ITabPanelProps {
  children: any;
  index: any;
  value: any;
}

const TabPanel: React.FC<ITabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}>
      {value === index && (
        <Box p={3}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
};

export interface IObservationSubmissionCSVProps {
  getCSVData: () => Promise<IGetSubmissionCSVForViewResponse>;
}

const ObservationSubmissionCSV: React.FC<IObservationSubmissionCSVProps> = (props) => {
  const classes = useStyles();
  const { getCSVData } = props;
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [page, setPage] = useState(0);
  const [value, setValue] = useState(0);
  const [isLoadingSubmissionCSV, setIsLoadingSubmissionCSV] = useState(true);
  const [submissionCSVDetails, setSubmissionCSVDetails] = useState<IGetSubmissionCSVForViewResponse | null>(null);

  const getSubmissionCSVDetails = useCallback(async () => {
    const submissionCSVWithDetailsResponse = await getCSVData();

    if (!submissionCSVWithDetailsResponse) {
      return;
    }

    setSubmissionCSVDetails(submissionCSVWithDetailsResponse);
  }, [getCSVData]);

  useEffect(() => {
    if (isLoadingSubmissionCSV && !submissionCSVDetails) {
      getSubmissionCSVDetails();
      setIsLoadingSubmissionCSV(false);
    }
  }, [isLoadingSubmissionCSV, submissionCSVDetails, getSubmissionCSVDetails]);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  if (!submissionCSVDetails || !submissionCSVDetails.data || submissionCSVDetails.data.length === 0) {
    return <CircularProgress data-testid="spinner" className="componentProgress" size={40} />;
  }

  return (
    <>
      <Box px={3}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="csv-groups"
          indicatorColor="primary"
          variant="scrollable">
          {submissionCSVDetails.data.map((dataItem: IGetSubmissionCSVForViewItem, dataItemIndex: number) => (
            <Tab key={dataItemIndex} label={dataItem.name} {...a11yProps(dataItemIndex)} />
          ))}
        </Tabs>
      </Box>
      <Box>
        {submissionCSVDetails.data.map((dataItem: IGetSubmissionCSVForViewItem, dataItemIndex: number) => (
          <TabPanel key={dataItemIndex} value={value} index={dataItemIndex}>
            <TableContainer>
              <Table data-testid="submission-data-table" className={classes.table} aria-label="submission-data-table">
                <TableHead>
                  <TableRow>
                    {dataItem.headers.map((header: string, headerIndex: number) => (
                      <TableCell key={headerIndex}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataItem.rows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row: any[], rowIndex: number) => (
                      <TableRow key={rowIndex}>
                        {dataItem.headers.map((header: string, headerIndex: number) => (
                          <TableCell key={headerIndex}>{row[headerIndex]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[25, 50, 75, 100]}
              component="div"
              count={dataItem.rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={(event: unknown, newPage: number) => handleChangePage(event, newPage, setPage)}
              onChangeRowsPerPage={(event: React.ChangeEvent<HTMLInputElement>) =>
                handleChangeRowsPerPage(event, setPage, setRowsPerPage)
              }
            />
          </TabPanel>
        ))}
      </Box>
    </>
  );
};

export default ObservationSubmissionCSV;
