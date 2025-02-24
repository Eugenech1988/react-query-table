import { it, expect, vi, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SchoolarProvider } from '@/SchoolarContext.tsx';
import TableComponent from './index.tsx';
import * as useDataHooks from '@/hooks/useData.ts';
import { QueryClient, QueryClientProvider, UseMutationResult } from '@tanstack/react-query';
import { ILessonsData, ILessonsItem } from '@/types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockSetSchoolar = vi.fn();
vi.mock('@/SchoolarContext.tsx', async () => {
  const actual = await vi.importActual('@/SchoolarContext.tsx');
  return {
    ...actual,
    useSchoolar: () => ({
      setSchoolar: mockSetSchoolar,
    }),
    SchoolarProvider: actual.SchoolarProvider,
  };
});

const mockData = [
  {
    Items: [
      { Id: 1, FirstName: 'John', SecondName: 'Doe' },
      { Id: 2, FirstName: 'Jane', SecondName: 'Smith' },
    ],
  },
  {
    Items: [
      { Id: 1, Title: 'Math' },
      { Id: 2, Title: 'Science' },
    ],
  },
  {
    Items: [
      { Id: 1, SchoolboyId: 1, ColumnId: 1, Title: 'Н' },
    ],
  },
];

const mockUseTableData = (data = mockData, isLoading = false, isError = false) => {
  vi.spyOn(useDataHooks, 'useTableData').mockReturnValue({
    isLoading,
    isError,
    // @ts-ignore
    data,
  });
};

const mockMutate = vi.fn();
const mockUseMutation = (): UseMutationResult<any, Error, ILessonsItem, ILessonsData> => ({
  mutate: mockMutate,
  mutateAsync: vi.fn(),
  reset: vi.fn(),
  status: 'idle',
  isIdle: true,
  isSuccess: false,
  isError: false,
  isPending: false,
  error: null,
  data: undefined,
  variables: undefined,
  context: undefined,
  failureCount: 0,
  failureReason: null,
  isPaused: false,
  submittedAt: 0,
});

describe('TableComponent', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 3,
          refetchOnWindowFocus: false,
          staleTime: 100000,
        },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SchoolarProvider>
            <TableComponent />
          </SchoolarProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('should render table with two columns and three rows', () => {
    mockUseTableData();
    renderComponent();

    expect(screen.getByText('Math')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('Doe John')).toBeInTheDocument();
    expect(screen.getByText('Smith Jane')).toBeInTheDocument();
  });

  it('should display loading message when data is being fetched', () => {
    mockUseTableData([], true, false);
    renderComponent();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error message when data fetch fails', () => {
    mockUseTableData([], false, true);
    renderComponent();

    expect(screen.getByText('Error: occurred')).toBeInTheDocument();
  });

  it('should navigate to card view when clicking on student name', () => {
    mockUseTableData();
    renderComponent();

    fireEvent.click(screen.getByText('Doe John'));

    expect(mockSetSchoolar).toHaveBeenCalledWith(mockData[0].Items[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/card');
  });

  it('should handle pagination correctly', () => {
    const manyStudents = {
      Items: Array.from({ length: 10 }, (_, i) => ({
        Id: i + 1,
        FirstName: `Student${i + 1}`,
        SecondName: `Last${i + 1}`,
      })),
    };

    mockUseTableData([manyStudents, mockData[1], mockData[2]]);
    renderComponent();

    expect(screen.getByText('Last1 Student1')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Go to next page'));
    expect(screen.getByText('Last6 Student6')).toBeInTheDocument();
  });

  it('should handle lesson toggle correctly', () => {
    mockUseTableData();
    vi.spyOn(useDataHooks, 'useRemoveLesson').mockReturnValue(mockUseMutation());
    vi.spyOn(useDataHooks, 'useCreateLesson').mockReturnValue(mockUseMutation());

    renderComponent();

    const cells = screen.getAllByRole('cell');
    fireEvent.click(cells[2]);

    expect(mockMutate).toHaveBeenCalled();
  });
});