export interface ISchoolboysItem {
  Id: number,
  FirstName: string | null,
  SecondName: string | null,
  LastName: string | null,
}

export interface ILessonsItem {
  ColumnId: number;
  Id?: number;
  SchoolboyId: number;
  Title?: string;
}

export interface IColumnsItem {
  Id: number,
  Title: string
}

export interface ILessonsData {
  Items: ILessonsItem[];
}