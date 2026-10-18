const fs=require('fs');const L='/home/user/nosebleed-live-app/statdesk/data/mlb/legends/2026-10-17/';
const only=process.argv.slice(2);
const num=x=>{const v=parseFloat(String(x||'').replace(/,/g,''));return Number.isFinite(v)?v:null};
const fold=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const EXCL={NYY:['Derek Jeter','Alex Rodriguez','Mariano Rivera','CC Sabathia']};
const out={};
for(const f of fs.readdirSync(L).filter(f=>f.endsWith('-stathead.json')).sort()){
  const r=JSON.parse(fs.readFileSync(L+f));const fr=r.franchise;if(only.length&&!only.includes(fr))continue;
  const api=JSON.parse(fs.readFileSync(L+f.replace('stathead','mlbapi')));
  const res={fr,hitters:[],pitchers:[],multiTeamRows:0};
  for(const [grp,wk] of [['batting','b_war'],['pitching','p_war']]){
    const rows=(r[grp]&&r[grp].rows)||[];if(rows.length<100){res.warn=(res.warn||'')+grp+' rows '+rows.length+'; ';}
    res.multiTeamRows+=rows.filter(x=>/,/.test(x.teams_played_for||'')).length;
    const by={};for(const x of rows){const w=num(x[wk]);if(w==null)continue;(by[x._id||x.name_display]=by[x._id||x.name_display]||{name:x.name_display,id:x._id,s:[]}).s.push({w,x})}
    const list=Object.values(by).map(p=>{p.s.sort((a,b)=>b.w-a.w);p.top5=Math.round(p.s.slice(0,5).reduce((a,b)=>a+b.w,0)*10)/10;p.best=p.s[0];p.played2026=p.s.some(z=>z.x.year_id==='2026');
      const m=api.players.find(q=>q.brId===p.id||fold(q.name)===fold(p.name));p.api=m&&m.matched;
      if(p.api&&(p.api.yearByYear||[]).some(y=>y.season==='2026'))p.api2026teams=(p.api.yearByYear||[]).filter(y=>y.season==='2026').map(y=>y.team&&y.team.name);
      return p}).sort((a,b)=>b.top5-a.top5);
    res[grp==='batting'?'hitters':'pitchers']=list.slice(0,10);
  }
  out[fr]=res;
}
const pad=(s,n)=>String(s).padEnd(n);
for(const [fr,res] of Object.entries(out)){
  console.log('=====',fr,res.warn||'','multiTeamRows',res.multiTeamRows);
  for(const p of res.hitters.slice(0,7)){const b=p.best.x;console.log(' H',pad(p.name,22),pad(p.top5,5),p.played2026?'2026!':'     ',p.api2026teams?('api2026:'+p.api2026teams.join('/')):'', '| best',b.year_id,b.b_war,b.b_batting_avg,b.b_hr+'HR',b.b_rbi+'RBI',b.b_onbase_plus_slugging,b.b_sb+'SB',b.teams_played_for,p.api?'':'NOAPI')}
  for(const p of res.pitchers.slice(0,5)){const b=p.best.x;console.log(' P',pad(p.name,22),pad(p.top5,5),p.played2026?'2026!':'     ',p.api2026teams?('api2026:'+p.api2026teams.join('/')):'','| best',b.year_id,b.p_war,b.p_w+'-'+b.p_l,b.p_earned_run_avg,b.p_so+'K',b.p_sv+'SV',b.p_ip+'IP',b.teams_played_for,p.api?'':'NOAPI')}
}
fs.writeFileSync('/tmp/claude-0/-home-user-nosebleed-live-app/75721383-15dc-5412-b541-c7bb30bff665/scratchpad/legends_ranked.json',JSON.stringify(out));
