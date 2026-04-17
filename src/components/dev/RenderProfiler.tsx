import { Profiler, type ReactNode, useCallback } from "react";

interface RenderProfilerProps {
  id: string;
  children: ReactNode;
  thresholdMs?: number;
}

export function RenderProfiler({
  id,
  children,
  thresholdMs = 8,
}: RenderProfilerProps) {
  const onRender = useCallback(
    (
      profilerId: string,
      phase: "mount" | "update" | "nested-update",
      actualDuration: number,
      baseDuration: number,
    ) => {
      if (!import.meta.env.DEV) {
        return;
      }

      if (actualDuration < thresholdMs) {
        return;
      }

      console.log(`[Profiler:${profilerId}]`, {
        phase,
        actualDuration: Number(actualDuration.toFixed(2)),
        baseDuration: Number(baseDuration.toFixed(2)),
      });
    },
    [thresholdMs],
  );

  if (!import.meta.env.DEV) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}
