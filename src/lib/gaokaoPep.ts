/**
 * 人教版普通高中英语教科书 (2019) — grade ↔ volume mapping.
 * All high-school content must cite one of these seven PDFs.
 */

export type GaokaoPepBookId =
  | "required1"
  | "required2"
  | "required3"
  | "elective1"
  | "elective2"
  | "elective3"
  | "elective4";

export type GaokaoGradeBand = "g1" | "g2" | "g3";

export type GaokaoPepBook = {
  id: GaokaoPepBookId;
  /** Display label (Chinese) */
  label: string;
  /** Absolute path to the official PEP PDF */
  pdfPath: string;
  /** 高一/高二/高三 */
  gradeBand: GaokaoGradeBand;
  /** Matches ?year_band= / ?grade= query (1 | 2 | 3) */
  yearBand: 1 | 2 | 3;
  sortOrder: number;
};

/** Official textbook paths (user machine). */
export const GAOKAO_PEP_PDF_PATHS: Record<GaokaoPepBookId, string> = {
  required1:
    "c:\\Users\\willi\\OneDrive\\Desktop\\英语教材\\高中英语教材\\人教版\\普通高中教科书·英语必修 第一册.pdf",
  required2:
    "c:\\Users\\willi\\OneDrive\\Desktop\\英语教材\\高中英语教材\\人教版\\普通高中教科书·英语必修 第二册.pdf",
  required3:
    "c:\\Users\\willi\\OneDrive\\Desktop\\英语教材\\高中英语教材\\人教版\\普通高中教科书·英语必修 第三册.pdf",
  elective1:
    "c:\\Users\\willi\\OneDrive\\Desktop\\英语教材\\高中英语教材\\人教版\\普通高中教科书·英语选择性必修 第一册.pdf",
  elective2:
    "c:\\Users\\willi\\OneDrive\\Desktop\\英语教材\\高中英语教材\\人教版\\普通高中教科书·英语选择性必修 第二册.pdf",
  elective3:
    "c:\\Users\\willi\\OneDrive\\Desktop\\英语教材\\高中英语教材\\人教版\\普通高中教科书·英语选择性必修 第三册.pdf",
  elective4:
    "c:\\Users\\willi\\OneDrive\\Desktop\\英语教材\\高中英语教材\\人教版\\普通高中教科书·英语选择性必修 第四册.pdf",
};

/**
 * Logical curriculum map:
 * - 高一: 必修第一册 + 必修第二册
 * - 高二: 必修第三册 + 选择性必修第一册
 * - 高三: 选择性必修第二册 + 第三册 + 第四册
 */
export const GAOKAO_PEP_BOOKS: GaokaoPepBook[] = [
  {
    id: "required1",
    label: "必修第一册",
    pdfPath: GAOKAO_PEP_PDF_PATHS.required1,
    gradeBand: "g1",
    yearBand: 1,
    sortOrder: 1,
  },
  {
    id: "required2",
    label: "必修第二册",
    pdfPath: GAOKAO_PEP_PDF_PATHS.required2,
    gradeBand: "g1",
    yearBand: 1,
    sortOrder: 2,
  },
  {
    id: "required3",
    label: "必修第三册",
    pdfPath: GAOKAO_PEP_PDF_PATHS.required3,
    gradeBand: "g2",
    yearBand: 2,
    sortOrder: 3,
  },
  {
    id: "elective1",
    label: "选择性必修第一册",
    pdfPath: GAOKAO_PEP_PDF_PATHS.elective1,
    gradeBand: "g2",
    yearBand: 2,
    sortOrder: 4,
  },
  {
    id: "elective2",
    label: "选择性必修第二册",
    pdfPath: GAOKAO_PEP_PDF_PATHS.elective2,
    gradeBand: "g3",
    yearBand: 3,
    sortOrder: 5,
  },
  {
    id: "elective3",
    label: "选择性必修第三册",
    pdfPath: GAOKAO_PEP_PDF_PATHS.elective3,
    gradeBand: "g3",
    yearBand: 3,
    sortOrder: 6,
  },
  {
    id: "elective4",
    label: "选择性必修第四册",
    pdfPath: GAOKAO_PEP_PDF_PATHS.elective4,
    gradeBand: "g3",
    yearBand: 3,
    sortOrder: 7,
  },
];

export function yearBandToGradeBand(year: number | null | undefined): GaokaoGradeBand | null {
  if (year === 1) return "g1";
  if (year === 2) return "g2";
  if (year === 3) return "g3";
  return null;
}

export function gradeBandLabel(band: GaokaoGradeBand): string {
  return band === "g1" ? "高一" : band === "g2" ? "高二" : "高三";
}

export function booksForYearBand(year: number | null | undefined): GaokaoPepBook[] {
  const band = yearBandToGradeBand(year);
  if (!band) return GAOKAO_PEP_BOOKS;
  return GAOKAO_PEP_BOOKS.filter((b) => b.gradeBand === band);
}

export function bookById(id: GaokaoPepBookId): GaokaoPepBook | undefined {
  return GAOKAO_PEP_BOOKS.find((b) => b.id === id);
}
