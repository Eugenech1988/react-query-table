import { useState } from 'react';
import styles from './style.module.scss';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TablePagination } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSchoolar } from '@/SchoolarContext.tsx';
import { ILessonsItem, IColumnsItem, ISchoolboysItem, ITableData } from '@/types';
import { useCreateLesson, useRemoveLesson, useTableData } from '@/hooks/useData.ts';

const TableComponent = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { setSchoolar } = useSchoolar();
  const navigate = useNavigate();

  const { mutate: removeMutate, isError: isRemoveError, error: removeError } = useRemoveLesson();
  const { mutate: addMutate, isError: isAddError, error: addError } = useCreateLesson();
  const { isLoading, isError, data } = useTableData();

  if (isLoading) return <span>Loading...</span>;
  if (isError || isRemoveError || isAddError) return <Typography color={'error'}>Error: {removeError?.message || addError?.message || 'occurred'}</Typography>;

  const tableData = data as unknown as [ITableData, ITableData, ITableData];

  if (!tableData[0]?.Items || !tableData[1]?.Items || !tableData[2]?.Items) {
    return <Typography color={'error'}>Error: The data does not match the expected procedure.</Typography>;
  }

  const schoolars = tableData[0]?.Items as ISchoolboysItem[];
  const columns = tableData[1]?.Items as IColumnsItem[];
  const lessons = tableData[2]?.Items as ILessonsItem[];

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedSchoolars = schoolars.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleLessonClick = (SchoolboyId: number, ColumnId: number, Title: string | null) => () => {
    if (Title) removeMutate({ SchoolboyId, ColumnId });
    else addMutate({ SchoolboyId, ColumnId, Title: 'Н' });
  };

  const handleSchoolarClick = (schoolar: ISchoolboysItem) => () => {
    setSchoolar(schoolar);
    navigate('/card');
  };

  return (
    <TableContainer component={Paper} sx={{ maxWidth: 800, margin: 'auto', mt: 2 }}>
      <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>Учнi</Typography>
      <Table>
        <TableHead>
          <TableRow className={styles.tableHead}>
            <TableCell className={styles.tableHeadCell}>№</TableCell>
            <TableCell className={styles.tableHeadCell}>Ім’я учня</TableCell>
            {columns.map((column: IColumnsItem) => (
              <TableCell key={column.Id} className={styles.tableHeadCell}>{column.Title}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedSchoolars.map((schoolar: ISchoolboysItem, index: number) => (
            <TableRow key={schoolar.Id} className={styles.tableRow}>
              <TableCell className={styles.tableCell}>{index + 1 + (page * rowsPerPage)}</TableCell>
              <TableCell
                onClick={handleSchoolarClick(schoolar)}
                className={styles.tableCellClickable}
              >
                {`${schoolar.SecondName || 'Doe'} ${schoolar.FirstName || 'John'}`}
              </TableCell>
              {columns.map((column: IColumnsItem) => {
                const lesson = lessons.find((lesson: ILessonsItem) =>
                  lesson.SchoolboyId === schoolar.Id && lesson.ColumnId === column.Id);
                return (
                  <TableCell
                    key={column.Id}
                    onClick={handleLessonClick(schoolar.Id, column.Id, lesson?.Title || null)}
                    className={styles.tableCellClickable}
                  >
                    {lesson?.Title || ''}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Рядків на сторінку:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} з ${count !== -1 ? count : `більше ніж ${to}`}`}
        component="div"
        count={schoolars.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
};

export default TableComponent;