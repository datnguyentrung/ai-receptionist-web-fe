import { useLeaderboardActionDropDownItems } from "@/config/constants/ListActionDropDown";
import { Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { CategoryTabs } from "./Components/CategoryTabs/CategoryTabs";
import QuarterLeaderboard from "./Components/QuarterLeaderboard/QuarterLeaderboard";
import styles from "./Rankings.module.scss";

const RANKINGS_ROUTE_MAP = {
  "quarterly-score": "/rankings/score",
  "quarterly-fitness": "/rankings/fitness",
} as const;

const DEFAULT_RANKINGS_CATEGORY_ID = "quarterly-score";

function getCurrentQuarter(): number {
  return Math.floor(new Date().getMonth() / 3) + 1;
}

const QUARTERS = [1, 2, 3, 4] as const;
const YEARS = Array.from({ length: 1 }, (_, i) => new Date().getFullYear() - i);

export default function Rankings() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(getCurrentQuarter);
  const navigate = useNavigate();
  const location = useLocation();

  const selectedCategoryId = useMemo(() => {
    if (location.pathname.endsWith("/fitness")) {
      return "quarterly-fitness";
    }

    if (location.pathname.endsWith("/score")) {
      return "quarterly-score";
    }

    return DEFAULT_RANKINGS_CATEGORY_ID;
  }, [location.pathname]);

  const handleSelectCategory = (
    category: (typeof useLeaderboardActionDropDownItems)[number],
  ) => {
    navigate(
      RANKINGS_ROUTE_MAP[category.id as keyof typeof RANKINGS_ROUTE_MAP],
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.iconWrap}>
            <Trophy size={20} />
          </div>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Bảng xếp hạng</h1>
            <p className={styles.subtitle}>Kết quả thi đua học viên theo quý</p>
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.filters__group}>
            <Select
              value={String(year)}
              onValueChange={(v) => setYear(Number(v))}
            >
              <SelectTrigger className={styles.filterTrigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    Năm {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(quarter)}
              onValueChange={(v) => setQuarter(Number(v))}
            >
              <SelectTrigger size="sm" className={styles.filterTrigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUARTERS.map((q) => (
                  <SelectItem key={q} value={String(q)}>
                    Quý {q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <CategoryTabs
        categories={useLeaderboardActionDropDownItems.filter(
          (c) => c.display !== false,
        )}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
      />

      <QuarterLeaderboard
        year={year}
        quarter={quarter}
        categoryId={selectedCategoryId}
      />
    </div>
  );
}
