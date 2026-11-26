
const $ = (selector) => document.querySelector(selector);

// 초기 데이터
let memos = [
  { id: 5, text: "28일 Python 시험 · 오전 7시", date: "26.11.26", todo: false },
  { id: 1, text: "냉동실에 닭가슴살 버리기", date: "26.11.18", todo: false },
  { id: 2, text: "재환 -20,000 은정 +30,000", date: "26.11.18", todo: false },
  { id: 3, text: "이마트 샐러리 귤 감자 카누 김자반 계란", date: "26.11.18", todo: false },
  { id: 4, text: "대한민국은 민주공화국이다. 대한민국의 주권은 국민에게 있고 모든 권력은 국민으로부터 나온다. 대한민국의 국민되는 요건은 법률로써정한다.대한민국의 영토는 한반도와 그 부속도서로 한", date: "26.11.18", todo: false }
];

let habits = [
  { text: "점심 먹고 30분 산책", done: true },
  { text: "하루 5,000-10,000 사이로 쓰기", done: true },
  { text: "하루 책 20장 읽기", done: false },
  { text: "앉았다 일어났다, 복근, 팔굽혀펴기 100회씩", done: false }
];

const events = [
  { date: "2026-11-25", text: "종프 휴강 ♥", time: "", color: "pink" },
  { date: "2026-11-26", text: "지수랑 점심 약속", time: "", color: "pink" },
  { date: "2026-11-26", text: "현혈하는 날", time: "", color: "blue" },
  { date: "2026-11-27", text: "강의실책상 원목나라 854-6688 에재고알아보고연락", time: "", color: "green" },
  { date: "2026-11-28", text: "Python 시험", time: "오전 7:00", color: "pink" }
];

let selectedMemo = null;
let weekOffset = 0;
const today = new Date();
let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const missionHistoryKey = "good-habits-mission-history";

function loadMissionHistory() {
  try {
    const savedHistory = localStorage.getItem(missionHistoryKey);
    if (!savedHistory) return {};

    const parsedHistory = JSON.parse(savedHistory);
    if (!parsedHistory || typeof parsedHistory !== "object" || Array.isArray(parsedHistory)) {
      throw new TypeError("Saved mission progress must be an object.");
    }

    return Object.fromEntries(
      Object.entries(parsedHistory).filter(([date, count]) =>
        /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isInteger(count) && count >= 0
      )
    );
  } catch (error) {
    console.error("Could not load daily mission progress.", error);
    return {};
  }
}

let missionHistory = loadMissionHistory();

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekStart(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function sameDate(first, second) {
  return dateKey(first) === dateKey(second);
}

function completedHabitCount() {
  return habits.filter(habit => habit.done).length;
}

function saveTodayMissionProgress() {
  missionHistory[dateKey(today)] = completedHabitCount();
  try {
    localStorage.setItem(missionHistoryKey, JSON.stringify(missionHistory));
  } catch (error) {
    console.error("Could not save daily mission progress.", error);
  }
}

if (!Object.hasOwn(missionHistory, dateKey(today))) {
  saveTodayMissionProgress();
}

// 퀵메모 렌더링
function renderMemos() {
  const list = $("#memoList");
  list.innerHTML = "";

  memos.forEach(memo => {
    const card = document.createElement("div");
    card.className = "memo-card";
    const text = document.createElement("span");
    text.className = "memo-text";
    text.textContent = memo.text;
    card.appendChild(text);
    card.addEventListener("click", () => openMemo(memo.id));
    list.appendChild(card);
  });

  const add = document.createElement("button");
  add.className = "memo-card add-card";
  add.textContent = "+";
  add.addEventListener("click", () => {
    $("#memoInput").focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  list.appendChild(add);
}

// 메모 추가
function addMemo() {
  const input = $("#memoInput");
  const text = input.value.trim();

  if (!text) {
    input.focus();
    return;
  }

  memos.unshift({
    id: Date.now(),
    text,
    date: "26.11.18",
    todo: false
  });

  input.value = "";
  renderMemos();
}

$("#addMemo").addEventListener("click", addCurrentPageItem);

$("#memoInput").addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  addCurrentPageItem();
});

$("#memoInput").addEventListener("focus", () => {
  if (window.location.hash === "#weekly") {
    $("#memoInput").placeholder = "예: 28일 카드값";
  } else if (window.location.hash === "#daily") {
    $("#memoInput").placeholder = "아침 일어나서 물 한 잔 마시기";
  }
});

$("#memoInput").addEventListener("input", () => {
  $("#memoInput").setCustomValidity("");
});

$("#memoInput").addEventListener("blur", () => {
  if ($("#memoInput").value) return;
  setInputPrompt(window.location.hash.slice(1));
});

function addCurrentPageItem() {
  const currentPage = window.location.hash.slice(1);
  if (currentPage === "daily") {
    addHabitFromInput();
  } else if (currentPage === "weekly") {
    addWeeklyEventFromInput();
  } else {
    addMemo();
  }
}

// 메모 상세 팝업
function openMemo(id) {
  selectedMemo = memos.find(m => m.id === id);
  if (!selectedMemo) return;

  $("#modalText").value = selectedMemo.text;
  $("#todoCheck").checked = selectedMemo.todo;
  $("#modalDate").textContent = selectedMemo.date + " 수";
  $("#memoModal").classList.add("open");
}

function closeMemo() {
  $("#memoModal").classList.remove("open");
  selectedMemo = null;
}

$("#closeModal").addEventListener("click", closeMemo);

$("#memoModal").addEventListener("click", e => {
  if (e.target === $("#memoModal")) closeMemo();
});

// 메모 저장
$("#saveMemo").addEventListener("click", () => {
  if (!selectedMemo) return;

  selectedMemo.text = $("#modalText").value.trim();
  selectedMemo.todo = $("#todoCheck").checked;

  renderMemos();
  closeMemo();
});

// 메모 삭제
$("#deleteMemo").addEventListener("click", () => {
  if (!selectedMemo) return;

  if (!confirm("메모를 삭제할까요?")) return;

  memos = memos.filter(m => m.id !== selectedMemo.id);
  renderMemos();
  closeMemo();
});

// 음성 플레이어 시각 효과 (실제 음성 재생은 미연결)
let audioPlaying = false;

$("#playAudio").addEventListener("click", () => {
  audioPlaying = !audioPlaying;
  $("#playAudio").textContent = audioPlaying ? "Ⅱ" : "▶";
  $("#audioProgress").style.width = audioPlaying ? "65%" : "25%";
});

// 데일리습관 렌더링
function renderHabits() {
  [
    { list: $("#habitList"), count: $("#progressCount") },
    { list: $("#dailyHabitList"), count: $("#dailyProgressCount") }
  ].forEach(({ list, count }) => {
    if (!list || !count) return;
    list.innerHTML = "";

    const visibleHabits = list.id === "habitList" ? habits.slice(0, 4) : habits;
    visibleHabits.forEach((habit, index) => {
      const item = document.createElement("label");
      item.className = `habit-item ${habit.done ? "done" : ""}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = habit.done;
      checkbox.addEventListener("change", () => {
        habits[index].done = checkbox.checked;
        saveTodayMissionProgress();
        renderHabits();
        renderMissionProgress();
      });

      const text = document.createElement("span");
      text.textContent = habit.text;
      item.append(checkbox, text);
      list.appendChild(item);
    });

    const completed = habits.filter(habit => habit.done).length;
    count.textContent = `${completed} / ${habits.length}`;
  });
}

function renderMissionProgress() {
  const grid = $("#missionProgressGrid");
  if (!grid) return;

  grid.innerHTML = "";
  const firstDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 34);

  for (let index = 0; index < 35; index++) {
    const date = new Date(firstDay);
    date.setDate(firstDay.getDate() + index);
    const key = dateKey(date);
    const completionCount = key === dateKey(today)
      ? completedHabitCount()
      : missionHistory[key] || 0;
    const level = Math.min(completionCount, 4);
    const cell = document.createElement("span");
    cell.className = `mission-day level-${level}`;
    cell.setAttribute(
      "aria-label",
      `${date.getMonth() + 1}월 ${date.getDate()}일, 습관 ${completionCount}개 완료`
    );
    grid.appendChild(cell);
  }

  document.querySelectorAll(".mission-medal").forEach(medal => {
    const threshold = Number(medal.dataset.reward);
    const earned = completedHabitCount() >= threshold;
    const image = medal.querySelector("img");
    if (!image.dataset.inactiveSrc) {
      image.dataset.inactiveSrc = image.getAttribute("src");
    }
    medal.classList.toggle("earned", earned);
    image.src = earned ? image.dataset.earnedSrc : image.dataset.inactiveSrc;
  });
  const trophy = $(".mission-trophy");
  const trophyEarned = completedHabitCount() >= 4;
  trophy.classList.toggle("earned", trophyEarned);
  trophy.querySelector("img").src = trophyEarned
    ? trophy.querySelector("img").dataset.earnedSrc
    : "img/trophy-grey.png";
}

// 습관 추가
function addHabit(text) {
  const habitText = text.trim();
  if (!habitText) return;
  habits.unshift({ text: habitText, done: false });
  renderHabits();
}

function addHabitFromInput() {
  const input = $("#memoInput");
  if (!input.value.trim()) {
    input.focus();
    return;
  }
  addHabit(input.value);
  input.value = "";
  input.placeholder = "습관 추가";
}

document.querySelectorAll(".add-habit").forEach(button => {
  button.addEventListener("click", () => {
    const text = prompt("새로운 습관을 입력하세요.");

    if (!text || !text.trim()) return;

    addHabit(text);
  });
});

// Weekly 달력
const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

function renderCalendar() {
  const calendar = $("#calendar");
  const eventArea = $("#calendarEvents");

  calendar.innerHTML = "";
  eventArea.innerHTML = "";

  const base = getWeekStart(today);
  base.setDate(base.getDate() + weekOffset * 7);

  for (let i = 0; i < 7; i++) {
    const date = new Date(base);
    date.setDate(base.getDate() + i);

    const day = document.createElement("div");
    day.className = "calendar-day";

    if (i === 0) day.classList.add("sunday");
    if (i === 6) day.classList.add("saturday");

    if (sameDate(date, today)) {
      day.classList.add("today");
    }

    day.innerHTML = `
      <div class="day-name">${dayNames[i]}</div>
      <span class="day-number">${date.getDate()}</span>
    `;

    calendar.appendChild(day);

    const column = document.createElement("div");
    column.className = "event-column";

    events.filter(event => event.date === dateKey(date)).forEach(event => {
      const chip = document.createElement("div");
      chip.className = `event-chip ${event.color}`;
      chip.textContent = event.text;
      column.appendChild(chip);
    });

    eventArea.appendChild(column);
  }

  $("#currentWeek").textContent =
    weekOffset === 0 ? "이번 주" : "다음 주";
}

function renderMonthCalendar() {
  const calendar = $("#monthCalendar");
  const monthLabel = $("#monthLabel");
  calendar.innerHTML = "";

  monthLabel.textContent = `${displayedMonth.getFullYear()}년 ${displayedMonth.getMonth() + 1}월`;

  const firstOfMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
  const lastOfMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
  const visibleDayCount = Math.ceil((firstOfMonth.getDay() + lastOfMonth.getDate()) / 7) * 7;

  for (let index = 0; index < visibleDayCount; index++) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = dateKey(date);
    const dayEvents = events.filter(event => event.date === key);
    const dayButton = document.createElement("button");
    dayButton.type = "button";
    dayButton.className = "month-day";
    dayButton.setAttribute("aria-label", `${date.getMonth() + 1}월 ${date.getDate()}일${dayEvents.length ? `, 일정 ${dayEvents.length}개` : ""}`);

    if (date.getMonth() !== displayedMonth.getMonth()) dayButton.classList.add("outside-month");
    if (sameDate(date, today)) dayButton.classList.add("today");
    if (sameDate(date, selectedDate)) dayButton.classList.add("selected");
    if (date.getDay() === 0) dayButton.classList.add("sunday");
    if (date.getDay() === 6) dayButton.classList.add("saturday");

    const number = document.createElement("span");
    number.className = "month-day-number";
    number.textContent = date.getDate();
    dayButton.appendChild(number);

    if (dayEvents.length) {
      const dot = document.createElement("span");
      dot.className = "month-event-dot";
      dot.setAttribute("aria-hidden", "true");
      dayButton.appendChild(dot);
    }

    dayButton.addEventListener("click", () => {
      selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      displayedMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      renderMonthCalendar();
      renderWeeklySchedule();
    });

    calendar.appendChild(dayButton);
  }
}

function renderWeeklySchedule() {
  const list = $("#weeklyScheduleList");
  const weekStart = getWeekStart(selectedDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekEvents = events
    .filter(event => {
      const date = new Date(`${event.date}T00:00:00`);
      return date >= weekStart && date <= weekEnd;
    })
    .sort((first, second) => first.date.localeCompare(second.date) || first.time.localeCompare(second.time));

  list.innerHTML = "";

  if (!weekEvents.length) {
    const empty = document.createElement("p");
    empty.className = "schedule-empty";
    empty.textContent = "등록된 일정이 없습니다";
    list.appendChild(empty);
    return;
  }

  weekEvents.forEach(event => {
    const [year, month, day] = event.date.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const item = document.createElement("article");
    item.className = "schedule-item";
    if (event.date < dateKey(today)) item.classList.add("past");

    const dateInfo = document.createElement("div");
    dateInfo.className = "schedule-date";
    const dateNumber = document.createElement("strong");
    dateNumber.textContent = `${month}.${String(day).padStart(2, "0")}`;
    const weekday = document.createElement("span");
    weekday.textContent = `${dayNames[date.getDay()]}요일`;
    dateInfo.append(dateNumber, weekday);

    const eventInfo = document.createElement("div");
    eventInfo.className = "schedule-info";
    const title = document.createElement("strong");
    title.textContent = event.text;
    eventInfo.appendChild(title);
    if (event.time) {
      const time = document.createElement("span");
      time.textContent = event.time;
      eventInfo.appendChild(time);
    }

    item.append(dateInfo, eventInfo);
    list.appendChild(item);
  });
}

function addWeeklyEventFromInput() {
  const input = $("#memoInput");
  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }

  const dateMatch = text.match(/(\d{1,2})일/);
  if (!dateMatch) {
    input.setCustomValidity("날짜를 포함해 입력해줘. 예: 28일 카드값");
    input.reportValidity();
    return;
  }

  const day = Number(dateMatch[1]);
  const eventDate = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), day);
  if (eventDate.getMonth() !== displayedMonth.getMonth()) {
    input.setCustomValidity("선택한 달에 있는 날짜를 입력해줘.");
    input.reportValidity();
    return;
  }

  const timeMatch = text.match(/(오전|오후)\s*(\d{1,2})(?::(\d{2})|시(?:\s*(\d{1,2})분?)?)/);
  const title = text
    .replace(dateMatch[0], "")
    .replace(timeMatch?.[0] || "", "")
    .replace(/[·,]/g, " ")
    .trim();

  if (!title) {
    input.setCustomValidity("일정 이름도 함께 입력해줘.");
    input.reportValidity();
    return;
  }

  const time = timeMatch
    ? `${timeMatch[1]} ${timeMatch[2]}:${timeMatch[3] || timeMatch[4] || "00"}`
    : "";
  events.push({
    date: dateKey(eventDate),
    text: title,
    time,
    color: "pink"
  });

  displayedMonth = new Date(eventDate.getFullYear(), eventDate.getMonth(), 1);
  selectedDate = eventDate;
  input.value = "";
  input.setCustomValidity("");
  renderCalendar();
  renderMonthCalendar();
  renderWeeklySchedule();
}

$("#prevMonth").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
  selectedDate = new Date(displayedMonth);
  renderMonthCalendar();
  renderWeeklySchedule();
});

$("#nextMonth").addEventListener("click", () => {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
  selectedDate = new Date(displayedMonth);
  renderMonthCalendar();
  renderWeeklySchedule();
});

$("#goToToday").addEventListener("click", () => {
  displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  renderMonthCalendar();
  renderWeeklySchedule();
});

$("#prevWeek").addEventListener("click", () => {
  weekOffset = 0;
  renderCalendar();
});

$("#nextWeek").addEventListener("click", () => {
  weekOffset = 1;
  renderCalendar();
});

$("#currentWeek").addEventListener("click", () => {
  weekOffset = weekOffset === 0 ? 1 : 0;
  renderCalendar();
});

// 해시 링크로 화면 전환
const pageIds = new Set(
  [...document.querySelectorAll(".page-panel")].map(panel => panel.dataset.page)
);

function showPage() {
  const requestedPage = window.location.hash.slice(1);
  const currentPage = pageIds.has(requestedPage) ? requestedPage : "home";
  $(".bottom-nav").dataset.page = currentPage;
  setInputPrompt(currentPage);
  $("#addMemo").setAttribute(
    "aria-label",
    currentPage === "daily" ? "습관 추가" : currentPage === "weekly" ? "일정 추가" : "메모 추가"
  );

  document.querySelectorAll(".page-panel").forEach(panel => {
    const isActive = panel.dataset.page === currentPage;
    panel.classList.toggle("active", isActive);
    panel.setAttribute("aria-hidden", String(!isActive));
  });

  document.querySelectorAll(".nav-item").forEach(item => {
    const isActive = item.getAttribute("href") === `#${currentPage}`;
    item.classList.toggle("active", isActive);
    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  window.scrollTo(0, 0);
}

function setInputPrompt(page) {
  const prompts = {
    home: "퀵메모 입력",
    weekly: "일정 추가하기",
    daily: "습관 추가",
    settings: "퀵메모 입력"
  };
  $("#memoInput").placeholder = prompts[page] || prompts.home;
}

document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", event => {
    event.preventDefault();
    window.history.pushState({}, "", item.getAttribute("href"));
    showPage();
  });
});

window.addEventListener("hashchange", showPage);
window.addEventListener("popstate", showPage);
showPage();

// 초기 실행
renderMemos();
renderHabits();
renderMissionProgress();
renderCalendar();
renderMonthCalendar();
renderWeeklySchedule();
