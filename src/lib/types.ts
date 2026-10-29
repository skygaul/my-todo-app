// todos 테이블 한 행. 컬럼 이름을 그대로 써서 SQL 결과와 1:1로 대응시킵니다.
// pg 드라이버 변환: UUID·VARCHAR → string, BOOLEAN → boolean, TIMESTAMPTZ → Date
export type Todo = {
  id: string;
  title: string;
  is_completed: boolean;
  created_at: Date;
};
