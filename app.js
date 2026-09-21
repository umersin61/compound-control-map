'use strict';
const D=window.CONTROL_MAP;
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const short=a=>a?a.slice(0,8)+'…'+a.slice(-6):'';
const nodeById=Object.fromEntries(D.nodes.map(n=>[n.id,n]));
const sourceById=Object.fromEntries(D.sources.map(s=>[s.id,s]));
const labels={onchain:'ON-CHAIN VERIFIED',documented:'DOCUMENTED',inferred:'INFERRED',unknown:'UNKNOWN',proposed:'CONCEPTUAL'};
const badge=s=>`<span class="badge ${s}">${labels[s]||s}</span>`;
const sourceLinks=ids=>[...new Set(ids)].filter(id=>sourceById[id]).map(id=>{const s=sourceById[id];return `<a class="drawer-source" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a>`;}).join('');
let state={view:'institutional',model:'current',selected:null};
const views={
institutional:{title:'Institutional control',description:'<strong>Two separate permission layers.</strong> The Admin Safe administers the market and Configurator. The Upgrade Safe owns the proxy administrator. Governor ownership or a Safe module connecting those authorities to governance was not found in the reviewed paths.',positions:{gov:[35,35],timelock:[35,235],community:[35,485],admin:[435,65],upgrade:[435,340],comet:[850,65],proxyadmin:[850,340],config:[850,525]},height:640},
upgrade:{title:'Upgrade path',description:'<strong>Ownership determines the upgrade route.</strong> CometProxyAdmin is owned by the 4-of-7 Upgrade Safe and administers both proxies. The four Admin Safe owners are a subset of the seven Upgrade owners.',positions:{timelock:[35,245],upgrade:[395,245],proxyadmin:[735,245],comet:[850,65],config:[850,485]},height:600},
treasury:{title:'TMC / funding',description:'<strong>Custody locations matter.</strong> Governance’s superior rights over the Treasury Timelock and escrow do not make the Governor an owner of the TMC Safe. These are selected control paths, not an inventory of all treasury balances.',positions:{gov:[35,45],timelock:[35,245],community:[35,465],tmc:[435,45],treasury:[435,245],escrow:[850,45],avatar:[850,245]},height:580},
guardian:{title:'Community Guardian',description:'<strong>A cancellation power, not an automatic legitimacy filter.</strong> Community signers can authorize cancellation of unexecuted Governor proposals while their authority is active. Institutional market pause authority is documented in deployment configuration; it was not freshly confirmed by the pauseGuardian getter.',positions:{community:[420,245],gov:[35,45],timelock:[35,415],comet:[850,45],treasury:[850,415]},height:550},
revocation:{title:'Governance revocation path',description:'<strong>The missing permission is the issue.</strong> Treasury administration has a path back to the Governor Timelock. The reviewed Institutional Safe and proxy control paths do not. This is a bounded contract-permission finding, not a conclusion about development mandates or legal remedies.',positions:{gov:[35,30],timelock:[35,220],admin:[435,70],upgrade:[435,335],comet:[850,70],proxyadmin:[850,335],treasury:[35,490]},height:610},
signers:{title:'Signer overlap',description:'<strong>Exact addresses, not assumed identities.</strong> Select an owner to highlight its memberships. All four principal Safe owner sets were read on 21 September. The nested Safe adds an additional authorization layer.',height:900},
people:{title:'People & public pseudonyms',description:'<strong>Only supported public attribution is shown.</strong> Names and pseudonyms come from public signer records. They do not prove who presently holds an organization’s private key. Unknown addresses are available in the signer view and matrix.',height:530},
organizations:{title:'Organizations & documented roles',description:'<strong>Organizational descriptions are a separate evidence layer.</strong> Solid signer edges use exact on-chain addresses. Dashed institutional-seat links reflect public descriptions where an exact key-to-organization mapping is unresolved. They are not additional signing votes.',height:780}
};
function positionsFor(){
 const v=views[state.view];
 if(state.model==='proposed')return {height:630,positions:{gov:[35,35],timelock:[35,235],controller:[395,235],admin:[730,65],upgrade:[730,420],comet:[890,235]}};
 if(v.positions)return {height:v.height,positions:v.positions};
 const positions={};
 ['admin','upgrade','tmc','community'].forEach((id,i)=>positions[id]=[20+i*275,25]);
 let list=D.nodes.filter(n=>n.signer);
 if(state.view==='people')list=list.filter(n=>n.type==='person');
 if(state.view==='organizations')list=D.nodes.filter(n=>n.type==='organization');
 const columns=state.view==='people'?3:4;
 list.forEach((n,i)=>positions[n.id]=[20+(i%columns)*(1100/columns),230+Math.floor(i/columns)*120]);
 return {positions,height:Math.max(v.height,260+Math.ceil(list.length/columns)*120)};
}
function visibleEdges(positions){
 const ids=Object.keys(positions);
 return D.edges.filter(e=>ids.includes(e.from)&&ids.includes(e.to)&&!(e.type==='missing-direct-revocation-path'&&e.to==='upgrade'&&state.view!=='upgrade')&&(state.model==='proposed'?(e.status==='proposed'||(e.from==='gov'&&e.to==='timelock')):e.status!=='proposed'));
}
function route(a,b,e){
 const [x1,y1]=a,[x2,y2]=b;const w=190,h=83;
 let sx=x1+w/2,sy=y1+h/2,tx=x2+w/2,ty=y2+h/2,path;
 if(Math.abs(x2-x1)>240){sx=x2>x1?x1+w:x1;tx=x2>x1?x2:x2+w;const mid=(sx+tx)/2;path=`M${sx},${sy} C${mid},${sy} ${mid},${ty} ${tx},${ty}`;}
 else if(Math.abs(y2-y1)>100){sy=y2>y1?y1+h:y1;ty=y2>y1?y2:y2+h;if(e.type==='vetoes'&&e.to==='gov'){sx=x1;tx=x2;path=`M${sx},${sy} C${Math.min(x1,x2)-25},${sy} ${Math.min(x1,x2)-25},${ty} ${tx},${ty}`;}else{const mid=(sy+ty)/2;path=`M${sx},${sy} C${sx},${mid} ${tx},${mid} ${tx},${ty}`;}}
 else{sx=x1+w;tx=x2;path=`M${sx},${sy} L${tx},${ty}`;}
 if(e.type==='vetoes'&&e.to==='gov'&&x1===x2)return {path,lx:x1+110,ly:y1-30};
 return {path,lx:(sx+tx)/2,ly:(sy+ty)/2-8};
}
function renderGraph(){
 const {positions,height}=positionsFor();const edges=visibleEdges(positions);const graph=$('#graph');
 graph.style.height=height+'px';
 const overlap=['signers','people','organizations'].includes(state.view)&&state.model==='current';
 const hasSelection=overlap&&state.selected&&positions[state.selected];
 const neighbors=new Set([state.selected]);edges.forEach(e=>{if(e.from===state.selected)neighbors.add(e.to);if(e.to===state.selected)neighbors.add(e.from);});
 let svg=`<svg viewBox="0 0 1100 ${height}" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#62998a"/></marker><marker id="amber-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#c08239"/></marker></defs>`;
 edges.forEach(e=>{const r=route(positions[e.from],positions[e.to],e);const missing=e.type==='missing-direct-revocation-path';const faint=hasSelection&&e.from!==state.selected&&e.to!==state.selected;const cls=missing?'missing':e.status;svg+=`<path class="edge ${cls} ${faint?'faint':''}" d="${r.path}" marker-end="url(#${missing?'amber-arrow':'arrow'})"/>`;if(!overlap&&!(e.from==='admin'&&e.to==='config')&&!(e.from==='community'&&e.to==='comet')){const label=missing?'no direct route identified':e.label;svg+=`<text class="edge-label ${cls}" x="${r.lx}" y="${r.ly}" text-anchor="middle">${esc(label)}</text>`;}});
 svg+='</svg>';
 graph.innerHTML=svg+Object.entries(positions).map(([id,[x,y]])=>{const n=nodeById[id];const sub=n.threshold?`${n.threshold} of ${n.owners?.length||1} owners`:n.status==='proposed'?'Not deployed':n.address?short(n.address):'Public documentation';return `<button class="graph-node ${n.type} ${n.id===state.selected?'selected':''} ${hasSelection&&!neighbors.has(id)?'faint':''}" data-node="${id}" style="left:${x/11}%;top:${y}px" aria-label="${esc(n.label)}: ${esc(sub)}. Open evidence"><span class="node-type">${n.signer?(n.id==='fd947'?'Nested Safe owner':n.status==='unknown'?'Unattributed owner':'Documented attribution'):n.type==='proposal'?'Proposed controller':n.type==='safe'?'Signing authority':n.type}</span><strong>${esc(n.label)}</strong><span class="node-sub">${esc(sub)}</span></button>`;}).join('');
 $('#view-title').textContent=state.model==='proposed'?'Proposed governance-owned model':views[state.view].title;
 $('#view-count').textContent=`${Object.keys(positions).length} nodes · ${edges.length} relationships`;
 $('#view-description').innerHTML=state.model==='proposed'?'<strong>Conceptual design, not deployed.</strong> The controller represents superior governance ownership. Operator links would be delegated permissions, not unrestricted ownership. All privileged upgrade and administrative routes must preserve governance’s ability to revoke.':views[state.view].description;
 $('#model-note').textContent=state.model==='proposed'?'Design comparison only. No controller has been implemented or audited; current permissions have not changed.':'Current permissions. Select any node or relationship to inspect its evidence.';
 $('#edge-count').textContent=`(${edges.length})`;
 $('#edge-list').innerHTML=edges.map(e=>`<div class="relation"><div><button class="text-button" data-node="${e.from}">${esc(nodeById[e.from].label)}</button> → <button class="text-button" data-node="${e.to}">${esc(nodeById[e.to].label)}</button><p>${esc(e.label)} ${badge(e.status)}</p></div><div>${sourceLinks(e.sources)}</div></div>`).join('');
 document.querySelectorAll('.filterbar button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
 $('#current').setAttribute('aria-pressed',String(state.model==='current'));$('#proposed').setAttribute('aria-pressed',String(state.model==='proposed'));
}
function showNode(id){
 const n=nodeById[id];if(!n)return;state.selected=id;renderGraph();
 const memberships=D.edges.filter(e=>e.type==='signer-of'&&e.from===id).map(e=>e.to);
 const observations=D.evidence.filter(e=>e.node===id);
 $('#drawer-content').innerHTML=`${badge(n.status)}<h2 id="drawer-title">${esc(n.label)}</h2><p>${esc(n.summary)}</p>${n.address?`<a class="address" href="https://etherscan.io/address/${n.address}" target="_blank" rel="noopener noreferrer">${n.address} ↗</a>`:''}${n.threshold?`<p class="drawer-stat">${n.threshold} / ${n.owners?.length||1}<small>owner authorizations required</small></p>`:''}<h3>${n.signer?'What this membership means':'Powers & boundaries'}</h3><p>${esc(n.powers)}</p>${n.human?`<p><strong>Individual key custodian:</strong> ${esc(n.human)}</p>`:''}${n.modules?`<h3>Enabled Safe modules</h3><p>${n.modules.length?'See ledger':'No enabled modules returned'} · observed ${esc(n.moduleDate)}. Owner-authorized transactions remain possible; this is not a complete Safe security audit.</p>`:''}${n.owners?`<h3>Exact owner set</h3>${n.owners.map(o=>`<button class="owner-link" data-node="${o}">${esc(nodeById[o].label)}<small>${nodeById[o].address}</small></button>`).join('')}`:''}${memberships.length?`<h3>Owner of / signer on</h3>${memberships.map(m=>`<button class="owner-link" data-node="${m}">${esc(nodeById[m].label)} · ${nodeById[m].threshold} of ${nodeById[m].owners.length}</button>`).join('')}`:''}${observations.length?`<h3>Observed readings</h3>${observations.map(o=>`<p><strong>${esc(o.method)}</strong><br>${esc(o.date)}${o.note?'<br>'+esc(o.note):''}</p>`).join('')}`:''}${n.signer?`<h3>Evidence separation</h3><p>Safe membership is verified from the owner list. ${n.identityStatus==='unknown'?'Person and organization attribution is unknown.':'The label is documented separately; it is not a cryptographic proof of present human key custody.'}</p>`:''}<h3>Sources</h3>${sourceLinks(n.sources)}`;
 if(!$('#drawer').open)$('#drawer').showModal();$('#drawer').scrollTop=0;
}
function renderMatrix(){
 const keys=['admin','upgrade','tmc','community','fd947'];
 const shared=$('#shared-only').checked;
 const list=D.nodes.filter(n=>n.signer).map(n=>({n,m:keys.map(k=>nodeById[k].owners.includes(n.id))})).filter(r=>!shared||r.m.filter(Boolean).length>1).sort((a,b)=>b.m.filter(Boolean).length-a.m.filter(Boolean).length||a.n.label.localeCompare(b.n.label));
 $('#matrix').innerHTML=list.map(({n,m})=>`<tr><td><button data-node="${n.id}"><strong>${esc(n.label)}<span class="attribution">${n.identityStatus==='unknown'?'identity unknown':n.id==='fd947'?'explorer label':'publicly documented'}</span></strong><span>${short(n.address)}</span></button></td>${m.map(x=>`<td>${x?'<span class="dot" aria-label="Owner">✓</span>':'<span class="no-seat" aria-label="Not an owner">—</span>'}</td>`).join('')}</tr>`).join('');
}
function setView(view){state.view=view;state.model='current';state.selected=['signers','people','organizations'].includes(view)?'FC63':null;renderGraph();}
document.addEventListener('click',e=>{const n=e.target.closest('[data-node]');if(n){showNode(n.dataset.node);return;}const v=e.target.closest('[data-view]');if(v){setView(v.dataset.view);if(!v.closest('.filterbar'))$('#explore').scrollIntoView({behavior:'smooth'});}});
$('#close-drawer').addEventListener('click',()=>$('#drawer').close());
$('#drawer').addEventListener('click',e=>{if(e.target===$('#drawer')){const r=$('#drawer').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right)$('#drawer').close();}});
$('#current').addEventListener('click',()=>{state.model='current';renderGraph();});
function proposed(){state.model='proposed';state.selected=null;renderGraph();}
$('#proposed').addEventListener('click',proposed);
$('#show-proposed').addEventListener('click',()=>{proposed();$('#explore').scrollIntoView({behavior:'smooth'});});
$('#shared-only').addEventListener('change',renderMatrix);
$('#search').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase(),r=$('#search-results');r.hidden=!q;if(!q){r.innerHTML='';return;}const matches=D.nodes.filter(n=>[n.label,n.address,n.summary].join(' ').toLowerCase().includes(q));r.innerHTML=matches.length?matches.map(n=>`<button data-node="${n.id}">${esc(n.label)}<small>${esc(n.address?short(n.address):n.type)}</small></button>`).join(''):'<p>No matching node. Try an address prefix or a public label.</p>';});
$('#limitations').innerHTML=D.limitations.map(t=>`<li>${esc(t)}</li>`).join('');
$('#sources').innerHTML=D.sources.map(s=>`<a class="source-card" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${badge(s.kind)}<strong>${esc(s.title)} ↗</strong><p>${esc(s.note)}</p><small>Reviewed ${esc(s.accessed)}</small></a>`).join('');
$('#ledger').innerHTML=D.evidence.map(o=>`<div class="ledger-item"><strong>${esc(nodeById[o.node].label)} · ${esc(o.date)}</strong><p><code>${esc(o.method)}</code></p><pre>${esc(JSON.stringify(o.result,null,2))}</pre>${o.note?`<small>${esc(o.note)}</small>`:''}${sourceLinks([o.source])}</div>`).join('');
renderGraph();renderMatrix();
