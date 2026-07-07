import {
  NAV_ITEMS,
  type NavigationItem,
} from "@/config/constants/path";
import { ROLE_LEVELS } from "@/config/constants/roleLevels";
import { prefetchClassSchedules } from "@/pages/ClassSchedules/classSchedulesQueries";
import { useAuthStore } from "@/store/authStore";
import { useUserLevel } from "@/utils/roleUtils";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  LockKeyhole,
  Pin,
  PinOff,
  Search,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UtilitiesPage.module.scss";

export const QUICK_UTILITIES_STORAGE_KEY = "quick-utilities:v1";

type UtilityItem = NavigationItem & {
  id: string;
  to?: string;
  isDisabled: boolean;
  disabledReason?: string;
};

function getStoredQuickIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const rawValue = window.localStorage.getItem(QUICK_UTILITIES_STORAGE_KEY);
    if (!rawValue) return [];

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function useQuickUtilities(validIds: Set<string>) {
  const [storedQuickIds, setStoredQuickIds] = useState<string[]>(() =>
    getStoredQuickIds(),
  );
  const quickIds = useMemo(
    () => storedQuickIds.filter((id) => validIds.has(id)),
    [storedQuickIds, validIds],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        QUICK_UTILITIES_STORAGE_KEY,
        JSON.stringify(quickIds),
      );
    } catch {
      // Local storage is an enhancement; the page still works without it.
    }
  }, [quickIds]);

  const toggleQuickItem = (id: string) => {
    if (!validIds.has(id)) return;

    setStoredQuickIds((currentIds) => {
      if (currentIds.includes(id)) {
        return currentIds.filter((currentId) => currentId !== id);
      }

      return [...currentIds, id];
    });
  };

  return { quickIds, toggleQuickItem };
}

function getItemId(item: NavigationItem, index: number) {
  return item.id ?? item.to ?? `${item.label}-${index}`;
}

function isRouteValid(to?: string) {
  return Boolean(to && !to.includes("undefined") && !to.includes("null"));
}

function normalizeUtilityItems(
  items: NavigationItem[],
  currentLevel: number,
): UtilityItem[] {
  return items.map((item, index) => {
    const itemId = getItemId(item, index);
    const hasAccess =
      !item.minLevel ||
      (!item.maxLevel && currentLevel >= item.minLevel) ||
      (item.maxLevel !== undefined &&
        currentLevel >= item.minLevel &&
        currentLevel <= item.maxLevel);
    const hasRoute = isRouteValid(item.to);
    const isHiddenByConfig = item.display === false;
    const isDisabled = !hasAccess || !hasRoute || isHiddenByConfig;

    return {
      ...item,
      id: itemId,
      isDisabled,
      disabledReason: !hasRoute
        ? "Chưa có đường dẫn"
        : isHiddenByConfig
          ? "Đang ẩn"
          : !hasAccess
            ? "Chưa đủ quyền"
            : undefined,
    };
  });
}

function UtilityCard({
  item,
  isQuick,
  onNavigate,
  onPrefetch,
  onToggleQuick,
  isNavigating,
}: {
  item: UtilityItem;
  isQuick: boolean;
  onNavigate: (item: UtilityItem) => void;
  onPrefetch: (item: UtilityItem) => void;
  onToggleQuick: (item: UtilityItem) => void;
  isNavigating: boolean;
}) {
  const Icon = item.icon;
  const QuickIcon = isQuick ? Check : Pin;

  return (
    <article
      className={`${styles.utilityCard} ${
        item.isDisabled ? styles.utilityCardDisabled : ""
      } ${isQuick ? styles.utilityCardPinned : ""} ${
        isNavigating ? styles.utilityCardNavigating : ""
      }`}
    >
      <button
        type="button"
        className={styles.utilityMain}
        disabled={item.isDisabled}
        onMouseEnter={() => onPrefetch(item)}
        onClick={() => onNavigate(item)}
        aria-busy={isNavigating}
      >
        <span className={styles.utilityIconWrap}>
          <Icon size={20} strokeWidth={2.15} />
        </span>

        <span className={styles.utilityText}>
          <span className={styles.utilityTitle}>{item.label}</span>
          {item.disabledReason ? (
            <span className={styles.utilityMeta}>
              <LockKeyhole size={11} />
              {item.disabledReason}
            </span>
          ) : (
            <span className={styles.utilityMeta}>Sẵn sàng sử dụng</span>
          )}
        </span>
      </button>

      <button
        type="button"
        className={styles.pinButton}
        disabled={item.isDisabled}
        aria-label={isQuick ? `Bỏ ghim ${item.label}` : `Ghim ${item.label}`}
        aria-pressed={isQuick}
        onClick={() => onToggleQuick(item)}
      >
        <QuickIcon size={14} strokeWidth={2.3} />
      </button>
    </article>
  );
}

export function UtilitiesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const activeProfile = useAuthStore((state) => state.activeProfile);
  const { level, isAuthenticated } = useUserLevel();
  const [searchValue, setSearchValue] = useState("");
  const [navigatingItemId, setNavigatingItemId] = useState<string | null>(null);

  const studentCode = activeProfile?.userInfo?.userCode;
  const currentLevel = isAuthenticated ? level : ROLE_LEVELS.GUEST;

  const utilityItems = useMemo(
    () => normalizeUtilityItems(NAV_ITEMS({ studentCode }), currentLevel),
    [currentLevel, studentCode],
  );

  const validQuickIds = useMemo(
    () =>
      new Set(
        utilityItems.filter((item) => !item.isDisabled).map((item) => item.id),
      ),
    [utilityItems],
  );
  const { quickIds, toggleQuickItem } = useQuickUtilities(validQuickIds);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) return utilityItems;

    return utilityItems.filter((item) =>
      item.label.toLowerCase().includes(normalizedSearch),
    );
  }, [searchValue, utilityItems]);

  const quickItems = useMemo(
    () =>
      quickIds
        .map((id) => utilityItems.find((item) => item.id === id))
        .filter((item): item is UtilityItem => Boolean(item && !item.isDisabled)),
    [quickIds, utilityItems],
  );

  const scheduleIds = useMemo(
    () =>
      activeProfile?.userInfo?.assignedClasses
        ?.map((c) => c?.classSchedule?.scheduleId)
        ?.filter((id): id is string => Boolean(id)) ?? [],
    [activeProfile],
  );

  const prefetchSchedules = useCallback(
    (options?: { includeRoute?: boolean }) => {
      prefetchClassSchedules(queryClient, scheduleIds, options);
    },
    [queryClient, scheduleIds],
  );

  useEffect(() => {
    const idleWindow = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (idleWindow.requestIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(
        () => prefetchSchedules(),
        { timeout: 1800 },
      );
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(() => prefetchSchedules(), 700);
    return () => window.clearTimeout(timeoutId);
  }, [prefetchSchedules]);

  const handleNavigate = (item: UtilityItem) => {
    if (item.isDisabled || !item.to) return;
    const targetRoute = item.to;
    setNavigatingItemId(item.id);

    window.requestAnimationFrame(() => {
      navigate(targetRoute);
    });
  };

  const handlePrefetch = (item: UtilityItem) => {
    if (item.isDisabled || item.to !== "/schedules") return;

    prefetchSchedules();
  };

  const handleToggleQuick = (item: UtilityItem) => {
    if (item.isDisabled) return;
    toggleQuickItem(item.id);
  };

  return (
    <div className={styles.utilitiesPage}>
      <header className={styles.pageHeader}>
        <div className={styles.headerCopy}>
          <span className={styles.headerBadge}>
            <Sparkles size={14} />
            Trung tâm tiện ích
          </span>
          <h1>Tiện ích</h1>
          <p>Truy cập nhanh các tính năng của hệ thống</p>
        </div>

        <label className={styles.searchBox}>
          <Search size={17} strokeWidth={2} />
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Tìm tính năng..."
          />
        </label>
      </header>

      <section className={styles.section} aria-labelledby="quick-utilities-title">
        <div className={styles.sectionHead}>
          <div>
            <h2 id="quick-utilities-title">Truy cập nhanh</h2>
            <p>Các tính năng bạn ghim sẽ được lưu trên thiết bị này.</p>
          </div>
          {quickItems.length > 0 && (
            <span className={styles.countBadge}>{quickItems.length} mục</span>
          )}
        </div>

        {quickItems.length > 0 ? (
          <div className={`${styles.utilityGrid} ${styles.quickGrid}`}>
            {quickItems.map((item) => (
              <UtilityCard
                key={item.id}
                item={item}
                isQuick
                onNavigate={handleNavigate}
                onPrefetch={handlePrefetch}
                onToggleQuick={handleToggleQuick}
                isNavigating={navigatingItemId === item.id}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <PinOff size={22} />
            <div>
              <p>Chưa có mục ghim</p>
              <span>Chạm biểu tượng ghim trên tính năng để thêm vào truy cập nhanh.</span>
            </div>
          </div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="all-utilities-title">
        <div className={styles.sectionHead}>
          <div>
            <h2 id="all-utilities-title">Tất cả tính năng</h2>
            <p>Danh sách được đồng bộ từ cấu hình điều hướng chính.</p>
          </div>
          <span className={styles.countBadge}>{filteredItems.length} mục</span>
        </div>

        <div className={styles.utilityGrid}>
          {filteredItems.map((item) => (
            <UtilityCard
              key={item.id}
              item={item}
              isQuick={quickIds.includes(item.id)}
              onNavigate={handleNavigate}
              onPrefetch={handlePrefetch}
              onToggleQuick={handleToggleQuick}
              isNavigating={navigatingItemId === item.id}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
