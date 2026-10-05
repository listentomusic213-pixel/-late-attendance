const $=s=>document.querySelector(s);
const T=[{k:'blue',n:'น้ำเงิน',e:'Blue',c:'#2F7BF6',t:'#E8F0FE',sz:240,w:1},{k:'pink',n:'ชมพู',e:'Pink',c:'#F0589A',t:'#FDE8F1',sz:236,w:.8},{k:'green',n:'เขียว',e:'Green',c:'#25B26B',t:'#E2F6EC',sz:228,w:.65},{k:'orange',n:'ส้ม',e:'Orange',c:'#F59A23',t:'#FEF1DC',sz:244,w:1.35},{k:'red',n:'แดง',e:'Red',c:'#E8504A',t:'#FDE9E8',sz:232,w:1.1}];
let TOTAL=T.reduce((a,t)=>a+t.sz,0);
const ico={check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',srch:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="4"/><path d="M3 10h18M8 3v4M16 3v4"/>',grid:'<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>',trophy:'<path d="M8 4h8v6a4 4 0 01-8 0zM8 6H4c0 3 1 4 4 5M16 6h4c0 3-1 4-4 5M12 14v4M8 20h8"/>'};
const svg=(n,x='')=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${x}>${ico[n]}</svg>`;

let BOOT={},ROS=[],DAYS=[],TODAY='',daily={},NW=0,MONTHS=[];
const sd=s=>new Date(s+'T00:00:00Z'),iso=d=>d.toISOString().slice(0,10);
const fmt=(s,o={day:'numeric',month:'short'})=>sd(s).toLocaleDateString('th-TH',{...o,timeZone:'UTC'});
const wkOf=s=>Math.floor((sd(s)-sd(DAYS[0]))/6048e5);
const mon=s=>s.slice(0,7);
const mLabel=m=>new Date(m+'-15T00:00:00Z').toLocaleDateString('th-TH',{month:'short',timeZone:'UTC'});
const wLabel=w=>{const d=sd(DAYS[0]);d.setUTCDate(d.getUTCDate()+w*7);return fmt(iso(d))};
// ---------- เชื่อมกับ Apps Script ผ่าน fetch (แทน google.script.run) ----------
const API='https://script.google.com/macros/s/AKfycbxPHEU3OU8NW8VmFD38RfmbiXoKsB9p4Fu5CiYYjZa27TdMxNrfXskwPbqlxhuq1-KLlg/exec';
function call(fn,a,ok,fail){
 if(fn=='recordLate')a.push(sessionStorage.getItem('who'));
 fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({fn,args:a,pin:sessionStorage.getItem('pin')})})
 .then(r=>r.json()).then(r=>{if(r.error=='PIN'){login('รหัสผ่านไม่ถูกต้อง');return}if(r.error)throw new Error(r.error);if(ok)ok(r.data)})
 .catch(e=>fail?fail(e):alert(e.message))}
function B(ok,fail){return new Proxy({},{get:(_,k)=>k=='withSuccessHandler'?f=>B(f,fail):k=='withFailureHandler'?f=>B(ok,f):(...a)=>call(k,a,ok,fail)})}
const gs=B();
function login(msg){$('#nav').innerHTML='';[1,2,3].forEach(i=>$('#v'+i).classList.add('hide'));$('#v0').classList.remove('hide');
 $('#v0').innerHTML=`<div class="card" style="max-width:420px;margin:40px auto"><h1 style="font-size:24px">เข้าสู่ระบบสำหรับครู</h1><p class="sub">${msg||'กรอกชื่อและรหัสผ่านที่โรงเรียนกำหนด'}</p>
 <div class="search" style="margin-bottom:12px"><input id="lw" placeholder="ชื่อครูผู้บันทึก" style="padding-left:20px" value="${sessionStorage.getItem('who')||''}"></div>
 <div class="search"><input id="lp" type="password" placeholder="รหัสผ่าน" style="padding-left:20px"></div>
 <button class="cta" style="font-size:18px;padding:16px;background:var(--blue);box-shadow:none" onclick="sessionStorage.setItem('who',$('#lw').value.trim()||'ครู');sessionStorage.setItem('pin',$('#lp').value);start()">เข้าสู่ระบบ</button></div>`}
// ---------- charts ----------
const nice=m=>{const s=Math.pow(10,Math.floor(Math.log10(m||1)));const f=m/s;return(f<=1?1:f<=2?2:f<=5?5:10)*s};
function axes(W,H,P,max){let g='';for(let i=0;i<=4;i++){const y=P.t+(H-P.t-P.b)*i/4;g+=`<line x1="${P.l}" x2="${W-P.r}" y1="${y}" y2="${y}" stroke="#E8ECF4"/><text x="${P.l-8}" y="${y+4}" text-anchor="end">${Math.round(max*(1-i/4))}</text>`}return g}
function bars(vals,labels,cols,o={}){const W=o.w||560,H=o.h||240,P={l:36,r:8,t:16,b:28},max=nice(Math.max(...vals)*1.1),bw=(W-P.l-P.r)/vals.length,w=Math.min(54,bw*.62);
 let s=`<svg viewBox="0 0 ${W} ${H}" width="100%" role="img">${axes(W,H,P,max)}`;
 vals.forEach((v,i)=>{const h=(H-P.t-P.b)*v/max,x=P.l+bw*i+(bw-w)/2,y=H-P.b-h;s+=`<rect x="${x}" y="${y}" width="${w}" height="${Math.max(h,0)}" rx="${Math.min(10,w/2)}" fill="${cols[i%cols.length]}"/><text x="${x+w/2}" y="${y-6}" text-anchor="middle" style="fill:#1F2A44;font-weight:700">${v}</text><text x="${x+w/2}" y="${H-8}" text-anchor="middle">${labels[i]}</text>`});return s+'</svg>'}
function line(series,labels,o={}){const W=o.w||640,H=o.h||260,P={l:36,r:12,t:16,b:28},n=labels.length,max=nice(Math.max(1,...series.flatMap(s=>s.v))*1.1),X=i=>P.l+(W-P.l-P.r)*i/Math.max(n-1,1),Y=v=>P.t+(H-P.t-P.b)*(1-v/max);
 let s=`<svg viewBox="0 0 ${W} ${H}" width="100%" role="img">${axes(W,H,P,max)}`;const st=Math.ceil(n/8);
 labels.forEach((l,i)=>{if(i%st==0)s+=`<text x="${X(i)}" y="${H-8}" text-anchor="middle">${l}</text>`});
 series.forEach(se=>{const d=se.v.map((v,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join('');
  if(o.area)s+=`<path d="${d}L${X(n-1)} ${H-P.b}L${X(0)} ${H-P.b}Z" fill="${se.c}" opacity=".12"/>`;
  s+=`<path d="${d}" fill="none" stroke="${se.c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  if(n<16)se.v.forEach((v,i)=>s+=`<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="#fff" stroke="${se.c}" stroke-width="2.5"/>`)});return s+'</svg>'}
function donut(vals,cols,center,sub){const r=62,C=2*Math.PI*r,tot=vals.reduce((a,b)=>a+b,0)||1;let off=0,s='<svg viewBox="0 0 180 180" width="100%" style="max-width:220px;display:block;margin:auto"><g transform="rotate(-90 90 90)">';
 vals.forEach((v,i)=>{const l=C*v/tot;s+=`<circle cx="90" cy="90" r="${r}" fill="none" stroke="${cols[i]}" stroke-width="22" stroke-dasharray="${Math.max(l-3,0)} ${C}" stroke-dashoffset="${-off}" stroke-linecap="round"/>`;off+=l});
 return s+`</g><text x="90" y="92" text-anchor="middle" style="fill:#1F2A44;font-size:30px;font-weight:800">${center}</text><text x="90" y="112" text-anchor="middle">${sub}</text></svg>`}
const badge=i=>`<span class="badge b-${T[i].k}">${T[i].n}</span>`;
const cols=T.map(t=>t.c);
// ---------- nav ----------
const VIEWS=[['เช็กมาสายรายวัน','cal'],['สถิตินักเรียน','user'],['สรุปรายวัน','check'],['แดชบอร์ด','grid']];
let cur=0;
function nav(){$('#nav').innerHTML=VIEWS.map((v,i)=>`<button class="${i==cur?'on':''}" onclick="go(${i})">${svg(v[1])}${v[0]}</button>`).join('');
 [0,1,2,3].forEach(i=>$('#v'+i).classList.toggle('hide',i!=cur))}
function go(i){cur=i;nav();[r0,r1,r2,r3][i]();scrollTo(0,0)}
let sel0=null;
function find(q){q=q.trim();return q?ROS.filter(s=>s.id.includes(q)):[]}
function r0(){const el=$('#v0');
 el.innerHTML=`<div class="head"><div><h1>เช็กมาสายรายวัน</h1><p class="sub">${fmt(TODAY,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p></div><span class="badge b-blue">ประตูหน้าโรงเรียน · หลัง 07:45 น.</span></div>
 <div class="grid g21"><div class="card"><h3>ค้นหานักเรียน</h3><p class="sub">พิมพ์เลขประจำตัวนักเรียน เช่น 66008</p>
 <label class="search">${svg('srch')}<input id="q0" inputmode="numeric" placeholder="เลขประจำตัวนักเรียน" autocomplete="off" aria-label="เลขประจำตัวนักเรียน"></label>
 <div class="sug" id="s0"></div><div id="res0"></div></div>
 <div class="card"><h3>บันทึกวันนี้</h3><p class="sub">รายการล่าสุดที่บันทึกในระบบ</p><div id="log0"></div></div></div>`;
 $('#q0').oninput=e=>{const f=find(e.target.value);$('#s0').innerHTML=f.length>1?f.slice(0,6).map(s=>`<button class="chip" onclick="pick(${ROS.indexOf(s)})">${s.id} · ${s.name.split(' ')[0]}</button>`).join(''):'';if(f.length==1)sel0=f[0];else if(!f.length)sel0=null;res0(e.target.value)};
 $('#s0').innerHTML=ROS.slice(0,4).map(s=>`<button class="chip" onclick="pick(${ROS.indexOf(s)})">${s.id}</button>`).join('');
 res0('');log0()}
function pick(i){sel0=ROS[i];$('#q0').value=sel0.id;$('#s0').innerHTML='';res0(sel0.id)}
// ---------- 2 student stats ----------
let sel1=ROS[3];
function r1(){const el=$('#v1');
 el.innerHTML=`<div class="head"><div><h1>สถิตินักเรียน</h1><p class="sub">ดูประวัติและแนวโน้มการมาสายรายบุคคล</p></div></div>
 <label class="search">${svg('srch')}<input id="q1" inputmode="numeric" placeholder="ค้นหาด้วยเลขประจำตัวนักเรียน" value="${sel1?sel1.id:''}" aria-label="เลขประจำตัวนักเรียน"></label>
 <div class="sug">${ROS.slice(0,6).map(s=>`<button class="chip" onclick="q1.value='${s.id}';p1('${s.id}')">${s.id}</button>`).join('')}</div><div id="r1"></div>`;
 $('#q1').oninput=e=>p1(e.target.value);p1(sel1?sel1.id:'')}
function p1render(q){const f=find(q),el=$('#r1');
 if(f.length!=1){el.innerHTML=`<div class="card empty"><b>${q.trim()?(f.length?'พบหลายรายการ พิมพ์เลขให้ครบ':'ไม่พบเลขประจำตัว '+q):'ค้นหานักเรียน'}</b>พิมพ์เลขประจำตัวเพื่อดูสถิติ</div>`;return}
 const s=sel1=f[0],t=T[s.team],wk=wkOf(TODAY),m=mon(TODAY),cw=s.rec.filter(r=>wkOf(r.d)==wk).length,cm=s.rec.filter(r=>mon(r.d)==m).length;
 const wv=Array(12).fill(0);s.rec.forEach(r=>{const i=wkOf(r.d)-(NW-12);if(i>=0)wv[i]++});
 const wl=wv.map((_,i)=>wLabel(NW-12+i));
 el.innerHTML=`<div class="card"><div class="prof"><div class="av" style="background:${t.c}">${s.name[0]}</div><div><h2>${s.name}</h2><p class="num" style="font-size:15px;font-weight:700">รหัส ${s.id}</p>${badge(s.team)} <span class="badge" style="background:var(--soft);color:var(--ink)">ชั้น ${s.gr}</span></div><div class="tot"><span class="num" style="color:${t.c}">${s.rec.length}</span><span>มาสายทั้งหมด (ครั้ง)</span></div></div></div>
 <div class="grid g3" style="margin:20px 0"><div class="card kpi"><span>สัปดาห์นี้</span><b class="num" style="font-size:36px;color:var(--blue)">${cw}</b></div><div class="card kpi"><span>เดือนนี้</span><b class="num" style="font-size:36px;color:var(--orange)">${cm}</b></div><div class="card kpi"><span>เฉลี่ยต่อเดือน</span><b class="num" style="font-size:36px;color:var(--green)">${(s.rec.length/MONTHS.length).toFixed(1)}</b></div></div>
 <div class="grid g21"><div class="card"><h3>ความถี่การมาสาย</h3><p class="sub">จำนวนครั้งต่อสัปดาห์ ย้อนหลัง 12 สัปดาห์</p>${bars(wv,wl.map((l,i)=>i%2?'':l),[t.c],{h:230})}</div>
 <div class="card"><h3>ประวัติการมาสาย</h3><p class="sub">ล่าสุดอยู่ด้านบน</p><div class="hist">${s.rec.length?`<table><tr><th>วันที่</th><th>เวลา</th></tr>${[...s.rec].reverse().map(r=>`<tr><td>${fmt(r.d,{weekday:'short',day:'numeric',month:'short'})}</td><td class="num">${r.t} น.</td></tr>`).join('')}</table>`:'<div class="empty"><b>ไม่เคยมาสาย</b>เยี่ยมมาก</div>'}</div></div></div>`}
// ---------- 3 daily summary ----------
let day2='';
function r2(){if(!day2)day2=TODAY;const el=$('#v2'),v=daily[day2],tot=v.reduce((a,b)=>a+b,0);
 el.innerHTML=`<div class="head"><div><h1>สรุปรายวัน</h1><p class="sub">จำนวนนักเรียนมาสายแยกตามสี</p></div><div class="tools"><select id="d2" aria-label="เลือกวันที่">${DAYS.slice(-15).reverse().map(d=>`<option value="${d}" ${d==day2?'selected':''}>${fmt(d,{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</option>`).join('')}</select></div></div>
 <div class="grid g5">${T.map((t,i)=>`<div class="stat" style="--c:${t.c}"><div class="lab"><span>${t.n}</span><span class="badge b-${t.k}">${t.e}</span></div><div class="big num">${v[i]}</div><small>จาก ${t.sz} คน · <b class="num">${(v[i]/t.sz*100).toFixed(1)}%</b></small><div class="track"><i style="width:${Math.min(100,v[i]/t.sz*100*6)}%"></i></div></div>`).join('')}</div>
 <div class="grid g3" style="margin:20px 0"><div class="card kpi w"><span>นักเรียนมาสายทั้งหมด</span><b class="num">${tot}</b></div><div class="card kpi w"><span>นักเรียนที่เช็กทั้งหมด</span><b class="num">${TOTAL.toLocaleString()}</b></div><div class="card kpi w"><span>สัดส่วนมาสาย</span><b class="num">${(tot/TOTAL*100).toFixed(1)}%</b></div></div>
 <div class="grid g21"><div class="card"><h3>เปรียบเทียบทั้ง 5 สี</h3><p class="sub">จำนวนนักเรียนมาสาย (คน)</p>${bars(v,T.map(t=>t.n),cols)}</div><div class="card"><h3>สัดส่วนตามสี</h3><p class="sub">แบ่งจากผู้มาสายทั้งหมด</p>${donut(v,cols,tot,'คน')}</div></div>`;
 $('#d2').onchange=e=>{day2=e.target.value;r2()}}
// ---------- 4 dashboard ----------
let gran='week',off=new Set();
function r3(){const el=$('#v3'),tv=T.map((_,i)=>DAYS.reduce((a,d)=>a+daily[d][i],0)),all=tv.reduce((a,b)=>a+b,0),top=tv.indexOf(Math.max(...tv)),tt=T[top];
 const uniq=BOOT.uniq;
 const keys=gran=='week'?[...Array(NW).keys()]:MONTHS,lab=gran=='week'?keys.map(wLabel):keys.map(mLabel);
 const agg=keys.map(k=>T.map((_,i)=>DAYS.filter(d=>(gran=='week'?wkOf(d):mon(d))==k).reduce((a,d)=>a+daily[d][i],0)));
 const ser=T.map((t,i)=>({c:t.c,v:agg.map(r=>r[i]),i})).filter(s=>!off.has(s.i));
 el.innerHTML=`<div class="head"><div><h1>แดชบอร์ดภาคเรียน</h1><p class="sub">ภาคเรียนที่ 1/2569 · ${fmt(DAYS[0])} – ${fmt(TODAY,{day:'numeric',month:'short',year:'numeric'})}</p></div><div class="seg"><button class="${gran=='week'?'on':''}" onclick="gran='week';r3()">รายสัปดาห์</button><button class="${gran=='month'?'on':''}" onclick="gran='month';r3()">รายเดือน</button></div></div>
 <div class="hl" style="--hc:${tt.c};--hc-t:${tt.t}"><div class="ic">${svg('trophy')}</div><div><b>สี${tt.n}มาสายมากที่สุด</b><p>คิดเป็น ${(tv[top]/all*100).toFixed(1)}% ของการมาสายทั้งภาคเรียน · มากกว่าสีที่น้อยที่สุด ${tv[top]-Math.min(...tv)} ครั้ง</p></div><span class="num">${tv[top].toLocaleString()} ครั้ง</span></div>
 <div class="grid g3"><div class="card kpi"><span>บันทึกการมาสายทั้งหมด</span><b class="num" style="color:var(--blue)">${all.toLocaleString()}</b></div><div class="card kpi"><span>นักเรียนที่เคยมาสาย (คน)</span><b class="num" style="color:var(--pink)">${uniq.toLocaleString()}</b></div><div class="card kpi"><span>เฉลี่ยต่อวัน (คน/วัน)</span><b class="num" style="color:var(--green)">${(all/DAYS.length).toFixed(1)}</b></div></div>
 <div class="grid g21" style="margin:20px 0"><div class="card"><h3>สะสมตามสี</h3><p class="sub">จำนวนครั้งทั้งภาคเรียน</p>${bars(tv,T.map(t=>t.n),cols)}</div><div class="card"><h3>สัดส่วนตามสี</h3><p class="sub">แบ่งจากทั้งภาคเรียน</p>${donut(tv,cols,all.toLocaleString(),'ครั้ง')}</div></div>
 <div class="card"><h3>แนวโน้มการมาสาย</h3><p class="sub">${gran=='week'?'รายสัปดาห์':'รายเดือน'} · กดชื่อสีเพื่อซ่อนหรือแสดงเส้น</p><div class="legend">${T.map((t,i)=>`<button class="lg ${off.has(i)?'off':''}" style="--c:${t.c}" onclick="off.has(${i})?off.delete(${i}):off.add(${i});r3()"><i></i>${t.n}</button>`).join('')}</div>${line(ser,lab,{h:280})}</div>
 <div class="card" style="margin-top:20px"><h3>สรุป${gran=='week'?'รายสัปดาห์':'รายเดือน'}</h3><p class="sub">จำนวนครั้งที่มาสายแยกตามสี</p><div class="scroll"><table><tr><th>${gran=='week'?'สัปดาห์เริ่ม':'เดือน'}</th>${T.map(t=>`<th>${t.n}</th>`).join('')}<th>รวม</th></tr>${keys.map((k,j)=>{const mx=Math.max(...agg[j]);return`<tr><td>${lab[j]}</td>${agg[j].map((v,i)=>`<td class="num" ${v==mx?`style="color:${T[i].c}"`:''}>${v}${v==mx?' ▲':''}</td>`).join('')}<td class="num">${agg[j].reduce((a,b)=>a+b,0)}</td></tr>`}).reverse().join('')}</table></div></div>`}

// ---------- ส่วนที่เชื่อมกับ Google Sheet ----------
const done=s=>s.td;
function res0(q){const el=$('#res0'),f=find(q);
 if(!q.trim()){el.innerHTML=`<div class="empty"><b>พร้อมเช็กชื่อ</b>พิมพ์เลขประจำตัวหรือเลือกจากรายการด้านบน</div>`;return}
 if(!f.length){el.innerHTML=`<div class="empty"><b>ไม่พบเลขประจำตัว ${q}</b>ตรวจสอบตัวเลขอีกครั้ง</div>`;return}
 if(f.length>1){el.innerHTML=`<div class="empty"><b>พบ ${f.length} รายการ</b>เลือกนักเรียนจากปุ่มด้านบน</div>`;return}
 const s=f[0],t=T[s.team];
 el.innerHTML=`<div class="prof"><div class="av" style="background:${t.c}">${s.name[0]}</div><div><h2>${s.name}</h2><p class="num" style="font-size:15px;font-weight:700">รหัส ${s.id}</p>${badge(s.team)} <span class="badge" style="background:var(--soft);color:var(--ink)">ชั้น ${s.gr}</span></div><div class="tot"><span class="num" style="color:${t.c}">${s.n}</span><span>มาสายสะสม (ครั้ง)</span></div></div>
 <button class="cta" ${done(s)?'disabled':''} onclick="rec('${s.id}')">${svg('check')}${done(s)?'บันทึกวันนี้แล้ว':'บันทึกการมาสาย'}</button>`}
function log0(){gs.withSuccessHandler(L=>{$('#log0').innerHTML=L.length?`<table>${L.reverse().map(x=>`<tr><td class="num">${x.t}</td><td>${x.name}</td><td>${badge(x.team)}</td></tr>`).join('')}</table>`:`<div class="empty"><b>ยังไม่มีรายการ</b>รายการที่บันทึกจะแสดงที่นี่</div>`}).getTodayLog()}
function rec(id){const s=ROS.find(x=>x.id==id);if(s.td)return;const b=document.querySelector('.cta');b.disabled=true;b.textContent='กำลังบันทึก...';
 gs.withSuccessHandler(r=>{if(!r.ok){alert(r.msg);res0(id);return}
  s.td=true;s.n=r.total;if(s.rec)s.rec.push({d:TODAY,t:r.time});daily[TODAY][s.team]++;res0(id);log0();
  $('#ov').innerHTML=`<div class="ov" onclick="if(event.target==this)cl()"><div class="modal" role="alertdialog"><div class="ok"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h2>บันทึกสำเร็จ</h2><p style="color:var(--ink);font-size:18px;font-weight:600">${s.name}</p><p>${badge(s.team)} ชั้น ${s.gr}</p><p>เวลา ${r.time} น. · มาสายสะสม ${s.n} ครั้ง</p><button onclick="cl()">ตกลง</button></div></div>`;setTimeout(cl,4500)})
 .withFailureHandler(e=>{alert('บันทึกไม่สำเร็จ: '+e.message);res0(id)}).recordLate(id)}
function cl(){$('#ov').innerHTML=''}
function p1(q){const f=find(q);
 if(f.length==1&&!f[0].rec){$('#r1').innerHTML='<div class="card empty"><b>กำลังโหลดประวัติ...</b></div>';
  gs.withSuccessHandler(h=>{f[0].rec=h;p1render(q)}).getHistory(f[0].id)}else p1render(q)}
// ---------- เริ่มทำงาน ----------
function start(){
nav();$('#v0').innerHTML='<div class="card empty"><b>กำลังโหลดข้อมูล...</b></div>';
gs.withSuccessHandler(b=>{BOOT=b;ROS=b.students;DAYS=b.days;TODAY=b.today;daily=b.daily;
 T.forEach((t,i)=>t.sz=b.sizes[i]||1);TOTAL=T.reduce((a,t)=>a+t.sz,0);NW=wkOf(TODAY)+1;MONTHS=[...new Set(DAYS.map(mon))];r0()})
 .withFailureHandler(e=>{$('#v0').innerHTML='<div class="card empty"><b>โหลดข้อมูลไม่สำเร็จ</b>'+e.message+'</div>'}).getBoot();
}
sessionStorage.getItem('pin')?start():login();
