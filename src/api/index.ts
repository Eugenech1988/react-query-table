import axios, { AxiosError } from 'axios';

// Local fallback values - it's for engage of errors when start
const DEFAULT_URL_LOCAL = 'http://94.131.246.109:5555';
const CLASS_KEY_LOCAL = '2';

// Use process.env value if available, otherwise fallback to local variable
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
  (response) => {
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
        console.error('Помилка CORS: Сервер не дозволяє доступ з цієї домену.');
        // alert('Сервер не дозволяє доступ з цієї домену (CORS). Перевірте налаштування серверу.');
      } else {
        console.error('Помилка: Сервер не відповідає.');
        // alert('Неможливо зв’язатися з сервером. Перевірте з’єднання.');
      }
    } else {
      console.error('Помилка налаштування запиту:', error.message);
    }
    return Promise.reject(error);
  }
);

export const fetchData = (endpoint: string) => schoolApi.get(endpoint).then(res => res.data);

export const addLesson = ({ SchoolboyId, ColumnId }: { SchoolboyId: number, ColumnId: number }) =>
  schoolApi.post('/Rate', { SchoolboyId, ColumnId, Title: 'Н' }).then(res => res.data);

export const removeLesson = ({ SchoolboyId, ColumnId }: { SchoolboyId: number, ColumnId: number }) =>
  schoolApi.post('/UnRate', { SchoolboyId, ColumnId }).then(res => res.data);

export const fetchColumns = () => fetchData('/Column');
export const fetchSchoolboys = () => fetchData('/Schoolboy');
export const fetchLessons = () => fetchData('/Rate');
