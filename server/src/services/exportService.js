import * as XLSX from 'xlsx';

export class ExportService {
  /**
   * Export array of business objects or leads to XLSX buffer
   */
  static generateXlsx(data, sheetName = 'Local Leads') {
    const formattedData = this.formatRowsForExport(data);
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    
    // Auto-fit column widths
    const colWidths = [];
    if (formattedData.length > 0) {
      Object.keys(formattedData[0]).forEach(key => {
        const maxLen = Math.max(
          key.length,
          ...formattedData.map(row => String(row[key] || '').length)
        );
        colWidths.push({ wch: Math.min(Math.max(maxLen + 2, 12), 40) });
      });
      worksheet['!cols'] = colWidths;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Export array of business objects or leads to CSV string
   */
  static generateCsv(data) {
    const formattedData = this.formatRowsForExport(data);
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    return XLSX.utils.sheet_to_csv(worksheet);
  }

  /**
   * Normalize rows into clean, human-readable column headers
   */
  static formatRowsForExport(items) {
    return items.map((item, idx) => {
      // Check if this is a lead object with nested business
      const biz = item.business || item;
      return {
        '#': idx + 1,
        'Business Name': biz.name || '',
        'Category': biz.category || '',
        'Address': biz.address || '',
        'Phone Number': biz.phone || '',
        'Website': biz.website || '',
        'Rating': biz.rating || '',
        'Reviews': biz.reviewCount || biz.review_count || 0,
        'Google Maps Link': biz.mapsUrl || biz.maps_url || '',
        'Lead Status': item.status || 'Unsaved',
        'Service Interest': item.serviceInterest || item.service_interest || '',
        'Follow Up Date': item.followUpDate || item.follow_up_date || '',
        'Notes': item.notes || '',
        'Place ID': biz.placeId || biz.provider_place_id || ''
      };
    });
  }
}
