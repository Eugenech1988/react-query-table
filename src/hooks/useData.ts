import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { addLesson, removeLesson, fetchLessons, fetchColumns, fetchSchoolboys } from '@/api';
import { ILessonsItem } from '@/types';

const updateCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: string,
  updater: (oldData: any) => any
) => {
  const previousData = queryClient.getQueryData<{ Items: ILessonsItem[] }>([queryKey]);
  queryClient.setQueryData([queryKey], (old: any) => updater(old));
  return previousData;
};

const handleCacheError = (
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: string,
  context?: { previousData?: any }
) => {
  if (context?.previousData) {
    queryClient.setQueryData([queryKey], context.previousData);
  }
};

export const useRemoveLesson = () => {
  const queryClient = useQueryClient();
  const queryKey = 'lessons';

  return useMutation({
    mutationFn: removeLesson,
    onMutate: async (variables: ILessonsItem) => {
      await queryClient.cancelQueries({ queryKey: [queryKey] });

      return updateCache(queryClient, queryKey, (old) => {
        if (!old || !Array.isArray(old.Items)) {
          console.error('Invalid data format:', old);
          return old;
        }
        return {
          ...old,
          Items: old.Items.filter(
            (lesson: ILessonsItem) =>
              lesson.SchoolboyId !== variables.SchoolboyId ||
              lesson.ColumnId !== variables.ColumnId
          ),
        };
      });
    },
    onError: (_err, _variables, context) => {
      //@ts-ignore
      handleCacheError(queryClient, queryKey, context);
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

      return updateCache(queryClient, queryKey, (old) => {
        if (!old || !Array.isArray(old.Items)) {
          console.error('Invalid data format:', old);
          return old;
        }
        const newLesson = {
          ColumnId: variables.ColumnId,
          SchoolboyId: variables.SchoolboyId,
          Title: 'Н',
          Id: `${Date.now()}`,
        };

        return {
          ...old,
          Items: [...old.Items, newLesson],
        };
      });
    },
    onError: (_err, _variables, context) => {
      // @ts-ignore
      handleCacheError(queryClient, queryKey, context);
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

  const queries = useQueries({ queries: queriesConfig });

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const data = queries.map((query) => query.data);

  return { isLoading, isError, data };
};
