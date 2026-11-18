
const $ = (selector) => document.querySelector(selector);

// 초기 데이터
let memos = [
  { id: 1, text: "냉동실에 닭가슴살 버리기", date: "26.11.18", todo: false },
  { id: 2, text: "재환 -20,000\n은정 +30,000", date: "26.11.18", todo: false },
  { id: 3, text: "이마트\n샐러리\n굴\n감자\n카누\n김자반\n계란", date: "26.11.18", todo: false },
  { id: 4, text: "인류의 활동이\n지구환경을\n좌지우지하는\n새로운 지질시대인\n인류세로\n들어서고 있다는 주장", date: "26.11.18", todo: false }
];

let habits = [
  { text: "점심 먹고 30분 산책", done: true },
  { text: "하루 5,000원 이하로 쓰기", done: true },
  { text: "하루 책 20장 읽기", done: false },
  { text: "앉았다 일어났다, 복근, 팔굽혀펴기 100회씩", done: false }
];

const events = [
  { day: 3, text: "종표 휴강 ♥", color: "pink" },
  { day: 4, text: "지수랑 점심 약속", color: "pink" },
  { day: 4, text: "현혈하는 날", color: "blue" },
  { day: 5, text: "강의실책상 원목나라 854-6688 에재고알아보고연락 ...", color: "green" }
];

let selectedMemo = null;
let weekOffset = 0;

// 퀵메모 렌더링
function renderMemos() {
  const list = $("#memoList");
  list.innerHTML = "";

  memos.slice(0, 4).forEach(memo => {
    const card = document.createElement("div");
    card.className = "memo-card";
    card.textContent = memo.text;
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

$("#addMemo").addEventListener("click", addMemo);

$("#memoInput").addEventListener("keydown", e => {
  if (e.key === "Enter") addMemo();
});

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
  const list = $("#habitList");
  list.innerHTML = "";

  habits.slice(0, 4).forEach((habit, index) => {
    const item = document.createElement("label");
    item.className = `habit-item ${habit.done ? "done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = habit.done;

    checkbox.addEventListener("change", () => {
      habits[index].done = checkbox.checked;
      renderHabits();
    });

    const text = document.createElement("span");
    text.textContent = habit.text;

    item.append(checkbox, text);
    list.appendChild(item);
  });

  const completed = habits.filter(h => h.done).length;
  $("#progressCount").textContent = `${completed} / ${habits.length}`;
}

// 습관 추가
$("#addHabit").addEventListener("click", () => {
  const text = prompt("새로운 습관을 입력하세요.");

  if (!text || !text.trim()) return;

  habits.push({ text: text.trim(), done: false });
  renderHabits();
});

// Weekly 달력
const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

function renderCalendar() {
  const calendar = $("#calendar");
  const eventArea = $("#calendarEvents");

  calendar.innerHTML = "";
  eventArea.innerHTML = "";

  const today = new Date();
  const base = new Date(today);
  base.setDate(today.getDate() - today.getDay() + weekOffset * 7);

  const firstDay = new Date(base);
  const lastDay = new Date(base);
  lastDay.setDate(base.getDate() + 6);

  for (let i = 0; i < 7; i++) {
    const date = new Date(base);
    date.setDate(base.getDate() + i);

    const day = document.createElement("div");
    day.className = "calendar-day";

    if (i === 0) day.classList.add("sunday");
    if (i === 6) day.classList.add("saturday");

    if (
      date.toDateString() === today.toDateString()
    ) {
      day.classList.add("today");
    }

    day.innerHTML = `
      <div class="day-name">${dayNames[i]}</div>
      <span class="day-number">${date.getDate()}</span>
    `;

    calendar.appendChild(day);

    const column = document.createElement("div");
    column.className = "event-column";

    events.filter(event => event.day === i).forEach(event => {
      const chip = document.createElement("div");
      chip.className = `event-chip ${event.color}`;
      chip.textContent = event.text;
      column.appendChild(chip);
    });

    eventArea.appendChild(column);
  }

  $("#currentWeek").textContent =
    weekOffset === 0 ? "이번 주⌄" :
    weekOffset === -1 ? "지난 주⌄" :
    weekOffset === 1 ? "다음 주⌄" : "주간⌄";
}

$("#prevWeek").addEventListener("click", () => {
  weekOffset--;
  renderCalendar();
});

$("#nextWeek").addEventListener("click", () => {
  weekOffset++;
  renderCalendar();
});

$("#currentWeek").addEventListener("click", () => {
  weekOffset = 0;
  renderCalendar();
});

// 하단 메뉴
document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item")
      .forEach(nav => nav.classList.remove("active"));

    item.classList.add("active");

    const page = item.dataset.page;

    if (page === "weekly") {
      $("#weekly").scrollIntoView({ behavior: "smooth" });
    } else if (page === "daily") {
      $("#daily").scrollIntoView({ behavior: "smooth" });
    } else if (page === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (page === "settings") {
      alert("설정 화면은 준비 중입니다.");
    }
  });
});

// 초기 실행
renderMemos();
renderHabits();
renderCalendar();


