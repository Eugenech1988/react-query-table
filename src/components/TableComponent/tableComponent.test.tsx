import { it, expect, vi, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SchoolarProvider } from '@/SchoolarContext.tsx';
import TableComponent from './index.tsx';
import * as useDataHooks from '@/hooks/useData.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
      setSchoolar: mockSetSchoolar
    }),
    SchoolarProvider: actual.SchoolarProvider
  };
});


const mockData = [
  {
    Items: [
      { Id: 1, FirstName: 'John', SecondName: 'Doe' },
      { Id: 2, FirstName: 'Jane', SecondName: 'Smith' }
    ]
  },
  {
    Items: [
      { Id: 1, Title: 'Math' },
      { Id: 2, Title: 'Science' }
    ]
  },
  {
    Items: [
      { Id: 1, SchoolboyId: 1, ColumnId: 1, Title: 'Н' }
    ]
  }
];

describe('TableComponent', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 3,
          refetchOnWindowFocus: false,
          staleTime: 100000
        }
      }
    });
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SchoolarProvider>
            <TableComponent/>
          </SchoolarProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
  it('should render table with two columns and three rows', () => {
    vi.spyOn(useDataHooks, 'useTableData').mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockData
    });

    renderComponent();

    expect(screen.getByText('Math')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('Doe John')).toBeInTheDocument();
    expect(screen.getByText('Smith Jane')).toBeInTheDocument();
  })

  it('should display loading message when data is being fetched', () => {
    vi.spyOn(useDataHooks, 'useTableData').mockReturnValue({
      isLoading: true,
      isError: false,
      data: mockData ?? [{ Items: [] }, { Items: [] }, { Items: [] }]
    });

    renderComponent();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error message when data fetch fails', () => {
    vi.spyOn(useDataHooks, 'useTableData').mockReturnValue({
      isLoading: false,
      isError: true,
      data: mockData ?? [{ Items: [] }, { Items: [] }, { Items: [] }]
    });

    renderComponent();
    expect(screen.getByText('Error: occurred')).toBeInTheDocument();
  });

  it('should display table with correct data when loaded successfully', () => {
    vi.spyOn(useDataHooks, 'useTableData').mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockData || []
    });
    vi.spyOn(useDataHooks, 'useRemoveLesson').mockReturnValue({
      mutate: vi.fn(),
      isError: false,
      error: null,
      isSuccess: false,
      isIdle: true,
      status: 'idle',
      data: undefined,
      variables: undefined,
      reset: vi.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      mutateAsync: vi.fn(),
      isPending: false,
      isPaused: false,
      submittedAt: 0
    });
    vi.spyOn(useDataHooks, 'useCreateLesson').mockReturnValue({
      mutate: vi.fn(),
      isError: false,
      error: null,
      isSuccess: false,
      isIdle: true,
      status: 'idle',
      data: undefined,
      variables: undefined,
      reset: vi.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      mutateAsync: vi.fn(),
      isPending: false,
      isPaused: false,
      submittedAt: 0
    });

    renderComponent();
    
    expect(screen.getByText('Math')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    
    expect(screen.getByText('Doe John')).toBeInTheDocument();
    expect(screen.getByText('Smith Jane')).toBeInTheDocument();
  });

  it('should handle pagination correctly', () => {
    const manyStudents = {
      Items: Array.from({ length: 10 }, (_, i) => ({
        Id: i + 1,
        FirstName: `Student${i + 1}`,
        SecondName: `Last${i + 1}`
      }))
    };

    vi.spyOn(useDataHooks, 'useTableData').mockReturnValue({
      isLoading: false,
      isError: false,
      data: [manyStudents, mockData[1], mockData[2]]
    });

    renderComponent();

    expect(screen.getByText('Last1 Student1')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTitle('Go to next page'));
    expect(screen.getByText('Last6 Student6')).toBeInTheDocument();
  });

  it('should navigate to card view when clicking on student name', () => {
    vi.spyOn(useDataHooks, 'useTableData').mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockData
    });

    renderComponent();
    
    fireEvent.click(screen.getByText('Doe John'));
    
    expect(mockSetSchoolar).toHaveBeenCalledWith(mockData[0].Items[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/card');
  });

  it('should handle lesson toggle correctly', () => {
    const mockRemoveMutate = vi.fn();
    const mockAddMutate = vi.fn();

    vi.spyOn(useDataHooks, 'useTableData').mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockData
    });
    vi.spyOn(useDataHooks, 'useRemoveLesson').mockReturnValue({
      mutate: mockRemoveMutate,
      isError: false,
      error: null,
      isSuccess: false,
      isIdle: true,
      status: 'idle',
      data: undefined,
      variables: undefined,
      reset: vi.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      mutateAsync: vi.fn(),
      isPending: false,
      isPaused: false,
      submittedAt: 0
    });
    vi.spyOn(useDataHooks, 'useCreateLesson').mockReturnValue({
      mutate: mockAddMutate,
      isError: false,
      error: null,
      isSuccess: false,
      isIdle: true,
      status: 'idle',
      data: undefined,
      variables: undefined,
      reset: vi.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      mutateAsync: vi.fn(),
      isPending: false,
      isPaused: false,
      submittedAt: 0
    });

    renderComponent();

    const cells = screen.getAllByRole('cell');
    fireEvent.click(cells[2]); // Assuming this is a lesson cell

    expect(mockRemoveMutate).toHaveBeenCalled();
  });
});