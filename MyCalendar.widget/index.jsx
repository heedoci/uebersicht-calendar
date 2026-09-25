import { run } from "uebersicht";

const BASE = "$HOME/Library/Application Support/Übersicht/widgets/MyCalendar.widget";
const PY = 'python3 "' + BASE + '/calendar_data.py"';
const CONFIG = 'open -e "$HOME/Library/Application Support/MyCalendarWidget/config.json"';

export const command = PY + " fetch";
export const refreshFrequency = 15 * 60 * 1000;

export const initialState = {
  data: null,
  loading: true,
  hoverKey: null,
  widgetLeft: 18,
  widgetTop: 18,
  positionLoaded: false,
};

const parseOutput = output => {
  try { return JSON.parse(output || "{}"); }
  catch (e) { return { ok: false, error: String(e), events: [] }; }
};

const defaultRightPosition = () => {
  const margin = 18;
  const width = 690;
  const viewport = Math.max(window.innerWidth || 0, width + margin * 2);
  return { left: Math.max(margin, viewport - width - margin), top: margin };
};

const applyData = (prev, parsed) => {
  if (prev.positionLoaded) return { ...prev, data: parsed, loading: false };
  const p = parsed && parsed.widgetPosition ? parsed.widgetPosition : {};
  const fallback = defaultRightPosition();
  return {
    ...prev,
    data: parsed,
    loading: false,
    widgetLeft: p.saved ? Math.max(0, Number(p.left) || fallback.left) : fallback.left,
    widgetTop: p.saved ? Math.max(0, Number(p.top) || fallback.top) : fallback.top,
    positionLoaded: true,
  };
};

export const updateState = (event, previousState) => {
  const prev = previousState || initialState;
  if (event.type === "LOADING") return { ...prev, loading: true };
  if (event.type === "DATA_UPDATED") return applyData(prev, parseOutput(event.output));
  if (event.type === "HOVER") return { ...prev, hoverKey: event.key };
  if (event.type === "LEAVE") return { ...prev, hoverKey: null };
  if (event.type === "POSITION") return { ...prev, widgetLeft: event.left, widgetTop: event.top, positionLoaded: true };
  if (event.type === "RESET") {
    const p = defaultRightPosition();
    return { ...prev, widgetLeft: p.left, widgetTop: p.top, positionLoaded: true };
  }
  if (Object.prototype.hasOwnProperty.call(event, "output")) return applyData(prev, parseOutput(event.output));
  return prev;
};

export const className = [
  "top:0",
  "left:0",
  "width:690px",
  "color:rgba(255,255,255,.96)",
  "font-family:-apple-system,BlinkMacSystemFont,Apple SD Gothic Neo,Pretendard,sans-serif",
  "user-select:none",
  "*{box-sizing:border-box}",
  ".widget{position:relative;background:transparent;text-shadow:0 1px 2px rgba(0,0,0,.98),0 0 7px rgba(0,0,0,.62);will-change:transform}",
  ".header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 8px 8px;padding:4px 2px;cursor:grab}",
  ".header.dragging{cursor:grabbing}",
  ".left,.actions,.nav{display:flex;align-items:center}.left{gap:10px}.actions{gap:6px}.nav{gap:7px}",
  ".title{font-size:16px;font-weight:820}.status{font-size:9px;color:rgba(255,255,255,.62)}",
  "button{pointer-events:auto;border:0;outline:0;appearance:none;cursor:pointer;font:inherit;color:inherit}",
  ".btn{min-height:27px;padding:0 9px;border-radius:8px;background:rgba(12,16,22,.22);border:1px solid rgba(255,255,255,.08);font-size:10px;font-weight:680}",
  ".btn:hover{background:rgba(30,38,50,.44)}.icon{min-width:28px;padding:0 7px;font-size:14px}",
  ".month{min-width:105px;text-align:center;font-size:15px;font-weight:800}",
  ".shell{margin:0 8px;border:1px solid rgba(255,255,255,.15);border-radius:17px;background:rgba(12,16,22,.20);overflow:visible;box-shadow:0 12px 34px rgba(0,0,0,.16)}",
  ".weekdays,.grid{display:grid;grid-template-columns:repeat(7,1fr)}",
  ".weekdays{padding:0 7px;border-bottom:1px solid rgba(255,255,255,.10)}",
  ".weekday{padding:8px 4px 7px;text-align:center;font-size:9.5px;font-weight:780;color:rgba(255,255,255,.72)}",
  ".sat{color:rgba(112,171,255,.94)}.sun{color:rgba(255,105,105,.94)}",
  ".grid{padding:6px 7px 8px}",
  ".day{position:relative;min-height:78px;padding:5px;border-right:1px solid rgba(255,255,255,.055);border-bottom:1px solid rgba(255,255,255,.055)}",
  ".day:nth-child(7n){border-right:none}.day:hover{background:rgba(255,255,255,.025)}.outside{opacity:.32}",
  ".dayhead{display:flex;align-items:center;justify-content:space-between;height:19px;margin-bottom:3px}",
  ".date{width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;font-size:10.5px;font-weight:760}",
  ".today .date{background:rgba(61,120,255,.98);color:white}",
  ".count{font-size:8px;color:rgba(255,255,255,.30)}",
  ".event{pointer-events:auto;display:flex;align-items:center;min-width:0;height:16px;gap:4px;padding:0 3px;margin-bottom:1px;border-radius:4px;color:rgba(255,255,255,.92);font-size:9px;line-height:16px;text-decoration:none}",
  ".event:hover{background:rgba(255,255,255,.07)}.bar{width:3px;height:11px;border-radius:99px;flex:0 0 auto}.etitle{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.etime{font-size:7.5px;color:rgba(255,255,255,.46)}",
  ".more{padding-left:8px;color:rgba(255,255,255,.38);font-size:8px}",
  ".popup{pointer-events:auto;position:absolute;z-index:9999;width:350px;max-height:410px;display:flex;flex-direction:column;overflow:hidden;padding:12px 9px 10px 13px;border-radius:15px;background:rgba(16,20,27,.94);border:1px solid rgba(255,255,255,.13);box-shadow:0 18px 48px rgba(0,0,0,.43)}",
  ".dr{left:6px;top:calc(100% + 6px)}.dl{right:6px;top:calc(100% + 6px)}.ur{left:6px;bottom:calc(100% + 6px)}.ul{right:6px;bottom:calc(100% + 6px)}",
  ".phead{display:flex;justify-content:space-between;margin-bottom:6px}.ptitle{font-size:12px;font-weight:800}.pcount{font-size:8.5px;color:rgba(255,255,255,.42)}",
  ".plist{min-height:0;overflow-y:auto}.pevent{pointer-events:auto;display:block;padding:8px 5px;border-top:1px solid rgba(255,255,255,.07);color:rgba(255,255,255,.92);text-decoration:none}.pevent:first-child{border-top:none}",
  ".prow{display:flex;align-items:center;gap:6px}.dot{width:7px;height:7px;border-radius:50%}.petitle{flex:1;font-size:10.5px;font-weight:730}.petime{font-size:8.5px;color:rgba(255,255,255,.55)}.meta{padding-left:13px;margin-top:3px;font-size:8px;color:rgba(255,255,255,.42)}",
  ".legend{display:flex;flex-wrap:wrap;gap:7px 11px;margin:7px 11px 0;font-size:8px;color:rgba(255,255,255,.60)}.li{display:flex;align-items:center;gap:4px}.ldot{width:6px;height:6px;border-radius:50%}",
  ".error{margin:0 8px;padding:14px;border-radius:14px;background:rgba(20,24,31,.82);font-size:10px}"
].join(";");

const COLORS = ["#58a6ff","#39d0a2","#b38cff","#ffb24d","#ff7597","#62d3e8","#f57b5f","#91c95b"];
const colorFor = name => {
  let h = 0;
  String(name || "").split("").forEach(ch => { h = ((h << 5) - h + ch.charCodeAt(0)) | 0; });
  return COLORS[Math.abs(h) % COLORS.length];
};
const pad = n => String(n).padStart(2, "0");
const keyOf = (y,m,d) => y + "-" + pad(m) + "-" + pad(d);
const timeOf = iso => {
  const m = String(iso || "").match(/T(\d{2}:\d{2})/);
  return m ? m[1] : "";
};
const shift = (y,m,delta) => {
  const d = new Date(y, m - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
};
const loadMonth = (dispatch,y,m) => {
  dispatch({ type:"LOADING" });
  run(PY + " fetch " + y + " " + m).then(output => dispatch({ type:"DATA_UPDATED", output }));
};
const openCalendar = e => {
  e.preventDefault();
  e.stopPropagation();
  run("open -a Calendar");
};
const interactive = target => Boolean(target && target.closest && target.closest("button,a,[data-no-drag=true]"));

const beginDrag = (e,dispatch,left,top) => {
  if (e.button !== 0 || interactive(e.target)) return;
  const handle = e.currentTarget;
  const panel = handle.closest(".widget");
  const rect = panel.getBoundingClientRect();
  const sx = e.clientX, sy = e.clientY, sl = Number(left) || 18, st = Number(top) || 18;
  let last = { left:sl, top:st };
  handle.classList.add("dragging");
  const move = ev => {
    const margin = 18;
    const maxLeft = Math.max(margin, (window.innerWidth || 0) - rect.width - margin);
    const maxTop = Math.max(margin, (window.innerHeight || 0) - rect.height - margin);
    last.left = Math.min(Math.max(sl + ev.clientX - sx, margin), maxLeft);
    last.top = Math.min(Math.max(st + ev.clientY - sy, margin), maxTop);
    panel.style.transform = "translate3d(" + last.left + "px," + last.top + "px,0)";
  };
  const up = () => {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
    handle.classList.remove("dragging");
    dispatch({ type:"POSITION", left:Math.round(last.left), top:Math.round(last.top) });
    run(PY + " save-position " + Math.round(last.left) + " " + Math.round(last.top));
  };
  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);
};

export const render = (props,dispatch) => {
  const s = props || initialState;
  if (!s.data) return <div className="widget"><div className="error">캘린더 로딩 중…</div></div>;
  const data = s.data;
  if (!data.ok) return <div className="widget"><div className="error">{data.error}</div></div>;

  const year = data.year, month = data.month;
  const events = Array.isArray(data.events) ? data.events : [];
  const maxVisible = Number(data.maxEventsPerDay) || 3;
  const now = new Date();
  const first = new Date(year, month - 1, 1);
  const leading = (first.getDay() + 6) % 7;
  const last = new Date(year, month, 0).getDate();
  const byDay = {};
  events.forEach(ev => (ev.days || []).forEach(k => { (byDay[k] || (byDay[k] = [])).push(ev); }));

  const cells = [];
  const prev = shift(year,month,-1);
  const prevLast = new Date(prev.year,prev.month,0).getDate();
  for (let i=0;i<leading;i++) cells.push({year:prev.year,month:prev.month,day:prevLast-leading+i+1,outside:true});
  for (let d=1;d<=last;d++) cells.push({year,month,day:d,outside:false});
  const next = shift(year,month,1);
  let nd = 1;
  while (cells.length % 7) cells.push({year:next.year,month:next.month,day:nd++,outside:true});

  const weekdays = ["월","화","수","목","금","토","일"];
  const rows = cells.length / 7;
  const current = year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <div className="widget" style={{transform:"translate3d(" + s.widgetLeft + "px," + s.widgetTop + "px,0)"}}>
      <div className="header"
        onMouseDown={e => beginDrag(e,dispatch,s.widgetLeft,s.widgetTop)}
        onDoubleClick={() => {
          const p = defaultRightPosition();
          dispatch({type:"RESET"});
          run(PY + " save-position " + p.left + " " + p.top);
        }}>
        <div className="left"><div className="title">내 캘린더</div><div className="status">{data.count}개 일정</div></div>
        <div className="actions" data-no-drag="true">
          <div className="nav">
            <button className="btn icon" onClick={() => { const p=shift(year,month,-1); loadMonth(dispatch,p.year,p.month); }}>‹</button>
            <div className="month">{year}.{pad(month)}</div>
            <button className="btn icon" onClick={() => { const p=shift(year,month,1); loadMonth(dispatch,p.year,p.month); }}>›</button>
            <button className="btn" disabled={current} onClick={() => loadMonth(dispatch,now.getFullYear(),now.getMonth()+1)}>이번 달</button>
          </div>
          <button className="btn" onClick={() => run(CONFIG)}>⚙︎</button>
          <button className="btn icon" onClick={() => loadMonth(dispatch,year,month)}>↻</button>
        </div>
      </div>

      <div className="shell">
        <div className="weekdays">
          {weekdays.map((w,i) => <div className={"weekday " + (i===5?"sat ":"") + (i===6?"sun":"")} key={w}>{w}</div>)}
        </div>
        <div className="grid">
          {cells.map((cell,idx) => {
            const key = keyOf(cell.year,cell.month,cell.day);
            const list = byDay[key] || [];
            const visible = list.slice(0,maxVisible);
            const col = idx % 7, row = Math.floor(idx/7);
            const popupClass = row >= rows-2 ? (col>=4?"ul":"ur") : (col>=4?"dl":"dr");
            const today = cell.year===now.getFullYear() && cell.month===now.getMonth()+1 && cell.day===now.getDate();
            const hovered = s.hoverKey===key && list.length>0;
            return <div className={"day " + (cell.outside?"outside ":"") + (today?"today":"")} key={key}
              onMouseEnter={() => list.length && dispatch({type:"HOVER",key})}
              onMouseLeave={() => hovered && dispatch({type:"LEAVE"})}>
              <div className="dayhead"><span className="date">{cell.day}</span>{list.length?<span className="count">{list.length}</span>:null}</div>
              {visible.map((ev,i) => <a href="#" className="event" data-no-drag="true" onClick={openCalendar} key={key+"-"+i}>
                <span className="bar" style={{background:colorFor(ev.calendar)}}></span>
                <span className="etitle">{ev.title}</span>
                {!ev.allDay?<span className="etime">{timeOf(ev.start)}</span>:null}
              </a>)}
              {list.length>maxVisible?<div className="more">+{list.length-maxVisible}</div>:null}
              {hovered?<div className={"popup "+popupClass}>
                <div className="phead"><div className="ptitle">{cell.month}월 {cell.day}일</div><div className="pcount">{list.length}개 일정</div></div>
                <div className="plist">
                  {list.map((ev,i) => <a href="#" className="pevent" onClick={openCalendar} key={"p-"+key+"-"+i}>
                    <div className="prow"><span className="dot" style={{background:colorFor(ev.calendar)}}></span><span className="petitle">{ev.title}</span><span className="petime">{ev.allDay?"종일":timeOf(ev.start)}</span></div>
                    <div className="meta">{ev.calendar}{ev.location?" · "+ev.location:""}</div>
                  </a>)}
                </div>
              </div>:null}
            </div>;
          })}
        </div>
      </div>

      <div className="legend">
        {(data.calendars || []).map(name => <span className="li" key={name}><span className="ldot" style={{background:colorFor(name)}}></span>{name}</span>)}
      </div>
    </div>
  );
};
