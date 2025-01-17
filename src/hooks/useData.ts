import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { addLesson, removeLesson, fetchLessons, fetchColumns, fetchSchoolboys } from '@/api';
import { ILessonsItem } from '@/types';

interface ILessonsData {
  Items: ILessonsItem[];
}

const updateCache = <T>(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: string,
  updater: (oldData: T) => T
): T | undefined => {
  const previousData = queryClient.getQueryData<T>([queryKey]);

  if (previousData) {
    queryClient.setQueryData([queryKey], updater(previousData));
  }

  return previousData;
};

const handleCacheError = <T>(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: string,
  context?: { previousData?: T }
): void => {
  if (context?.previousData) {
    queryClient.setQueryData<T>([queryKey], context.previousData);
  }
};

export const useRemoveLesson = () => {
  const queryClient = useQueryClient();
  const queryKey = 'lessons';

  return useMutation({
    mutationFn: removeLesson,
    onMutate: async (variables: ILessonsItem) => {
      await queryClient.cancelQueries({ queryKey: [queryKey] });

      return updateCache<ILessonsData>(queryClient, queryKey, (old) => {
        if (!old || !Array.isArray(old.Items)) {
          console.error('Invalid data format:', old);
          return old;
        }
        return {
          ...old,
          Items: old.Items.filter(
            (lesson) =>
              lesson.SchoolboyId !== variables.SchoolboyId ||
              lesson.ColumnId !== variables.ColumnId
          ),
        };
      });
    },
    onError: (_err, _variables, context) => {
      handleCacheError<ILessonsData>(queryClient, queryKey, { previousData: context });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });
};


export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  const queryKey = 'lessons';

  return useMutation({
    mutationFn: addLesson,
    onMutate: async (variables: ILessonsItem) => {
      await queryClient.cancelQueries({ queryKey: [queryKey] });

      return updateCache<ILessonsData>(queryClient, queryKey, (old) => {
        if (!old || !Array.isArray(old.Items)) {
          console.error('Invalid data format:', old);
          return old;
        }
        const newLesson: ILessonsItem = {
          ColumnId: variables.ColumnId,
          SchoolboyId: variables.SchoolboyId,
          Title: 'Н',
          Id: Date.now(), // Ensure `Id` is of the correct type if not a string
        };

        return {
          ...old,
          Items: [...old.Items, newLesson],
        };
      });
    },
    onError: (_err, _variables, context) => {
      handleCacheError<ILessonsData>(queryClient, queryKey, { previousData: context });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });
};

export const useTableData = () => {
  const queriesConfig = [
    { queryKey: ['schoolboys'], queryFn: fetchSchoolboys },
    { queryKey: ['columns'], queryFn: fetchColumns },
    { queryKey: ['lessons'], queryFn: fetchLessons },
  ];

  const queries = useQueries({
    queries: queriesConfig.map((config) => ({
      ...config,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const data = queries.map((query) => query.data);

  return { isLoading, isError, data };
};

