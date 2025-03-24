export default function ExportButton() {
  const handleExport = () => {
    // 实际逻辑 (后期启用)
    /*
    fetch('/api/export-pdf')
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'report.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    */

    // 假数据逻辑
    alert('PDF export simulated.');
  };

  return <button className="export-btn" onClick={handleExport}>Export PDF</button>;
}
