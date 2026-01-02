import { ActivityData, ActivityStatus } from '../types';

// The ID from your provided URL: https://docs.google.com/spreadsheets/d/1XoQj-jSUcds5bNbR1mjVFKUgwwG1RYET_6SVYPQMbSU/edit
const SHEET_ID = '1XoQj-jSUcds5bNbR1mjVFKUgwwG1RYET_6SVYPQMbSU';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

export const fetchSheetData = async (): Promise<ActivityData[]> => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
        // If this fails, the user likely hasn't "Published to Web" yet.
        throw new Error('Failed to fetch Google Sheet data. Ensure the sheet is published to web as CSV.');
    }
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.error("Error fetching sheet:", error);
    throw error;
  }
};

export const parseCSV = (csvText: string): ActivityData[] => {
  // Split by newline
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  
  // Helper to handle CSV lines with quoted values (e.g. "1,000", "Domain 1")
  const parseLine = (line: string) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Skip header row (index 0) and map the rest
  return lines.slice(1).map((line, index) => {
    const values = parseLine(line);
    
    // Helper to safely get value by index and remove quotes
    const getVal = (i: number) => {
        const val = values[i];
        return val ? val.replace(/^"|"$/g, '') : '';
    };

    // Helper to parse numbers like "400,000" or "$400"
    const parseNum = (val: string) => {
        if (!val) return 0;
        const clean = val.replace(/,/g, '').replace(/[^0-9.-]/g, '');
        return parseFloat(clean) || 0;
    };

    const parseNullableNum = (val: string) => {
        if (!val) return null;
        const n = parseNum(val);
        return isNaN(n) ? null : n;
    }

    // Mapping based on your specific columns:
    // A: No, B: Code, C: Domain, D: Name, E: Op, F: Timeline, G: Target, H: Participants, I: Planned, J: Completed, K: Status
    // L: Allocation, M: Expenditure, N: Balance, O: Progress (Note: Column letters in prompt vs CSV order might vary slightly, strictly following CSV order provided in text)
    // CSV Text Order provided previously: No., Code, Domain, Name, Op, Timeline, Target, Partic, Planned, Completed, Status, Alloc, Expend, Balance, Progress
    
    // Normalize Status
    let status = ActivityStatus.NOT_STARTED;
    const rawStatus = getVal(10).toLowerCase();
    if (rawStatus.includes('process')) status = ActivityStatus.ON_PROCESS;
    else if (rawStatus.includes('completed')) status = ActivityStatus.COMPLETED;

    // Calculate budget progress if missing (expenditure / allocation * 100)
    let bProgress = parseNum(getVal(14));
    const alloc = parseNum(getVal(11));
    const expend = parseNum(getVal(12));
    
    // Fallback calculation for progress if the sheet cell is empty
    if (bProgress === 0 && alloc > 0 && expend > 0) {
        bProgress = (expend / alloc) * 100;
    }

    return {
      no: getVal(0),
      activityCode: getVal(1),
      domainName: getVal(2),
      activityName: getVal(3),
      operation: getVal(4),
      timeline: getVal(5),
      targetParticipants: getVal(6),
      participants: getVal(7),
      plannedTimes: parseNullableNum(getVal(8)),
      completedTime: parseNullableNum(getVal(9)),
      status: status,
      allocationBudget: alloc,
      expenditure: expend,
      balance: parseNum(getVal(13)),
      budgetProgress: bProgress
    };
  });
};