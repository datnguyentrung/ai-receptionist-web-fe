import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useLeaderboardActionDropDownItems } from "@/config/constants/ListActionDropDown";
import { Trophy } from "lucide-react";
import { useState } from "react";
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

function getCurrentQuarter(): number {
  return Math.floor(new Date().getMonth() / 3) + 1;
}

const QUARTERS = [1, 2, 3, 4] as const;
const YEARS = Array.from({ length: 1 }, (_, i) => new Date().getFullYear() - i);

export default function Rankings() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(getCurrentQuarter);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    useLeaderboardActionDropDownItems[0].id,
  );

  const handleSelectCategory = (
    category: (typeof useLeaderboardActionDropDownItems)[number],
  ) => {
    setSelectedCategoryId(category.id);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrap}>
            <Trophy size={20} />
          </div>
          <div>
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
              <SelectTrigger>
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
              <SelectTrigger size="sm">
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

      <Tabs defaultValue="quarter">
        {/* <TabsList className={styles.tabsList}>
          {LEADERBOARD_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList> */}
        <CategoryTabs
          categories={useLeaderboardActionDropDownItems}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
        />

        <TabsContent value="quarter">
          <QuarterLeaderboard year={year} quarter={quarter} />
        </TabsContent>

        {/* Future:
        <TabsContent value="yearly">
          <YearlyLeaderboard />
        </TabsContent>
        */}
      </Tabs>
    </div>
  );
}
