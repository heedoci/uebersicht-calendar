# MyCalendar Übersicht Widget

macOS 기본 Calendar 앱의 일정을 Übersicht 바탕화면 위젯으로 보여주는 개인용 월간 캘린더입니다.

## 기능

- macOS Calendar 일정 연동 (`icalBuddy`)
- 이전/다음 달 이동 및 이번 달 복귀
- 오늘 날짜 강조
- 날짜별 일정 표시
- 날짜 hover 시 상세 일정
- 캘린더별 색상 구분
- 일정 클릭 시 Calendar 앱 열기
- 헤더 드래그 이동 + 위치 저장
- 기본 위치는 화면 오른쪽 상단
- 헤더 더블클릭 시 오른쪽 상단으로 초기화
- 배경 blur 없음
- 15분 자동 갱신

## 준비

```bash
brew install --cask ubersicht
brew install ical-buddy
icalBuddy calendars
```

마지막 명령에서 macOS가 Calendar 접근 권한을 물으면 허용합니다.

## 설치

`MyCalendar.widget` 폴더를 아래 위치에 복사합니다.

```text
~/Library/Application Support/Übersicht/widgets/
```

그 후 Übersicht에서 **Refresh All Widgets**를 실행합니다.

## 파일

- `index.jsx`: Übersicht UI / 월 이동 / hover / drag
- `calendar_data.py`: icalBuddy 일정 조회 / 설정 / 위치 저장
- `VERSION`: 현재 정리 버전

## 설정 파일

최초 실행 후 아래 파일이 자동 생성됩니다.

```text
~/Library/Application Support/MyCalendarWidget/config.json
```

예시:

```json
{
  "hiddenCalendars": ["생일", "대한민국의 공휴일"],
  "maxEventsPerDay": 3
}
```

## 메모

이 저장소는 대화 중 만든 중간 버전을 모두 보존하는 아카이브가 아니라, 최종 사용 형태를 정리한 버전입니다.
