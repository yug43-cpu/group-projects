const T = [
  "Exercise",
  "Fajr Namaz",
  "Dhuhr Namaz",
  "Asr Namaz",
  "Maghrib Namaz",
  "Isha Namaz",
  "College",
  "Madrasa",
  "Self-study"
];

const N = T.length;

const $ = x => document.getElementById(x);

const today = new Date();

const data = JSON.parse(
  localStorage.getItem("protrackData") || "{}"
);

const settings = JSON.parse(
  localStorage.getItem("protrackSettings") ||
  '{"on":false,"time":"21:00"}'
);

today.setHours(0, 0, 0, 0);


let view = new Date(
  today.getFullYear(),
  today.getMonth(),
  1
);


/* DATE KEY */

const key = d => {
  const x = new Date(d);

  return (
    x.getFullYear() +
    "-" +
    String(x.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(x.getDate()).padStart(2, "0")
  );
};


/* GET DAY DATA */

const day = d => {
  return data[key(d)] || {
    tasks: {},
    goal: ""
  };
};


/* SAVE */

const save = () => {
  localStorage.setItem(
    "protrackData",
    JSON.stringify(data)
  );
};


/* PERFECT DAY */

const perfect = d => {
  return T.every(
    (_, i) => day(d).tasks?.[i]
  );
};


/* HAS ACTIVITY */

const active = d => {
  return (
    Object.keys(day(d).tasks || {}).length > 0 ||
    !!day(d).goal
  );
};


/* CURRENT STREAK */

function streak() {

  let d = new Date(today);
  let n = 0;

  if (!perfect(d)) {
    d.setDate(d.getDate() - 1);

    if (!perfect(d)) {
      return 0;
    }
  }

  while (perfect(d)) {

    n++;

    d.setDate(
      d.getDate() - 1
    );
  }

  return n;
}


/* BEST STREAK */

function best() {

  const ks = Object.keys(data).sort();

  let b = 0;
  let r = 0;
  let p = null;

  ks.forEach(k => {

    const d = new Date(
      k + "T00:00:00"
    );

    if (perfect(d)) {

      r =
        p &&
        (d - p) / 864e5 === 1
          ? r + 1
          : 1;

      b = Math.max(b, r);

      p = d;

    } else {

      p = null;

    }

  });

  return b;
}


/* TOTALS */

function totals() {

  let c = 0;
  let i = 0;

  Object.keys(data).forEach(k => {

    const d = new Date(
      k + "T00:00:00"
    );

    if (perfect(d)) {
      c++;
    } else if (active(d)) {
      i++;
    }

  });

  return [c, i];
}


/* RENDER MAIN PAGE */

function render() {

  let x = day(today);

  data[key(today)] = x;


  /* DATE */

  $("weekday").textContent =
    today
      .toLocaleDateString(undefined, {
        weekday: "long"
      })
      .toUpperCase();


  $("dateText").textContent =
    today.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });


  /* GOAL */

  $("goal").value =
    x.goal || "";


  /* TASKS */

  $("tasks").innerHTML = "";


  T.forEach((t, i) => {

    const e =
      document.createElement("div");

    e.className =
      "task " +
      (x.tasks?.[i] ? "done" : "");


    e.innerHTML = `
      <div class="dot"></div>

      <div>
        <b>${t}</b>

        <small>
          ${
            x.tasks?.[i]
              ? "Completed"
              : "Tap to complete"
          }
        </small>
      </div>
    `;


    e.onclick = () => {

      data[key(today)].tasks[i] =
        !data[key(today)].tasks[i];

      save();

      render();
    };


    $("tasks").appendChild(e);

  });


  /* PROGRESS */

  const n =
    T.filter(
      (_, i) => x.tasks?.[i]
    ).length;


  $("count").textContent =
    n + " / " + N + " complete";


  $("bar").style.width =
    n / N * 100 + "%";


  $("status").textContent =
    n === N
      ? "PERFECT DAY"
      : "Incomplete";


  /* STREAK */

  $("topStreak").textContent =
    streak();


  /* REMINDER */

  $("toggle").classList.toggle(
    "on",
    settings.on
  );


  $("rtime").value =
    settings.time;


  calendar();
  report();
}


/* CALENDAR */

function calendar() {

  const y = view.getFullYear();
  const m = view.getMonth();


  $("month").textContent =
    view.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric"
    });


  $("days").innerHTML = "";


  /* EMPTY DAYS BEFORE MONTH */

  const firstDay =
    new Date(y, m, 1).getDay();


  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    const e =
      document.createElement("div");

    e.className =
      "day empty";

    $("days").appendChild(e);
  }


  /* MONTH DAYS */

  const total =
    new Date(y, m + 1, 0).getDate();


  for (
    let n = 1;
    n <= total;
    n++
  ) {

    const d =
      new Date(y, m, n);


    const e =
      document.createElement("div");


    let classes = "day";


    if (perfect(d)) {
      classes += " perfect";
    } else if (active(d)) {
      classes += " incomplete";
    }


    if (d > today) {
      classes += " future";
    }


    if (key(d) === key(today)) {
      classes += " today";
    }


    e.className = classes;


    e.innerHTML =
      "<b>" + n + "</b>";


    $("days").appendChild(e);
  }
}


/* REPORT */

function report() {

  const [c, i] =
    totals();


  $("rc").textContent = c;
  $("ri").textContent = i;
  $("rs").textContent = streak();

  /* WEEKLY HISTORY */

  $("wr").innerHTML = "";


  const start =
    new Date(today);


  start.setDate(
    start.getDate() - 6
  );


  for (let j = 0; j < 7; j++) {

    const d =
      new Date(start);


    d.setDate(
      start.getDate() + j
    );


    const e =
      document.createElement("div");


    e.className = "wd";


    let circleClass = "";


    if (perfect(d)) {
      circleClass = "done";
    } else if (active(d)) {
      circleClass = "partial";
    }


    const icon =
      perfect(d)
        ? "✓"
        : d.getDate();


    e.innerHTML = `
      ${d.toLocaleDateString(
        undefined,
        { weekday: "short" }
      )}

      <div class="circle ${circleClass}">
        ${icon}
      </div>
    `;


    $("wr").appendChild(e);
  }


  /* WEEKLY COMPLETION CHART */

  const chart = $("weeklyChart");
  const svgNamespace = "http://www.w3.org/2000/svg";
  const chartDays = [];
  const chartLeft = 48;
  const chartRight = 680;
  const chartTop = 20;
  const chartBottom = 205;
  const chartHeight = chartBottom - chartTop;

  chart.replaceChildren();

  const addSvgElement = (name, attributes, text) => {
    const element = document.createElementNS(svgNamespace, name);

    Object.entries(attributes).forEach(([attribute, value]) => {
      element.setAttribute(attribute, value);
    });

    if (text !== undefined) {
      element.textContent = text;
    }

    chart.appendChild(element);
    return element;
  };

  for (let j = 0; j < 7; j++) {
    const date = new Date(start);
    date.setDate(start.getDate() + j);

    chartDays.push({
      date,
      completed: T.filter((_, index) => day(date).tasks?.[index]).length
    });
  }

  [0, 3, 6, 9].forEach(value => {
    const y = chartBottom - value / N * chartHeight;

    addSvgElement("line", {
      x1: chartLeft,
      y1: y,
      x2: chartRight,
      y2: y,
      class: "chart-grid"
    });

    addSvgElement("text", {
      x: chartLeft - 12,
      y: y + 4,
      class: "chart-axis-label",
      "text-anchor": "end"
    }, String(value));
  });

  const points = chartDays.map((item, index) => ({
    x: chartLeft + index * (chartRight - chartLeft) / 6,
    y: chartBottom - item.completed / N * chartHeight,
    ...item
  }));

  points.forEach((point, index) => {
    const next = points[index + 1];

    if (next && point.completed !== next.completed) {
      const rising = next.completed > point.completed;
      const line = addSvgElement("line", {
        x1: point.x,
        y1: point.y,
        x2: next.x,
        y2: next.y,
        class: rising ? "chart-segment increase" : "chart-segment decrease"
      });
      const length = Math.hypot(next.x - point.x, next.y - point.y);

      line.style.strokeDasharray = String(length);
      line.style.strokeDashoffset = String(length);
      line.style.animation = `draw-chart-line 520ms ease-out ${index * 65}ms forwards`;
    }

    const weekday = point.date.toLocaleDateString(undefined, {
      weekday: "short"
    });

    addSvgElement("text", {
      x: point.x,
      y: chartBottom + 28,
      class: "chart-axis-label",
      "text-anchor": "middle"
    }, weekday);
  });

  points.forEach((point, index) => {
    const previous = points[index - 1];
    const next = points[index + 1];
    const change = next && next.completed !== point.completed
      ? next.completed - point.completed
      : previous && previous.completed !== point.completed
        ? point.completed - previous.completed
        : 0;

    if (change !== 0) {
      const marker = addSvgElement("circle", {
        cx: point.x,
        cy: point.y,
        r: 4,
        class: change > 0 ? "chart-point increase" : "chart-point decrease"
      });
      const title = document.createElementNS(svgNamespace, "title");
      title.textContent = `${point.date.toLocaleDateString()}: ${point.completed}/${N} tasks completed`;
      marker.appendChild(title);
    }
  });


  /* DAILY HISTORY */

  const history = $("history");
  history.innerHTML = "";

  const historyKeys = Object.keys(data)
    .filter(k => active(new Date(k + "T00:00:00")))
    .sort((a, b) => b.localeCompare(a));

  if (historyKeys.length === 0) {
    const empty = document.createElement("p");
    empty.className = "note";
    empty.textContent = "No daily history yet.";
    history.appendChild(empty);
  }

  historyKeys.forEach((k, index) => {
    const record = data[k];
    const date = new Date(k + "T00:00:00");
    const completed = T.filter((_, i) => record.tasks?.[i]).length;
    const entry = document.createElement("details");
    entry.className = "history-entry";
    entry.open = index === 0;

    const summary = document.createElement("summary");
    summary.className = "history-summary";

    const dateLabel = document.createElement("b");
    dateLabel.textContent = date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    const progress = document.createElement("span");
    progress.className = "history-progress";
    progress.textContent = `${completed}/${N} tasks`;

    summary.append(dateLabel, progress);
    entry.appendChild(summary);

    const content = document.createElement("div");
    content.className = "history-content";

    const goal = document.createElement("p");
    goal.className = "history-goal";

    const goalLabel = document.createElement("b");
    goalLabel.textContent = "Daily goal: ";

    const goalText = document.createElement("span");
    goalText.textContent = record.goal || "No goal saved.";

    goal.append(goalLabel, goalText);
    content.appendChild(goal);

    const taskList = document.createElement("ul");
    taskList.className = "history-tasks";

    T.forEach((task, i) => {
      const item = document.createElement("li");
      const taskName = document.createElement("span");
      const taskStatus = document.createElement("span");
      const isComplete = !!record.tasks?.[i];

      item.className = isComplete ? "history-task done" : "history-task";
      taskName.textContent = task;
      taskStatus.className = "history-task-status";
      taskStatus.textContent = isComplete ? "Done" : "Not done";
      item.append(taskName, taskStatus);
      taskList.appendChild(item);
    });

    content.appendChild(taskList);
    entry.appendChild(content);
    history.appendChild(entry);
  });
}


/* VIEW SWITCHING */

function show(v) {

  ["day", "cal", "rep"].forEach(x => {

    $(x + "View")
      .classList.toggle(
        "active",
        x === v
      );

  });


  $("dayTab")
    .classList.toggle(
      "active",
      v === "day"
    );


  $("calTab")
    .classList.toggle(
      "active",
      v === "cal"
    );


  $("repTab")
    .classList.toggle(
      "active",
      v === "rep"
    );


  ["day", "cal", "rep"].forEach(x => {
    const tab = $(x + "Tab");

    if (x === v) {
      tab.setAttribute("aria-current", "page");
    } else {
      tab.removeAttribute("aria-current");
    }
  });
}


/* NAVIGATION */

$("dayTab").onclick =
  () => show("day");


$("calTab").onclick =
  () => show("cal");


$("repTab").onclick =
  () => show("rep");


/* PREVIOUS MONTH */

$("prev").onclick = () => {

  view.setMonth(
    view.getMonth() - 1
  );

  calendar();
};


/* NEXT MONTH */

$("next").onclick = () => {

  view.setMonth(
    view.getMonth() + 1
  );

  calendar();
};


/* SAVE DAILY GOAL */

$("saveGoal").onclick = () => {

  data[key(today)].goal =
    $("goal").value.trim();


  save();


  $("saved").textContent =
    " Saved";


  setTimeout(() => {

    $("saved").textContent =
      "";

  }, 1200);


  render();
};


/* REMINDER TOGGLE */

$("toggle").onclick =
  async () => {

    settings.on =
      !settings.on;


    if (
      settings.on &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {

      await Notification.requestPermission();

    }


    localStorage.setItem(
      "protrackSettings",
      JSON.stringify(settings)
    );


    render();
  };


/* REMINDER TIME */

$("rtime").onchange =
  e => {

    settings.time =
      e.target.value;


    localStorage.setItem(
      "protrackSettings",
      JSON.stringify(settings)
    );

  };


/* DAILY NOTIFICATION */

setInterval(() => {

  if (
    settings.on &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {

    const n = new Date();


    const hm =
      String(n.getHours()).padStart(2, "0") +
      ":" +
      String(n.getMinutes()).padStart(2, "0");


    if (
      hm === settings.time &&
      n.getSeconds() < 10 &&
      !perfect(today)
    ) {

      new Notification(
        "ProTrack reminder",
        {
          body:
            "Complete today's routine and protect your streak."
        }
      );

    }

  }

}, 10000);


/* SERVICE WORKER */

if ("serviceWorker" in navigator) {

  navigator.serviceWorker.register(
    "sw.js"
  );

}


/* INITIAL LOAD */

render();
