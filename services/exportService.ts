
import PptxGenJS from "pptxgenjs";
import { ActivityData, DashboardMetrics } from '../types';

export const exportToPowerPoint = (data: ActivityData[], metrics: DashboardMetrics, domainName: string | null) => {
  try {
    const pres = new PptxGenJS();
    const date = new Date().toLocaleDateString();
    const title = domainName ? `Budget Report: ${domainName}` : "Overall Budget Report";

    // ==========================================
    // SLIDE 1: DASHBOARD OVERVIEW (KPIs & Charts)
    // ==========================================
    const slide1 = pres.addSlide();
    
    // Header
    slide1.addText(title, { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: '1e3a8a' });
    slide1.addText(`Generated on: ${date}`, { x: 0.5, y: 0.9, fontSize: 12, color: '64748b' });

    // --- KPI Cards ---
    const kpiY = 1.4;
    const kpiW = 2.0; // Reduced width to fit 4 cards
    const kpiH = 1.2;
    const gap = 0.2;

    // Function to draw a simple KPI box
    const drawKPI = (x: number, label: string, value: string, color: string) => {
      slide1.addShape(pres.ShapeType.rect, { x: x, y: kpiY, w: kpiW, h: kpiH, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, shadow: { type: 'outer', color: 'cccccc', blur: 3, offset: 2 } });
      slide1.addText(label, { x: x + 0.1, y: kpiY + 0.3, fontSize: 11, color: '64748b' });
      slide1.addText(value, { x: x + 0.1, y: kpiY + 0.7, fontSize: 18, bold: true, color: color });
    };

    let startX = 0.5;
    drawKPI(startX, "Current Balance", `$${metrics.totalBalance.toLocaleString()}`, metrics.totalBalance >= 0 ? '10B981' : 'EF4444'); 
    startX += kpiW + gap;
    drawKPI(startX, "Total Expenditure", `$${metrics.totalExpenditure.toLocaleString()}`, 'EF4444');
    startX += kpiW + gap;
    drawKPI(startX, "Total Overspent", `$${metrics.totalOverspent.toLocaleString()}`, 'B91C1C'); // Dark Red
    startX += kpiW + gap;
    drawKPI(startX, "Total Underspent", `$${metrics.totalUnderspent.toLocaleString()}`, '047857'); // Dark Green


    // --- Charts ---
    // 1. Donut Chart (Budget Summary)
    const donutData = [
      {
        name: "Budget",
        labels: ["Spent", "Remaining"],
        values: [metrics.totalExpenditure, metrics.totalBalance > 0 ? metrics.totalBalance : 0]
      }
    ];

    // FIX: Use ChartType.doughnut instead of charts.DOUGHNUT
    slide1.addChart(pres.ChartType.doughnut, donutData, {
      x: 0.5, y: 3.0, w: 4.0, h: 3.5,
      chartColors: ['EF4444', '10B981'], // Red, Green
      legendPos: 'b',
      showPercent: true,
      holeSize: 60,
      showTitle: true,
      title: 'Budget Utilization',
      titleFontSize: 14,
      shadow: { type: 'outer', color: 'cccccc', blur: 3 }
    });

    // 2. Area Chart (Balance Trend)
    // Prepare data: take up to 10-15 points to avoid overcrowding chart
    const trendDataPoints = data.slice(0, 15); 
    const areaData = [
      {
        name: "Balance",
        labels: trendDataPoints.map(d => d.timeline || d.activityCode),
        values: trendDataPoints.map(d => d.balance)
      }
    ];

    // FIX: Use ChartType.area instead of charts.AREA
    slide1.addChart(pres.ChartType.area, areaData, {
      x: 5.0, y: 3.0, w: 4.5, h: 3.5,
      chartColors: ['3B82F6'], // Blue
      chartColorsOpacity: 50,
      showLegend: false,
      showTitle: true,
      title: 'Balance Trend (Recent Activities)',
      titleFontSize: 14,
      shadow: { type: 'outer', color: 'cccccc', blur: 3 }
    });

    // ==========================================
    // SLIDES 2+: VISUAL BUDGET PROGRESS
    // ==========================================
    // We will paginate this list (e.g., 6 items per slide) so progress bars look good.
    const ITEMS_PER_SLIDE = 6;
    const totalItems = data.length;
    
    for (let i = 0; i < totalItems; i += ITEMS_PER_SLIDE) {
      const slide = pres.addSlide();
      const currentBatch = data.slice(i, i + ITEMS_PER_SLIDE);
      
      slide.addText(`Budget Progress (Items ${i + 1} - ${Math.min(i + ITEMS_PER_SLIDE, totalItems)})`, { x: 0.5, y: 0.5, fontSize: 18, bold: true, color: '333333' });

      let currentY = 1.0;
      
      currentBatch.forEach((item) => {
        // Background Box for row
        slide.addShape(pres.ShapeType.rect, { x: 0.5, y: currentY, w: 9.0, h: 0.9, fill: { color: 'FFFFFF' }, line: { color: 'E5E7EB' } });

        // Activity Name & Timeline
        slide.addText(item.activityName, { x: 0.7, y: currentY + 0.15, fontSize: 12, bold: true, color: '1F2937' });
        slide.addText(item.timeline, { x: 0.7, y: currentY + 0.45, fontSize: 10, color: '6B7280' });

        // Progress Bar Logic
        const barX = 4.0;
        const barY = currentY + 0.35;
        const barW = 3.0; // Total width of bar
        const barH = 0.15;
        
        const progress = Math.min(Math.max(item.budgetProgress, 0), 100);
        const progressW = (progress / 100) * barW;
        const barColor = item.budgetProgress > 100 ? 'EF4444' : '3B82F6';

        // 1. Gray Background Bar
        // FIX: Removed invalid 'r' property from shape props
        slide.addShape(pres.ShapeType.rect, { x: barX, y: barY, w: barW, h: barH, fill: { color: 'E5E7EB' } });
        // 2. Colored Progress Bar
        if (progressW > 0) {
          // FIX: Removed invalid 'r' property from shape props
          slide.addShape(pres.ShapeType.rect, { x: barX, y: barY, w: progressW, h: barH, fill: { color: barColor } });
        }
        // 3. Percentage Text
        slide.addText(`${item.budgetProgress.toFixed(0)}%`, { x: barX + barW + 0.1, y: barY - 0.05, fontSize: 11, bold: true, color: '1F2937' });

        // Financials (Right side)
        slide.addText(`Exp: $${item.expenditure.toLocaleString()}`, { x: 7.8, y: currentY + 0.15, w: 1.5, fontSize: 10, color: '6B7280', align: 'right' });
        slide.addText(`Bud: $${item.allocationBudget.toLocaleString()}`, { x: 7.8, y: currentY + 0.45, w: 1.5, fontSize: 10, bold: true, color: '1F2937', align: 'right' });

        currentY += 1.0;
      });
    }

    // ==========================================
    // LAST SLIDE: DETAILED DATA TABLE
    // ==========================================
    const tableSlide = pres.addSlide();
    tableSlide.addText("Detailed Activity List", { x: 0.5, y: 0.5, fontSize: 18, bold: true, color: '333333' });

    // FIX: Updated table definition to use TableCell objects consistently and correct fill property structure
    // Table Headers
    const headers = [
      { text: "Activity", options: { fill: { color: "f3f4f6" }, bold: true, color: '111827' } },
      { text: "Status", options: { fill: { color: "f3f4f6" }, bold: true, color: '111827' } },
      { text: "Budget", options: { fill: { color: "f3f4f6" }, bold: true, align: "right" as const, color: '111827' } },
      { text: "Spent", options: { fill: { color: "f3f4f6" }, bold: true, align: "right" as const, color: '111827' } },
      { text: "Balance", options: { fill: { color: "f3f4f6" }, bold: true, align: "right" as const, color: '111827' } }
    ];

    // Table Rows - convert string values to TableCell objects for type safety
    const rows = data.map(item => [
      { text: item.activityName },
      { text: item.status },
      { text: `$${item.allocationBudget.toLocaleString()}`, options: { align: "right" as const } },
      { text: `$${item.expenditure.toLocaleString()}`, options: { align: "right" as const } },
      { text: `$${item.balance.toLocaleString()}`, options: { align: "right" as const } }
    ]);

    tableSlide.addTable([headers, ...rows], {
      x: 0.5,
      y: 1.0,
      w: 9.0,
      colW: [4, 1.5, 1.2, 1.2, 1.2],
      fontSize: 10,
      border: { pt: 1, color: "e5e7eb" },
      autoPage: true, // Automatically creates new slides if table is too long
      newPageStartY: 1.0
    });

    pres.writeFile({ fileName: `Budget_Report_${new Date().toISOString().split('T')[0]}.pptx` });
  } catch (err) {
    console.error("Error generating PowerPoint:", err);
    alert("Failed to generate PowerPoint. Please try again.");
  }
};

export const exportToCSV = (data: ActivityData[]) => {
  try {
    // Define CSV headers matching the structure
    const headers = [
      "No", "Activity Code", "Domain Name", "Activity Name", "Operation", 
      "Timeline", "Status", "Allocation Budget", "Expenditure", "Balance", "Budget Progress (%)"
    ];

    // Map data to CSV rows
    const rows = data.map(item => [
      `"${item.no}"`,
      `"${item.activityCode}"`,
      `"${item.domainName}"`,
      `"${item.activityName}"`,
      `"${item.operation}"`,
      `"${item.timeline}"`,
      `"${item.status}"`,
      item.allocationBudget,
      item.expenditure,
      item.balance,
      item.budgetProgress
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `budget_data_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Error exporting CSV:", err);
  }
};
