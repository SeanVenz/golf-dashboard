import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType,
} from 'docx';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'Performance_Golf_Dashboard_Guide.docx');

// ── Helpers ──────────────────────────────────────────────────────────────────

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level, spacing: { before: 300, after: 100 } });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 22, ...opts })],
  });
}

function bold(text) {
  return new TextRun({ text, bold: true, size: 22 });
}

function richPara(...runs) {
  return new Paragraph({ spacing: { after: 120 }, children: runs });
}

function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 22 })],
  });
}

function richBullet(runs, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 60 },
    children: runs,
  });
}

const cellBorder = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
};

function headerCell(text, width = 2000) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: cellBorder,
    shading: { type: ShadingType.SOLID, color: '2D3748' },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, color: 'FFFFFF' })] })],
  });
}

function cell(text, width = 2000) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: cellBorder,
    children: [new Paragraph({ children: [new TextRun({ text, size: 20 })] })],
  });
}

// ── Document ─────────────────────────────────────────────────────────────────

const doc = new Document({
  creator: 'Performance Golf Dashboard',
  title: 'Performance Golf Dashboard — Complete Guide',
  sections: [
    {
      properties: {},
      children: [
        // ── TITLE ──
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: 'Performance Golf Dashboard', bold: true, size: 48, color: '4F46E5' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: 'Complete Guide & Documentation', size: 28, color: '64748B', italics: true })],
        }),

        // ── WHAT IS THIS? ──
        heading('What Is This Dashboard?'),
        para('The Performance Golf Dashboard is an interactive web-based analytics tool that visualizes call center performance data. It takes raw data from 5 Excel spreadsheets and presents it as charts, tables, and KPI cards that managers can use to track agent performance, sales, attendance, and productivity.'),
        para('It runs entirely in the browser — there is no server, no database, and no login required. Once deployed, anyone with the URL can view the dashboard.'),

        // ── HOW TO RUN IT ──
        heading('How To Run It'),
        heading('What You Need', HeadingLevel.HEADING_2),
        bullet('A computer with Node.js installed (version 18 or higher)'),
        bullet('Download Node.js from https://nodejs.org — pick the LTS version'),
        bullet('A terminal (Command Prompt on Windows, Terminal on Mac)'),

        heading('Step-by-Step', HeadingLevel.HEADING_2),
        richBullet([bold('Step 1: '), new TextRun({ text: 'Open your terminal and navigate to the dashboard folder', size: 22 })]),
        richBullet([bold('Step 2: '), new TextRun({ text: 'Run "npm install" to install all required packages', size: 22 })]),
        richBullet([bold('Step 3: '), new TextRun({ text: 'Run "npm run dev" to start the development server', size: 22 })]),
        richBullet([bold('Step 4: '), new TextRun({ text: 'Open your browser and go to http://localhost:5173', size: 22 })]),
        richBullet([bold('Step 5: '), new TextRun({ text: 'You should see the dashboard!', size: 22 })]),
        para(''),
        para('If you ever update the Excel files, run "npm run process-data" first, then "npm run dev" again.'),

        // ── PAGES ──
        heading('Dashboard Pages'),

        heading('Page 1: Executive Overview', HeadingLevel.HEADING_2),
        para('This is the landing page — the big picture view. It shows:'),
        bullet('6 KPI Cards across the top: Total Calls, Total Sales, Avg Calls Per Hour (CPH), Avg Handle Time (AHT), Work Hours Compliance %, and Hub Activity %'),
        bullet('Daily Calls Trend — a line chart showing how many calls happened each day, with a smoothed 7-day average line'),
        bullet('Sales Breakdown — a stacked area chart showing how CP, VIP, Product, SC, and GS sales changed over time'),
        bullet('Team Comparison — a horizontal bar chart comparing average CPH and AHT across all teams'),

        heading('Page 2: Agent Performance', HeadingLevel.HEADING_2),
        para('A detailed view of every individual agent. The main feature is the sortable leaderboard table.'),
        bullet('Click any column header to sort by that metric (e.g., click "Sales" to see top sellers)'),
        bullet('Click any agent row to open their detail panel on the right side'),
        bullet('The detail panel shows personal KPIs, daily trend charts, and call/sales breakdowns'),
        bullet('Columns: Name, Team, LOB, Total Calls, CPH, AHT, Sales, LOB Sales, Compliance, Activity, Days Worked'),

        heading('Page 3: Sales Analytics', HeadingLevel.HEADING_2),
        para('Everything about sales performance.'),
        bullet('Sales Leaderboard — top 15 agents ranked by total sales'),
        bullet('Sales by LOB — donut chart showing which Lines of Business generate the most sales'),
        bullet('Daily Sales Trend — how sales volume changes over time'),
        bullet('Sales by Team — which teams sell the most'),

        heading('Page 4: Attendance & Scheduling', HeadingLevel.HEADING_2),
        para('Workforce management and coverage tracking.'),
        bullet('Status Breakdown — donut chart of Working vs Vacation Leave (VL) vs Leave of Absence (LOA) vs Holiday'),
        bullet('Daily Agent Count — how many agents were active each day'),
        bullet('Team Headcount Over Time — stacked area chart showing how team sizes change'),
        bullet('Shift Distribution — breakdown of scheduled hours'),

        heading('Page 5: Productivity / Hubstaff', HeadingLevel.HEADING_2),
        para('Insights from Hubstaff time tracking data.'),
        bullet('Activity vs CPH Scatter Plot — each dot is an agent, showing if higher activity means more calls'),
        bullet('Daily Activity Trend — average hub activity percentage over time'),
        bullet('Top Agents by Activity — ranked bar chart'),
        bullet('Low Activity Alerts — table of agents averaging below 50% activity'),

        // ── FILTERS ──
        heading('How Filters Work'),
        para('At the top of every page, there is a filter bar. Changing any filter instantly updates all charts, tables, and KPI numbers on the page.'),

        new Table({
          rows: [
            new TableRow({ children: [headerCell('Filter', 2000), headerCell('Type', 2000), headerCell('What It Does', 5000)] }),
            new TableRow({ children: [cell('Date Range'), cell('Two date pickers'), cell('Only shows data between the start and end dates')] }),
            new TableRow({ children: [cell('Team'), cell('Multi-select dropdown'), cell('Filter to one or more teams (e.g., Team Jen)')] }),
            new TableRow({ children: [cell('LOB'), cell('Multi-select dropdown'), cell('Filter by Line of Business (CP, VIP, SC)')] }),
            new TableRow({ children: [cell('Agent'), cell('Search box'), cell('Type a name to focus on one agent only')] }),
            new TableRow({ children: [cell('Reset'), cell('Button'), cell('Clears all filters back to defaults')] }),
          ],
        }),

        para(''),
        richPara(bold('Important: '), new TextRun({ text: 'Filters combine with AND logic. If you select Team Jen AND LOB = CP, you will only see agents who are in Team Jen AND assigned to the CP line of business.', size: 22 })),
        para('The current filter state is saved in the URL. You can copy the URL from your browser and share it with someone — they will see the exact same filtered view.'),

        // ── DATA SOURCES ──
        heading('Data Sources'),
        para('The dashboard reads from 5 Excel files:'),

        new Table({
          rows: [
            new TableRow({ children: [headerCell('File', 3000), headerCell('What It Contains', 4000), headerCell('Date Range', 2000)] }),
            new TableRow({ children: [cell('Aloware Logs.xlsx'), cell('Call logs — inbound/outbound calls, durations, call counts per bucket'), cell('Jul – Sep 2024')] }),
            new TableRow({ children: [cell('Hubstaff.xlsx'), cell('Time tracking — login hours, mouse/keyboard activity percentage'), cell('Jul – Sep 2024')] }),
            new TableRow({ children: [cell('Roster_Schedule.xlsx'), cell('Schedules — team, role, LOB, shift times, leave status'), cell('Jul – Sep 2024')] }),
            new TableRow({ children: [cell('Sales tracker.xlsx'), cell('Sales — Product, VIP, CP, SC, GS counts per agent/day'), cell('May – Sep 2024')] }),
            new TableRow({ children: [cell('Names.xlsx'), cell('Maps different name spellings between Hubstaff and Roster'), cell('—')] }),
          ],
        }),

        // ── DATA NORMALIZATION ──
        heading('Data Normalization & Processing'),
        para('Before the dashboard can display anything, the raw Excel data goes through a normalization pipeline. This is handled by the script "scripts/process-data.js". Here is what it does and why each step matters:'),

        heading('Step 1: Name Resolution', HeadingLevel.HEADING_2),
        para('The biggest challenge is that the same person can have different name spellings across the 4 data sources. For example:'),

        new Table({
          rows: [
            new TableRow({ children: [headerCell('In Hubstaff', 3500), headerCell('In Roster/Aloware', 3500)] }),
            new TableRow({ children: [cell('ALEXIS MARIE ABELEDA'), cell('Alexis Marie Abeleda')] }),
            new TableRow({ children: [cell('Alfredo Belano'), cell('Abet Belano')] }),
            new TableRow({ children: [cell('Mark Mendez'), cell('Makkie Mendez')] }),
            new TableRow({ children: [cell('King Nimrod S. Ycaro'), cell('King Ycaro')] }),
            new TableRow({ children: [cell('Ma. Cristina Anglita'), cell('Ma Cristina Anglita')] }),
            new TableRow({ children: [cell('Cindy Claire G. Esteban'), cell('Cindy Claire Esteban')] }),
          ],
        }),

        para(''),
        para('There are 32 such mismatches out of 95 agents. The Names.xlsx file maps every Hubstaff name to its corresponding Roster name. The script builds a case-insensitive lookup table so that regardless of which source a name comes from, it resolves to a single canonical version.'),
        para('Without this step, "Mark Mendez" from Hubstaff and "Makkie Mendez" from Roster would appear as two separate people in the dashboard, each with incomplete data.'),

        heading('Step 2: Aloware Call Log Parsing', HeadingLevel.HEADING_2),
        para('The Aloware Logs file has a complex structure:'),
        bullet('The header spans 3 rows (not the usual 1 row) with column groups'),
        bullet('Each agent has 2 rows per day — one for inbound calls and one for outbound calls'),
        bullet('Call data is split into 3 duration buckets:'),
        bullet('Bucket 0: Calls shorter than 30 seconds (often misdials or abandoned)', 1),
        bullet('Bucket 1: Calls between 30 and 660 seconds (normal calls)', 1),
        bullet('Bucket 2: Calls longer than 660 seconds (11+ minutes, long calls)', 1),
        bullet('Plus total columns: total duration, total calls, IB/OB breakdowns'),
        para(''),
        para('The script reads each column by its position (not by header name, since header names repeat), merges the inbound and outbound rows for each agent-day into a single combined record, and sums up all the call metrics.'),

        heading('Step 3: Hubstaff Time Conversion', HeadingLevel.HEADING_2),
        para('Hubstaff records login hours in a format like "08:06:27" meaning 8 hours, 6 minutes, 27 seconds. However, Excel stores these as a fraction of a day internally (e.g., 0.338 = 8 hours and 6 minutes).'),
        para('The script detects whether the value is a raw number (fraction of day) or a Date object, and converts it to decimal hours either way. For example:'),
        bullet('Excel fraction 0.338 × 24 = 8.11 hours'),
        bullet('Date "1899-12-30T08:06:27" → 8 + 6/60 + 27/3600 = 8.11 hours'),
        para(''),
        para('The Activity column is a decimal between 0 and 1 representing mouse/keyboard activity percentage (0.58 = 58% active).'),
        para('If an agent has multiple Hubstaff entries for the same day (e.g., different projects), the hours are summed and the activity is averaged.'),

        heading('Step 4: Roster & Sales Parsing', HeadingLevel.HEADING_2),
        para('These are more straightforward:'),
        bullet('Roster_Schedule provides each agent\'s team, role, LOB, shift times, scheduled hours, hire date, and leave status (VL/LOA/Hol)'),
        bullet('Sales tracker provides daily sales counts for each agent across 5 categories: Product, VIP, CP, SC, and GS'),
        bullet('Dates are normalized to YYYY-MM-DD format (e.g., "2024-07-15") regardless of how Excel stored them'),

        heading('Step 5: Joining on Date + Name', HeadingLevel.HEADING_2),
        para('This is where everything comes together. The script creates a single combined record for every unique Date + Agent Name combination found across ALL four data sources.'),
        para('For example, for agent "Ma Cristina Anglita" on July 15, 2024, the merged record would contain:'),
        bullet('From Aloware: 85 total calls, 3 under 30s, 4200 seconds total duration, 12 inbound, 73 outbound'),
        bullet('From Hubstaff: 8.1 login hours, 64% activity'),
        bullet('From Roster: Team Jen, Phone Support role, CP LOB, scheduled 7.5 hours, no leave'),
        bullet('From Sales: 0 Product, 3 VIP, 2 CP, 0 SC, 0 GS'),
        para(''),
        para('If an agent appears in one source but not another for a given day, the missing fields default to 0 or null. This happens for:'),
        bullet('May–June 2024: Sales data exists but call logs, Hubstaff, and Roster data does not'),
        bullet('Some agents appear only in Hubstaff (they have login hours but no calls or schedule)'),
        bullet('Some agents appear only in Aloware (they have calls but no Hubstaff tracking)'),

        heading('Step 6: Metric Computation', HeadingLevel.HEADING_2),
        para('After joining, the script calculates derived metrics for every agent-day record:'),

        new Table({
          rows: [
            new TableRow({ children: [headerCell('Metric', 2500), headerCell('Formula', 4000), headerCell('Notes', 2500)] }),
            new TableRow({ children: [cell('CPH'), cell('total_calls / login_hours'), cell('0 if no login hours')] }),
            new TableRow({ children: [cell('AHT'), cell('total_duration / (total_calls - calls_under_30s)'), cell('Excludes short calls')] }),
            new TableRow({ children: [cell('Compliance'), cell('login_hours / scheduled_hours'), cell('Falls back to login_hours / 7.5')] }),
            new TableRow({ children: [cell('Phone/Hub'), cell('total_duration / (login_hours × 3600)'), cell('Ratio of phone time to logged time')] }),
            new TableRow({ children: [cell('Total Sales'), cell('Product + VIP + CP + SC + GS'), cell('Sum of all types')] }),
            new TableRow({ children: [cell('LOB Sale'), cell('Sales matching agent LOB'), cell('CP sales if LOB=CP, etc.')] }),
          ],
        }),

        heading('Step 7: Aggregation', HeadingLevel.HEADING_2),
        para('Finally, the daily records are aggregated into summary files:'),
        bullet('agents-daily.json — every individual record (one per agent per day). This is the master dataset. ~12,600 records.'),
        bullet('agents-summary.json — one record per agent with averaged/summed metrics across all their days. ~148 agents.'),
        bullet('teams-summary.json — one record per team with team-wide averages. ~9 teams.'),
        bullet('daily-totals.json — one record per date with organization-wide totals. ~152 days.'),
        para(''),
        para('The dashboard loads the daily data and re-aggregates it on the fly when filters change. This means if you filter to "July only", the KPIs, charts, and tables all recalculate from just the July data — they don\'t show stale pre-computed numbers.'),

        // ── METRICS ──
        heading('Metrics Glossary'),

        new Table({
          rows: [
            new TableRow({ children: [headerCell('Metric', 2000), headerCell('Full Name', 2500), headerCell('What It Means', 4500)] }),
            new TableRow({ children: [cell('CPH'), cell('Calls Per Hour'), cell('How many calls an agent makes/receives per hour of logged time. Higher is generally better for outbound teams.')] }),
            new TableRow({ children: [cell('AHT'), cell('Avg Handle Time'), cell('Average seconds spent on each call (excluding calls under 30 seconds which are considered misdials). Lower AHT can mean more efficient calls.')] }),
            new TableRow({ children: [cell('Compliance'), cell('Work Hours Compliance'), cell('Percentage of scheduled hours actually worked. 1.0 (100%) means the agent worked exactly their scheduled hours. Above 1.0 means overtime.')] }),
            new TableRow({ children: [cell('Activity'), cell('Hub Activity %'), cell('Hubstaff tracks mouse and keyboard usage. 60% means the agent was actively using their computer 60% of logged time. Low activity could indicate idle time.')] }),
            new TableRow({ children: [cell('Phone/Hub'), cell('Phone Time / Hub Ratio'), cell('What fraction of logged Hubstaff time was spent on phone calls. Helps identify if agents are spending their time on calls vs other tasks.')] }),
            new TableRow({ children: [cell('LOB Sale'), cell('Line of Business Sale'), cell('Sales that match the agent\'s assigned LOB. If an agent is assigned to CP, this counts only their CP sales (not VIP/SC/etc).')] }),
            new TableRow({ children: [cell('Total Sales'), cell('All Sales Combined'), cell('Sum of Product + VIP + CP + SC + GS sales. Counts every sale regardless of LOB assignment.')] }),
          ],
        }),

        // ── TEAMS ──
        heading('Teams & Organizational Structure'),
        para('The call center is organized into 6 main teams, plus Training and Support:'),

        new Table({
          rows: [
            new TableRow({ children: [headerCell('Team', 2000), headerCell('Agents', 1500), headerCell('Primary Focus', 5500)] }),
            new TableRow({ children: [cell('Team Jen'), cell('16'), cell('Largest team. Primarily CP/Phone Support focused. Highest call volume and sales.')] }),
            new TableRow({ children: [cell('Team Aya'), cell('15'), cell('Mixed phone support team. Second highest call volume.')] }),
            new TableRow({ children: [cell('Team Anne'), cell('17'), cell('Mixed phone support. Third in call volume.')] }),
            new TableRow({ children: [cell('Team Remen'), cell('12'), cell('Mixed roles including setters and phone support.')] }),
            new TableRow({ children: [cell('Team King'), cell('16'), cell('Primarily setter-focused. High outbound call volume, very low sales (setters book appointments, not close sales).')] }),
            new TableRow({ children: [cell('Team Sitti'), cell('18'), cell('Mixed roles.')] }),
            new TableRow({ children: [cell('Training'), cell('14'), cell('Agents currently in training programs.')] }),
            new TableRow({ children: [cell('Support'), cell('8'), cell('IT, supervisors, and administrative support.')] }),
          ],
        }),

        para(''),

        heading('Roles', HeadingLevel.HEADING_2),
        bullet('Phone Support — handles inbound/outbound customer calls'),
        bullet('Setter — books appointments for sales team (high call volume, low direct sales)'),
        bullet('Customer Care — handles customer inquiries and issues'),
        bullet('Appt Confirmer — confirms booked appointments'),
        bullet('Retention — works to retain customers considering cancellation'),
        bullet('Supervisor — team lead/management'),
        bullet('IT POC — IT point of contact'),
        bullet('Trainer — trains new hires'),

        heading('Lines of Business (LOB)', HeadingLevel.HEADING_2),
        bullet('CP — Core Product'),
        bullet('VIP — VIP/premium tier customers'),
        bullet('SC — Service/Support Channel'),
        bullet('"-" (dash) — No assigned LOB, typically setters who work across all lines'),

        heading('Statuses', HeadingLevel.HEADING_2),
        bullet('Active (no status shown) — agent is working normally'),
        bullet('VL — Vacation Leave'),
        bullet('LOA — Leave of Absence'),
        bullet('Hol — Holiday (office closed)'),

        // ── DEPLOYING ──
        heading('Deploying to the Internet'),
        para('The easiest way to make the dashboard available online is through Vercel (free):'),
        richBullet([bold('1. '), new TextRun({ text: 'Push the project to a GitHub repository', size: 22 })]),
        richBullet([bold('2. '), new TextRun({ text: 'Go to vercel.com and sign in with your GitHub account', size: 22 })]),
        richBullet([bold('3. '), new TextRun({ text: 'Click "Import Project" and select the dashboard repository', size: 22 })]),
        richBullet([bold('4. '), new TextRun({ text: 'Vercel auto-detects Vite and builds everything automatically', size: 22 })]),
        richBullet([bold('5. '), new TextRun({ text: 'You get a live URL (e.g., performance-golf.vercel.app) you can share with anyone', size: 22 })]),

        // ── FAQ ──
        heading('Frequently Asked Questions'),

        richPara(bold('Q: How do I update the data?')),
        para('Replace the Excel files in the project root, run "npm run process-data" in your terminal, then re-deploy. The JSON files in src/data/ will be regenerated.'),

        richPara(bold('Q: Why do some agents show as "Unknown" team?')),
        para('About 60 agents appear in Hubstaff or Sales data but do not have a matching entry in the Roster Schedule. They represent less than 1% of total call data. These are typically agents who were briefly tracked but not formally rostered during the data period.'),

        richPara(bold('Q: Why does the Sales data start in May but other data starts in July?')),
        para('The Sales tracker covers May through September 2024, while the call logs, Hubstaff, and Roster data only cover July through September. For May and June, only sales data will appear — call metrics and attendance will show as zero.'),

        richPara(bold('Q: What does "GS" mean in the sales columns?')),
        para('GS appears as a column in the Sales tracker Excel file. Its exact business meaning was not specified in the original data documentation, but it is tracked and displayed alongside the other sale types (Product, VIP, CP, SC).'),

        richPara(bold('Q: Can I download or export the data from the dashboard?')),
        para('The current version is view-only. If you need to export data, you can open the JSON files in src/data/ directly — they contain all the processed data in a standard format.'),
      ],
    },
  ],
});

// ── Generate ─────────────────────────────────────────────────────────────────

const buffer = await Packer.toBuffer(doc);
writeFileSync(OUT, buffer);
console.log(`Word document written to: ${OUT}`);
