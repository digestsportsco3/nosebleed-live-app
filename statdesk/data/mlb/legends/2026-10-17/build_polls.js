// Builds poll lines from final picks: only fields where Stathead and MLB API agree.
const fs=require('fs');const S='/tmp/claude-0/-home-user-nosebleed-live-app/75721383-15dc-5412-b541-c7bb30bff665/scratchpad/';const L='/home/user/nosebleed-live-app/statdesk/data/mlb/legends/2026-10-17/';
const picks=JSON.parse(fs.readFileSync(S+'picks.json'));const R=JSON.parse(fs.readFileSync(S+'legends_ranked.json'));
const fold=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const NAMES={};for(const f of fs.readdirSync(L).filter(f=>f.startsWith('names-')))for(const o of JSON.parse(fs.readFileSync(L+f)).out)NAMES[fold(o.query)]=o;
const ALIAS={'henry aaron':'hank aaron','tris speaker':'tristram speaker'};
const TEAMN={ARI:/Arizona/,ATL:/Braves/,BAL:/Orioles|Browns/,BOS:/Red Sox|Americans/,CHC:/Cubs/,CHW:/White Sox/,CIN:/Reds/,CLE:/Cleveland/,COL:/Rockies/,DET:/Tigers/,HOU:/Houston/,KCR:/Royals/,LAD:/Dodgers|Brooklyn/,MIL:/Brewers|Pilots/,MIN:/Twins|Senators|Washington/,NYM:/Mets/,NYY:/Yankees|Highlanders|New York/,PHI:/Phillies/,PIT:/Pirates/,SDP:/Padres/,SEA:/Mariners/,SFG:/Giants/,STL:/Cardinals/,TEX:/Rangers|Senators/,TOR:/Blue Jays/,WSN:/Nationals|Expos|Montreal/,OAK:/Athletics/,ANA:/Angels/,FLA:/Marlins/,TBD:/Rays/};
const norm=x=>String(x??'').replace(/^0(?=\.)/,'');
const out={};const problems=[];
for(const [fr,list] of Object.entries(picks)){out[fr]=[];const r=R[fr];
 for(const [name,g] of list){const pool=g==='H'?r.hitters:r.pitchers;const p=pool.find(x=>fold(x.name)===fold(name));const b=p.best.x;
  let yrs=p.api&&p.api.yearByYear;let apiId=p.api&&p.api.id;
  if(!yrs){const n=NAMES[ALIAS[fold(name)]||fold(name)];const c=n&&n.people.map(q=>({q,rows:q.yearByYear.filter(y=>y.season===b.year_id&&TEAMN[fr].test(y.team&&y.team.name||''))})).find(z=>z.rows.length);if(c){yrs=c.q.yearByYear;apiId=c.q.id}}
  const rows=(yrs||[]).filter(y=>y.season===b.year_id&&TEAMN[fr].test(y.team&&y.team.name||''));
  if(rows.length!==1){problems.push(fr+' '+name+' api rows '+rows.length);continue}
  const s=rows[0].stat;const played26=(yrs||[]).some(y=>y.season==='2026'&&TEAMN[fr].test(y.team&&y.team.name||''));if(played26)problems.push(fr+' '+name+' PLAYED 2026');
  const F=g==='H'?[['AVG',b.b_batting_avg,s.avg],['HR',b.b_hr,s.homeRuns],['RBI',b.b_rbi,s.rbi],['H',b.b_h,s.hits],['SB',b.b_sb,s.stolenBases],['R',b.b_r,s.runs]]
   :[['W',b.p_w,s.wins],['L',b.p_l,s.losses],['ERA',b.p_earned_run_avg,s.era],['K',b.p_so,s.strikeOuts],['IP',b.p_ip,s.inningsPitched],['SV',b.p_sv,s.saves]];
  const ok={},bad=[];for(const [k,a,c] of F){if(norm(a)===norm(c))ok[k]=String(c).replace(/^0(?=\.)/,'');else bad.push(k+' '+a+'/'+c)}
  let line;
  if(g==='H'){const parts=[];if(ok.AVG)parts.push(ok.AVG);if(ok.HR)parts.push(ok.HR+' HR');if(ok.RBI)parts.push(ok.RBI+' RBI');else if(ok.R)parts.push(ok.R+' R');if(ok.SB&&+ok.SB>=30)parts.push(ok.SB+' SB');if(!ok.AVG&&ok.H)parts.unshift(ok.H+' H');line=parts.join(', ')}
  else{const parts=[];if(ok.W&&ok.L)parts.push(ok.W+'-'+ok.L);if(ok.ERA)parts.push(ok.ERA+' ERA');if(ok.K)parts.push(ok.K+' K');if(ok.SV&&+ok.SV>=20)parts.push(ok.SV+' SV');line=parts.join(', ')}
  out[fr].push({name,g,year:b.year_id,war:b[g==='H'?'b_war':'p_war'],top5:p.top5,line,bad,apiId});
 }}
fs.writeFileSync(S+'polls.json',JSON.stringify(out,null,1));
for(const [fr,l] of Object.entries(out)){console.log(fr);l.forEach(x=>console.log('  ',x.name,'('+x.year+'):',x.line,'| WAR',x.war,x.bad.length?'DROPPED '+x.bad.join('; '):''))}
console.log('PROBLEMS',problems);
