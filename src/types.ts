export interface Registration {
  id: string;
  name: string;
  neis: string;
  course: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  syncStatus: 'local' | 'synced' | 'failed';
}

export interface CourseSchedule {
  date: string;
  topic: string;
  activity: string;
}

export interface Course {
  title: string;
  subTitle?: string;
  period: string;
  time: string;
  hours: number;
  location: string;
  schedule?: CourseSchedule[];
}

export const TARGET_COURSE: Course = {
  title: "생성형 AI 에이전트와 함께하는\n에듀테크 수업디자인",
  subTitle: "특수분야 직무연수 15차시 과정",
  period: "2026. 6. 10. ~ 10. 21. (총 5회)",
  time: "15시간 (1회 3시간)",
  hours: 15,
  location: "추후공개",
  schedule: [
    {
      date: "6월 10일(수)",
      topic: "전과목 수업 적용\n에듀테크 이론·실습",
      activity: "선생님의 아이디어를 구현하는 바이브코딩 수업 디자인\n(내부 강사 - 고두철)"
    },
    {
      date: "6월 24일(수)",
      topic: "전과목 수업 적용\n강의, 실습",
      activity: "생성형 AI의 최신 트렌드 이해 및 프롬프트 엔지니어링 기초\n(내부 강사 - 문종기)"
    },
    {
      date: "7월 8일(수)",
      topic: "사회, 창제 수업 적용\n이론·실습",
      activity: "에듀테크(슈페 앱)로 바꾸는 경제교육 교실\n(내부 강사 - 권민수)"
    },
    {
      date: "9월 30일(수)",
      topic: "전과목 수업 적용\n에듀테크 이론",
      activity: "온라인 학급 구축하고 소통하기 (웍스, 톡톡클래스 등)\n(내부 강사 - 김다혜)"
    },
    {
      date: "10월 14일(수)",
      topic: "체육 수업 적용\n에듀테크 강의•실습",
      activity: "세부 내용에 Active Arcade, 메타스포츠스쿨 등 체육 앱 활용 수업 들여다보기\n(내부 강사 - 김재근)"
    }
  ]
};
