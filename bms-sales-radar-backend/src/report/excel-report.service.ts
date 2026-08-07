import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Business } from '../business/business.entity';
import { ScoreService } from '../score/score.calculator';
import { GooglePlaceEntity } from '../google/entities/google-place.entity';

@Injectable()
export class ExcelReportService {
  constructor(private readonly scoreService: ScoreService) {}

  async createBusinessReport(
    businesses: Business[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet('Businesses');

    worksheet.columns = [
      {
        header: 'Name',
        key: 'name',
        width: 30,
      },
      {
        header: 'Address',
        key: 'address',
        width: 40,
      },
      {
        header: 'Phone',
        key: 'phone',
        width: 20,
      },
      {
        header: 'Instagram',
        key: 'instagramUrl',
        width: 30,
      },
      {
        header: 'LinkedIn',
        key: 'linkedinUrl',
        width: 30,
      },
      {
        header: 'Sales Priority',
        key: 'salesPriority',
        width: 20,
      },
    ];

    const scoredBusinesses = businesses.map((business) =>
      this.scoreService.createScoredBusiness(business),
    );

    scoredBusinesses.forEach((business) => {
      worksheet.addRow({
        name: business.name,
        address: business.address,
        phone: business.phone ?? '',
        instagramUrl: business.instagramUrl ?? '',
        linkedinUrl: business.linkedinUrl ?? '',
        salesPriority: business.salesPriority,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return Buffer.from(buffer);
  }

  async createNewBusinessCandidatesReport(
    places: GooglePlaceEntity[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BMS Sales Radar';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(
      'Yeni İşletme Adayları',
      {
        views: [{ state: 'frozen', ySplit: 3 }],
      },
    );

    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Yeni İşletme Adayları';
    titleCell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 16,
    };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1565C0' },
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(1).height = 30;

    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = places.length
      ? `${places.length} yeni işletme adayı listelendi.`
      : 'Son tamamlanan taramada rapora uygun yeni işletme bulunamadı.';
    worksheet.getCell('A2').font = {
      italic: true,
      color: { argb: 'FF5F6368' },
    };

    const headerRow = worksheet.getRow(3);
    headerRow.values = [
      'İşletme Adı',
      'Adres',
      'İlçe',
      'Telefon',
      'Google Maps',
      'İlk Tespit Tarihi',
    ];
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF263238' },
    };
    headerRow.alignment = { vertical: 'middle' };
    headerRow.height = 24;

    for (const place of places) {
      const row = worksheet.addRow([
        place.displayName ?? '',
        place.formattedAddress ?? '',
        place.district,
        place.nationalPhoneNumber ?? '',
        place.googleMapsUri
          ? {
              text: 'Haritada aç',
              hyperlink: place.googleMapsUri,
            }
          : '',
        place.firstSeenAt,
      ]);

      row.getCell(5).font = {
        color: { argb: 'FF1565C0' },
        underline: true,
      };
      row.getCell(6).numFmt = 'dd.mm.yyyy hh:mm';
      row.alignment = { vertical: 'top' };
    }

    worksheet.columns = [
      { width: 32 },
      { width: 52 },
      { width: 20 },
      { width: 18 },
      { width: 18 },
      { width: 22 },
    ];
    worksheet.autoFilter = {
      from: 'A3',
      to: 'F3',
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async createSavedCandidatesReport(
    businesses: Business[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BMS Sales Radar';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Kaydedilen Adaylar', {
      views: [{ state: 'frozen', ySplit: 3 }],
    });

    worksheet.mergeCells('A1:M1');
    worksheet.getCell('A1').value = 'Kaydedilen Adaylar';
    worksheet.getCell('A1').font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 16,
    };
    worksheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1565C0' },
    };
    worksheet.getRow(1).height = 30;

    worksheet.mergeCells('A2:M2');
    worksheet.getCell('A2').value =
      `${businesses.length} kaydedilmiş aday listelendi.`;

    const headers = [
      'İşletme Adı', 'Adres', 'Telefon', 'Durum', 'Skor',
      'Keşif Kaynağı', 'Instagram', 'Facebook', 'LinkedIn',
      'İş İlanı', 'Google Maps', 'Notlar', 'Kayıt Tarihi',
    ];
    const headerRow = worksheet.getRow(3);
    headerRow.values = headers;
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF263238' },
    };

    for (const business of businesses) {
      const row = worksheet.addRow([
        business.name,
        business.address ?? '',
        business.phone ?? '',
        business.status,
        business.score ?? 0,
        business.discoverySource ?? '',
        business.instagramUrl ?? '',
        business.facebookUrl ?? '',
        business.linkedinUrl ?? '',
        business.jobPostingUrl ?? '',
        business.googleMapsUrl ?? '',
        business.notes ?? '',
        business.createdAt,
      ]);
      row.getCell(13).numFmt = 'dd.mm.yyyy hh:mm';
    }

    worksheet.columns = [
      { width: 30 }, { width: 48 }, { width: 18 }, { width: 20 },
      { width: 10 }, { width: 18 }, { width: 32 }, { width: 32 },
      { width: 32 }, { width: 32 }, { width: 32 }, { width: 45 },
      { width: 21 },
    ];
    worksheet.autoFilter = { from: 'A3', to: 'M3' };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

// NestJS automatically creates ScoreService object 
//dependency injection

//waiting (await) for excel file to be produced,takes time
