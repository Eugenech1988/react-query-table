import axios, { AxiosError, AxiosResponse } from 'axios';
import { ILessonsItem, ISchoolboysItem, IColumnsItem} from '@/types';

// just for example
const DEFAULT_URL_LOCAL = 'http://94.131.246.109:5555';
const CLASS_KEY_LOCAL = '2';

// Use environment variables otherwise local values
const DEFAULT_URL = process.env.DEFAULT_URL || DEFAULT_URL_LOCAL;
const CLASS_KEY = process.env.CLASS_KEY || CLASS_KEY_LOCAL;

const schoolApi = axios.create({
  baseURL: `${DEFAULT_URL}/v1/${CLASS_KEY}`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'authorization': `Bearer ${CLASS_KEY}`,
    'accept-language': 'en-US',
  }
});

schoolApi.interceptors.response.use(
  (response: AxiosResponse) => {
    const statusMessages: Record<number, string> = {
      200: 'Дані отримано успішно:',
      201: 'Запис створено успішно:',
    };
    console.log(statusMessages[response.status] || 'Успішний статус:', response.data);
    return response;
  },
  (error: AxiosError) => {
    const errorMessages: Record<number, string> = {
      404: 'Ресурс не знайдено.',
      500: 'Внутрішня помилка сервера.',
    };

    if (error.response) {
      const status = error.response.status;
      const message = errorMessages[status] || `Помилка ${status}: ${error.response.data}`;
      console.error(message);
      alert(message);
    } else if (error.request) {
      if (error.message.includes('CORS')) {
        console.error('Помилка CORS: Сервер не дозволяє доступ з цього домену.');
      } else {
        console.error('Помилка: Сервер не відповідає.');
      }
    } else {
      console.error('Помилка налаштування запиту:', error.message);
    }
    return Promise.reject(error);
  }
);

// Типизация функций
export const fetchData = <T>(endpoint: string): Promise<T> =>
  schoolApi.get<T>(endpoint).then((res: AxiosResponse<T>) => res.data);

export const addLesson = ({ SchoolboyId, ColumnId }: { SchoolboyId: number, ColumnId: number }): Promise<ILessonsItem> =>
  schoolApi.post<ILessonsItem>('/Rate', { SchoolboyId, ColumnId, Title: 'Н' }).then((res: AxiosResponse<ILessonsItem>) => res.data);

export const removeLesson = ({ SchoolboyId, ColumnId }: { SchoolboyId: number, ColumnId: number }): Promise<void> =>
  schoolApi.post<void>('/UnRate', { SchoolboyId, ColumnId }).then((res: AxiosResponse<void>) => res.data);

export const fetchColumns = (): Promise<IColumnsItem[]> => fetchData<IColumnsItem[]>('/Column');
export const fetchSchoolboys = (): Promise<ISchoolboysItem[]> => fetchData<ISchoolboysItem[]>('/Schoolboy');
export const fetchLessons = (): Promise<ILessonsItem[]> => fetchData<ILessonsItem[]>('/Rate');