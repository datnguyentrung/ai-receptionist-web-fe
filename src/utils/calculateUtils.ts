export type CalculatedEntranceExamResult = {
  date: string;
  studentId: string;
  fullName: string;
  birthDate: string;
  birthYear: number;
  phone: string;
  year: string;
  quarter: string;
  punchingTechnique: number;
  stanceAndTerminology: number;
  stanceWithHandTechniques: number;
  kickingTechnique: number;
  totalScore: number;
  breakdown: {
    damKtTay: number;
    damKtTan: number;
    damKyNang: number;
    damTiengHet: number;
    tanThuatNgu: number;
    tanKtTay: number;
    tanKtTan: number;
    tanTayDt1KtTan: number;
    tanTayDt1KtTay: number;
    tanTayDt1TiengHet: number;
    tanTayDt2KtTan: number;
    tanTayDt2KtTay: number;
    tanTayDt2TiengHet: number;
    tanTayDt3KtTan: number;
    tanTayDt3KtTay: number;
    tanTayDt3TiengHet: number;
    apChagi: number;
    toloChagi: number;
    dopChagi: number;
    dwitChagi: number;
  };
};

type CachedEntranceExamPayload = {
  signature: string;
  results: CalculatedEntranceExamResult[];
};

const ENTRANCE_EXAM_CACHE_KEY = "entrance_exam_calculated_scores_v2";

function toNumber(value: string | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeCsvValue(value: string | undefined): string {
  return (value ?? "").trim();
}

function getQuarterByMonth(month: number): string {
  if (month <= 3) return "Quý 1";
  if (month <= 6) return "Quý 2";
  if (month <= 9) return "Quý 3";
  return "Quý 4";
}

function parseYearAndQuarter(dateValue: string): {
  year: string;
  quarter: string;
} {
  const [dayPart, monthPart, yearPart] = dateValue.split("/");
  const month = toNumber(monthPart);
  const year = normalizeCsvValue(yearPart);

  if (!dayPart || !month || !year) {
    return { year: "", quarter: "" };
  }

  return {
    year,
    quarter: getQuarterByMonth(month),
  };
}

function parseBirthYear(birthDate: string): number {
  const parts = birthDate.split("/");
  return toNumber(parts[2]);
}

function buildCsvSignature(csvText: string): string {
  let hash = 0;

  for (let index = 0; index < csvText.length; index += 1) {
    hash = (hash * 31 + csvText.charCodeAt(index)) >>> 0;
  }

  return `${csvText.length}_${hash}`;
}

export function parseAndCalculateEntranceExamResults(
  csvText: string,
): CalculatedEntranceExamResult[] {
  const trimmedCsv = csvText.trim();
  if (!trimmedCsv) return [];

  const lines = trimmedCsv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((header) => header.trim());
  const headerIndexMap = new Map<string, number>();

  headers.forEach((header, index) => {
    headerIndexMap.set(header, index);
  });

  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const read = (header: string) =>
      normalizeCsvValue(cols[headerIndexMap.get(header) ?? -1]);

    const date = read("date");
    const birthDate = read("birth_date");
    const { year, quarter } = parseYearAndQuarter(date);

    const damKtTay = toNumber(read("dam_kt_tay"));
    const damKtTan = toNumber(read("dam_kt_tan"));
    const damKyNang = toNumber(read("dam_kn"));
    const damTiengHet = toNumber(read("dam_tieng_het"));

    const tanThuatNgu = toNumber(read("tan_thuat_ngu"));
    const tanKtTay = toNumber(read("tan_kt_tay"));
    const tanKtTan = toNumber(read("tan_kt_tan"));

    const tanTayDt1KtTan = toNumber(read("tan_tay_dt1_kt_tan"));
    const tanTayDt1KtTay = toNumber(read("tan_tay_dt1_kt_tay"));
    const tanTayDt1TiengHet = toNumber(read("tan_tay_dt1_tieng_het"));

    const tanTayDt2KtTan = toNumber(read("tan_tay_dt2_kt_tan"));
    const tanTayDt2KtTay = toNumber(read("tan_tay_dt2_kt_tay"));
    const tanTayDt2TiengHet = toNumber(read("tan_tay_dt2_tieng_het"));

    const tanTayDt3KtTan = toNumber(read("tan_tay_dt3_kt_tan"));
    const tanTayDt3KtTay = toNumber(read("tan_tay_dt3_kt_tay"));
    const tanTayDt3TiengHet = toNumber(read("tan_tay_dt3_tieng_het"));

    const apChagi = toNumber(read("ap_chagi"));
    const toloChagi = toNumber(read("tolo_chagi"));
    const dopChagi = toNumber(read("dop_chagi"));
    const dwitChagi = toNumber(read("dwit_chagi"));

    const punchingTechnique = damKtTay + damKtTan + damKyNang + damTiengHet;

    const stanceAndTerminology = tanThuatNgu + tanKtTay + tanKtTan;

    const stanceWithHandTechniques =
      tanTayDt1KtTan +
      tanTayDt1KtTay +
      tanTayDt1TiengHet +
      tanTayDt2KtTan +
      tanTayDt2KtTay +
      tanTayDt2TiengHet +
      tanTayDt3KtTan +
      tanTayDt3KtTay +
      tanTayDt3TiengHet;

    const kickingTechnique = apChagi + toloChagi + dopChagi + dwitChagi;

    const totalScore =
      punchingTechnique +
      stanceAndTerminology +
      stanceWithHandTechniques +
      kickingTechnique;

    return {
      date,
      studentId: read("id"),
      fullName: read("name"),
      birthDate,
      birthYear: parseBirthYear(birthDate),
      phone: read("phone"),
      year,
      quarter,
      punchingTechnique,
      stanceAndTerminology,
      stanceWithHandTechniques,
      kickingTechnique,
      totalScore,
      breakdown: {
        damKtTay,
        damKtTan,
        damKyNang,
        damTiengHet,
        tanThuatNgu,
        tanKtTay,
        tanKtTan,
        tanTayDt1KtTan,
        tanTayDt1KtTay,
        tanTayDt1TiengHet,
        tanTayDt2KtTan,
        tanTayDt2KtTay,
        tanTayDt2TiengHet,
        tanTayDt3KtTan,
        tanTayDt3KtTay,
        tanTayDt3TiengHet,
        apChagi,
        toloChagi,
        dopChagi,
        dwitChagi,
      },
    };
  });
}

export function getCalculatedEntranceExamResults(
  csvText: string,
): CalculatedEntranceExamResult[] {
  const signature = buildCsvSignature(csvText);

  if (typeof window === "undefined") {
    return parseAndCalculateEntranceExamResults(csvText);
  }

  try {
    const cachedValue = window.localStorage.getItem(ENTRANCE_EXAM_CACHE_KEY);

    if (cachedValue) {
      const cachedPayload = JSON.parse(
        cachedValue,
      ) as CachedEntranceExamPayload;

      if (cachedPayload.signature === signature) {
        return cachedPayload.results;
      }
    }
  } catch {
    // Ignore localStorage parse errors and recalculate from source CSV.
  }

  const calculatedResults = parseAndCalculateEntranceExamResults(csvText);

  try {
    const payload: CachedEntranceExamPayload = {
      signature,
      results: calculatedResults,
    };
    window.localStorage.setItem(
      ENTRANCE_EXAM_CACHE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // Ignore write failures (private mode/quota) and continue with in-memory result.
  }

  return calculatedResults;
}
