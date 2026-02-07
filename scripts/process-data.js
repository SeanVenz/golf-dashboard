import XLSX from 'xlsx';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'src', 'data');

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

// ── Helpers ──────────────────────────────────────────────────────────────────

function readWorkbook(filename) {
  return XLSX.readFile(resolve(ROOT, filename), { cellDates: true });
}

function toISODate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    const d = val;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  if (typeof val === 'string') {
    const match = val.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) return match[0];
  }
  return null;
}

function timeToDecimalHours(val) {
  if (val instanceof Date) {
    return val.getUTCHours() + val.getUTCMinutes() / 60 + val.getUTCSeconds() / 3600;
  }
  if (typeof val === 'number') {
    return val * 24;
  }
  return 0;
}

function num(val) {
  if (val == null || val === '') return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function getCellValue(sheet, r, c) {
  const addr = XLSX.utils.encode_cell({ r, c });
  const cell = sheet[addr];
  return cell ? cell.v : null;
}

// ── Step 1: Build unified name resolution ───────────────────────────────────

console.log('Reading Names.xlsx...');
const wbNames = readWorkbook('Names.xlsx');
const namesSheet = wbNames.Sheets[wbNames.SheetNames[0]];
const namesRows = XLSX.utils.sheet_to_json(namesSheet);

// Read Roster_Schedule to get canonical names
console.log('Reading Roster_Schedule.xlsx (for canonical names)...');
const wbRosterPre = readWorkbook('Roster_Schedule.xlsx');
const rosterRowsPre = XLSX.utils.sheet_to_json(wbRosterPre.Sheets[wbRosterPre.SheetNames[0]], { cellDates: true });

// Build canonical name set from Roster_Schedule (these are the real names)
const canonicalNames = new Map(); // lower → exact name from Roster_Schedule
for (const row of rosterRowsPre) {
  const name = row.Name ? String(row.Name).trim() : null;
  if (name) {
    canonicalNames.set(name.toLowerCase(), name);
  }
}

// Build unified name resolution: any_variant_lower → canonical_name
const nameResolver = new Map();

// First, add all canonical Roster_Schedule names
for (const [lower, exact] of canonicalNames) {
  nameResolver.set(lower, exact);
}

// Then, add Names.xlsx mappings (Hubstaff name → Roster name)
// The Names.xlsx "Roster" column should match Roster_Schedule names
for (const row of namesRows) {
  const hubName = String(row.Hubstaff || '').trim();
  const rosterName = String(row.Roster || '').trim();
  if (!hubName || !rosterName) continue;

  // Find the canonical version of the roster name
  const canonical = canonicalNames.get(rosterName.toLowerCase()) || rosterName;

  // Map the hubstaff name variant to canonical
  nameResolver.set(hubName.toLowerCase(), canonical);
  // Also map the roster column value
  nameResolver.set(rosterName.toLowerCase(), canonical);
}

// Also add Aloware names by reading them
console.log('Reading Aloware Logs.xlsx (for name variants)...');
const wbAlowarePre = readWorkbook('Aloware Logs.xlsx');
const alowareSheetPre = wbAlowarePre.Sheets[wbAlowarePre.SheetNames[0]];
const alowareRangePre = XLSX.utils.decode_range(alowareSheetPre['!ref']);
for (let r = 4; r <= alowareRangePre.e.r; r++) {
  const nameVal = getCellValue(alowareSheetPre, r, 1);
  if (nameVal) {
    const name = String(nameVal).trim();
    const lower = name.toLowerCase();
    if (!nameResolver.has(lower)) {
      // Try to find a canonical match, otherwise use as-is
      const canonical = canonicalNames.get(lower) || name;
      nameResolver.set(lower, canonical);
    }
  }
}

// Also add Sales tracker names
console.log('Reading Sales tracker.xlsx (for name variants)...');
const wbSalesPre = readWorkbook('Sales tracker.xlsx');
const salesRowsPre = XLSX.utils.sheet_to_json(wbSalesPre.Sheets[wbSalesPre.SheetNames[0]], { cellDates: true });
for (const row of salesRowsPre) {
  const name = row.Name ? String(row.Name).trim() : null;
  if (name) {
    const lower = name.toLowerCase();
    if (!nameResolver.has(lower)) {
      const canonical = canonicalNames.get(lower) || name;
      nameResolver.set(lower, canonical);
    }
  }
}

console.log(`  Name resolver entries: ${nameResolver.size}`);

function resolveName(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  return nameResolver.get(trimmed.toLowerCase()) || trimmed;
}

// ── Step 2: Parse Aloware Logs ──────────────────────────────────────────────

console.log('Parsing Aloware Logs...');
const alowareSheet = alowareSheetPre;
const alowareRange = alowareRangePre;

// Columns by position (row 2 has headers but duplicates exist):
// 0: sim_date, 1: Setter_name, 2: Direction
// 3: sec_duration (bucket 0, <30s), 4: calls (bucket 0)
// 5: sec_duration (bucket 1, 30-660s), 6: calls (bucket 1)
// 7: sec_duration (bucket 2, >660s), 8: calls (bucket 2)
// 9: sec_duration (total), 10: calls (total)
// 11: IB_Calls, 12: OB_Calls, 13: IB_Duration, 14: OB_Duration

const alowareRecords = [];
for (let r = 4; r <= alowareRange.e.r; r++) {
  const dateVal = getCellValue(alowareSheet, r, 0);
  const name = getCellValue(alowareSheet, r, 1);
  const direction = getCellValue(alowareSheet, r, 2);

  if (!dateVal || !name) continue;

  const date = toISODate(dateVal);
  if (!date) continue;

  alowareRecords.push({
    date,
    name: resolveName(name),
    direction: String(direction || '').toLowerCase().trim(),
    secDuration0: num(getCellValue(alowareSheet, r, 3)),
    calls0: num(getCellValue(alowareSheet, r, 4)),
    secDuration1: num(getCellValue(alowareSheet, r, 5)),
    calls1: num(getCellValue(alowareSheet, r, 6)),
    secDuration2: num(getCellValue(alowareSheet, r, 7)),
    calls2: num(getCellValue(alowareSheet, r, 8)),
    totalSecDuration: num(getCellValue(alowareSheet, r, 9)),
    totalCalls: num(getCellValue(alowareSheet, r, 10)),
    ibCalls: num(getCellValue(alowareSheet, r, 11)),
    obCalls: num(getCellValue(alowareSheet, r, 12)),
    ibDuration: num(getCellValue(alowareSheet, r, 13)),
    obDuration: num(getCellValue(alowareSheet, r, 14)),
  });
}

console.log(`  Aloware records parsed: ${alowareRecords.length}`);

// Merge inbound + outbound per agent/day
const alowareMerged = new Map();
for (const rec of alowareRecords) {
  const key = `${rec.date}|${rec.name}`;
  if (!alowareMerged.has(key)) {
    alowareMerged.set(key, {
      date: rec.date,
      name: rec.name,
      calls0: 0, secDuration0: 0,
      calls1: 0, secDuration1: 0,
      calls2: 0, secDuration2: 0,
      totalCalls: 0, totalSecDuration: 0,
      ibCalls: 0, obCalls: 0,
      ibDuration: 0, obDuration: 0,
    });
  }
  const m = alowareMerged.get(key);
  m.calls0 += rec.calls0;
  m.secDuration0 += rec.secDuration0;
  m.calls1 += rec.calls1;
  m.secDuration1 += rec.secDuration1;
  m.calls2 += rec.calls2;
  m.secDuration2 += rec.secDuration2;
  m.totalCalls += rec.totalCalls;
  m.totalSecDuration += rec.totalSecDuration;
  m.ibCalls += rec.ibCalls;
  m.obCalls += rec.obCalls;
  m.ibDuration += rec.ibDuration;
  m.obDuration += rec.obDuration;
}

console.log(`  Aloware merged (agent/day): ${alowareMerged.size}`);

// ── Step 3: Parse Hubstaff ──────────────────────────────────────────────────

console.log('Parsing Hubstaff...');
const wbHubstaff = readWorkbook('Hubstaff.xlsx');
const hubstaffRows = XLSX.utils.sheet_to_json(wbHubstaff.Sheets[wbHubstaff.SheetNames[0]], { cellDates: true });

const hubstaffRecords = [];
for (const row of hubstaffRows) {
  const date = toISODate(row.Date);
  const name = resolveName(row.Member);
  if (!date || !name) continue;

  hubstaffRecords.push({
    date,
    name,
    project: String(row.Project || '').trim(),
    regularHours: timeToDecimalHours(row['Regular hours']),
    activity: num(row.Activity),
  });
}

// Some agents have multiple project entries per day — aggregate
const hubstaffMerged = new Map();
for (const rec of hubstaffRecords) {
  const key = `${rec.date}|${rec.name}`;
  if (!hubstaffMerged.has(key)) {
    hubstaffMerged.set(key, {
      date: rec.date,
      name: rec.name,
      regularHours: 0,
      activitySum: 0,
      activityCount: 0,
    });
  }
  const m = hubstaffMerged.get(key);
  m.regularHours += rec.regularHours;
  m.activitySum += rec.activity;
  m.activityCount += 1;
}

console.log(`  Hubstaff records parsed: ${hubstaffRecords.length}, merged: ${hubstaffMerged.size}`);

// ── Step 4: Parse Roster_Schedule ───────────────────────────────────────────

console.log('Parsing Roster_Schedule...');
const rosterRows = rosterRowsPre;

const rosterRecords = [];
for (const row of rosterRows) {
  const date = toISODate(row.Date);
  const name = resolveName(row.Name);
  if (!date || !name) continue;

  rosterRecords.push({
    date,
    name,
    team: String(row.Team || '').trim(),
    role: String(row.Role || '').trim(),
    lob: String(row.LOB || '').trim(),
    status: row.Status ? String(row.Status).trim() : null,
    scheduledHrs: num(row.Scheduled_Hrs),
    wave: row.Wave ? String(row.Wave).trim() : null,
    hireDate: toISODate(row['Hire Date']),
    shiftStart: row.START instanceof Date
      ? `${String(row.START.getUTCHours()).padStart(2,'0')}:${String(row.START.getUTCMinutes()).padStart(2,'0')}`
      : null,
    shiftEnd: row.END instanceof Date
      ? `${String(row.END.getUTCHours()).padStart(2,'0')}:${String(row.END.getUTCMinutes()).padStart(2,'0')}`
      : null,
  });
}

const rosterMap = new Map();
for (const rec of rosterRecords) {
  rosterMap.set(`${rec.date}|${rec.name}`, rec);
}

console.log(`  Roster records parsed: ${rosterRecords.length}`);

// ── Step 5: Parse Sales Tracker ─────────────────────────────────────────────

console.log('Parsing Sales tracker...');
const salesRows = salesRowsPre;

const salesRecords = [];
for (const row of salesRows) {
  const date = toISODate(row.Date);
  const name = resolveName(row.Name);
  if (!date || !name) continue;

  salesRecords.push({
    date,
    name,
    product: num(row.Product),
    vip: num(row.VIP),
    cp: num(row.CP),
    sc: num(row.SC),
    gs: num(row.GS),
  });
}

const salesMap = new Map();
for (const rec of salesRecords) {
  salesMap.set(`${rec.date}|${rec.name}`, rec);
}

console.log(`  Sales records parsed: ${salesRecords.length}`);

// ── Step 6: Join all sources on Date + Name ─────────────────────────────────

console.log('Joining all data sources...');

// Collect all unique date+name keys from all sources
const allKeys = new Set();
for (const key of alowareMerged.keys()) allKeys.add(key);
for (const key of hubstaffMerged.keys()) allKeys.add(key);
for (const key of rosterMap.keys()) allKeys.add(key);
for (const key of salesMap.keys()) allKeys.add(key);

// Build agent metadata lookup from roster (latest info per agent)
const agentMeta = new Map();
for (const rec of rosterRecords) {
  const existing = agentMeta.get(rec.name);
  if (!existing || rec.date > existing.date) {
    agentMeta.set(rec.name, {
      team: rec.team,
      role: rec.role,
      lob: rec.lob,
      hireDate: rec.hireDate,
    });
  }
}

const agentsDaily = [];
for (const key of allKeys) {
  const [date, name] = key.split('|');
  const aloware = alowareMerged.get(key);
  const hubstaff = hubstaffMerged.get(key);
  const roster = rosterMap.get(key);
  const sales = salesMap.get(key);

  // Get team/role/lob from roster for this day, or fall back to latest known
  const meta = agentMeta.get(name) || {};
  const team = roster?.team || meta.team || '';
  const role = roster?.role || meta.role || '';
  const lob = roster?.lob || meta.lob || '';
  const status = roster?.status || null;
  const scheduledHrs = roster?.scheduledHrs || 0;
  const hireDate = roster?.hireDate || meta.hireDate || null;

  const totalCalls = aloware?.totalCalls || 0;
  const calls0 = aloware?.calls0 || 0;
  const totalSecDuration = aloware?.totalSecDuration || 0;
  const ibCalls = aloware?.ibCalls || 0;
  const obCalls = aloware?.obCalls || 0;
  const ibDuration = aloware?.ibDuration || 0;
  const obDuration = aloware?.obDuration || 0;

  const regularHours = hubstaff?.regularHours || 0;
  const hubActivity = hubstaff ? hubstaff.activitySum / hubstaff.activityCount : 0;

  const salesProduct = sales?.product || 0;
  const salesVip = sales?.vip || 0;
  const salesCp = sales?.cp || 0;
  const salesSc = sales?.sc || 0;
  const salesGs = sales?.gs || 0;
  const totalSales = salesProduct + salesVip + salesCp + salesSc + salesGs;

  // Compute metrics
  const cph = regularHours > 0 ? totalCalls / regularHours : 0;
  const qualifiedCalls = totalCalls - calls0;
  const aht = qualifiedCalls > 0 ? totalSecDuration / qualifiedCalls : 0;
  const workHrsCompliance = scheduledHrs > 0 ? regularHours / scheduledHrs : (regularHours > 0 ? regularHours / 7.5 : 0);
  const phoneTHub = regularHours > 0 ? totalSecDuration / (regularHours * 3600) : 0;

  // LOB Sale: sales matching agent's LOB
  let lobSale = 0;
  if (lob === 'CP') lobSale = salesCp;
  else if (lob === 'VIP') lobSale = salesVip;
  else if (lob === 'SC') lobSale = salesSc;
  else lobSale = totalSales;

  agentsDaily.push({
    date,
    name,
    team,
    role,
    lob,
    status,
    scheduledHrs,
    hireDate,
    totalCalls,
    calls0,
    totalSecDuration,
    ibCalls,
    obCalls,
    ibDuration,
    obDuration,
    regularHours: Math.round(regularHours * 100) / 100,
    hubActivity: Math.round(hubActivity * 100) / 100,
    salesProduct,
    salesVip,
    salesCp,
    salesSc,
    salesGs,
    totalSales,
    cph: Math.round(cph * 100) / 100,
    aht: Math.round(aht * 100) / 100,
    workHrsCompliance: Math.round(workHrsCompliance * 100) / 100,
    phoneTHub: Math.round(phoneTHub * 100) / 100,
    lobSale,
  });
}

// Sort by date then name
agentsDaily.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));

console.log(`  Joined records: ${agentsDaily.length}`);

// ── Step 7: Aggregate summaries ─────────────────────────────────────────────

console.log('Computing summaries...');

function avg(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function sum(arr) {
  return arr.reduce((s, v) => s + v, 0);
}

// Per-agent summary
const agentGroups = new Map();
for (const rec of agentsDaily) {
  if (!agentGroups.has(rec.name)) agentGroups.set(rec.name, []);
  agentGroups.get(rec.name).push(rec);
}

const agentsSummary = [];
for (const [name, recs] of agentGroups) {
  const workDays = recs.filter(r => !r.status);
  const meta = agentMeta.get(name) || {};

  // Compute avg daily LOB sale
  const dailyLobSales = recs.map(r => r.lobSale);
  const avgDailyLobSale = avg(dailyLobSales);

  agentsSummary.push({
    name,
    team: meta.team || recs[0]?.team || '',
    role: meta.role || recs[0]?.role || '',
    lob: meta.lob || recs[0]?.lob || '',
    hireDate: meta.hireDate || null,
    daysTotal: recs.length,
    daysWorked: workDays.length,
    totalCalls: sum(recs.map(r => r.totalCalls)),
    avgCph: Math.round(avg(recs.filter(r => r.cph > 0).map(r => r.cph)) * 100) / 100,
    avgAht: Math.round(avg(recs.filter(r => r.aht > 0).map(r => r.aht)) * 100) / 100,
    totalSales: sum(recs.map(r => r.totalSales)),
    salesProduct: sum(recs.map(r => r.salesProduct)),
    salesVip: sum(recs.map(r => r.salesVip)),
    salesCp: sum(recs.map(r => r.salesCp)),
    salesSc: sum(recs.map(r => r.salesSc)),
    salesGs: sum(recs.map(r => r.salesGs)),
    totalLobSales: sum(recs.map(r => r.lobSale)),
    avgDailyLobSale: Math.round(avgDailyLobSale * 100) / 100,
    avgWorkHrsCompliance: Math.round(avg(recs.filter(r => r.workHrsCompliance > 0).map(r => r.workHrsCompliance)) * 100) / 100,
    avgHubActivity: Math.round(avg(recs.filter(r => r.hubActivity > 0).map(r => r.hubActivity)) * 100) / 100,
    totalRegularHours: Math.round(sum(recs.map(r => r.regularHours)) * 100) / 100,
    avgPhoneTHub: Math.round(avg(recs.filter(r => r.phoneTHub > 0).map(r => r.phoneTHub)) * 100) / 100,
    ibCalls: sum(recs.map(r => r.ibCalls)),
    obCalls: sum(recs.map(r => r.obCalls)),
  });
}

agentsSummary.sort((a, b) => a.name.localeCompare(b.name));

// Per-team summary
const teamGroups = new Map();
for (const rec of agentsDaily) {
  const team = rec.team || 'Unknown';
  if (!teamGroups.has(team)) teamGroups.set(team, []);
  teamGroups.get(team).push(rec);
}

const teamsSummary = [];
for (const [team, recs] of teamGroups) {
  const uniqueAgents = new Set(recs.map(r => r.name));
  teamsSummary.push({
    team,
    agentCount: uniqueAgents.size,
    totalCalls: sum(recs.map(r => r.totalCalls)),
    avgCph: Math.round(avg(recs.filter(r => r.cph > 0).map(r => r.cph)) * 100) / 100,
    avgAht: Math.round(avg(recs.filter(r => r.aht > 0).map(r => r.aht)) * 100) / 100,
    totalSales: sum(recs.map(r => r.totalSales)),
    avgWorkHrsCompliance: Math.round(avg(recs.filter(r => r.workHrsCompliance > 0).map(r => r.workHrsCompliance)) * 100) / 100,
    avgHubActivity: Math.round(avg(recs.filter(r => r.hubActivity > 0).map(r => r.hubActivity)) * 100) / 100,
    avgPhoneTHub: Math.round(avg(recs.filter(r => r.phoneTHub > 0).map(r => r.phoneTHub)) * 100) / 100,
  });
}

teamsSummary.sort((a, b) => b.totalCalls - a.totalCalls);

// Per-day totals
const dayGroups = new Map();
for (const rec of agentsDaily) {
  if (!dayGroups.has(rec.date)) dayGroups.set(rec.date, []);
  dayGroups.get(rec.date).push(rec);
}

const dailyTotals = [];
for (const [date, recs] of dayGroups) {
  const uniqueAgents = new Set(recs.map(r => r.name));
  dailyTotals.push({
    date,
    agentCount: uniqueAgents.size,
    totalCalls: sum(recs.map(r => r.totalCalls)),
    ibCalls: sum(recs.map(r => r.ibCalls)),
    obCalls: sum(recs.map(r => r.obCalls)),
    totalSecDuration: sum(recs.map(r => r.totalSecDuration)),
    avgCph: Math.round(avg(recs.filter(r => r.cph > 0).map(r => r.cph)) * 100) / 100,
    avgAht: Math.round(avg(recs.filter(r => r.aht > 0).map(r => r.aht)) * 100) / 100,
    totalSales: sum(recs.map(r => r.totalSales)),
    salesProduct: sum(recs.map(r => r.salesProduct)),
    salesVip: sum(recs.map(r => r.salesVip)),
    salesCp: sum(recs.map(r => r.salesCp)),
    salesSc: sum(recs.map(r => r.salesSc)),
    salesGs: sum(recs.map(r => r.salesGs)),
    avgWorkHrsCompliance: Math.round(avg(recs.filter(r => r.workHrsCompliance > 0).map(r => r.workHrsCompliance)) * 100) / 100,
    avgHubActivity: Math.round(avg(recs.filter(r => r.hubActivity > 0).map(r => r.hubActivity)) * 100) / 100,
    totalRegularHours: Math.round(sum(recs.map(r => r.regularHours)) * 100) / 100,
  });
}

dailyTotals.sort((a, b) => a.date.localeCompare(b.date));

// ── Step 8: Write output ────────────────────────────────────────────────────

writeFileSync(resolve(OUT, 'agents-daily.json'), JSON.stringify(agentsDaily));
writeFileSync(resolve(OUT, 'agents-summary.json'), JSON.stringify(agentsSummary));
writeFileSync(resolve(OUT, 'teams-summary.json'), JSON.stringify(teamsSummary));
writeFileSync(resolve(OUT, 'daily-totals.json'), JSON.stringify(dailyTotals));

console.log(`\nOutput written to ${OUT}/`);
console.log(`  agents-daily.json: ${agentsDaily.length} records`);
console.log(`  agents-summary.json: ${agentsSummary.length} agents`);
console.log(`  teams-summary.json: ${teamsSummary.length} teams`);
console.log(`  daily-totals.json: ${dailyTotals.length} days`);

// Print date range
const dates = agentsDaily.map(r => r.date).sort();
console.log(`  Date range: ${dates[0]} to ${dates[dates.length - 1]}`);

// Print team breakdown
console.log('\nTeams:');
for (const t of teamsSummary) {
  console.log(`  ${t.team}: ${t.agentCount} agents, ${t.totalCalls} calls, ${t.totalSales} sales`);
}
