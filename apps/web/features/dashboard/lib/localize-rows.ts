type LocalizableRow = {
  header: string
  reviewer: string
  status: string
  type: string
}

export type DashboardRowContent = {
  rowContent: {
    headers: Record<string, string>
    types: Record<string, string>
  }
  table: {
    assignReviewer: string
    statusOptions: {
      done: string
      inProcess: string
      notStarted: string
    }
  }
}

export function localizeDashboardRows<T extends LocalizableRow>(
  rows: T[],
  messages: DashboardRowContent
) {
  return rows.map((row) => ({
    ...row,
    header: messages.rowContent.headers[row.header] ?? row.header,
    reviewer:
      row.reviewer === "Assign reviewer" ? messages.table.assignReviewer : row.reviewer,
    status:
      row.status === "Done"
        ? messages.table.statusOptions.done
        : row.status === "In Process"
          ? messages.table.statusOptions.inProcess
          : row.status === "Not Started"
            ? messages.table.statusOptions.notStarted
            : row.status,
    type: messages.rowContent.types[row.type] ?? row.type,
  }))
}
