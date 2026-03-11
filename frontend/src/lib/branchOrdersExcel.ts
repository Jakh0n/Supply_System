import ExcelJS from "exceljs"

export type BranchOrdersData = Record<
  string,
  Array<{ name: string; unit: string; quantity: number }>
>

const BRANCH_ROW_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFD3D3D3" },
}

function applyRowFill(worksheet: ExcelJS.Worksheet, rowNumber: number): void {
  const row = worksheet.getRow(rowNumber)
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = BRANCH_ROW_FILL
  })
}

export function downloadBranchOrdersExcel(
  data: BranchOrdersData,
  month: number,
  year: number,
  monthLabel: string,
): Promise<void> {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)
  const periodStartStr = startDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  const periodEndStr = endDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Branch orders", {
    views: [{ state: "frozen", ySplit: 2 }],
  })

  worksheet.addRow([`Branch orders (monthly summary) — ${monthLabel} ${year}`])
  worksheet.addRow([`Report period: ${periodStartStr} – ${periodEndStr}`])
  worksheet.addRow([])

  const branchNames = Object.keys(data).sort()
  const branchRowNumbers: number[] = []

  for (const branchName of branchNames) {
    const products = data[branchName] ?? []
    if (products.length === 0) continue
    const branchRow = worksheet.addRow(["Branch", branchName])
    branchRowNumbers.push(branchRow.number)
    worksheet.addRow(["Product", "Quantity", "Unit"])
    for (const p of products) {
      worksheet.addRow([p.name, p.quantity, p.unit])
    }
    worksheet.addRow([])
  }

  const totalByProduct = new Map<
    string,
    { name: string; unit: string; quantity: number }
  >()
  for (const branchName of branchNames) {
    const products = data[branchName] ?? []
    for (const p of products) {
      const key = `${p.name}|${p.unit}`
      const existing = totalByProduct.get(key)
      if (existing) {
        existing.quantity += p.quantity
      } else {
        totalByProduct.set(key, {
          name: p.name,
          unit: p.unit,
          quantity: p.quantity,
        })
      }
    }
  }
  const overallProducts = Array.from(totalByProduct.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
  let overallHeaderRowNumber = 0
  if (overallProducts.length > 0) {
    const overallRow = worksheet.addRow(["Overall total (all branches)"])
    overallHeaderRowNumber = overallRow.number
    worksheet.addRow(["Product", "Quantity", "Unit"])
    for (const p of overallProducts) {
      worksheet.addRow([p.name, p.quantity, p.unit])
    }
  }

  branchRowNumbers.forEach((r) => applyRowFill(worksheet, r))
  if (overallHeaderRowNumber > 0) applyRowFill(worksheet, overallHeaderRowNumber)

  const fileName = `branch-orders-${year}-${String(month).padStart(2, "0")}-${Date.now()}.xlsx`
  return workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  })
}
