import * as FileSaver from 'file-saver';

export const ExportExcel = async ({ data, filename }) => {
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.xlsx';
  let xlsx = await import("xlsx");
  const ws = xlsx.utils.json_to_sheet(data);
  const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
  const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'array' });
  const render_data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(render_data, filename + fileExtension);

}
