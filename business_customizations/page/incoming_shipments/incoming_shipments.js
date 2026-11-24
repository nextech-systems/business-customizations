frappe.pages['incoming-shipments'].on_page_load = function(wrapper) {
  frappe.ui.make_app_page({
    parent: wrapper,
    title: 'Incoming Shipments',
    single_column: true
  });

  var html = `<!-- Incoming Shipments Dashboard -->
<!-- ERPNext Custom Page Format                        -->
<!-- Paste this entire file into:                      -->
<!--   ERPNext → Page → New Page → Script/Content tab  -->

<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">

<style>
/* ── RESET & ROOT ── */
#mc-dashboard *, #mc-dashboard *::before, #mc-dashboard *::after { box-sizing: border-box; margin: 0; padding: 0; }

#mc-dashboard {
  --blue:       #172e57;
  --blue-md:    #1e3d6e;
  --blue-lt:    #e8edf5;
  --red:        #cf0000;
  --white:      #ffffff;
  --border:     #dde2ea;
  --text:       #1a1a2e;
  --muted:      #6b7280;
  --success:    #0e6b42;
  --success-bg: #e6f5ef;
  --warn:       #92540a;
  --warn-bg:    #fff4e5;
  --danger:     #9b1717;
  --danger-bg:  #fdf0f0;
  --info:       #1a4d8f;
  --info-bg:    #e8edf5;
  --grey-lt:    #f4f4f5;
  --shadow:     0 1px 4px rgba(23,46,87,.08), 0 4px 16px rgba(23,46,87,.06);
  --shadow-md:  0 4px 20px rgba(23,46,87,.13);
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: var(--text);
  background: #f0f3f8;
  padding: 24px;
  min-height: 100vh;
}

/* ── TOPBAR ── */
.mc-topbar {
  background: var(--blue); border-radius: 12px; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
  height: 58px; margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(23,46,87,.25);
}
.mc-topbar-left  { display: flex; align-items: center; gap: 14px; }
.mc-topbar-divider { width: 1px; height: 20px; background: rgba(255,255,255,.25); }
.mc-page-title  { font-size: 12px; font-weight: 600; color: rgba(255,255,255,.65); letter-spacing: .4px; text-transform: uppercase; }
.mc-topbar-right { display: flex; align-items: center; gap: 10px; }
.mc-badge-live  { background: #0e6b42; color: #fff; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 3px 9px; border-radius: 20px; }
.mc-badge-demo  { background: #92540a; color: #fff; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 3px 9px; border-radius: 20px; }
.mc-updated     { font-size: 11px; color: rgba(255,255,255,.45); }

/* ── SETTINGS TRIGGER ── */
.mc-settings-btn {
  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
  color: #fff; border-radius: 7px; padding: 5px 12px;
  font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 600;
  cursor: pointer; transition: background .15s;
}
.mc-settings-btn:hover { background: rgba(255,255,255,.2); }

/* ── STATS ── */
.mc-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 22px; }
.mc-stat {
  background: var(--white); border-radius: 12px; padding: 18px 20px;
  box-shadow: var(--shadow); border-left: 4px solid transparent; position: relative; overflow: hidden;
}
.mc-stat::after { content:''; position:absolute; right:-8px; top:-8px; width:54px; height:54px; border-radius:50%; background:currentColor; opacity:.05; }
.mc-stat.total     { border-color: var(--blue);    color: var(--blue); }
.mc-stat.intransit { border-color: #1a4d8f;        color: #1a4d8f; }
.mc-stat.overdue   { border-color: var(--red);     color: var(--red); }
.mc-stat.clearing  { border-color: #92540a;        color: #92540a; }
.mc-stat.received  { border-color: var(--success); color: var(--success); }
.mc-stat-label { font-size: 10px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: var(--muted); margin-bottom: 7px; }
.mc-stat-val   { font-size: 26px; font-weight: 800; line-height: 1; margin-bottom: 3px; }
.mc-stat-sub   { font-size: 11px; color: var(--muted); font-weight: 500; }

/* ── TOOLBAR ── */
.mc-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.mc-toolbar-left { display: flex; align-items: center; gap: 8px; flex: 1; flex-wrap: wrap; }
.mc-search {
  display: flex; align-items: center; background: var(--white);
  border: 1px solid var(--border); border-radius: 8px;
  padding: 0 12px; height: 36px; gap: 7px; min-width: 240px;
}
.mc-search:focus-within { border-color: var(--blue); }
.mc-search input { border: none; outline: none; font-family: 'Montserrat', sans-serif; font-size: 12.5px; color: var(--text); background: transparent; width: 100%; }
.mc-select {
  height: 36px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px;
  background: var(--white); font-family: 'Montserrat', sans-serif;
  font-size: 12px; font-weight: 500; color: var(--text); cursor: pointer; outline: none;
}
.mc-select:focus { border-color: var(--blue); }
.mc-btn {
  display: inline-flex; align-items: center; gap: 5px; height: 36px; padding: 0 14px;
  border-radius: 8px; font-family: 'Montserrat', sans-serif; font-size: 11.5px; font-weight: 600;
  cursor: pointer; border: 1px solid transparent; transition: all .15s; white-space: nowrap;
}
.mc-btn-primary { background: var(--blue); color: #fff; }
.mc-btn-primary:hover { background: var(--blue-md); }
.mc-btn-outline { background: var(--white); color: var(--blue); border-color: var(--border); }
.mc-btn-outline:hover { border-color: var(--blue); background: var(--blue-lt); }
.mc-view-toggle { display: flex; background: var(--white); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.mc-view-btn { height: 36px; padding: 0 13px; border: none; background: transparent; font-family: 'Montserrat', sans-serif; font-size: 11.5px; font-weight: 600; cursor: pointer; color: var(--muted); transition: all .15s; }
.mc-view-btn.active { background: var(--blue); color: #fff; }

/* ── TABLE ── */
.mc-table-card { background: var(--white); border-radius: 12px; box-shadow: var(--shadow); overflow: hidden; }
.mc-table-hdr  { padding: 14px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.mc-table-title { font-size: 13.5px; font-weight: 700; color: var(--blue); }
.mc-row-count   { font-size: 12px; color: var(--muted); font-weight: 500; }
.mc-table-scroll { overflow-x: auto; }
.mc-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.mc-table thead tr { background: #f8f9fb; border-bottom: 1.5px solid var(--border); }
.mc-table th { padding: 10px 13px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: .7px; text-transform: uppercase; color: var(--blue); white-space: nowrap; cursor: pointer; user-select: none; }
.mc-table th:hover { background: var(--blue-lt); }
.mc-table th.sort-asc::after  { content: ' ▲'; font-size: 8px; }
.mc-table th.sort-desc::after { content: ' ▼'; font-size: 8px; }
.mc-table tbody tr { border-bottom: 1px solid #f0f2f6; transition: background .1s; }
.mc-table tbody tr:last-child { border-bottom: none; }
.mc-table tbody tr:hover { background: #f7f9fc; }
.mc-table td { padding: 10px 13px; vertical-align: middle; white-space: nowrap; }

/* ── KANBAN ── */
.mc-kanban-wrap  { display: none; }
.mc-kanban-wrap.active { display: block; }
.mc-list-wrap.hidden   { display: none; }
.mc-kanban-board { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 16px; align-items: flex-start; }
.mc-kanban-col { min-width: 270px; max-width: 290px; flex-shrink: 0; background: #f0f3f8; border-radius: 12px; overflow: hidden; }
.mc-kanban-col-hdr { padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; }
.mc-col-count { background: rgba(255,255,255,.5); border-radius: 20px; padding: 2px 8px; font-size: 10px; }
.mc-kanban-cards { padding: 0 9px 9px; display: flex; flex-direction: column; gap: 9px; min-height: 50px; }
.mc-kcard {
  background: var(--white); border-radius: 9px; padding: 13px;
  box-shadow: var(--shadow); cursor: pointer; transition: transform .12s, box-shadow .12s;
  border-left: 3px solid transparent;
}
.mc-kcard:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.mc-kc-po   { font-size: 10.5px; font-weight: 700; color: var(--blue); font-family: 'DM Mono', monospace; margin-bottom: 3px; }
.mc-kc-supp { font-size: 12px; font-weight: 600; margin-bottom: 2px; }
.mc-kc-prod { font-size: 10.5px; color: var(--muted); margin-bottom: 7px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 230px; }
.mc-kc-row  { display: flex; align-items: center; justify-content: space-between; margin-top: 7px; }
.mc-kc-val  { font-size: 11.5px; font-weight: 700; color: var(--blue); }
.mc-kc-days { font-size: 10.5px; font-weight: 600; }
.mc-kc-note { font-size: 10px; color: var(--red); margin-top: 5px; font-weight: 600; }
.mc-kc-trk  { font-size: 9.5px; color: var(--muted); font-family: 'DM Mono', monospace; margin-top: 3px; }

/* Kanban column colours */
.mc-col-ordered  .mc-kanban-col-hdr { background: #e2e8f0; color: #475569; }
.mc-col-enroute  .mc-kanban-col-hdr { background: var(--info-bg); color: var(--info); }
.mc-col-overland .mc-kanban-col-hdr { background: #eaf4e6; color: #256018; }
.mc-col-customs  .mc-kanban-col-hdr { background: var(--warn-bg); color: var(--warn); }
.mc-col-partrcv  .mc-kanban-col-hdr { background: #fff4e5; color: #7a440a; }
.mc-col-delayed  .mc-kanban-col-hdr { background: var(--danger-bg); color: var(--danger); }
.mc-col-ordered  .mc-kcard { border-color: #94a3b8; }
.mc-col-enroute  .mc-kcard { border-color: #1a4d8f; }
.mc-col-overland .mc-kcard { border-color: #256018; }
.mc-col-customs  .mc-kcard { border-color: #92540a; }
.mc-col-partrcv  .mc-kcard { border-color: #7a440a; }
.mc-col-delayed  .mc-kcard { border-color: var(--danger); }

/* ── RECEIVED FLOATING TAB ── */
.mc-rcv-tab {
  position: fixed; left: 0; top: 50%; transform: translateY(-50%);
  z-index: 150; writing-mode: vertical-rl;
  background: var(--success); color: #fff;
  padding: 16px 9px; border-radius: 0 9px 9px 0;
  font-size: 10.5px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase;
  cursor: pointer; box-shadow: 2px 0 12px rgba(14,107,66,.3);
  transition: padding .15s; display: none; align-items: center; gap: 7px; user-select: none;
}
.mc-rcv-tab.visible { display: flex; }
.mc-rcv-tab:hover { padding-left: 13px; }
.mc-rcv-count { background: rgba(255,255,255,.25); border-radius: 20px; padding: 2px 6px; font-size: 9.5px; font-weight: 800; writing-mode: horizontal-tb; }

/* ── RECEIVED DRAWER ── */
.mc-drawer-overlay { position: fixed; inset: 0; background: rgba(23,46,87,.35); z-index: 300; display: none; }
.mc-drawer-overlay.open { display: block; }
.mc-drawer {
  position: fixed; left: 0; top: 0; bottom: 0; width: 340px;
  background: var(--white); z-index: 301;
  box-shadow: 4px 0 28px rgba(14,107,66,.12);
  transform: translateX(-100%); transition: transform .22s ease;
  display: flex; flex-direction: column;
}
.mc-drawer.open { transform: translateX(0); }
.mc-drawer-hdr { background: var(--success); padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; }
.mc-drawer-title { font-size: 13px; font-weight: 700; color: #fff; }
.mc-drawer-body { padding: 14px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 9px; }

/* ── ALERT POPUP ── */
.mc-alert-overlay {
  position: fixed; inset: 0; background: rgba(23,46,87,.6); z-index: 700;
  display: flex; align-items: center; justify-content: center; padding: 20px;
  opacity: 0; pointer-events: none; transition: opacity .22s;
}
.mc-alert-overlay.open { opacity: 1; pointer-events: all; }
.mc-alert-modal {
  background: var(--white); border-radius: 16px; width: 100%; max-width: 560px;
  box-shadow: 0 24px 70px rgba(23,46,87,.28); overflow: hidden;
  transform: scale(.96) translateY(10px); transition: transform .22s;
}
.mc-alert-overlay.open .mc-alert-modal { transform: scale(1) translateY(0); }
.mc-alert-hdr { background: linear-gradient(135deg,#9b1717,#cf0000); padding: 20px 24px; display: flex; align-items: center; gap: 13px; }
.mc-alert-icon { font-size: 26px; }
.mc-alert-title { font-size: 16px; font-weight: 800; color: #fff; }
.mc-alert-sub   { font-size: 11.5px; color: rgba(255,255,255,.75); margin-top: 2px; font-weight: 500; }
.mc-alert-body  { padding: 18px 22px; max-height: 52vh; overflow-y: auto; }
.mc-alert-section { font-size: 9.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); margin: 0 0 9px; padding-bottom: 5px; border-bottom: 1px solid var(--border); }
.mc-alert-item { display: flex; align-items: flex-start; gap: 11px; padding: 10px 12px; border-radius: 9px; margin-bottom: 7px; border-left: 3px solid transparent; }
.mc-alert-item.overdue   { background: var(--danger-bg); border-color: var(--danger); }
.mc-alert-item.due-today { background: var(--warn-bg);   border-color: #f59e0b; }
.mc-alert-item.due-soon  { background: #fff8e1;          border-color: #d4a017; }
.mc-alert-item-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.mc-ai-po   { font-size: 10.5px; font-weight: 700; color: var(--blue); font-family: 'DM Mono', monospace; }
.mc-ai-supp { font-size: 12.5px; font-weight: 600; }
.mc-ai-det  { font-size: 11px; color: var(--muted); margin-top: 2px; }
.mc-alert-footer { padding: 14px 22px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.mc-noshow { display: flex; align-items: center; gap: 7px; font-size: 11.5px; color: var(--muted); cursor: pointer; }

/* ── EDIT MODAL ── */
.mc-modal-overlay {
  position: fixed; inset: 0; background: rgba(23,46,87,.55); z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 20px;
  opacity: 0; pointer-events: none; transition: opacity .18s;
}
.mc-modal-overlay.open { opacity: 1; pointer-events: all; }
.mc-modal {
  background: var(--white); border-radius: 14px; width: 100%; max-width: 600px;
  box-shadow: 0 20px 55px rgba(23,46,87,.22); overflow: hidden;
  transform: translateY(18px); transition: transform .18s;
}
.mc-modal-overlay.open .mc-modal { transform: translateY(0); }
.mc-modal-hdr { background: var(--blue); padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; }
.mc-modal-title { font-size: 14px; font-weight: 700; color: #fff; }
.mc-modal-close { background: none; border: none; color: rgba(255,255,255,.6); font-size: 20px; cursor: pointer; line-height: 1; }
.mc-modal-close:hover { color: #fff; }
.mc-modal-body { padding: 20px 22px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; max-height: 65vh; overflow-y: auto; }
.mc-modal-field { display: flex; flex-direction: column; gap: 4px; }
.mc-modal-field.full { grid-column: 1/-1; }
.mc-modal-label { font-size: 9.5px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: var(--muted); }
.mc-modal-input { border: 1px solid var(--border); border-radius: 6px; padding: 7px 10px; font-family: 'Montserrat', sans-serif; font-size: 12.5px; outline: none; transition: border-color .15s; }
.mc-modal-input:focus { border-color: var(--blue); }
.mc-modal-select { border: 1px solid var(--border); border-radius: 6px; padding: 7px 10px; font-family: 'Montserrat', sans-serif; font-size: 12.5px; outline: none; cursor: pointer; background: var(--white); }
.mc-modal-footer { padding: 14px 22px; border-top: 1px solid var(--border); display: flex; gap: 9px; justify-content: flex-end; }
.mc-trk-result { font-size: 12px; padding: 10px 12px; background: var(--blue-lt); border-radius: 7px; color: var(--blue); font-weight: 600; line-height: 1.6; }

/* ── SETTINGS PANEL ── */
.mc-settings-overlay { position: fixed; inset: 0; background: rgba(23,46,87,.4); z-index: 400; display: none; }
.mc-settings-overlay.open { display: block; }
.mc-settings-panel {
  position: fixed; right: 0; top: 0; bottom: 0; width: 400px;
  background: var(--white); z-index: 401;
  box-shadow: -4px 0 28px rgba(23,46,87,.13);
  transform: translateX(100%); transition: transform .22s ease;
}
.mc-settings-panel.open { transform: translateX(0); }
.mc-settings-hdr { background: var(--blue); padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; }
.mc-settings-title { font-size: 14px; font-weight: 700; color: #fff; }
.mc-settings-body { padding: 22px; overflow-y: auto; height: calc(100% - 62px); }
.mc-sg-title { font-size: 10px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; padding-bottom: 7px; border-bottom: 1px solid var(--border); }
.mc-sg { margin-bottom: 26px; }
.mc-sl { margin-bottom: 12px; }
.mc-sl-lbl { font-size: 11.5px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
.mc-sl-hint { font-size: 10.5px; color: var(--muted); margin-top: 3px; }
.mc-sinput { width: 100%; border: 1px solid var(--border); border-radius: 6px; padding: 8px 11px; font-family: 'Montserrat', sans-serif; font-size: 12.5px; outline: none; }
.mc-sinput:focus { border-color: var(--blue); }

/* ── BADGES ── */
.mc-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: .3px; white-space: nowrap; }
.mc-badge::before { content:''; width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }
.mc-b-paid     { background: var(--success-bg); color: var(--success); }
.mc-b-partial  { background: var(--warn-bg);    color: var(--warn); }
.mc-b-unpaid   { background: var(--danger-bg);  color: var(--danger); }
.mc-b-enroute  { background: var(--info-bg);    color: var(--info); }
.mc-b-overland { background: #eaf4e6;            color: #256018; }
.mc-b-clearing { background: var(--warn-bg);    color: var(--warn); }
.mc-b-received { background: var(--success-bg); color: var(--success); }
.mc-b-delayed  { background: var(--danger-bg);  color: var(--danger); }
.mc-b-partrcv  { background: #fff4e5;            color: #7a440a; }
.mc-b-pending  { background: var(--grey-lt);    color: #555; }

.mc-days-chip { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 10.5px; font-weight: 700; }
.mc-days-overdue { background: var(--danger-bg); color: var(--danger); }
.mc-days-soon    { background: var(--warn-bg);   color: var(--warn); }
.mc-days-ok      { background: var(--success-bg);color: var(--success); }
.mc-days-future  { background: var(--grey-lt);   color: var(--muted); }

.mc-progress { display: flex; align-items: center; gap: 7px; }
.mc-progress-track { flex: 1; height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; min-width: 55px; }
.mc-progress-fill { height: 100%; border-radius: 3px; }
.mc-progress-fill.full { background: var(--success); }
.mc-progress-fill.half { background: #f59e0b; }
.mc-progress-fill.zero { background: var(--red); }
.mc-progress-pct { font-size: 10.5px; font-weight: 600; color: var(--muted); min-width: 28px; text-align: right; }

.mc-supp-cell { display: flex; align-items: center; gap: 9px; }
.mc-supp-avatar { width: 30px; height: 30px; border-radius: 7px; background: var(--blue); color: #fff; font-size: 10.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.mc-supp-name { font-weight: 600; font-size: 12px; }
.mc-supp-ctry { font-size: 10.5px; color: var(--muted); }

.mc-po-link { font-weight: 700; color: var(--blue); text-decoration: none; font-family: 'DM Mono', monospace; font-size: 11.5px; cursor: pointer; }
.mc-po-link:hover { color: var(--red); text-decoration: underline; }
.mc-note-cell { max-width: 170px; overflow: hidden; text-overflow: ellipsis; color: var(--muted); font-size: 11px; }
.mc-flag-note { color: var(--red); font-weight: 600; }
.mc-trk-cell  { font-family: 'DM Mono', monospace; font-size: 10.5px; color: var(--muted); }
.mc-edit-sel  { border: 1px solid var(--blue); border-radius: 4px; padding: 3px 6px; font-family: 'Montserrat', sans-serif; font-size: 11.5px; outline: none; cursor: pointer; }

/* ── TOAST ── */
.mc-toast-wrap { position: fixed; bottom: 20px; right: 20px; z-index: 600; display: flex; flex-direction: column; gap: 7px; }
.mc-toast { background: var(--blue); color: #fff; padding: 10px 16px; border-radius: 9px; font-size: 12.5px; font-weight: 600; box-shadow: var(--shadow-md); animation: mcSlideUp .25s ease; pointer-events: none; }
.mc-toast.success { background: var(--success); }
.mc-toast.warn    { background: var(--warn); }
.mc-toast.error   { background: var(--danger); }
@keyframes mcSlideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

.mc-empty { text-align: center; padding: 44px 22px; color: var(--muted); }
.mc-empty p { font-size: 13.5px; margin-top: 7px; }
.mc-footer { text-align: center; margin-top: 28px; font-size: 11px; color: var(--muted); font-weight: 500; letter-spacing: .3px; }

@media (max-width: 768px) {
  #mc-dashboard { padding: 12px; }
  .mc-stats { grid-template-columns: repeat(2,1fr); }
  .mc-toolbar { flex-direction: column; align-items: stretch; }
  .mc-settings-panel { width: 100%; }
  .mc-modal-body { grid-template-columns: 1fr; }
}
</style>

<!-- ── FLOATING RECEIVED TAB ── -->
<div class="mc-rcv-tab" id="mc-rcv-tab" onclick="mcOpenDrawer()">
  ✅ Fully Received <span class="mc-rcv-count" id="mc-rcv-count">0</span>
</div>
<div class="mc-drawer-overlay" id="mc-drawer-ov" onclick="mcCloseDrawer()"></div>
<div class="mc-drawer" id="mc-drawer">
  <div class="mc-drawer-hdr">
    <span class="mc-drawer-title">✅ Fully Received</span>
    <button class="mc-modal-close" onclick="mcCloseDrawer()">×</button>
  </div>
  <div class="mc-drawer-body" id="mc-drawer-body"></div>
</div>

<!-- ── ALERT POPUP ── -->
<div class="mc-alert-overlay" id="mc-alert-ov">
  <div class="mc-alert-modal">
    <div class="mc-alert-hdr">
      <div class="mc-alert-icon">🚨</div>
      <div>
        <div class="mc-alert-title">Shipment Alerts</div>
        <div class="mc-alert-sub" id="mc-alert-sub">Checking for due and overdue shipments…</div>
      </div>
    </div>
    <div class="mc-alert-body" id="mc-alert-body"></div>
    <div class="mc-alert-footer">
      <label class="mc-noshow"><input type="checkbox" id="mc-noshow-chk"> Don't show again today</label>
      <button class="mc-btn mc-btn-primary" onclick="mcCloseAlert()">View Dashboard →</button>
    </div>
  </div>
</div>

<!-- ── EDIT MODAL ── -->
<div class="mc-modal-overlay" id="mc-edit-ov">
  <div class="mc-modal">
    <div class="mc-modal-hdr">
      <span class="mc-modal-title" id="mc-modal-po">Edit Shipment</span>
      <button class="mc-modal-close" onclick="mcCloseModal()">×</button>
    </div>
    <div class="mc-modal-body">
      <div class="mc-modal-field full">
        <div class="mc-modal-label">Notes / Alerts</div>
        <input class="mc-modal-input" id="mc-m-notes" placeholder="Enter notes…">
      </div>
      <div class="mc-modal-field">
        <div class="mc-modal-label">Container Number</div>
        <input class="mc-modal-input" id="mc-m-tracking" placeholder="e.g. MAEU1234567">
        <div style="font-size:10px;color:var(--muted);margin-top:3px">Any shipping line — tracked via FindTEU</div>
      </div>
      <div class="mc-modal-field">
        <div class="mc-modal-label">Bill of Lading (BOL)</div>
        <input class="mc-modal-input" id="mc-m-bol" placeholder="e.g. BOL: MAEUB123456">
        <div style="font-size:10px;color:var(--muted);margin-top:3px">Can also be used to track via FindTEU</div>
      </div>
      <div class="mc-modal-field">
        <div class="mc-modal-label">Customs Status</div>
        <select class="mc-modal-select" id="mc-m-customs">
          <option value="Not Filed">Not Filed</option>
          <option value="Filed">Filed</option>
          <option value="Cleared">Cleared</option>
          <option value="Held">Held</option>
        </select>
      </div>
      <div class="mc-modal-field">
        <div class="mc-modal-label">Local Charges</div>
        <select class="mc-modal-select" id="mc-m-local">
          <option value="Not Paid">Not Paid</option>
          <option value="Paid">Paid</option>
        </select>
      </div>
      <div class="mc-modal-field">
        <div class="mc-modal-label">Container Status</div>
        <select class="mc-modal-select" id="mc-m-status">
          <option value="Ordered">Ordered / Pending</option>
          <option value="En Route">En Route</option>
          <option value="Overland Freight">Overland Freight</option>
          <option value="Customs Clearing">Customs Clearing</option>
          <option value="Partially Received">Partially Received</option>
          <option value="Fully Received">Fully Received</option>
          <option value="Delayed">Delayed</option>
        </select>
      </div>
      <div class="mc-modal-field full" id="mc-trk-row" style="display:none">
        <div class="mc-modal-label">Tracking Result</div>
        <div class="mc-trk-result" id="mc-trk-result"></div>
      </div>
    </div>
    <div class="mc-modal-footer">
      <button class="mc-btn mc-btn-outline" onclick="mcLookupTracking()" id="mc-trk-btn">🔍 Lookup Tracking</button>
      <button class="mc-btn mc-btn-outline" onclick="mcCloseModal()">Cancel</button>
      <button class="mc-btn mc-btn-primary" onclick="mcHandleSaveEdit()">Save Changes</button>
    </div>
  </div>
</div>

<!-- ── SETTINGS PANEL ── -->
<div class="mc-settings-overlay" id="mc-cfg-ov" onclick="mcCloseSettings()"></div>
<div class="mc-settings-panel" id="mc-cfg-panel">
  <div class="mc-settings-hdr">
    <span class="mc-settings-title">⚙ Dashboard Settings</span>
    <button class="mc-modal-close" onclick="mcCloseSettings()">×</button>
  </div>
  <div class="mc-settings-body">
    <div class="mc-sg">
      <div class="mc-sg-title">Container Tracking — FindTEU</div>
      <div style="font-size:11.5px;color:var(--muted);margin-bottom:12px;line-height:1.6">
        FindTEU tracks containers across all major shipping lines (Maersk, CMA CGM, MSC, and 100+ more) from a single key. Also accepts BOL numbers. Containers are refreshed once daily automatically.<br><br>
        Register at <a href="https://www.findteu.com" target="_blank" style="color:var(--blue)">findteu.com</a> → Account → API Settings.
      </div>
      <div class="mc-sl">
        <div class="mc-sl-lbl">FindTEU API Key</div>
        <input class="mc-sinput" id="mc-cfg-findteu" type="password" placeholder="Bearer token from FindTEU">
        <div class="mc-sl-hint">Found in your FindTEU account → API Settings → Token</div>
      </div>
      <button class="mc-btn mc-btn-primary" onclick="mcSaveFindTEU()" style="width:100%">Save FindTEU Key</button>
      <div id="mc-findteu-status" style="margin-top:9px;font-size:11.5px;font-weight:600;color:var(--muted)"></div>
    </div>
    <div class="mc-sg">
      <div class="mc-sg-title">DHL &amp; FedEx (Courier Only)</div>
      <div style="font-size:11.5px;color:var(--muted);margin-bottom:12px">For DHL Express and FedEx courier parcels. Sea freight is handled by FindTEU.</div>
      <div class="mc-sl">
        <div class="mc-sl-lbl">DHL API Key</div>
        <input class="mc-sinput" id="mc-cfg-dhl" type="password" placeholder="DHL Express API Key">
      </div>
      <div class="mc-sl">
        <div class="mc-sl-lbl">FedEx Client ID</div>
        <input class="mc-sinput" id="mc-cfg-fedex-id" type="password" placeholder="FedEx Client ID">
      </div>
      <div class="mc-sl">
        <div class="mc-sl-lbl">FedEx Client Secret</div>
        <input class="mc-sinput" id="mc-cfg-fedex-secret" type="password" placeholder="FedEx Client Secret">
      </div>
      <button class="mc-btn mc-btn-outline" onclick="mcSaveCourier()" style="width:100%">Save Courier Keys</button>
    </div>
    <div class="mc-sg">
      <div class="mc-sg-title">Auto-Refresh</div>
      <div class="mc-sl">
        <div class="mc-sl-lbl">Refresh Interval</div>
        <select class="mc-sinput" id="mc-cfg-refresh">
          <option value="0">Manual only</option>
          <option value="5" selected>Every 5 minutes</option>
          <option value="15">Every 15 minutes</option>
          <option value="30">Every 30 minutes</option>
        </select>
      </div>
    </div>
  </div>
</div>

<!-- ── TOAST CONTAINER ── -->
<div class="mc-toast-wrap" id="mc-toast-wrap"></div>

<!-- ── MAIN DASHBOARD ── -->
<div id="mc-dashboard">

  <!-- Topbar -->
  <div class="mc-topbar">
    <div class="mc-topbar-left">
      <span style="font-size:15px;font-weight:800;color:#fff;letter-spacing:.3px">Incoming Shipments</span>
      <div class="mc-topbar-divider"></div>
      <span class="mc-page-title">Incoming Shipments</span>
    </div>
    <div class="mc-topbar-right">
      <span id="mc-src-badge" class="mc-badge-live">● Live</span>
      <span class="mc-updated" id="mc-updated">Loading…</span>
      <button class="mc-settings-btn" onclick="mcOpenSettings()">⚙ Settings</button>
    </div>
  </div>

  <!-- Stats -->
  <div class="mc-stats" id="mc-stats"></div>

  <!-- Toolbar -->
  <div class="mc-toolbar">
    <div class="mc-toolbar-left">
      <div class="mc-search">
        <span style="color:var(--muted);font-size:13px">🔍</span>
        <input type="text" id="mc-search" placeholder="Search supplier, PO, product…" oninput="mcApplyFilters()">
      </div>
      <select class="mc-select" id="mc-filter-status" onchange="mcApplyFilters()">
        <option value="">All Statuses</option>
        <option value="Ordered">Ordered / Pending</option>
        <option value="En Route">En Route</option>
        <option value="Overland Freight">Overland Freight</option>
        <option value="Customs Clearing">Customs Clearing</option>
        <option value="Partially Received">Partially Received</option>
        <option value="Fully Received">Fully Received</option>
        <option value="Delayed">Delayed</option>
      </select>
      <select class="mc-select" id="mc-filter-pay" onchange="mcApplyFilters()">
        <option value="">All Payments</option>
        <option value="Fully Paid">Fully Paid</option>
        <option value="Partially Paid">Partially Paid</option>
        <option value="Unpaid">Unpaid</option>
      </select>
    </div>
    <button class="mc-btn mc-btn-outline" onclick="mcExportCSV()">⬇ Export CSV</button>
    <div class="mc-view-toggle">
      <button class="mc-view-btn active" id="mc-btn-list"   onclick="mcSetView('list')">☰ List</button>
      <button class="mc-view-btn"        id="mc-btn-kanban" onclick="mcSetView('kanban')">⊞ Kanban</button>
    </div>
    <button class="mc-btn mc-btn-primary" id="mc-refresh-btn" onclick="mcRefresh()">↻ Refresh</button>
  </div>

  <!-- List view -->
  <div class="mc-list-wrap" id="mc-list-wrap">
    <div class="mc-table-card">
      <div class="mc-table-hdr">
        <span class="mc-table-title">Shipment Register</span>
        <span class="mc-row-count" id="mc-row-count">— shipments</span>
      </div>
      <div class="mc-table-scroll">
        <table class="mc-table">
          <thead>
            <tr>
              <th onclick="mcSort('po')">PO Number</th>
              <th onclick="mcSort('so')">Supplier SO</th>
              <th onclick="mcSort('supplier')">Supplier</th>
              <th onclick="mcSort('product')">Product Summary</th>
              <th onclick="mcSort('value')">Value (USD)</th>
              <th onclick="mcSort('payment')">Payment</th>
              <th onclick="mcSort('paid_pct')">% Paid</th>
              <th onclick="mcSort('days')">Days Away</th>
              <th onclick="mcSort('status')">Container Status</th>
              <th onclick="mcSort('customs')">Customs</th>
              <th onclick="mcSort('local_charges')">Local Charges</th>
              <th onclick="mcSort('eta')">ETA</th>
              <th>Tracking / BOL</th>
              <th onclick="mcSort('notes')">Notes</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody id="mc-tbody"></tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Kanban view -->
  <div class="mc-kanban-wrap" id="mc-kanban-wrap">
    <div class="mc-kanban-board" id="mc-kanban-board"></div>
  </div>

  <div class="mc-footer">Incoming Shipments Dashboard · Powered by ERPNext</div>
</div>

<script>
// ═══════════════════════════════════════════════
//  STATE & CONSTANTS
// ═══════════════════════════════════════════════
let MC = {
  shipments: [], filtered: [], view: 'list',
  sortKey: 'days', sortDir: 1, editIdx: null,
  autoTimer: null, rendered: false
};

const MC_CFG_KEY          = 'mc_dash_cfg';
const MC_EDITS_KEY        = 'mc_dash_edits';
const MC_TRK_CACHE_KEY    = 'mc_dash_trk_cache';
const MC_ALERT_SUPP_KEY   = 'mc_dash_alert_date';
const MC_LAST_TRK_KEY     = 'mc_dash_last_trk';

// ═══════════════════════════════════════════════
//  CONFIG & LOCAL STORAGE
// ═══════════════════════════════════════════════
function mcCfg()   { try { return JSON.parse(localStorage.getItem(MC_CFG_KEY)||'{}'); } catch { return {}; } }
function mcSaveCfg(c) { localStorage.setItem(MC_CFG_KEY, JSON.stringify(c)); }
function mcEdits() { try { return JSON.parse(localStorage.getItem(MC_EDITS_KEY)||'{}'); } catch { return {}; } }
function mcSaveEdit(po, fields) {
  const e = mcEdits(); e[po] = { ...(e[po]||{}), ...fields };
  localStorage.setItem(MC_EDITS_KEY, JSON.stringify(e));
}
function mcTrkCache() { try { return JSON.parse(localStorage.getItem(MC_TRK_CACHE_KEY)||'{}'); } catch { return {}; } }
function mcSaveTrkCache(c) { try { localStorage.setItem(MC_TRK_CACHE_KEY, JSON.stringify(c)); } catch {} }

// ═══════════════════════════════════════════════
//  ERPNEXT DATA FETCH — uses frappe.call() natively
//  No authentication needed — user is already logged in
// ═══════════════════════════════════════════════
function mcFetchERPNext() {
  return new Promise((resolve, reject) => {
    frappe.call({
      method: 'frappe.client.get_list',
      args: {
        doctype: 'Purchase Order',
        fields: [
          'name', 'supplier', 'supplier_delivery_note',
          'transaction_date', 'status', 'grand_total',
          'per_received', 'per_billed', 'items', 'notes', 'remarks'
        ],
        filters: [['status', 'not in', ['Cancelled', 'Closed']]],
        limit_page_length: 200,
        order_by: 'transaction_date desc'
      },
      callback: function(r) {
        if (r.exc) { reject(new Error(r.exc)); return; }
        const edits = mcEdits();
        const rows = (r.message || []).map(po => {
          const notes = po.notes || po.remarks || '';
          const notesLo = notes.toLowerCase();

          // Extract container number (4 letters + 7 digits = ISO standard)
          const ctnrMatch = notes.match(/\\b([A-Z]{4}\\d{7})\\b/);
          const tracking = ctnrMatch ? ctnrMatch[0] : '';

          // Extract BOL
          const bolMatch = notes.match(/(?:BOL|B\\/L|BL)[:\\s#]+([A-Z0-9\\-]{6,30})/i);
          const bol = bolMatch ? bolMatch[1].trim() : '';

          // Infer status from ERP status + notes keywords
          let status = 'Ordered';
          if (['To Receive and Bill','To Receive'].includes(po.status)) {
            if      (notesLo.match(/customs|clearing|held|c82/))               status = 'Customs Clearing';
            else if (notesLo.match(/overland|road|truck|lorry/))                status = 'Overland Freight';
            else if (notesLo.match(/delayed|delay/))                            status = 'Delayed';
            else if (tracking || bol || notesLo.match(/vessel|sea|port|route/)) status = 'En Route';
            else                                                                 status = 'Ordered';
          } else if (po.status === 'Completed') {
            status = 'Fully Received';
          } else if (po.status === 'To Bill') {
            status = 'Partially Received';
          }

          // ETA from notes — looks for "ETA: DD/MM/YYYY" or "ETA DD-MM-YYYY"
          const etaMatch = notes.match(/ETA[:\\s]+(\\d{1,2}[\\/-]\\d{1,2}[\\/-]\\d{2,4})/i);
          let eta = etaMatch ? new Date(etaMatch[1].replace(/\\//g,'-')) : mcFutureDate(21);
          if (isNaN(eta.getTime())) eta = mcFutureDate(21);

          const paidPct = Math.round(po.per_received || 0);
          const payment = paidPct === 100 ? 'Fully Paid' : paidPct > 0 ? 'Partially Paid' : 'Unpaid';

          const ov = edits[po.name] || {};
          return {
            po:            po.name,
            so:            po.supplier_delivery_note || '',
            supplier:      po.supplier,
            country:       '🌍',
            product:       '',  // filled below via items fetch
            value:         Math.round(po.grand_total || 0),
            eta,
            status:        ov.status        || status,
            customs:       ov.customs       || 'Not Filed',
            local_charges: ov.local_charges || 'Not Paid',
            payment,
            paid_pct:      paidPct,
            notes:         ov.notes !== undefined ? ov.notes : notes,
            tracking:      ov.tracking      || tracking,
            bol:           ov.bol           || bol,
            erpnext_id:    po.name,
            trackingResult: null
          };
        });

        // Fetch items for product descriptions
        mcFetchItems(rows).then(resolve).catch(() => resolve(rows));
      },
      error: function(err) { reject(new Error(err.message || 'frappe.call failed')); }
    });
  });
}

function mcFetchItems(rows) {
  // Fetch PO Items to get product names
  return new Promise((resolve) => {
    frappe.call({
      method: 'frappe.client.get_list',
      args: {
        doctype: 'Purchase Order Item',
        fields: ['parent', 'item_name', 'item_code', 'qty', 'uom'],
        filters: [['parent', 'in', rows.map(r => r.po)]],
        limit_page_length: 1000
      },
      callback: function(r) {
        const items = r.message || [];
        // Group items by parent PO
        const byPO = {};
        items.forEach(i => {
          if (!byPO[i.parent]) byPO[i.parent] = [];
          byPO[i.parent].push(i);
        });
        rows.forEach(row => {
          const poItems = byPO[row.po] || [];
          row.product = poItems.slice(0,2).map(i => i.item_name || i.item_code).join(', ') || 'Various Items';
          row.qty = poItems.reduce((s,i) => s+(i.qty||0), 0);
          row.units = poItems[0]?.uom || 'Units';
        });
        resolve(rows);
      },
      error: () => { rows.forEach(r => { if (!r.product) r.product = 'Various Items'; }); resolve(rows); }
    });
  });
}

// ═══════════════════════════════════════════════
//  FINDTEU TRACKING
// ═══════════════════════════════════════════════
const MC_MILESTONES = {
  EMPTY_OUT:'Empty Container Released', FULL_IN:'Container Loaded / Full In',
  LOADED_ON:'Loaded on Vessel',          VESSEL_DEP:'Vessel Departed',
  VESSEL_ARR:'Vessel Arrived at Port',   DISCHARGED:'Discharged from Vessel',
  FULL_OUT:'Container Collected',        EMPTY_RET:'Empty Container Returned',
  DELIVERED:'Delivered to Consignee',    CUSTOMS:'Customs Hold / Inspection'
};

function mcCarrierLabel(t) {
  if (!t) return 'Unknown';
  const u = t.trim().toUpperCase();
  if (/^(MAEU|MSKU|MRKU|TRHU|TEMU)\\d{7}$/.test(u)) return 'Maersk';
  if (/^(CMAU|CGMU|SEGU|RCIU)\\d{7}$/.test(u))       return 'CMA CGM';
  if (/^(MSCU|MEDU)\\d{7}$/.test(u))                 return 'MSC';
  if (/^[A-Z]{4}\\d{7}$/.test(u))                    return 'Auto-detect';
  if (/^JD/.test(u))                                 return 'DHL';
  if (/^\\d{12,15}$/.test(u))                        return 'FedEx';
  return 'BOL / Reference';
}

async function mcFetchTracking(ref, isBOL = false) {
  if (!ref) return null;
  const cacheKey = ref.trim().toUpperCase();
  const cache = mcTrkCache();
  if (cache[cacheKey]) {
    const age = Date.now() - cache[cacheKey].fetchedAt;
    if (age < 23 * 60 * 60 * 1000) return { ...cache[cacheKey].result, fromCache: true, cachedAt: cache[cacheKey].fetchedAt };
  }
  const cfg = mcCfg();
  if (cfg.findteu) {
    try {
      const body = isBOL ? { booking_number: ref.trim() } : { container_number: ref.trim() };
      const res = await fetch('https://api.findteu.com/container', {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${cfg.findteu}\`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const data = await res.json();
        const c = data.container || data;
        const ev = (c.events || [])[0] || {};
        const result = {
          carrier:   c.carrier_name || c.scac || mcCarrierLabel(ref),
          milestone: MC_MILESTONES[ev.milestone] || ev.milestone || 'In Transit',
          vessel:    c.vessel_name || '', pol: c.port_of_loading || '',
          pod:       c.port_of_discharge || '', eta: c.eta_pod || c.eta || '',
          completed: c.completed || false,
          location:  ev.location || ev.port || '',
          updated:   ev.actual_time || ev.event_time || new Date().toISOString(),
          demo: false
        };
        const nc = mcTrkCache(); nc[cacheKey] = { result, fetchedAt: Date.now() }; mcSaveTrkCache(nc);
        return result;
      }
      if (res.status === 402) return { carrier:'FindTEU', milestone:'API limit reached — upgrade plan', demo:true, error:'quota' };
      if (res.status === 401) return { carrier:'FindTEU', milestone:'Invalid API key — check Settings', demo:true, error:'auth' };
    } catch(e) { console.warn('FindTEU:', e); }
  }
  // Simulation fallback
  const sims = ['Loaded on Vessel','Vessel Departed — On Schedule','At Sea — ETA On Track','Arrived at Port of Discharge','Awaiting Customs Clearance'];
  return { carrier: mcCarrierLabel(ref), milestone: sims[Math.floor(Math.random()*sims.length)], location:'Demo — add FindTEU key in Settings', updated: new Date().toISOString(), demo:true };
}

async function mcRefreshAllTracking() {
  const toTrack = MC.shipments.filter(s => (s.tracking || s.bol) && s.status !== 'Fully Received');
  if (!toTrack.length) return;
  let updated = 0;
  for (const s of toTrack) {
    const ref = s.tracking || s.bol;
    const res = await mcFetchTracking(ref, !s.tracking && !!s.bol);
    if (res && !res.demo) {
      const m = (res.milestone||'').toLowerCase();
      let ns = s.status;
      if (res.completed || m.includes('deliver'))                            ns = 'Fully Received';
      else if (m.includes('customs') || m.includes('hold'))                 ns = 'Customs Clearing';
      else if (m.includes('discharged') || m.includes('collected'))         ns = 'Overland Freight';
      else if (m.includes('loaded') || m.includes('departed') || m.includes('at sea') || m.includes('vessel')) ns = 'En Route';
      else if (m.includes('arrived'))                                        ns = 'Customs Clearing';
      else if (m.includes('delay'))                                          ns = 'Delayed';
      if (ns !== s.status) { s.status = ns; mcSaveEdit(s.po, { status: ns }); updated++; }
      s.trackingResult = res;
    }
  }
  if (updated) { mcRenderAll(); mcToast(\`Tracking: \${updated} shipment\${updated>1?'s':''} updated\`, 'success'); }
  localStorage.setItem(MC_LAST_TRK_KEY, Date.now().toString());
}

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════
frappe.ready(function() {
  const cfg = mcCfg();
  if (cfg.findteu)     document.getElementById('mc-cfg-findteu').value     = cfg.findteu;
  if (cfg.dhl)         document.getElementById('mc-cfg-dhl').value         = cfg.dhl;
  if (cfg.fedexId)     document.getElementById('mc-cfg-fedex-id').value    = cfg.fedexId;
  if (cfg.fedexSecret) document.getElementById('mc-cfg-fedex-secret').value= cfg.fedexSecret;
  mcLoadData();
  mcSetAutoRefresh(cfg.refresh || 5);
  // Modals close on overlay click
  document.getElementById('mc-edit-ov').addEventListener('click', e => { if (e.target===e.currentTarget) mcCloseModal(); });
  document.getElementById('mc-alert-ov').addEventListener('click', e => { if (e.target===e.currentTarget) mcCloseAlert(); });
});

async function mcLoadData() {
  mcToast('Loading Purchase Orders…');
  try {
    MC.shipments = await mcFetchERPNext();
    document.getElementById('mc-src-badge').className = 'mc-badge-live';
    document.getElementById('mc-src-badge').textContent = '● Live';
    mcRenderAll();
    mcToast(\`\${MC.shipments.length} orders loaded\`, 'success');
    // Daily tracking refresh
    const lastTrk = parseInt(localStorage.getItem(MC_LAST_TRK_KEY)||'0');
    if (Date.now() - lastTrk > 23*60*60*1000) setTimeout(mcRefreshAllTracking, 3500);
  } catch(e) {
    mcToast('Error loading data: ' + e.message, 'error');
    console.error('MC Dashboard:', e);
  }
}

// ═══════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════
function mcRenderAll() {
  mcRenderStats();
  mcApplyFilters();
  document.getElementById('mc-updated').textContent =
    'Updated ' + new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  if (!MC.rendered) {
    MC.rendered = true;
    setTimeout(mcShowAlertPopup, 700);
  }
}

function mcApplyFilters() {
  const q  = document.getElementById('mc-search').value.toLowerCase();
  const st = document.getElementById('mc-filter-status').value;
  const py = document.getElementById('mc-filter-pay').value;
  MC.filtered = MC.shipments.filter(s => {
    const mQ  = !q  || s.po.toLowerCase().includes(q) || s.supplier.toLowerCase().includes(q) || s.product.toLowerCase().includes(q) || (s.so||'').toLowerCase().includes(q);
    const mSt = !st || s.status === st;
    const mPy = !py || s.payment === py;
    return mQ && mSt && mPy;
  });
  if (MC.view === 'list') mcRenderTable(); else mcRenderKanban();
}

// ── HELPERS ──
function mcFutureDate(days) { const d = new Date(); d.setDate(d.getDate()+days); d.setHours(10,0,0,0); return d; }
function mcDaysUntil(dt) { const n=new Date(); n.setHours(0,0,0,0); const t=new Date(dt); t.setHours(0,0,0,0); return Math.round((t-n)/86400000); }
function mcFmtDate(d)  { return new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
function mcFmtVal(v)   { return '$'+Number(v).toLocaleString('en-US'); }
function mcInitials(n) { return (n||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase(); }

function mcDaysChip(days, status) {
  if (status==='Fully Received') return \`<span class="mc-days-chip mc-days-ok">Received</span>\`;
  if (days<0)   return \`<span class="mc-days-chip mc-days-overdue">\${Math.abs(days)}d overdue</span>\`;
  if (days===0) return \`<span class="mc-days-chip mc-days-soon">Today</span>\`;
  if (days<=5)  return \`<span class="mc-days-chip mc-days-soon">\${days}d</span>\`;
  if (days<=14) return \`<span class="mc-days-chip mc-days-ok">\${days}d</span>\`;
  return \`<span class="mc-days-chip mc-days-future">\${days}d</span>\`;
}
function mcStatusBadge(s) {
  const m = {'En Route':'enroute','Overland Freight':'overland','Customs Clearing':'clearing','Partially Received':'partrcv','Fully Received':'received','Delayed':'delayed','Ordered':'pending'};
  return \`<span class="mc-badge mc-b-\${m[s]||'pending'}">\${s||'Pending'}</span>\`;
}
function mcCustomsBadge(s) {
  const m = {'Not Filed':'unpaid','Filed':'partial','Cleared':'paid','Held':'delayed'};
  return \`<span class="mc-badge mc-b-\${m[s]||'pending'}">\${s}</span>\`;
}
function mcLocalBadge(s)   { return s==='Paid' ? \`<span class="mc-badge mc-b-paid">Paid</span>\` : \`<span class="mc-badge mc-b-unpaid">Not Paid</span>\`; }
function mcPayBadge(s)     { const m={'Fully Paid':'paid','Partially Paid':'partial','Unpaid':'unpaid'}; return \`<span class="mc-badge mc-b-\${m[s]||'pending'}">\${s}</span>\`; }
function mcProgressBar(p)  { const c=p===100?'full':p===0?'zero':'half'; return \`<div class="mc-progress"><div class="mc-progress-track"><div class="mc-progress-fill \${c}" style="width:\${p}%"></div></div><span class="mc-progress-pct">\${p}%</span></div>\`; }

// ── TABLE ──
function mcSort(key) {
  if (MC.sortKey===key) MC.sortDir*=-1; else { MC.sortKey=key; MC.sortDir=1; }
  document.querySelectorAll('.mc-table th').forEach((th,i) => {
    th.classList.remove('sort-asc','sort-desc');
    const keys=['po','so','supplier','product','value','payment','paid_pct','days','status','customs','local_charges','eta','tracking','notes'];
    if (keys[i]===key) th.classList.add(MC.sortDir===1?'sort-asc':'sort-desc');
  });
  mcRenderTable();
}
function mcGetSorted(data) {
  return [...data].sort((a,b) => {
    let av, bv;
    if (MC.sortKey==='days')           { av=mcDaysUntil(a.eta);  bv=mcDaysUntil(b.eta); }
    else if (MC.sortKey==='eta')       { av=new Date(a.eta);     bv=new Date(b.eta); }
    else if (['value','paid_pct'].includes(MC.sortKey)) { av=a[MC.sortKey]; bv=b[MC.sortKey]; }
    else { av=(a[MC.sortKey]||'').toString().toLowerCase(); bv=(b[MC.sortKey]||'').toString().toLowerCase(); }
    return av<bv?-MC.sortDir:av>bv?MC.sortDir:0;
  });
}
function mcRenderTable() {
  const tbody = document.getElementById('mc-tbody');
  document.getElementById('mc-row-count').textContent = MC.filtered.length + ' shipment' + (MC.filtered.length!==1?'s':'');
  const sorted = mcGetSorted(MC.filtered);
  if (!sorted.length) { tbody.innerHTML=\`<tr><td colspan="15"><div class="mc-empty"><div style="font-size:28px">📦</div><p>No shipments match your filters.</p></div></td></tr>\`; return; }
  tbody.innerHTML = sorted.map(s => {
    const idx = MC.shipments.indexOf(s);
    const days = mcDaysUntil(s.eta);
    const nc = (s.notes&&(s.notes.startsWith('⚠')||s.notes.startsWith('🔴')))?'mc-flag-note':'';
    const trkHtml = (s.tracking||s.bol)
      ? \`\${s.tracking?\`<div class="mc-trk-cell">\${s.tracking}</div><div style="font-size:9.5px;color:var(--muted)">\${mcCarrierLabel(s.tracking)}</div>\`:''} \${s.bol?\`<div style="font-size:9.5px;color:var(--muted);font-family:'DM Mono',monospace">BOL: \${s.bol}</div>\`:''}\`
      : \`<span style="color:var(--muted);font-size:10.5px">—</span>\`;
    return \`<tr>
      <td><a class="mc-po-link" onclick="mcOpenEdit(\${idx})">\${s.po}</a></td>
      <td style="font-size:11px;color:var(--muted)">\${s.so||'—'}</td>
      <td>
        <div class="mc-supp-cell">
          <div class="mc-supp-avatar">\${mcInitials(s.supplier)}</div>
          <div><div class="mc-supp-name">\${s.supplier}</div><div class="mc-supp-ctry">\${s.country}</div></div>
        </div>
      </td>
      <td style="max-width:180px;white-space:normal;line-height:1.4;font-size:11.5px">\${s.product}</td>
      <td style="font-weight:700;color:var(--blue)">\${mcFmtVal(s.value)}</td>
      <td>\${mcPayBadge(s.payment)}</td>
      <td style="min-width:100px">\${mcProgressBar(s.paid_pct)}</td>
      <td>\${mcDaysChip(days,s.status)}</td>
      <td>\${mcStatusBadge(s.status)}</td>
      <td onclick="mcInlineEdit(this,'customs',\${idx})" style="cursor:pointer">\${mcCustomsBadge(s.customs)}</td>
      <td onclick="mcInlineEdit(this,'local_charges',\${idx})" style="cursor:pointer">\${mcLocalBadge(s.local_charges)}</td>
      <td>
        <div style="font-weight:600;font-size:12px">\${mcFmtDate(s.eta)}</div>
      </td>
      <td>\${trkHtml}</td>
      <td onclick="mcInlineEditNote(this,\${idx})" style="cursor:pointer">
        <div class="mc-note-cell \${nc}" title="\${s.notes||''}">\${s.notes||'—'}</div>
      </td>
      <td><button class="mc-btn mc-btn-outline" style="height:26px;padding:0 9px;font-size:10.5px" onclick="mcOpenEdit(\${idx})">✏ Edit</button></td>
    </tr>\`;
  }).join('');
}

// ── INLINE EDIT (customs, local charges, notes directly in table) ──
function mcInlineEdit(cell, field, idx) {
  if (cell.querySelector('select')) return;
  const s = MC.shipments[idx];
  const opts = field==='customs' ? ['Not Filed','Filed','Cleared','Held'] : ['Not Paid','Paid'];
  const sel = document.createElement('select'); sel.className='mc-edit-sel';
  opts.forEach(o => { const op=document.createElement('option'); op.value=o; op.textContent=o; if(o===s[field]) op.selected=true; sel.appendChild(op); });
  cell.innerHTML=''; cell.appendChild(sel); sel.focus();
  sel.onchange = () => { MC.shipments[idx][field]=sel.value; mcSaveEdit(s.po,{[field]:sel.value}); mcRenderTable(); mcToast(\`Updated to "\${sel.value}"\`, 'success'); };
  sel.onblur = () => mcRenderTable();
}
function mcInlineEditNote(cell, idx) {
  if (cell.querySelector('input')) return;
  const s = MC.shipments[idx];
  const inp = document.createElement('input'); inp.type='text'; inp.style.cssText='border:1px solid var(--blue);border-radius:4px;padding:3px 7px;font-family:Montserrat,sans-serif;font-size:11.5px;outline:none;width:160px';
  inp.value = s.notes||''; inp.placeholder='Note or container no…';
  cell.innerHTML=''; cell.appendChild(inp); inp.focus();
  inp.onblur = () => {
    const val=inp.value.trim(); MC.shipments[idx].notes=val;
    const tm = val.match(/\\b([A-Z]{4}\\d{7})\\b/);
    if (tm) { MC.shipments[idx].tracking=tm[0]; mcSaveEdit(s.po,{notes:val,tracking:tm[0]}); mcToast(\`Container no. detected: \${tm[0]}\`, 'success'); }
    else { mcSaveEdit(s.po,{notes:val}); }
    mcRenderTable();
  };
  inp.onkeydown = e => { if(e.key==='Enter') inp.blur(); if(e.key==='Escape'){MC.shipments[idx].notes=s.notes; mcRenderTable();} };
}

// ── KANBAN ──
const MC_COLS = [
  { key:'Ordered',            label:'Ordered / Pending', cls:'mc-col-ordered',  icon:'📋' },
  { key:'En Route',           label:'En Route',           cls:'mc-col-enroute',  icon:'🚢' },
  { key:'Overland Freight',   label:'Overland Freight',   cls:'mc-col-overland', icon:'🚛' },
  { key:'Customs Clearing',   label:'Customs Clearing',   cls:'mc-col-customs',  icon:'🛃' },
  { key:'Partially Received', label:'Part. Received',     cls:'mc-col-partrcv',  icon:'📥' },
  { key:'Delayed',            label:'Delayed',            cls:'mc-col-delayed',  icon:'⚠️' },
];
function mcRenderKanban() {
  const board = document.getElementById('mc-kanban-board');
  board.innerHTML = MC_COLS.map(col => {
    const cards = MC.filtered.filter(s => s.status===col.key);
    return \`<div class="mc-kanban-col \${col.cls}">
      <div class="mc-kanban-col-hdr"><span>\${col.icon} \${col.label}</span><span class="mc-col-count">\${cards.length}</span></div>
      <div class="mc-kanban-cards">
        \${!cards.length ? \`<div style="text-align:center;padding:14px 8px;font-size:10.5px;color:var(--muted)">No shipments</div>\` : cards.map(s => {
          const idx=MC.shipments.indexOf(s); const days=mcDaysUntil(s.eta);
          const dH = s.status==='Fully Received'
            ? \`<span class="mc-kc-days" style="color:var(--success)">✓ Received</span>\`
            : days<0 ? \`<span class="mc-kc-days" style="color:var(--danger)">\${Math.abs(days)}d overdue</span>\`
            : days<=5 ? \`<span class="mc-kc-days" style="color:var(--warn)">\${days}d away</span>\`
            : \`<span class="mc-kc-days" style="color:var(--muted)">\${days}d away</span>\`;
          return \`<div class="mc-kcard" onclick="mcOpenEdit(\${idx})">
            <div class="mc-kc-po">\${s.po}</div>
            <div class="mc-kc-supp">\${s.supplier}</div>
            <div class="mc-kc-prod">\${s.product}</div>
            <div class="mc-kc-row"><span class="mc-kc-val">\${mcFmtVal(s.value)}</span>\${dH}</div>
            <div style="display:flex;gap:5px;margin-top:7px;flex-wrap:wrap">\${mcCustomsBadge(s.customs)}\${mcLocalBadge(s.local_charges)}</div>
            \${s.notes&&(s.notes.startsWith('⚠')||s.notes.startsWith('🔴'))?\`<div class="mc-kc-note">\${s.notes}</div>\`:''}
            \${s.tracking?\`<div class="mc-kc-trk">📡 \${s.tracking}</div>\`:''}
          </div>\`;
        }).join('')}
      </div>
    </div>\`;
  }).join('');
  // Received floating tab
  const rcv = MC.filtered.filter(s=>s.status==='Fully Received');
  document.getElementById('mc-rcv-count').textContent = rcv.length;
  document.getElementById('mc-rcv-tab').classList.toggle('visible', true);
  const db = document.getElementById('mc-drawer-body');
  db.innerHTML = !rcv.length
    ? \`<div style="text-align:center;padding:28px;font-size:12.5px;color:var(--muted)">No received shipments</div>\`
    : rcv.map(s => { const idx=MC.shipments.indexOf(s); return \`<div class="mc-kcard mc-col-received" style="border-color:var(--success)" onclick="mcOpenEdit(\${idx});mcCloseDrawer()">
        <div class="mc-kc-po">\${s.po}</div>
        <div class="mc-kc-supp">\${s.supplier}</div>
        <div class="mc-kc-prod">\${s.product}</div>
        <div class="mc-kc-row"><span class="mc-kc-val">\${mcFmtVal(s.value)}</span><span style="font-size:10.5px;color:var(--success);font-weight:600">✓ \${mcFmtDate(s.eta)}</span></div>
      </div>\`; }).join('');
}

// ── STATS ──
function mcRenderStats() {
  const s = MC.shipments;
  const total   = s.length;
  const transit = s.filter(x=>['En Route','Overland Freight'].includes(x.status)).length;
  const overdue = s.filter(x=>mcDaysUntil(x.eta)<0 && x.status!=='Fully Received').length;
  const clrg    = s.filter(x=>x.status==='Customs Clearing').length;
  const rcvd    = s.filter(x=>x.status==='Fully Received').length;
  const totalV  = s.reduce((a,x)=>a+Number(x.value),0);
  document.getElementById('mc-stats').innerHTML = \`
    <div class="mc-stat total"><div class="mc-stat-label">Total Shipments</div><div class="mc-stat-val">\${total}</div><div class="mc-stat-sub">\${mcFmtVal(totalV)} total value</div></div>
    <div class="mc-stat intransit"><div class="mc-stat-label">In Transit</div><div class="mc-stat-val">\${transit}</div><div class="mc-stat-sub">En route / overland</div></div>
    <div class="mc-stat overdue"><div class="mc-stat-label">Overdue</div><div class="mc-stat-val">\${overdue}</div><div class="mc-stat-sub">Past ETA</div></div>
    <div class="mc-stat clearing"><div class="mc-stat-label">Customs Clearing</div><div class="mc-stat-val">\${clrg}</div><div class="mc-stat-sub">Awaiting clearance</div></div>
    <div class="mc-stat received"><div class="mc-stat-label">Fully Received</div><div class="mc-stat-val">\${rcvd}</div><div class="mc-stat-sub">Completed</div></div>\`;
}

// ── ALERT POPUP ──
function mcShowAlertPopup() {
  const suppDate = localStorage.getItem(MC_ALERT_SUPP_KEY);
  const today = new Date().toISOString().slice(0,10);
  if (suppDate===today) return;
  const overdue  = MC.shipments.filter(s=>mcDaysUntil(s.eta)<0  && s.status!=='Fully Received');
  const dueToday = MC.shipments.filter(s=>mcDaysUntil(s.eta)===0 && s.status!=='Fully Received');
  const dueSoon  = MC.shipments.filter(s=>mcDaysUntil(s.eta)>0 && mcDaysUntil(s.eta)<=3 && s.status!=='Fully Received');
  if (!overdue.length && !dueToday.length && !dueSoon.length) return;
  const total = overdue.length+dueToday.length+dueSoon.length;
  document.getElementById('mc-alert-sub').textContent = \`\${total} shipment\${total!==1?'s':''} require\${total===1?'s':''} your attention\`;
  let html='';
  if (overdue.length) {
    html+=\`<div class="mc-alert-section" style="color:var(--danger)">🔴 Overdue — \${overdue.length} shipment\${overdue.length>1?'s':''}</div>\`;
    overdue.forEach(s=>{ const d=Math.abs(mcDaysUntil(s.eta)); html+=\`<div class="mc-alert-item overdue"><div class="mc-alert-item-icon">🚨</div><div style="flex:1"><div class="mc-ai-po">\${s.po}</div><div class="mc-ai-supp">\${s.supplier}</div><div class="mc-ai-det">\${s.product}</div><div class="mc-ai-det" style="color:var(--danger);font-weight:600">\${d} day\${d>1?'s':''} overdue · \${s.status}</div></div>\${mcPayBadge(s.payment)}</div>\`; });
  }
  if (dueToday.length) {
    html+=\`<div class="mc-alert-section" style="color:#b45309;margin-top:\${overdue.length?'14px':'0'}">🟡 Due Today</div>\`;
    dueToday.forEach(s=>{ html+=\`<div class="mc-alert-item due-today"><div class="mc-alert-item-icon">📦</div><div style="flex:1"><div class="mc-ai-po">\${s.po}</div><div class="mc-ai-supp">\${s.supplier}</div><div class="mc-ai-det">\${s.product} · \${s.status}</div></div>\${mcCustomsBadge(s.customs)}</div>\`; });
  }
  if (dueSoon.length) {
    html+=\`<div class="mc-alert-section" style="margin-top:\${(overdue.length||dueToday.length)?'14px':'0'}">🔵 Due Within 3 Days</div>\`;
    dueSoon.forEach(s=>{ const d=mcDaysUntil(s.eta); html+=\`<div class="mc-alert-item due-soon"><div class="mc-alert-item-icon">⏳</div><div style="flex:1"><div class="mc-ai-po">\${s.po}</div><div class="mc-ai-supp">\${s.supplier}</div><div class="mc-ai-det">\${s.product}</div><div class="mc-ai-det" style="font-weight:600">In \${d} day\${d>1?'s':''} · \${s.status}</div></div><span style="font-size:11px;color:var(--muted)">\${mcFmtDate(s.eta)}</span></div>\`; });
  }
  document.getElementById('mc-alert-body').innerHTML = html;
  document.getElementById('mc-alert-ov').classList.add('open');
}
function mcCloseAlert() {
  document.getElementById('mc-alert-ov').classList.remove('open');
  if (document.getElementById('mc-noshow-chk').checked)
    localStorage.setItem(MC_ALERT_SUPP_KEY, new Date().toISOString().slice(0,10));
}

// ── EDIT MODAL ──
function mcOpenEdit(idx) {
  MC.editIdx = idx;
  const s = MC.shipments[idx];
  document.getElementById('mc-modal-po').textContent  = \`Edit — \${s.po}\`;
  document.getElementById('mc-m-notes').value         = s.notes||'';
  document.getElementById('mc-m-tracking').value      = s.tracking||'';
  document.getElementById('mc-m-bol').value           = s.bol||'';
  document.getElementById('mc-m-customs').value       = s.customs||'Not Filed';
  document.getElementById('mc-m-local').value         = s.local_charges||'Not Paid';
  document.getElementById('mc-m-status').value        = s.status||'Ordered';
  document.getElementById('mc-trk-row').style.display = 'none';
  if (s.trackingResult) mcShowTrkResult(s.trackingResult);
  document.getElementById('mc-edit-ov').classList.add('open');
}
function mcCloseModal() { document.getElementById('mc-edit-ov').classList.remove('open'); MC.editIdx=null; }

// Persist edits to the ERPNext server (notes only — other fields are display-only)
async function mcSaveToServer(po, updates) {
  try {
    await frappe.call({
      method: 'business_customizations.api.update_shipment_notes',
      args: { po_name: po, data: updates },
    });
  } catch(e) {
    console.error('Server save failed for ' + po, e);
    mcToast('Saved locally — server sync failed', 'warn');
  }
}

// UI handler: collect form values, merge into state, persist locally + to server
function mcHandleSaveEdit() {
  if (MC.editIdx===null) return;
  const s=MC.shipments[MC.editIdx];
  const updates = {
    notes:         document.getElementById('mc-m-notes').value.trim(),
    tracking:      document.getElementById('mc-m-tracking').value.trim(),
    bol:           document.getElementById('mc-m-bol').value.trim(),
    customs:       document.getElementById('mc-m-customs').value,
    local_charges: document.getElementById('mc-m-local').value,
    status:        document.getElementById('mc-m-status').value,
  };
  // Recalculate payment label from the existing paid_pct (not from updates, which has no paid_pct)
  const pct = s.paid_pct || 0;
  updates.payment = pct>=100 ? 'Fully Paid' : pct>0 ? 'Partially Paid' : 'Unpaid';
  // Merge into in-memory state
  Object.assign(MC.shipments[MC.editIdx], updates);
  // Persist to localStorage (the existing mcSaveEdit(po, fields) at line ~599)
  mcSaveEdit(s.po, updates);
  // Persist notes back to ERPNext asynchronously
  mcSaveToServer(s.po, updates);
  mcCloseModal(); mcRenderAll();
  mcToast('Shipment updated', 'success');
}

// ── TRACKING RESULT DISPLAY ──
function mcShowTrkResult(r) {
  document.getElementById('mc-trk-row').style.display='';
  document.getElementById('mc-trk-result').innerHTML=\`
    <div style="font-weight:700;margin-bottom:5px">📡 \${r.carrier}</div>
    <div>🔖 \${r.milestone||r.status||'In Transit'}</div>
    \${r.vessel?\`<div>🚢 Vessel: \${r.vessel}</div>\`:''}
    \${r.pol?\`<div>📤 POL: \${r.pol}</div>\`:''}
    \${r.pod?\`<div>📥 POD: \${r.pod}</div>\`:''}
    \${r.location?\`<div>📍 \${r.location}</div>\`:''}
    \${r.eta?\`<div style="color:var(--blue);font-weight:600;margin-top:4px">🗓 ETA: \${r.eta}</div>\`:''}
    \${r.updated?\`<div style="font-size:10.5px;color:var(--muted);margin-top:3px">🕐 \${String(r.updated).replace('T',' ').slice(0,16)}</div>\`:''}
    \${r.fromCache?\`<div style="font-size:10px;color:var(--muted);margin-top:3px">Cached — refreshes after 23h</div>\`:''}
    \${r.demo?\`<div style="font-size:10px;color:var(--warn);font-weight:600;margin-top:5px">⚠ Simulated — add FindTEU key in Settings for live data</div>\`:''}
  \`;
}
async function mcLookupTracking() {
  if (MC.editIdx===null) return;
  const ref = document.getElementById('mc-m-tracking').value.trim() || document.getElementById('mc-m-bol').value.trim();
  const isBOL = !document.getElementById('mc-m-tracking').value.trim();
  if (!ref) { mcToast('Enter a container number or BOL first', 'warn'); return; }
  const btn = document.getElementById('mc-trk-btn');
  btn.textContent='⏳ Looking up…'; btn.disabled=true;
  const res = await mcFetchTracking(ref, isBOL);
  btn.textContent='🔍 Lookup Tracking'; btn.disabled=false;
  if (!res) { mcToast('No result returned', 'error'); return; }
  MC.shipments[MC.editIdx].trackingResult = res;
  mcShowTrkResult(res);
  const m=(res.milestone||'').toLowerCase();
  if (res.completed || m.includes('deliver'))                           document.getElementById('mc-m-status').value='Fully Received';
  else if (m.includes('customs')||m.includes('hold'))                  document.getElementById('mc-m-status').value='Customs Clearing';
  else if (m.includes('discharged')||m.includes('collected'))          document.getElementById('mc-m-status').value='Overland Freight';
  else if (m.includes('loaded')||m.includes('departed')||m.includes('sea')||m.includes('vessel')) document.getElementById('mc-m-status').value='En Route';
  else if (m.includes('arrived'))                                       document.getElementById('mc-m-status').value='Customs Clearing';
  else if (m.includes('delay'))                                         document.getElementById('mc-m-status').value='Delayed';
  if (!res.demo) mcToast('Status auto-updated from FindTEU — review and save', 'success');
}

// ── VIEW TOGGLE ──
function mcSetView(v) {
  MC.view = v;
  document.getElementById('mc-btn-list').classList.toggle('active', v==='list');
  document.getElementById('mc-btn-kanban').classList.toggle('active', v==='kanban');
  document.getElementById('mc-list-wrap').classList.toggle('hidden', v!=='list');
  document.getElementById('mc-kanban-wrap').classList.toggle('active', v==='kanban');
  document.getElementById('mc-rcv-tab').classList.toggle('visible', v==='kanban');
  if (v==='kanban') mcRenderKanban(); else mcRenderTable();
}

// ── RECEIVED DRAWER ──
function mcOpenDrawer()  { document.getElementById('mc-drawer-ov').classList.add('open'); document.getElementById('mc-drawer').classList.add('open'); }
function mcCloseDrawer() { document.getElementById('mc-drawer-ov').classList.remove('open'); document.getElementById('mc-drawer').classList.remove('open'); }

// ── SETTINGS ──
function mcOpenSettings()  { document.getElementById('mc-cfg-ov').classList.add('open'); document.getElementById('mc-cfg-panel').classList.add('open'); }
function mcCloseSettings() { document.getElementById('mc-cfg-ov').classList.remove('open'); document.getElementById('mc-cfg-panel').classList.remove('open'); }
function mcSaveFindTEU() {
  const cfg=mcCfg(); cfg.findteu=document.getElementById('mc-cfg-findteu').value.trim(); mcSaveCfg(cfg);
  document.getElementById('mc-findteu-status').textContent='✅ Saved — containers tracked daily';
  mcToast('FindTEU key saved', 'success');
}
function mcSaveCourier() {
  const cfg=mcCfg();
  cfg.dhl=document.getElementById('mc-cfg-dhl').value.trim();
  cfg.fedexId=document.getElementById('mc-cfg-fedex-id').value.trim();
  cfg.fedexSecret=document.getElementById('mc-cfg-fedex-secret').value.trim();
  mcSaveCfg(cfg); mcToast('Courier keys saved', 'success');
}

// ── REFRESH ──
async function mcRefresh() {
  const btn=document.getElementById('mc-refresh-btn');
  btn.textContent='↻ Refreshing…'; btn.disabled=true;
  await mcLoadData();
  btn.textContent='↻ Refresh'; btn.disabled=false;
}
function mcSetAutoRefresh(mins) {
  if (MC.autoTimer) clearInterval(MC.autoTimer);
  if (mins>0) MC.autoTimer=setInterval(mcRefresh, mins*60*1000);
}

// ── EXPORT ──
function mcExportCSV() {
  const hdrs=['PO','Supplier SO','Supplier','Product','Value USD','Payment','Paid %','Days Away','Status','Customs','Local Charges','ETA','Tracking','BOL','Notes'];
  const rows=MC.filtered.map(s=>[s.po,s.so,s.supplier,s.product,s.value,s.payment,s.paid_pct,mcDaysUntil(s.eta),s.status,s.customs,s.local_charges,mcFmtDate(s.eta),s.tracking||'',s.bol||'',s.notes||''].map(v=>\`"\${String(v).replace(/"/g,'""')}"\`).join(','));
  const csv=[hdrs.join(','),...rows].join('\\n');
  const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download='mc_shipments_'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
  mcToast('CSV exported', 'success');
}

// ── TOAST ──
function mcToast(msg, type='') {
  const w=document.getElementById('mc-toast-wrap');
  const el=document.createElement('div'); el.className=\`mc-toast \${type}\`; el.textContent=msg;
  w.appendChild(el); setTimeout(()=>el.remove(), 3500);
}
</script>
`;
  $(wrapper).find('.layout-main-section').html(html);
};
